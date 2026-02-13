import { app } from "@azure/functions";
import { getCosmosContainer } from "../../_lib/cosmos.js";
import { getClientPrincipal } from "../../_lib/auth.js";

app.http("deleteMileageDraft", {
    methods: ["DELETE"],
    authLevel: "anonymous",
    route: "deleteMileageDraft",
    handler: async (request, context) => {
        try {
            // SWA passes identity via headers; your helper should read from request.headers now
            const user = getClientPrincipal(request);
            if (!user?.email) {
                return {
                    status: 401,
                    jsonBody: { error: "unauthorised", details: "User context is missing" }
                };
            }

            const body = await request.json().catch(() => ({}));
            const draftId = body?.id;
            if (!draftId) {
                return {
                    status: 400,
                    jsonBody: { error: "bad_request", details: "Missing draft id" }
                };
            }

            const partitionKey = user.email;
            const entries = getCosmosContainer("mileagedb", "mileageEntries");
            await entries.item(draftId, partitionKey).delete();

            return { status: 200, jsonBody: { success: true } };
        } catch (error) {
            context.error("Error deleting mileage draft:", error);
            return {
                status: 500,
                jsonBody: { error: error?.message || "Failed to delete mileage draft" }
            };
        }
    }
});
