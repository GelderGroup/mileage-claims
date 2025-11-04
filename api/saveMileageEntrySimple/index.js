import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileagedb');
const container = database.container('mileageEntries');

export default async function (context, req) {
    context.log('Simple save mileage entry function started');

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

        context.log('Request body:', JSON.stringify(req.body, null, 2));

        // Get data from request body
        const { startPostcode, endPostcode, date, distance, reason } = req.body;

        if (!startPostcode || !endPostcode || !date || !distance) {
            context.res = {
                status: 400,
                body: { error: 'Missing required fields' }
            };
            return;
        }

        // Create entry with simple ID (no authentication for testing)
        const entryId = `test_${Date.now()}`;
        const entry = {
            id: entryId,
            userId: 'test@example.com', // Hard-coded for testing
            startPostcode,
            endPostcode,
            date,
            distance: parseFloat(distance),
            reason: reason || 'Business travel',
            submittedBy: 'test@example.com',
            submittedAt: new Date().toISOString(),
            status: 'submitted'
        };

        context.log('Creating entry:', JSON.stringify(entry, null, 2));

        // Save to Cosmos DB
        const { resource } = await container.items.create(entry);

        context.log('Successfully saved:', resource.id);

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