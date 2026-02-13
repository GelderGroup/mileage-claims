import { api } from "../services/api";

export async function getMileageSubmissions() {
    try {
        return await api.get("getMileageSubmissions").json();
    } catch (err) {
        try {
            const detail = await err.response?.json();
            throw new Error(detail?.details || detail?.error || "Failed to load mileage submissions");
        } catch {
            throw new Error("Failed to load mileage submissions");
        }
    }
}
