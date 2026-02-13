import { app } from "@azure/functions";
import { getCosmosContainer } from "../../_lib/cosmos.js";
import { getClientPrincipal } from "../../_lib/auth.js";
import { geocodePostcode } from "../../_lib/locationCore.js";
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

app.http("saveMileageEntry", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "saveMileageEntry",
    handler: async (request, context) => {
        try {
            const user = getClientPrincipal(request);
            if (!user?.email) {
                return {
                    status: 401,
                    jsonBody: { error: "unauthorised", details: "User context is missing" }
                };
            }

            const body = await request.json().catch(() => ({}));

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
            } = body || {};

            if (!startPostcode || !endPostcode || !date) {
                return {
                    status: 400,
                    jsonBody: { error: "bad_request", details: "Missing required fields" }
                };
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
                    return {
                        status: 400,
                        jsonBody: {
                            error: "bad_request",
                            details: "distanceCalculated is required when overrideEnabled is true"
                        }
                    };
                }

                if (distOverrideNum == null || distOverrideNum <= 0) {
                    return {
                        status: 400,
                        jsonBody: {
                            error: "bad_request",
                            details: "distanceOverride must be a positive number when overrideEnabled is true"
                        }
                    };
                }

                if (!overrideReason) {
                    return {
                        status: 400,
                        jsonBody: {
                            error: "bad_request",
                            details: "distanceOverrideReason is required when overrideEnabled is true"
                        }
                    };
                }

                if (!overrideDetails) {
                    return {
                        status: 400,
                        jsonBody: {
                            error: "bad_request",
                            details: "distanceOverrideDetails is required when overrideEnabled is true"
                        }
                    };
                }
            }

            // ---- compute effective distance (stored in `distance`)
            // If override is enabled, distance = override miles.
            // Else distance = calculated miles if provided, else fall back to client `distance`.
            const effectiveDistance = overrideOn
                ? distOverrideNum
                : (distCalculatedNum ?? distClientNum);

            if (effectiveDistance == null) {
                return {
                    status: 400,
                    jsonBody: {
                        error: "bad_request",
                        details:
                            "A distance value is required (distanceCalculated or distance, or enable override with distanceOverride)"
                    }
                };
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
                createdAt: nowIso, // consider preserving on update + adding updatedAt
                submittedAt: null
            };

            // 4) Upsert into Cosmos (create or replace)
            const entries = getCosmosContainer("mileagedb", "mileageEntries");
            const { resource } = await entries.items.upsert(entry);

            return {
                status: isNew ? 201 : 200,
                jsonBody: {
                    success: true,
                    entry: resource,
                    message: isNew ? "Mileage entry created" : "Mileage entry updated"
                }
            };
        } catch (err) {
            context.error(err);
            const msg = err?.message || "Unknown error";
            const status = /x-ms-client-principal|client-principal/i.test(msg) ? 401 : 500;

            return {
                status,
                jsonBody: {
                    error: status === 401 ? "Authentication failed" : "Internal server error",
                    details: msg
                }
            };
        }
    }
});
