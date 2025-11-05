import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";

const vehicles = getCosmosContainer("mileagedb", "vehicles");

export default async function (context, req) {
    try {
        const principal = getClientPrincipal(req);

        const query = {
            query: "SELECT * FROM c WHERE c.userId = @userId",
            parameters: [{ name: "@userId", value: principal.email }]
        };

        const { resources } = await vehicles.items.query(query).fetchAll();
        return (context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
                hasVehicle: resources.length > 0,
                vehicle: resources[0] ?? null,
                user: { email: principal.email, name: principal.name }
            }
        });
    } catch (err) {
        const status = /Missing x-ms-client-principal/.test(err.message) ? 401 : 500;
        context.log.error("getUserVehicle error:", err);
        context.res = { status, body: { error: err.message } };
    }
}