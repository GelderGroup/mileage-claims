import { app } from "@azure/functions";
import { calculateRouteMiles } from "../../_lib/locationCore.js";

app.http("getRouteMiles", {
    methods: ["POST"],
    authLevel: "anonymous", // SWA handles auth via routes config
    route: "getRouteMiles",
    handler: async (request, context) => {
        try {
            const body = await request.json().catch(() => ({}));
            const { startPostcode, endPostcode } = body;

            const miles = await calculateRouteMiles(startPostcode, endPostcode, {
                profile: "driving"
            });

            return {
                status: 200,
                jsonBody: { miles }
            };
        } catch (err) {
            context.error(err);
            return {
                status: 400,
                jsonBody: {
                    error: "route_failed",
                    detail: err?.message || "Route calculation failed"
                }
            };
        }
    }
});
