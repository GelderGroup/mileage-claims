import { app } from "@azure/functions";
import { getCosmosContainer } from "../../_lib/cosmos.js";
import { getClientPrincipal } from "../../_lib/auth.js";

app.http("getMileageDrafts", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "getMileageDrafts",
    handler: async (request, context) => {
        try {
            const user = getClientPrincipal(request);
            if (!user?.email) {
                return {
                    status: 401,
                    jsonBody: { error: "unauthorised", details: "User context is missing" }
                };
            }

            const query = {
                query: `
          SELECT c.id, c.date, c.startLabel, c.endLabel,
                 c.startPostcode, c.endPostcode,
                 c.distance,
                 c.distanceCalculated,
                 c.overrideEnabled,
                 c.distanceOverride,
                 c.distanceOverrideReason,
                 c.distanceOverrideDetails,
                 c.status, c.createdAt
          FROM c
          WHERE c.userId = @userId
            AND c.status = 'draft'
          ORDER BY c.createdAt DESC
        `,
                parameters: [{ name: "@userId", value: user.email }]
            };

            const entries = getCosmosContainer("mileagedb", "mileageEntries");
            const { resources } = await entries.items.query(query).fetchAll();

            return { status: 200, jsonBody: resources };
        } catch (err) {
            context.error(err);
            return {
                status: 500,
                jsonBody: { error: "load_failed", details: err?.message || "Unknown error" }
            };
        }
    }
});
