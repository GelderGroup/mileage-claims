import { api } from "../services/api.js";

export const SubmissionsApi = {
    get: () => api.get("getMileageSubmissions").json()
};
