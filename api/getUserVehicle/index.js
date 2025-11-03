import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileageClaims');
const container = database.container('vehicles');

export default async function (context, req) {
    try {
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
        context.res = {
            status: 500,
            body: { error: 'Internal server error' }
        };
    }
}