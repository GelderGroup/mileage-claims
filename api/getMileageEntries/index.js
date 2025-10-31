import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { TableClient } from '@azure/data-tables';

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

        // Create table client
        const tableClient = TableClient.fromConnectionString(
            process.env.AzureWebJobsStorage,
            'MileageEntries'
        );

        // Query entries for this user
        const entities = [];
        const entitiesIter = tableClient.listEntities({
            queryOptions: { filter: `PartitionKey eq '${user.email}'` }
        });

        for await (const entity of entitiesIter) {
            entities.push({
                id: entity.RowKey,
                fromPostcode: entity.fromPostcode,
                toPostcode: entity.toPostcode,
                date: entity.date,
                distance: entity.distance,
                reason: entity.reason,
                submittedAt: entity.submittedAt,
                status: entity.status
            });
        }

        // Sort by submission date (newest first)
        entities.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        context.res = {
            status: 200,
            body: entities
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