import ky from 'ky';

export const api = ky.create({
    prefixUrl: '/api',
    credentials: 'include',
    timeout: 8000,
    retry: { limit: 2 },
    hooks: {
        beforeError: [
            (error) => {
                const { response } = error;
                if (response && response.status === 401) {
                    // e.g. trigger re-login or redirect
                }
                return error;
            }
        ]
    }
});
