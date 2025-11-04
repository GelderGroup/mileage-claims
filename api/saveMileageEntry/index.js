import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileagedb');
const container = database.container('mileageEntries');

// JWT validation for Microsoft 365 tokens
const client = jwksClient({
    jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys'
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

async function validateToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            audience: process.env.AZURE_CLIENT_ID,
            issuer: 'https://login.microsoftonline.com/common/v2.0',
            algorithms: ['RS256']
        }, (err, decoded) => {
            if (err) {
                reject(new Error('Invalid token'));
            } else {
                resolve(decoded);
            }
        });
    });
}

export default async function (context, req) {
    context.log('Save mileage entry request received');
    context.log('Request method:', req.method);
    context.log('Request headers:', JSON.stringify(req.headers, null, 2));
    context.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        // Validate authentication
        context.log('Validating authentication token...');
        const user = await validateToken(req.headers.authorization);
        context.log('Authentication successful for user:', user.email);

        // Validate request body
        const { startPostcode, endPostcode, date, distance, reason } = req.body;
        context.log('Extracted fields:', { startPostcode, endPostcode, date, distance, reason });

        if (!startPostcode || !endPostcode || !date || !distance || !reason) {
            context.log('Missing required fields:', { startPostcode: !!startPostcode, endPostcode: !!endPostcode, date: !!date, distance: !!distance, reason: !!reason });
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
        context.log('Attempting to save to Cosmos DB...');
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
        context.log.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });

        context.res = {
            status: error.message.includes('token') ? 401 : 500,
            body: {
                error: error.message.includes('token') ? 'Authentication failed' : 'Internal server error',
                details: error.message
            }
        };
    }
};