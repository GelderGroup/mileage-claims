import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth";

const vehicles = getCosmosContainer("mileagedb", "vehicles");

export default async function (context, req) {
    try {
        // SWA already blocks unauthenticated at the edge; we still assert identity here
        const principal = getClientPrincipal(req);

        // Optional: enforce an app role (uncomment if you add roles)
        // if (!principal.roles.includes("vehicle-reader")) return (context.res = { status: 403, body: { error: "Forbidden" } });

        const query = {
            query: "SELECT * FROM c WHERE c.userId = @userId",
            parameters: [{ name: "@userId", value: principal.email }]
        };

        const { resources } = await vehicles.items.query(query).fetchAll();
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