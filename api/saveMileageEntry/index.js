import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";
import { geocodePostcode } from "../_lib/locationCore.js";
import crypto from "node:crypto";

const toNumberOrNull = (v) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

const toTrimmedOrNull = (v) => {
    if (v == null) return null;
    const s = String(v).trim();
    return s ? s : null;
};

export default async function saveMileageEntry(context, req) {
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

            // client may send these, but server will canonicalise
            distance,
            distanceCalculated,
            overrideEnabled,
            distanceOverride,
            distanceOverrideReason,
            distanceOverrideDetails
        } = req.body || {};

        if (!startPostcode || !endPostcode || !date) {
            context.res = {
                status: 400,
                body: { error: "bad_request", details: "Missing required fields" }
            };
            return;
        }

        // ---- normalise override-related fields
        const overrideOn = !!overrideEnabled;
        const distCalculatedNum = toNumberOrNull(distanceCalculated);
        const distOverrideNum = toNumberOrNull(distanceOverride);
        const overrideReason = toTrimmedOrNull(distanceOverrideReason);
        const overrideDetails = toTrimmedOrNull(distanceOverrideDetails);
        const distClientNum = toNumberOrNull(distance);

        // ---- validate override rules (server-side protection)
        if (overrideOn) {
            if (distCalculatedNum == null) {
                context.res = {
                    status: 400,
                    body: {
                        error: "bad_request",
                        details: "distanceCalculated is required when overrideEnabled is true"
                    }
                };
                return;
            }

            if (distOverrideNum == null || distOverrideNum <= 0) {
                context.res = {
                    status: 400,
                    body: {
                        error: "bad_request",
                        details: "distanceOverride must be a positive number when overrideEnabled is true"
                    }
                };
                return;
            }

            if (!overrideReason) {
                context.res = {
                    status: 400,
                    body: {
                        error: "bad_request",
                        details: "distanceOverrideReason is required when overrideEnabled is true"
                    }
                };
                return;
            }

            if (!overrideDetails) {
                context.res = {
                    status: 400,
                    body: {
                        error: "bad_request",
                        details: "distanceOverrideDetails is required when overrideEnabled is true"
                    }
                };
                return;
            }
        }

        // ---- compute effective distance (stored in `distance`)
        // If override is enabled, distance = override miles.
        // Else distance = calculated miles if provided, else fall back to client `distance`.
        const effectiveDistance =
            overrideOn ? distOverrideNum : (distCalculatedNum ?? distClientNum);

        if (effectiveDistance == null) {
            context.res = {
                status: 400,
                body: {
                    error: "bad_request",
                    details: "A distance value is required (distanceCalculated or distance, or enable override with distanceOverride)"
                }
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

        // If override isn't enabled, null out override fields to keep doc consistent.
        const storedOverride = overrideOn
            ? {
                overrideEnabled: true,
                distanceOverride: distOverrideNum,
                distanceOverrideReason: overrideReason,
                distanceOverrideDetails: overrideDetails
            }
            : {
                overrideEnabled: false,
                distanceOverride: null,
                distanceOverrideReason: null,
                distanceOverrideDetails: null
            };

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

            // effective distance used for claiming/submitting
            distance: Number(effectiveDistance),

            // always store calculated distance when supplied (or null)
            distanceCalculated: distCalculatedNum,

            ...storedOverride,

            status: "draft",
            createdAt: nowIso,   // consider preserving on update + adding updatedAt
            submittedAt: null
        };

        // 4) Upsert into Cosmos (create or replace)
        const entries = getCosmosContainer("mileagedb", "mileageEntries");
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
