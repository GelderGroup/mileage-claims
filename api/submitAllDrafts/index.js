import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";

const entries = getCosmosContainer("mileagedb", "mileageEntries");

export default async function submitAllDrafts(context, req) {
    try {
        const user = getClientPrincipal(req);
        if (!user?.email) {
            context.res = {
                status: 401,
                body: { error: "unauthorised", details: "User context is missing" }
            };
            return;
        }

        const userId = user.email;
        const submittedAt = new Date().toISOString();

        const { ids } = req.body || {};
        const hasIds = Array.isArray(ids) && ids.length > 0;
        const uniqIds = hasIds
            ? [...new Set(ids)].filter((x) => typeof x === "string" && x.trim().length > 0)
            : null;

        if (hasIds && uniqIds.length === 0) {
            context.res = {
                status: 400,
                body: { error: "bad_request", details: "ids contained no valid values" }
            };
            return;
        }

        // 1) Load eligible drafts from THIS partition (fast + safe)
        // If ids provided, restrict to those; otherwise all drafts
        const query = hasIds
            ? {
                query: `
            SELECT * FROM c
            WHERE c.userId = @userId
              AND c.status = 'draft'
              AND ARRAY_CONTAINS(@ids, c.id)
          `,
                parameters: [
                    { name: "@userId", value: userId },
                    { name: "@ids", value: uniqIds }
                ]
            }
            : {
                query: `
            SELECT * FROM c
            WHERE c.userId = @userId
              AND c.status = 'draft'
          `,
                parameters: [{ name: "@userId", value: userId }]
            };

        const { resources: drafts } = await entries.items.query(query).fetchAll();

        if (!drafts || drafts.length === 0) {
            context.res = {
                status: 409,
                body: {
                    error: "nothing_to_submit",
                    details: hasIds ? "No matching draft entries were found." : "No drafts to submit.",
                    requested: hasIds ? uniqIds.length : 0,
                    submitted: 0
                }
            };
            return;
        }

        // 2) Update docs
        const updatedDocs = drafts.map((doc) => ({
            ...doc,
            status: "submitted",
            submittedAt
            // optionally: updatedAt: submittedAt
        }));

        // 3) Upsert back into Cosmos (same partition)
        const results = await Promise.allSettled(
            updatedDocs.map((doc) => entries.items.upsert(doc))
        );

        const successIds = [];
        const failed = [];

        results.forEach((r, i) => {
            const id = updatedDocs[i]?.id;
            if (r.status === "fulfilled") successIds.push(id);
            else failed.push({ id, error: r.reason?.message || String(r.reason) });
        });

        // Helpful diagnostics if ids were supplied: which requested ids weren't found/eligible
        const notSubmittedRequestedIds = hasIds
            ? uniqIds.filter((id) => !successIds.includes(id))
            : [];

        context.res = {
            status: failed.length ? 207 : 200,
            body: {
                success: failed.length === 0,
                submittedAt,
                requested: hasIds ? uniqIds.length : null,
                eligible: drafts.length,
                submitted: successIds.length,
                successIds,
                notSubmittedRequestedIds,
                failed
            }
        };
    } catch (err) {
        context.log?.error?.(err);
        context.res = {
            status: 500,
            body: { error: "internal_error", details: err.message || String(err) }
        };
    }
}
