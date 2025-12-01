import crypto from "node:crypto";
import { getClientPrincipal } from "../_lib/auth.js";
import { getCosmosContainer } from "../_lib/cosmos.js";
import { mapVehicleLookupToCanonical } from "../_lib/mapVehicleLookupToCanonical.js";

const vehicles = getCosmosContainer("mileagedb", "vehicles");               // latest + pointers
const vehicleHistory = getCosmosContainer("mileagedb", "vehicle_history");  // snapshots
const plateLinks = getCosmosContainer("mileagedb", "plate_links");          // current plate→vehicle
const plateHistory = getCosmosContainer("mileagedb", "plate_history");      // plate assignment events

const readIfExists = async (container, id, pk) => {
    try { return (await container.item(id, pk).read()).resource || null; } catch { return null; }
};

const fingerprint = (c) => [
    c?.make ?? "", c?.year ?? "", c?.engineCc ?? "", c?.fuelType ?? "",
    c?.firstRegistered ?? "", c?.co2Gkm ?? ""
].join("|");

export default async function saveUserVehicle(context, req) {
    try {
        const user = getClientPrincipal(req);
        if (!user?.email) throw new Error("unauthorized");
        const ownerId = user.email.toLowerCase();

        const body = req.body || {};
        const raw = body.raw ?? body.doc ?? body;
        if (!raw || typeof raw !== "object") {
            context.res = { status: 400, body: { error: "Invalid request body" } };
            return;
        }

        // 1) Map to canonical (pure)
        const mapped = mapVehicleLookupToCanonical(raw, { ownerId });
        const { plateId, canonical } = mapped;
        if (!plateId) {
            context.res = { status: 400, body: { error: "Missing or invalid registration number" } };
            return;
        }

        const now = new Date().toISOString();

        // 2) Find existing plate link (same owner)
        const plateLinkId = `plate_link|${ownerId}|${plateId}`;
        const currentLink = await readIfExists(plateLinks, plateLinkId, ownerId);

        // 3) Choose vehicleId (reuse if “same car”, else new)
        let vehicleId = crypto.randomUUID();
        if (currentLink?.vehicleId) {
            const existingVehicle = await readIfExists(vehicles, `vehicle|${ownerId}|${currentLink.vehicleId}`, ownerId);
            if (existingVehicle && fingerprint(existingVehicle.canonical) === fingerprint(canonical)) {
                vehicleId = currentLink.vehicleId; // same underlying car under the private plate
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

        // Close previous plate assignment (if any) and append new event
        const prevVehicleId = currentLink?.vehicleId;
        const plateHistId = `plate_hist|${ownerId}|${plateId}|${now}`;
        const ops = [];

        ops.push(vehicles.items.upsert(latestDoc));
        ops.push(vehicleHistory.items.create({
            id: historyId, ownerId, vehicleId,
            registration: mapped.registration, registrationNormalized: plateId,
            canonical: mapped.canonical, source: mapped.source,
            snapshotAt: now, _type: "vehicle_history", _v: 1
        }));
        ops.push(plateLinks.items.upsert({
            id: plateLinkId, ownerId, plateId, vehicleId, updatedAt: now, _type: "plate_link", _v: 1
        }));
        ops.push(plateHistory.items.create({
            id: plateHistId, ownerId, plateId, vehicleId, assignedAt: now, unassignedAt: null,
            _type: "plate_history", _v: 1
        }));
        ops.push(vehicles.items.upsert({
            id: activeId, ownerId, vehicleId, registrationNormalized: plateId, updatedAt: now, _type: "vehicle_active", _v: 1
        }));

        // Optional: mark the previous plate_history event's unassignedAt
        if (prevVehicleId && prevVehicleId !== vehicleId) {
            // naive: write a closing row; if you want to *patch* the last row instead, store its id in the plate_link doc
            ops.push(plateHistory.items.create({
                id: `plate_hist|${ownerId}|${plateId}|${now}-close`,
                ownerId, plateId, vehicleId: prevVehicleId, assignedAt: null, unassignedAt: now,
                _type: "plate_history_close", _v: 1
            }));
        }

        const results = await Promise.all(ops);
        context.res = {
            status: 201,
            body: {
                success: true,
                vehicleId,
                latestId: results[0]?.resource?.id,
                vehicle: latestDoc,
                message: "Vehicle saved successfully"
            }
        };
    } catch (error) {
        const status = error.message === "unauthorized" ? 401 : 500;
        context.res = { status, body: { error: status === 401 ? "Authentication failed" : "Internal server error", details: error.message } };
    }
}
