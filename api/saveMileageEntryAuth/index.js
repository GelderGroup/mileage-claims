import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileagedb');
const container = database.container('mileageEntries');

// Simple token validation - just extract user info without full JWT verification
async function extractUserFromToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing authorization header');
    }

    const token = authHeader.substring(7);

    try {
        // Simple base64 decode of JWT payload (without signature verification for now)
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        console.log('Token payload:', payload);

        // Extract user email from various possible fields
        const userEmail = payload.email || payload.preferred_username || payload.upn || payload.unique_name;

        if (!userEmail) {
            throw new Error('No user email found in token');
        }

        return { email: userEmail };
    } catch (error) {
        console.log('Token extraction error:', error.message);
        throw new Error('Invalid token');
    }
}

export default async function (context, req) {
    context.log('Save mileage entry request received (with simple auth)');
    context.log('Request method:', req.method);
    context.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        // Extract user from token (simple validation)
        let user;
        try {
            user = await extractUserFromToken(req.headers.authorization);
            context.log('User extracted from token:', user.email);
        } catch (authError) {
            context.log('Authentication failed:', authError.message);
            context.res = {
                status: 401,
                body: { error: 'Authentication failed' }
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