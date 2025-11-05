import { http } from '../http.js';
export const VehiclesApi = {
    get: () => http('/api/getUserVehicle'),
    upsert: (vehicle) => http('/api/saveUserVehicle', { method: 'POST', body: JSON.stringify(vehicle) })
};
