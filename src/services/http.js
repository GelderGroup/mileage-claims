export async function http(path, opts = {}) {
    const res = await fetch(path, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest', ...(opts.body && { 'Content-Type': 'application/json' }), ...opts.headers },
        ...opts
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text();
}
