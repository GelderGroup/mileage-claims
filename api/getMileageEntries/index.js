import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";

const entries = getCosmosContainer("mileagedb", "mileageEntries");

export default async function (context, req) {
    try {
        const user = getClientPrincipal(req);

        // Query entries for this user from Cosmos DB
        const query = {
            query: "SELECT * FROM c WHERE c.userId = @userId",
            parameters: [
                {
                    name: "@userId",
                    value: user.email
                }
            ]
        };

        const { resources } = await entries.items.query(query).fetchAll();

        // Transform entries to expected format
        const formattedEntries = resources.map(entry => ({
            id: entry.id,
            startPostcode: entry.startPostcode,
            endPostcode: entry.endPostcode,
            date: entry.date,
            distance: entry.distance,
            reason: entry.reason,
            submittedAt: entry.submittedAt,
            status: entry.status
        }));

        // Sort by submission date (newest first)
        formattedEntries.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        return (context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: formattedEntries
        });

    } catch (error) {
        const status = /Missing x-ms-client-principal/.test(error.message) ? 401 : 500;
        context.log.error("getMileageEntries error:", error);
        context.res = { status, body: { error: error.message } };
    }
};