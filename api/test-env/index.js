export default async function (context, req) {
    try {
        const key = process.env.DVLA_API_KEY;
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { hasKey: !!key, sample: key ? key.slice(0, 6) + '…' : null }
        };
    } catch (err) {
        context.log.error(err);
        context.res = { status: 500, body: { error: 'server_error' } };
    }
}
