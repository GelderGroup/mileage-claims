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