import { reverseGeocodeToPostcode } from '../_lib/locationCore.js';

export default async function (context, req) {
    try {
        context.log.info('Raw request body:', req.body);
        const { latitude, longitude } = req.body || {};
        context.log.info('Received request for reverse geocoding:', { latitude, longitude });
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            throw new Error('Latitude and longitude must be numbers. Received: ' + JSON.stringify({ latitude, longitude }));
        }
        const result = await reverseGeocodeToPostcode(latitude, longitude);
        context.log.info('Reverse geocoding result:', result);
        if (!result || !result.postcode) {
            context.log.warn('No postcode found for coordinates:', { latitude, longitude });
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
        context.log.error('Reverse geocoding error:', err);
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
