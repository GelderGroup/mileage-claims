export async function getMileageSubmissions() {
    const res = await fetch('/api/getMileageSubmissions');
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(json.details || json.error || 'Failed to load mileage submissions');
    }

    return json; // array of entries
}