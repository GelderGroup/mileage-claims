import { CosmosClient } from '@azure/cosmos';
import { getClientPrincipal } from '../_lib/auth';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileagedb');
const container = database.container('vehicles');

export default async function (context, req) {
    context.log('SaveUserVehicle function started (EasyAuth version)');

    try {
        // Check if Cosmos connection string exists
        if (!process.env.COSMOS_CONNECTION_STRING) {
            context.log.error('COSMOS_CONNECTION_STRING environment variable is missing');
            context.res = {
                status: 500,
                body: { error: 'Database configuration error: connection string missing' }
            };
            return;
        }

        // Extract user from EasyAuth headers
        let user;
        try {
            user = getClientPrincipal(req);
            context.log('User extracted from EasyAuth:', user.email);
        } catch (authError) {
            context.log('Authentication failed:', authError.message);
            context.res = {
                status: 401,
                body: { error: 'Authentication failed', details: authError.message }
            };
            return;
        }

        context.log('Request body:', JSON.stringify(req.body));
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
        context.log.error('Error details:', error.message);
        context.log.error('Error stack:', error.stack);

        context.res = {
            status: 500,
            body: {
                error: 'Internal server error',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
}