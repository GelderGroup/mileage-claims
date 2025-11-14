export async function calculateDistance(startPostcode, endPostcode) {
    const res = await fetch('/api/routeMiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startPostcode, endPostcode })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(json.detail || json.error || 'Failed to calculate distance');
    }

    return json.miles;
}

// POST: include cookies, no bearer
export async function saveMileageEntry(mileageData) {
    const res = await fetch("/api/saveMileageEntry", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mileageData),
    });

    if (!res.ok) throw new Error((await res.text()) || `Server error: ${res.status}`);
    return res.json();
}

// GET: include cookies, no bearer
export async function getMileageEntries() {
    const res = await fetch("/api/getMileageEntries", {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    if (!res.ok) throw new Error(`Failed to fetch entries: ${res.status}`);
    return res.json();
}

export async function loadMileageDrafts() {
    const res = await fetch('/api/mileage-drafts');
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(json.details || json.error || 'Failed to load mileage drafts');
    }

    return json; // array of entries
}
