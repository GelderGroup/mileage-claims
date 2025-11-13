import { reverseGeocodeToPostcode } from '../_lib/locationCore.js';

export default async function (context, req) {
    try {
        const { latitude, longitude } = req.body || {};
        const result = await reverseGeocodeToPostcode(latitude, longitude);
        context.res = { status: 200, body: { postcode: result.postcode } };
    } catch (err) {
        context.log.error(err);
        context.res = {
            status: 400,
            body: { error: 'reverse_geocode_failed', detail: err.message }
        };
    }
}
