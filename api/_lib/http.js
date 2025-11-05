export const json = (c, status, body) =>
    (c.res = { status, headers: { 'Content-Type': 'application/json' }, body });

export const ok = (c, body) => json(c, 200, body);

export const err = (c, status, message, details) =>
    json(c, status, { error: message, ...(details && { details }) });

// Convenience: extract principal or send 401 and throw to stop execution
export const principalOr401 = (c, req, getClientPrincipal) => {
    try { return getClientPrincipal(req); }
    catch (e) { err(c, 401, 'Authentication failed'); throw e; }
};
