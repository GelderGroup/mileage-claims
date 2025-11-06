import { api } from "./api";

export const VehiclesApi = {
    get: () => api.get('getUserVehicle').json(),
    upsert: (vehicle) => api.post('saveUserVehicle', { json: vehicle }).json()
};
