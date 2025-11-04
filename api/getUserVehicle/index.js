import { CosmosClient } from "@azure/cosmos"; // keep for now (conn string)
const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const container = cosmosClient.database("mileagedb").container("vehicles");

// Robustly extract SWA principal
function getClientPrincipal(req) {
    const raw = req.headers["x-ms-client-principal"];
    if (!raw) throw new Error("Missing x-ms-client-principal");
    const json = Buffer.from(raw, "base64").toString("utf8");
    const p = JSON.parse(json); // keys: identityProvider, userId, userDetails, claims:[{typ,val}]
    const byType = (t) => p.claims?.find(c => c.typ === t)?.val;
    return {
        userId: p.userId,                                // AAD OID
        email: byType("preferred_username") || p.userDetails, // usually UPN/email
        name: byType("name") || p.userDetails,
        roles: p.claims?.filter(c => c.typ === "roles").map(c => c.val) || []
    };
}

export default async function (context, req) {
    try {
        if (!process.env.COSMOS_CONNECTION_STRING) {
            context.log.error("COSMOS_CONNECTION_STRING missing");
            return (context.res = { status: 500, body: { error: "DB config error" } });
        }

        // SWA already blocks unauthenticated at the edge; we still assert identity here
        const principal = getClientPrincipal(req);

        // Optional: enforce an app role (uncomment if you add roles)
        // if (!principal.roles.includes("vehicle-reader")) return (context.res = { status: 403, body: { error: "Forbidden" } });

        const query = {
            query: "SELECT * FROM c WHERE c.userId = @userId",
            parameters: [{ name: "@userId", value: principal.email }]
        };

        const { resources } = await container.items.query(query).fetchAll();
        return (context.res = {
            status: 200,
            body: { hasVehicle: resources.length > 0, vehicle: resources[0] ?? null, user: { email: principal.email, name: principal.name } }
        });
    } catch (err) {
        const status = /Missing x-ms-client-principal/.test(err.message) ? 401 : 500;
        context.log.error("getUserVehicle error:", err);
        context.res = { status, body: { error: err.message } };
    }
}