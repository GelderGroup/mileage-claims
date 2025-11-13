export function getCurrentLocationPostcode() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return Promise.reject(new Error('Geolocation is not supported in this browser'));
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            async pos => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch('/api/postcodeFromCoords', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ latitude, longitude })
                    });
                    const json = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(json.detail || json.error || 'Reverse geocoding failed');
                    resolve(json.postcode);
                } catch (err) {
                    reject(err);
                }
            },
            err => {
                if (err.code === err.TIMEOUT) {
                    reject(new Error('Getting your location took too long. Please enter your postcode manually.'));
                } else if (err.code === err.PERMISSION_DENIED) {
                    reject(new Error('Location access was denied. Please enter it manually.'));
                } else {
                    reject(new Error(err.message || 'Unable to get your location.'));
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 20000,
                maximumAge: 5 * 60_000
            }
        );
    });
}