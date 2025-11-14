import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";
import { geocodePostcode } from "../_lib/locationCore.js";
import crypto from "node:crypto";

const entries = getCosmosContainer("mileagedb", "mileageEntries");

export default async function (context, req) {
    try {
        const user = getClientPrincipal(req);
        if (!user?.email) {
            context.res = {
                status: 401,
                body: { error: "unauthorised", details: "User context is missing" }
            };
            return;
        }

        const {
            id,
            date,
            startPostcode,
            endPostcode,
            distance,
            distanceOverride,
            distanceOverrideReason,
            distanceOverrideDetails
        } = req.body || {};

        if (!startPostcode || !endPostcode || !date || distance == null) {
            context.res = {
                status: 400,
                body: { error: 'bad_request', details: 'Missing required fields' }
            };
            return;
        }

        // 1) Geocode both postcodes server-side (gives us canonical pc + lat/lng + label)
        const [from, to] = await Promise.all([
            geocodePostcode(startPostcode),
            geocodePostcode(endPostcode)
        ]);

        // 2) New vs existing
        const isNew = !id;
        const entryId = isNew ? crypto.randomUUID() : id;
        const nowIso = new Date().toISOString();

        // 3) Build entry document
        const entry = {
            id: entryId,
            userId: user.email,

            date,

            // Canonical postcodes + coords + pretty labels
            startPostcode: from.postcode,
            endPostcode: to.postcode,
            startLat: from.lat,
            startLng: from.lng,
            endLat: to.lat,
            endLng: to.lng,
            startLabel: from.label,
            endLabel: to.label,

            distance: Number(distance),

            distanceOverride:
                distanceOverride === '' || distanceOverride == null
                    ? null
                    : Number(distanceOverride),
            distanceOverrideReason: distanceOverrideReason?.trim() || null,
            distanceOverrideDetails: distanceOverrideDetails?.trim() || null,

            status: "draft",
            createdAt: nowIso,
            submittedAt: null
        };

        // 4) Upsert into Cosmos (create or replace)
        const { resource } = await entries.items.upsert(entry);

        context.res = {
            status: isNew ? 201 : 200,
            body: {
                success: true,
                entry: resource,
                message: isNew ? "Mileage entry created" : "Mileage entry updated"
            }
        };
    } catch (err) {
        context.log.error(err);
        const status = /x-ms-client-principal/.test(err.message) ? 401 : 500;
        context.res = {
            status,
            body: {
                error: status === 401 ? "Authentication failed" : "Internal server error",
                details: err.message
            }
        };
    }
}
