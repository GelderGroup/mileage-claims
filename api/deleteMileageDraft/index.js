import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";

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

        const { id: draftId } = req.body || {};
        if (!draftId) {
            context.res = {
                status: 400,
                body: { error: 'bad_request', details: 'Missing draft id' }
            };
            return;
        }

        const partitionKey = user.email;
        await entries.item(draftId, partitionKey).delete();
        context.res = {
            status: 200,
            body: { success: true }
        };
    } catch (error) {
        context.log.error('Error deleting mileage draft:', error);
        context.res = {
            status: 500,
            body: { error: error.message || 'Failed to delete mileage draft' }
        };
    }
};
