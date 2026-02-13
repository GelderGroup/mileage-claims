import { api } from "../services/api";

export async function calculateDistance(startPostcode, endPostcode) {
    const json = await api
        .post("getRouteMiles", { json: { startPostcode, endPostcode } })
        .json()
        .catch(async (err) => {
            // ky throws for non-2xx; try to surface server JSON if present
            const detail = await err.response?.json().catch(() => null);
            throw new Error(detail?.detail || detail?.error || "Failed to calculate distance");
        });

    return json.miles;
}

export async function saveMileageEntry(mileageData) {
    return api.post("saveMileageEntry", { json: mileageData }).json();
}

export async function getMileageDrafts() {
    return api.get("getMileageDrafts").json();
}

export async function deleteMileageDraft(draftId) {
    return api.delete("deleteMileageDraft", { json: { id: draftId } }).json();
}
