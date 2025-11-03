import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileagedb');
const container = database.container('vehicles');

export default async function (context, req) {
    context.log('GetUserVehicle function started');

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

        // Get user ID from query parameters (this will come from the authenticated user)
        const userId = req.query.userId;

        if (!userId) {
            context.res = {
                status: 400,
                body: { error: 'User ID is required' }
            };
            return;
        }

        // Query for user's vehicle
        const query = {
            query: 'SELECT * FROM c WHERE c.userId = @userId',
            parameters: [
                {
                    name: '@userId',
                    value: userId
                }
            ]
        };

        const { resources } = await container.items.query(query).fetchAll();

        if (resources.length > 0) {
            // User has a registered vehicle
            context.res = {
                status: 200,
                body: {
                    hasVehicle: true,
                    vehicle: resources[0]
                }
            };
        } else {
            // User needs to register a vehicle
            context.res = {
                status: 200,
                body: {
                    hasVehicle: false,
                    vehicle: null
                }
            };
        }

    } catch (error) {
        context.log.error('Error checking user vehicle:', error);
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