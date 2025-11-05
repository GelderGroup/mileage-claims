export const json = (c, status, body) => {
    c.res = { status, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body };
};

export const ok = (c, body) => json(c, 200, body);
export const err = (c, status, message, det) => json(c, status, { error: message, ...(det && { details: det }) });

export const principalOr401 = (c, req, getPrincipal) => {
    try { return getPrincipal(req); }
    catch (e) { err(c, 401, 'Authentication failed'); throw e; }
};
