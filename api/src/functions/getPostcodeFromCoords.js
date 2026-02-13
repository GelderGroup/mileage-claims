import { app } from "@azure/functions";
import { postcodeFromCoords } from "../../_lib/locationCore.js";

app.http("getPostcodeFromCoords", {
    methods: ["POST"],
    authLevel: "anonymous", // let SWA route rules handle auth
    route: "getPostcodeFromCoords",
    handler: async (request, context) => {
        try {
            const body = await request.json().catch(() => ({}));
            const { latitude, longitude } = body;

            if (typeof latitude !== "number" || typeof longitude !== "number") {
                throw new Error(
                    "Latitude and longitude must be numbers. Received: " +
                    JSON.stringify({ latitude, longitude })
                );
            }

            const result = await postcodeFromCoords(latitude, longitude);

            if (!result?.postcode) {
                return {
                    status: 404,
                    jsonBody: {
                        error: "postcode_not_found",
                        detail: "No postcode found for your location. Please enter it manually.",
                        received: body ?? null
                    }
                };
            }

            return {
                status: 200,
                jsonBody: { postcode: result.postcode }
            };
        } catch (err) {
            context.error(err);
            return {
                status: 500,
                jsonBody: {
                    error: "reverse_geocode_failed",
                    detail: err?.message,
                    stack: err?.stack,
                    received: await request.json().catch(() => null)
                }
            };
        }
    }
});
