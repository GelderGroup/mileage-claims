import { getCosmosContainer } from "../_lib/cosmos.js";
import { getClientPrincipal } from "../_lib/auth.js";
import { ok, err, principalOr401 } from "../_lib/http.js";

const vehicleContainer = getCosmosContainer("mileagedb", "vehicles");

export default async function (context, req) {
    try {
        const principal = principalOr401(context, req, getClientPrincipal);

        const { vehicles } = await vehicleContainer.items.query({
            query: "SELECT * FROM c WHERE c.userId = @userId",
            parameters: [{ name: "@userId", value: principal.email }]
        }).fetchAll();

        return ok(context, {
            hasVehicle: vehicles.length > 0,
            vehicle: vehicles[0] ?? null,
            user: { email: principal.email, name: principal.name }
        });

    } catch (e) {
        // If principalOr401 already wrote a 401, context.res is set.
        if (!context.res) err(context, 500, "Internal server error", e.message);
    }
}
