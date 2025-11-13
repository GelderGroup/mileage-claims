// services/postcodeService.js
// Works in browser (fetch + navigator.geolocation) and in Node 18+ (global fetch)

const BASE_URL = 'https://api.postcodes.io';

// Normalise postcode a bit
function normalisePostcode(pc) {
    return pc.trim().toUpperCase();
}

// postcode -> { postcode, lat, lng }
export async function geocodePostcode(postcode) {
    const pc = normalisePostcode(postcode);
    if (!pc) throw new Error('Postcode is required');

    const res = await fetch(`${BASE_URL}/postcodes/${encodeURIComponent(pc)}`);
    if (!res.ok) {
        throw new Error(`Postcode lookup failed (${res.status})`);
    }

    const json = await res.json();
    if (json.status !== 200 || !json.result) {
        throw new Error(json.error || 'Postcode not found');
    }

    const { postcode: canonical, latitude, longitude } = json.result;
    return {
        postcode: canonical,
        lat: latitude,
        lng: longitude
    };
}

// lat/lng -> nearest postcode
export async function reverseGeocodeToPostcode(lat, lng) {
    if (lat == null || lng == null) {
        throw new Error('Latitude and longitude are required');
    }

    const url = `${BASE_URL}/postcodes?lon=${encodeURIComponent(lng)}&lat=${encodeURIComponent(lat)}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Reverse geocoding failed (${res.status})`);
    }

    const json = await res.json();
    const result = json.result?.[0];
    if (!result) throw new Error('No postcode found near your location');

    return {
        postcode: result.postcode,
        lat: result.latitude,
        lng: result.longitude
    };
}

// Browser only: uses navigator.geolocation + reverseGeocodeToPostcode
// postcodeService.js
export function getCurrentLocationPostcode() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return Promise.reject(new Error('Geolocation is not supported in this browser'));
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            async pos => {
                const { latitude, longitude } = pos.coords;
                try {
                    const result = await reverseGeocodeToPostcode(latitude, longitude);
                    resolve(result.postcode);
                } catch (err) {
                    reject(err);
                }
            },
            err => {
                if (err.code === err.TIMEOUT) {
                    reject(new Error('Getting your location took too long. Please enter your postcode manually.'));
                } else if (err.code === err.PERMISSION_DENIED) {
                    reject(new Error('Location access was denied. Please enter your postcode manually.'));
                } else {
                    reject(new Error(err.message || 'Unable to get your location.'));
                }
            },
            {
                enableHighAccuracy: false,   // let it use Wi-Fi/IP if needed
                timeout: 20000,              // 20s, more forgiving
                maximumAge: 5 * 60_000       // reuse a recent fix if it has one
            }
        );
    });
}

