import { reverseGeocodeToPostcode } from '../_lib/locationCore.js';

export default async function (context, req) {
    try {
        const { latitude, longitude } = req.body || {};
        context.log.info('Received request for reverse geocoding:', { latitude, longitude });
        const result = await reverseGeocodeToPostcode(latitude, longitude);
        context.log.info('Reverse geocoding result:', result);
        context.res = { status: 200, body: { postcode: result.postcode } };
    } catch (err) {
        context.log.error('Reverse geocoding error:', err);
        context.res = {
            status: 400,
            body: {
                error: 'reverse_geocode_failed',
                detail: err.message,
                stack: err.stack,
                received: req.body || null
            }
        };
    }
}
