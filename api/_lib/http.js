// Force a proper HTTP response using the Web Response API.
// This avoids the host re-shaping the object and losing content-type.
export const json = (c, status, body) => {
    c.res = new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8' }
    });
};

export const ok = (c, body) => json(c, 200, body);
export const err = (c, status, msg, details) =>
    json(c, status, { error: msg, ...(details && { details }) });

export const principalOr401 = (c, req, getPrincipal) => {
    try { return getPrincipal(req); }
    catch (e) { err(c, 401, 'Authentication failed'); throw e; }
};
