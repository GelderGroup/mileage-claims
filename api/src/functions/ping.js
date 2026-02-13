import { app } from "@azure/functions";

app.http("ping", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        return { status: 200, body: "ok" };
    }
});
