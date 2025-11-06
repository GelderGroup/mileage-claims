const VRM = s => String(s || '').toUpperCase().replace(/\s+/g, '');

export default async function (context, req) {
    try {
        const vrm = VRM(req.body?.registrationNumber || req.query?.registrationNumber);
        if (!/^[A-Z0-9]{1,8}$/.test(vrm)) {
            context.res = { status: 400, body: { error: 'invalid_registration' } }; return;
        }

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);

        const r = await fetch('https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles', {
            method: 'POST',
            headers: { 'x-api-key': process.env.DVLA_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationNumber: vrm }),
            signal: ctrl.signal
        });
        const text = await r.text();
        clearTimeout(timer);

        if (!r.ok) {
            context.res = { status: r.status, body: { error: 'lookup_failed', detail: text.slice(0, 300) } }; return;
        }

        const data = JSON.parse(text);
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
                registration: vrm,
                make: data.make, model: data.model, colour: data.colour,
                fuelType: data.fuelType, engineCapacity: data.engineCapacity,
                firstReg: data.monthOfFirstRegistration
            }
        };
    } catch (err) {
        context.log.error(err);
        context.res = { status: 504, body: { error: 'upstream_timeout' } };
    }
}
