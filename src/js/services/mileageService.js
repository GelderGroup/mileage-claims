import drafts from '../../../data/drafts.json' assert { type: `json` };

export async function calculateDistance(startPostcode, endPostcode) {
    const res = await fetch('/api/getRouteMiles', {
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

export async function getMileageDrafts() {
    // const res = await fetch('/api/getMileageDrafts');
    // const json = await res.json().catch(() => ({}));

    // if (!res.ok) {
    //     throw new Error(json.details || json.error || 'Failed to load mileage drafts');
    // }

    // return json; // array of entries

    return Promise.resolve(drafts);
}

export async function deleteMileageDraft(draftId) {
    const res = await fetch("/api/deleteMileageDraft", {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: draftId }),
    });

    if (!res.ok) throw new Error((await res.text()) || `Server error: ${res.status}`);
    return res.json();
}
