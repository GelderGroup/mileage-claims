import { app } from "@azure/functions";
import crypto from "node:crypto";
import { getClientPrincipal } from "../../_lib/auth.js";
import { getCosmosContainer } from "../../_lib/cosmos.js";
import { mapVehicleLookupToCanonical } from "../../_lib/mapVehicleLookupToCanonical.js";

const readIfExists = async (container, id, pk) => {
    try {
        return (await container.item(id, pk).read()).resource || null;
    } catch {
        return null;
    }
};

const fingerprint = (c) =>
    [
        c?.make ?? "",
        c?.year ?? "",
        c?.engineCc ?? "",
        c?.fuelType ?? "",
        c?.firstRegistered ?? "",
        c?.co2Gkm ?? ""
    ].join("|");

app.http("saveUserVehicle", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "saveUserVehicle",
    handler: async (request, context) => {
        try {
            const user = getClientPrincipal(request);
            if (!user?.email) throw new Error("unauthorized");
            const ownerId = user.email.toLowerCase();

            // Cosmos containers
            const vehicles = getCosmosContainer("mileagedb", "vehicles"); // latest + pointers
            const vehicleHistory = getCosmosContainer("mileagedb", "vehicle_history"); // snapshots
            const plateLinks = getCosmosContainer("mileagedb", "plate_links"); // current plate→vehicle
            const plateHistory = getCosmosContainer("mileagedb", "plate_history"); // plate assignment events

            const body = await request.json().catch(() => ({}));
            const raw = body.raw ?? body.doc ?? body;

            if (!raw || typeof raw !== "object") {
                return { status: 400, jsonBody: { error: "Invalid request body" } };
            }

            // 1) Map to canonical (pure)
            const mapped = mapVehicleLookupToCanonical(raw, { ownerId });
            const { plateId, canonical } = mapped;

            if (!plateId) {
                return {
                    status: 400,
                    jsonBody: { error: "Missing or invalid registration number" }
                };
            }

            const now = new Date().toISOString();

            // 2) Find existing plate link (same owner)
            const plateLinkId = `plate_link|${ownerId}|${plateId}`;
            const currentLink = await readIfExists(plateLinks, plateLinkId, ownerId);

            // 3) Choose vehicleId (reuse if “same car”, else new)
            let vehicleId = crypto.randomUUID();

            if (currentLink?.vehicleId) {
                const existingVehicle = await readIfExists(
                    vehicles,
                    `vehicle|${ownerId}|${currentLink.vehicleId}`,
                    ownerId
                );

                if (
                    existingVehicle &&
                    fingerprint(existingVehicle.canonical) === fingerprint(canonical)
                ) {
                    vehicleId = currentLink.vehicleId;
                }
            }

            // 4) Upsert latest vehicle
            const latestId = `vehicle|${ownerId}|${vehicleId}`;
            const latestDoc = {
                id: latestId,
                ownerId,
                vehicleId,
                registration: mapped.registration,
                registrationNormalized: plateId,
                canonical: mapped.canonical,
                source: mapped.source,
                _type: "vehicle_latest",
                _v: 1,
                createdAt: now,
                updatedAt: now
            };

            // preserve createdAt if present
            const existingLatest = await readIfExists(vehicles, latestId, ownerId);
            if (existingLatest?.createdAt) latestDoc.createdAt = existingLatest.createdAt;

            // 5) Write latest + snapshot + plate link + active pointer
            const historyId = `vehicle|${ownerId}|${vehicleId}|${now}`;
            const activeId = `vehicle_active|${ownerId}`;

            const prevVehicleId = currentLink?.vehicleId;
            const plateHistId = `plate_hist|${ownerId}|${plateId}|${now}`;
            const ops = [];

            ops.push(vehicles.items.upsert(latestDoc));

            ops.push(
                vehicleHistory.items.create({
                    id: historyId,
                    ownerId,
                    vehicleId,
                    registration: mapped.registration,
                    registrationNormalized: plateId,
                    canonical: mapped.canonical,
                    source: mapped.source,
                    snapshotAt: now,
                    _type: "vehicle_history",
                    _v: 1
                })
            );

            ops.push(
                plateLinks.items.upsert({
                    id: plateLinkId,
                    ownerId,
                    plateId,
                    vehicleId,
                    updatedAt: now,
                    _type: "plate_link",
                    _v: 1
                })
            );

            ops.push(
                plateHistory.items.create({
                    id: plateHistId,
                    ownerId,
                    plateId,
                    vehicleId,
                    assignedAt: now,
                    unassignedAt: null,
                    _type: "plate_history",
                    _v: 1
                })
            );

            ops.push(
                vehicles.items.upsert({
                    id: activeId,
                    ownerId,
                    vehicleId,
                    registrationNormalized: plateId,
                    updatedAt: now,
                    _type: "vehicle_active",
                    _v: 1
                })
            );

            if (prevVehicleId && prevVehicleId !== vehicleId) {
                ops.push(
                    plateHistory.items.create({
                        id: `plate_hist|${ownerId}|${plateId}|${now}-close`,
                        ownerId,
                        plateId,
                        vehicleId: prevVehicleId,
                        assignedAt: null,
                        unassignedAt: now,
                        _type: "plate_history_close",
                        _v: 1
                    })
                );
            }

            const results = await Promise.all(ops);

            return {
                status: 201,
                jsonBody: {
                    success: true,
                    vehicleId,
                    latestId: results[0]?.resource?.id,
                    vehicle: latestDoc,
                    message: "Vehicle saved successfully"
                }
            };
        } catch (error) {
            const status = error?.message === "unauthorized" ? 401 : 500;
            return {
                status,
                jsonBody: {
                    error: status === 401 ? "Authentication failed" : "Internal server error",
                    details: error?.message || "Unknown error"
                }
            };
        }
    }
});
