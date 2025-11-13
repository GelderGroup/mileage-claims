export async function getCurrentLocationPostcode() {
    if (!("geolocation" in navigator)) throw new Error("Geolocation is not supported by this browser");
    const position = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
    console.log("Would reverse-geocode", position);
    return "SW1A 1AA"; // TODO: replace with real reverse-geocode
}

export async function calculateDistance(startPostcode, endPostcode) {
    if (!startPostcode?.trim() || !endPostcode?.trim()) throw new Error("Both start and end postcodes are required");
    const miles = Math.floor(Math.random() * 100) + 10;
    // would use service like postcodes.io or Google Maps API here
    console.log(`Calculated ${miles} miles from ${startPostcode} to ${endPostcode}`);
    await new Promise(r => setTimeout(r, 500));
    return miles;
}

// POST: include cookies, no bearer
export async function saveMileageEntry(mileageData) {
    const submissionData = { ...mileageData, submittedAt: new Date().toISOString(), status: "submitted" };

    const res = await fetch("/api/saveMileageEntry", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(submissionData),
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