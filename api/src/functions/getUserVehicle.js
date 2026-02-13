import { app } from "@azure/functions";
import { getCosmosContainer } from "../../_lib/cosmos.js";
import { getClientPrincipal } from "../../_lib/auth.js";

const readIfExists = async (container, id, pk) => {
    try {
        return (await container.item(id, pk).read()).resource || null;
    } catch {
        return null;
    }
};

app.http("getUserVehicle", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "getUserVehicle",
    handler: async (request, context) => {
        try {
            const principal = getClientPrincipal(request);
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
                        parameters: [{ name: "@ownerId", value: ownerId }]
                    })
                    .fetchAll();

                vehicle = resources?.[0] ?? null;
            }

            return {
                status: 200,
                jsonBody: {
                    hasVehicle: !!vehicle,
                    vehicle,
                    user: { email: principal.email, name: principal.name }
                }
            };
        } catch (err) {
            const msg = err?.message || "Unknown error";
            const status = /Missing x-ms-client-principal/.test(msg) ? 401 : 500;
            context.error("getUserVehicle error:", err);
            return { status, jsonBody: { error: msg } };
        }
    }
});
