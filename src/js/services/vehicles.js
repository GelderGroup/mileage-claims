import { api } from "../services/api.js";
import userVehicle from '../../../data/user-vehicle.json' assert { type: `json` };

export const VehiclesApi = {
    // current/active vehicle for the signed-in user
    // getActive: () => api.get("getUserVehicle").json(),
    getActive: () => Promise.resolve(userVehicle),

    // store/confirm a vehicle from the lookup payload
    // server will map, write latest + history, update plate link + active pointer
    confirmFromLookup: (raw) => api.post("saveUserVehicle", { json: { raw } }).json(),

    // (optional) list all vehicles for user if you add that endpoint later
    list: () => api.get("listUserVehicles").json()
};
