import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileagedb');
const container = database.container('mileageEntries');

// Extract user from Azure EasyAuth headers
function getUserFromHeaders(req) {
    // Azure Static Web Apps provides user info in headers when EasyAuth is enabled
    const userHeader = req.headers['x-ms-client-principal'];

    if (!userHeader) {
        throw new Error('No authentication information found');
    }

    try {
        // Decode the base64-encoded user principal
        const userInfo = JSON.parse(Buffer.from(userHeader, 'base64').toString());

        // Extract email from user claims
        const email = userInfo.claims?.find(claim =>
            claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' ||
            claim.typ === 'email' ||
            claim.typ === 'preferred_username'
        )?.val;

        if (!email) {
            throw new Error('No email found in user claims');
        }

        return {
            email: email,
            userId: userInfo.userId,
            identityProvider: userInfo.identityProvider
        };
    } catch (error) {
        throw new Error('Invalid authentication data');
    }
}

export default async function (context, req) {
    context.log('Save mileage entry request received (EasyAuth)');
    context.log('Request method:', req.method);
    context.log('Request headers:', Object.keys(req.headers || {}));

    try {
        // Extract user from Azure EasyAuth headers
        let user;
        try {
            user = getUserFromHeaders(req);
            context.log('User authenticated via EasyAuth:', user.email);
        } catch (authError) {
            context.log('Authentication failed:', authError.message);
            context.res = {
                status: 401,
                body: { error: 'Authentication required' }
            };
            return;
        }

        // Validate request body
        const { startPostcode, endPostcode, date, distance, reason } = req.body;
        context.log('Extracted fields:', { startPostcode, endPostcode, date, distance, reason });

        if (!startPostcode || !endPostcode || !date || !distance || !reason) {
            context.log('Missing required fields');
            context.res = {
                status: 400,
                body: { error: 'Missing required fields' }
            };
            return;
        }

        // Create entry with unique ID
        const entryId = `${user.email}_${Date.now()}`;
        const entry = {
            id: entryId,
            userId: user.email,
            startPostcode,
            endPostcode,
            date,
            distance: parseFloat(distance),
            reason,
            submittedBy: user.email,
            submittedAt: new Date().toISOString(),
            status: 'submitted'
        };

        context.log('Creating entry:', JSON.stringify(entry, null, 2));

        // Save to Cosmos DB
        const { resource } = await container.items.create(entry);
        context.log('Successfully saved to Cosmos DB:', resource.id);

        context.res = {
            status: 201,
            body: {
                success: true,
                id: entryId,
                message: 'Mileage entry saved successfully'
            }
        };

    } catch (error) {
        context.log.error('Error saving mileage entry:', error);
        context.log.error('Error stack:', error.stack);

        context.res = {
            status: 500,
            body: {
                error: 'Internal server error',
                details: error.message
            }
        };
    }
};