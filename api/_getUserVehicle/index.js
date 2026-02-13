import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";

const readIfExists = async (container, id, pk) => {
    try { return (await container.item(id, pk).read()).resource || null; } catch { return null; }
};

export default async function getUserVehicle(context, req) {
    try {
        const principal = getClientPrincipal(req);
        const ownerId = principal.email.toLowerCase();

        // 1) Try active pointer first
        const activeId = `vehicle_active|${ownerId}`;
        const vehicles = getCosmosContainer("mileagedb", "vehicles");
        const active = await readIfExists(vehicles, activeId, ownerId);

        let vehicle = null;

        if (active?.vehicleId) {
            const latestId = `vehicle|${ownerId}|${active.vehicleId}`;
            vehicle = await readIfExists(vehicles, latestId, ownerId);
        }

        // 2) Fallback: most-recent vehicle_latest in this partition
        if (!vehicle) {
            const { resources } = await vehicles.items
                .query({
                    query:
                        "SELECT TOP 1 * FROM c WHERE c.ownerId = @ownerId AND c._type = 'vehicle_latest' ORDER BY c.updatedAt DESC",
                    parameters: [{ name: "@ownerId", value: ownerId }],
                })
                .fetchAll();
            vehicle = resources?.[0] ?? null;
        }

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: {
                hasVehicle: !!vehicle,
                vehicle,
                user: { email: principal.email, name: principal.name },
            },
        };
    } catch (err) {
        const status = /Missing x-ms-client-principal/.test(err.message) ? 401 : 500;
        context.log.error("getUserVehicle error:", err);
        context.res = { status, body: { error: err.message } };
    }
}
