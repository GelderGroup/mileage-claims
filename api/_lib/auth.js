export function getClientPrincipal(request) {
    const raw = request.headers.get("x-ms-client-principal");
    if (!raw) throw new Error("Missing x-ms-client-principal");

    const p = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));

    const claim = (t) => p.claims?.find(c => c.typ === t)?.val;

    return {
        userId:
            p.userId ||
            claim("http://schemas.microsoft.com/identity/claims/objectidentifier"),

        email:
            claim("preferred_username") ||
            claim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress") ||
            p.userDetails,

        name:
            claim("name") ||
            p.userDetails,

        roles:
            p.claims?.filter(c => c.typ === "roles").map(c => c.val) || []
    };
}