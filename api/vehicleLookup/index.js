export default async function (context, req) {
    try {
        const registrationNumber = req.body?.registrationNumber?.toUpperCase().replace(/\s+/g, '');
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);

        const res = await fetch('https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles', {
            method: 'POST',
            headers: { 'x-api-key': process.env.DVLA_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationNumber }),
            signal: ctrl.signal
        });

        clearTimeout(timer);

        const data = await res.json();
        context.res = { status: res.status, body: data };
    } catch (err) {
        context.log.error(err);
        context.res = { status: 500, body: { error: 'lookup_failed', detail: err.message } };
    }
}
