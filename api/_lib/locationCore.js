// api/locationCore.js
const POSTCODES_BASE = 'https://api.postcodes.io';

function normalisePostcode(pc) {
    return pc.trim().toUpperCase();
}

export async function geocodePostcode(postcode) {
    const pc = normalisePostcode(postcode);
    if (!pc) throw new Error('Postcode is required');

    const res = await fetch(`${POSTCODES_BASE}/postcodes/${encodeURIComponent(pc)}`);
    const json = await res.json();

    if (!res.ok || json.status !== 200 || !json.result) {
        throw new Error(json.error || 'Postcode not found');
    }

    const { postcode: canonical, latitude, longitude } = json.result;
    return { postcode: canonical, lat: latitude, lng: longitude };
}

export async function reverseGeocodeToPostcode(lat, lng) {
    if (lat == null || lng == null) {
        throw new Error('Latitude and longitude are required');
    }

    const url = `${POSTCODES_BASE}/postcodes?lon=${encodeURIComponent(lng)}&lat=${encodeURIComponent(lat)}`;
    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.error || `Reverse geocoding failed (${res.status})`);
    }

    const result = json.result?.[0];
    if (!result) {
        throw new Error('We couldn’t match your current location to a postcode. Please enter it manually.');
    }

    return {
        postcode: result.postcode,
        lat: result.latitude,
        lng: result.longitude
    };
}

// --- Mapbox routing
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

export async function calculateRouteMiles(startPostcode, endPostcode, { profile = 'driving' } = {}) {
    if (!MAPBOX_TOKEN) {
        throw new Error('MAPBOX_TOKEN is not configured on the server');
    }

    const start = startPostcode?.trim();
    const end = endPostcode?.trim();
    if (!start || !end) throw new Error('Both start and end postcodes are required.');

    const [from, to] = await Promise.all([
        geocodePostcode(start),
        geocodePostcode(end)
    ]);

    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;

    const url =
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}` +
        `?geometries=geojson&overview=false&access_token=${encodeURIComponent(MAPBOX_TOKEN)}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok) {
        const msg = json?.message || `Routing failed (${res.status})`;
        throw new Error(msg);
    }

    const route = json.routes?.[0];
    if (!route) {
        throw new Error('No route found between these locations.');
    }

    const meters = route.distance;
    const miles = meters / 1609.344;
    return Math.round(miles * 10) / 10;
}
