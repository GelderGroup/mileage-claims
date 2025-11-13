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
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(mileageData),
    });

    if (!res.ok) throw new Error((await res.text()) || `Server error: ${res.status}`);
    return res.json();
}

// GET: include cookies, no bearer
export async function getMileageEntries() {
    const res = await fetch("/api/getMileageEntries", {
        credentials: "include",
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    if (!res.ok) throw new Error(`Failed to fetch entries: ${res.status}`);
    return res.json();
}