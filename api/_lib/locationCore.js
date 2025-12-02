const BASE_URL = 'https://api.postcodes.io';

function normalisePostcode(pc) {
    return pc?.trim().toUpperCase() || '';
}

export async function postcodeFromCoords(latitude, longitude) {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error('Latitude and longitude must be numbers');
    }
    const res = await fetch(`${BASE_URL}/postcodes?lon=${longitude}&lat=${latitude}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.status !== 200 || !json.result || !json.result[0]) {
        throw new Error(json.error || 'No postcode found for these coordinates');
    }
    return { postcode: json.result[0].postcode };
}

// postcode -> { postcode, lat, lng, label }
export async function geocodePostcode(postcode) {
    const pc = normalisePostcode(postcode);
    if (!pc) {
        throw new Error('Postcode is required');
    }

    const res = await fetch(`${BASE_URL}/postcodes/${encodeURIComponent(pc)}`);
    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.status !== 200 || !json.result) {
        throw new Error(json.error || `Postcode lookup failed (${res.status})`);
    }

    const r = json.result;

    const canonical = r.postcode;
    const lat = r.latitude;
    const lng = r.longitude;

    // Prefer town/city/village for label, fallback as needed
    let label =
        r.admin_district || // often the town/city
        r.parish ||
        r.admin_ward ||
        r.primary_care_trust ||
        canonical;

    return {
        postcode: canonical,
        lat,
        lng,
        label
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
