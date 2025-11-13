export const AuthApi = {
    async me() {
        const r = await fetch("/.auth/me", { credentials: "include" });
        if (!r.ok) return null;
        const data = await r.json();
        return (data?.clientPrincipal) || null; // {userId, userDetails, claims:[{typ,val}]}
    },
    login() {
        const ret = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/.auth/login/aad?post_login_redirect_uri=${ret || "/"}`;
    },
    logout() {
        window.location.href = "/.auth/logout?post_logout_redirect_uri=/";
    },
    async isAuthenticated() {
        return !!(await this.me());
    },
    getName(p) {
        const by = t => p?.claims?.find(c => c.typ === t)?.val;
        return by("name") || p?.userDetails || "User";
    },
    getEmail(p) {
        const by = t => p?.claims?.find(c => c.typ === t)?.val;
        return by("preferred_username") || p?.userDetails || null;
    }
};
