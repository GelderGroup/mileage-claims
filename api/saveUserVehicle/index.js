import { getClientPrincipal } from '../_lib/auth.js';
import { getCosmosContainer } from '../_lib/cosmos.js';

const vehicles = getCosmosContainer("mileagedb", "vehicles");

export default async function (context, req) {
    try {
        const user = getClientPrincipal(req);
        const { registration, make, model } = req.body;

        if (!registration || !make || !model) {
            context.res = {
                status: 400,
                body: { error: 'Missing required fields: registration, make, model' }
            };
            return;
        }

        // Create vehicle record using authenticated user's email
        const vehicleRecord = {
            id: `vehicle-${user.email}`, // Unique ID for the vehicle record
            userId: user.email, // Use authenticated user's email
            registration: registration.toUpperCase(),
            make: make,
            model: model,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to Cosmos DB (this will create or replace)
        const { resource } = await vehicles.items.upsert(vehicleRecord);

        context.res = { status: 201, body: { success: true, id: resource.id, message: "Vehicle saved successfully" } };
    } catch (error) {
        const status = /x-ms-client-principal/.test(error.message) ? 401 : 500;
        context.res = { status, body: { error: status === 401 ? "Authentication failed" : "Internal server error", details: error.message } };
    }
}