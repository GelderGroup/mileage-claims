import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";

const entries = getCosmosContainer("mileagedb", "mileageEntries");

export default async function getMileageSubmissions(context, req) {
    try {
        const user = getClientPrincipal(req);
        if (!user?.email) {
            context.res = {
                status: 401,
                body: { error: "unauthorised", details: "User context is missing" }
            };
            return;
        }

        const query = {
            query: `
                SELECT
                c.id, c.date,
                c.startLabel, c.endLabel,
                c.startPostcode, c.endPostcode,
                c.distance, c.distanceCalculated,
                c.overrideEnabled, c.distanceOverride,
                c.distanceOverrideReason, c.distanceOverrideDetails,
                c.status, c.createdAt, c.submittedAt
                FROM c
                WHERE c.userId = @userId
                AND c.status = 'submitted'
                ORDER BY c.submittedAt DESC, c.createdAt DESC
            `,
            parameters: [{ name: "@userId", value: user.email }]
        };


        const { resources } = await entries.items.query(query).fetchAll();

        context.res = {
            status: 200,
            body: resources
        };
    } catch (err) {
        context.log.error(err);
        context.res = {
            status: 500,
            body: { error: "load_failed", details: err.message }
        };
    }
}
