import { calculateRouteMiles } from '../_lib/locationCore.js';

export default async function (context, req) {
    try {
        const { startPostcode, endPostcode } = req.body || {};

        const miles = await calculateRouteMiles(startPostcode, endPostcode, {
            profile: 'driving'
        });

        context.res = { status: 200, body: { miles } };
    } catch (err) {
        context.log.error(err);
        context.res = {
            status: 400,
            body: { error: 'route_failed', detail: err.message }
        };
    }
}
