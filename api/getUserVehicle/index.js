import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileagedb');
const container = database.container('vehicles');

// Extract user information from Azure EasyAuth headers
function getUserFromHeaders(req) {
    // Azure EasyAuth automatically sets this header when user is authenticated
    const clientPrincipal = req.headers['x-ms-client-principal'];

    if (!clientPrincipal) {
        throw new Error('User not authenticated - x-ms-client-principal header missing');
    }

    try {
        // Decode the base64 encoded client principal
        const decoded = Buffer.from(clientPrincipal, 'base64').toString('utf-8');
        const principal = JSON.parse(decoded);

        if (!principal.userDetails) {
            throw new Error('Invalid user principal - no user details');
        }

        return {
            email: principal.userDetails,
            name: principal.userClaims?.find(claim => claim.typ === 'name')?.val || principal.userDetails
        };
    } catch (error) {
        throw new Error(`Failed to parse user principal: ${error.message}`);
    }
}

export default async function (context, req) {
    context.log('GetUserVehicle function started (EasyAuth version)');

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
            user = getUserFromHeaders(req);
            context.log('User extracted from EasyAuth:', user.email);
        } catch (authError) {
            context.log('Authentication failed:', authError.message);
            context.res = {
                status: 401,
                body: { error: 'Authentication failed', details: authError.message }
            };
            return;
        }

        // Query for user's vehicle using authenticated user email
        const query = {
            query: 'SELECT * FROM c WHERE c.userId = @userId',
            parameters: [
                {
                    name: '@userId',
                    value: user.email
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