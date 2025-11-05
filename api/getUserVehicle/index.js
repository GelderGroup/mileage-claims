import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";
import { ok, err, principalOr401 } from "../_lib/http.js";

const vehicles = getCosmosContainer("mileagedb", "vehicles");

export default async function (context, req) {
    try {
        const principal = principalOr401(context, req, getClientPrincipal);

        const { resources } = await vehicles.items.query({
            query: "SELECT * FROM c WHERE c.userId = @userId",
            parameters: [{ name: "@userId", value: principal.email }]
        }).fetchAll();

        ok(context, {
            hasVehicle: resources.length > 0,
            vehicle: resources[0] ?? null,
            user: { email: principal.email, name: principal.name }
        });

    } catch (e) {
        if (!context.res) err(context, 500, 'Internal server error', e.message);
    }
}
