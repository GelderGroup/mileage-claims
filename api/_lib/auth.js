// api/_lib/auth.js
export function getClientPrincipal(req) {
    const raw = req.headers["x-ms-client-principal"];
    if (!raw) throw new Error("Missing x-ms-client-principal");
    const p = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));

    const claim = (t) => p.claims?.find(c => c.typ === t)?.val;

    return {
        // Stable identifiers
        userId: p.userId || claim("http://schemas.microsoft.com/identity/claims/objectidentifier"),
        // Friendly identifiers
        email: claim("preferred_username") || p.userDetails,
        name: claim("name") || p.userDetails,
        // Roles (may be empty unless you assign app roles)
        roles: p.claims?.filter(c => c.typ === "roles").map(c => c.val) || []
    };
}
