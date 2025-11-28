import { postcodeFromCoords } from '../_lib/locationCore.js';

export default async function (context, req) {
    try {
        const { latitude, longitude } = req.body || {};
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            throw new Error('Latitude and longitude must be numbers. Received: ' + JSON.stringify({ latitude, longitude }));
        }
        const result = await postcodeFromCoords(latitude, longitude);
        if (!result || !result.postcode) {
            context.res = {
                status: 404,
                body: {
                    error: 'postcode_not_found',
                    detail: 'No postcode found for the provided coordinates.',
                    received: req.body || null
                }
            };
            return;
        }
        context.res = { status: 200, body: { postcode: result.postcode } };
    } catch (err) {
        context.res = {
            status: 500,
            body: {
                error: 'reverse_geocode_failed',
                detail: err.message,
                stack: err.stack,
                received: req.body || null
            }
        };
    }
}
