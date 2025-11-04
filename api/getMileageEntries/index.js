import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { CosmosClient } from '@azure/cosmos';

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
    context.log('Get mileage entries request received');

    try {
        // Validate authentication
        const user = await validateToken(req.headers.authorization);

        // Initialize Cosmos DB client inside the function
        if (!process.env.COSMOS_CONNECTION_STRING) {
            throw new Error('COSMOS_CONNECTION_STRING environment variable is not set');
        }

        const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
        const database = cosmosClient.database('mileagedb');
        const container = database.container('mileageEntries');

        // Query entries for this user from Cosmos DB
        const querySpec = {
            query: "SELECT * FROM c WHERE c.userId = @userId",
            parameters: [
                {
                    name: "@userId",
                    value: user.email
                }
            ]
        };

        const { resources: entries } = await container.items.query(querySpec).fetchAll();

        // Transform entries to expected format
        const formattedEntries = entries.map(entry => ({
            id: entry.id,
            startPostcode: entry.startPostcode,
            endPostcode: entry.endPostcode,
            date: entry.date,
            distance: entry.distance,
            reason: entry.reason,
            submittedAt: entry.submittedAt,
            status: entry.status
        }));

        // Sort by submission date (newest first)
        formattedEntries.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        context.res = {
            status: 200,
            body: formattedEntries
        };

    } catch (error) {
        context.log.error('Error getting mileage entries:', error);

        context.res = {
            status: error.message.includes('token') ? 401 : 500,
            body: {
                error: error.message.includes('token') ? 'Authentication failed' : 'Internal server error'
            }
        };
    }
};