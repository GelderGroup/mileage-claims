import { app } from "@azure/functions";

app.http("vehicleLookup", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "vehicleLookup",
    handler: async (request, context) => {
        try {
            const body = await request.json().catch(() => ({}));
            const registrationNumber = body?.registrationNumber
                ?.toUpperCase()
                .replace(/\s+/g, "");

            if (!registrationNumber) {
                return {
                    status: 400,
                    jsonBody: { error: "bad_request", detail: "registrationNumber is required" }
                };
            }

            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 8000);

            const res = await fetch(
                "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
                {
                    method: "POST",
                    headers: {
                        "x-api-key": process.env.DVLA_API_KEY,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ registrationNumber }),
                    signal: ctrl.signal
                }
            );

            clearTimeout(timer);

            const data = await res.json().catch(() => ({}));
            return { status: res.status, jsonBody: data };
        } catch (err) {
            context.error(err);
            return {
                status: 500,
                jsonBody: { error: "lookup_failed", detail: err?.message || "Unknown error" }
            };
        }
    }
});
