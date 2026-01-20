import { api } from "../services/api.js";

export const VehiclesApi = {
    // current/active vehicle for the signed-in user
    getActive: () => api.get("getUserVehicle").json(),

    // store/confirm a vehicle from the lookup payload
    // server will map, write latest + history, update plate link + active pointer
    confirmFromLookup: (raw) => api.post("saveUserVehicle", { json: { raw } }).json(),

    // (optional) list all vehicles for user if you add that endpoint later
    list: () => api.get("listUserVehicles").json(),
    submitAllDrafts: ({ ids }) => api.post("submitAllDrafts", { json: { ids } }).json()

};
