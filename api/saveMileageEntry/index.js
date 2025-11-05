import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";

const entries = getCosmosContainer("mileagedb", "mileageEntries");

export default async function (context, req) {
    try {
        const user = getClientPrincipal(req);
        const { startPostcode, endPostcode, date, distance, reason } = req.body;

        if (!startPostcode || !endPostcode || !date || !distance || !reason) {
            context.res = {
                status: 400,
                body: { error: 'Missing required fields: startPostcode, endPostcode, date, distance, reason' }
            };
            return;
        }

        const entry = {
            id: `${user.email}_${Date.now()}`,
            userId: user.email,
            startPostcode, endPostcode,
            date, distance: Number(distance), reason,
            submittedBy: user.email, submittedAt: new Date().toISOString(),
            status: "submitted"
        };

        // Save to Cosmos DB (this will create or replace)
        const { resource } = await entries.items.create(entry);

        context.res = { status: 201, body: { success: true, id: resource.id, message: "Mileage entry saved" } };
    } catch (err) {
        const status = /x-ms-client-principal/.test(err.message) ? 401 : 500;
        context.res = { status, body: { error: status === 401 ? "Authentication failed" : "Internal server error", details: err.message } };
    }
}
