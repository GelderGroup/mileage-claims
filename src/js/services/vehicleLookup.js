import { api } from "../services/api";
export const VehicleLookupApi = {
    byReg: (registrationNumber) =>
        api.post("vehicleLookup", { json: { registrationNumber } }).json(), // calls your server/func
};