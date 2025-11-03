import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileageClaims');
const container = database.container('vehicles');

export default async function (context, req) {
    try {
        const { userId, registration, make, model } = req.body;

        if (!userId || !registration || !make || !model) {
            context.res = {
                status: 400,
                body: { error: 'Missing required fields: userId, registration, make, model' }
            };
            return;
        }

        // Create vehicle record
        const vehicleRecord = {
            id: `vehicle-${userId}`, // Unique ID for the vehicle record
            userId: userId,
            registration: registration.toUpperCase(),
            make: make,
            model: model,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to Cosmos DB (this will create or replace)
        const { resource } = await container.items.upsert(vehicleRecord);

        context.res = {
            status: 201,
            body: {
                success: true,
                message: 'Vehicle registered successfully',
                vehicle: resource
            }
        };

    } catch (error) {
        context.log.error('Error saving user vehicle:', error);
        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
}