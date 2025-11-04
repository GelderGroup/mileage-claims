import { CosmosClient } from '@azure/cosmos';

const cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = cosmosClient.database('mileagedb');
const container = database.container('mileageEntries');

export default async function (context, req) {
    context.log('Save mileage entry request received');
    context.log('Request method:', req.method);
    context.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        // Validate request body
        const { startPostcode, endPostcode, date, distance, reason, submittedBy } = req.body;
        context.log('Extracted fields:', { startPostcode, endPostcode, date, distance, reason, submittedBy });

        if (!startPostcode || !endPostcode || !date || !distance || !reason) {
            context.log('Missing required fields:', { startPostcode: !!startPostcode, endPostcode: !!endPostcode, date: !!date, distance: !!distance, reason: !!reason });
            context.res = {
                status: 400,
                body: { error: 'Missing required fields' }
            };
            return;
        }

        // Create entry with unique ID
        const userEmail = submittedBy || 'unknown@user.com';
        const entryId = `${userEmail}_${Date.now()}`;
        const entry = {
            id: entryId,
            userId: userEmail,
            startPostcode,
            endPostcode,
            date,
            distance: parseFloat(distance),
            reason,
            submittedBy: userEmail,
            submittedAt: new Date().toISOString(),
            status: 'submitted'
        };

        context.log('Creating entry:', JSON.stringify(entry, null, 2));

        // Save to Cosmos DB
        context.log('Attempting to save to Cosmos DB...');
        context.log('Database name:', database.id);
        context.log('Container name:', container.id);

        // Test database connection first
        try {
            await database.read();
            context.log('Database connection successful');
        } catch (dbError) {
            context.log('Database connection failed:', dbError.message);
            throw new Error(`Database connection failed: ${dbError.message}`);
        }

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
            status: 500,
            body: {
                error: 'Internal server error',
                details: error.message
            }
        };
    }
};