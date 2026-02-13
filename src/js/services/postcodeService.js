import { api } from "../services/api";

export function getCurrentLocationPostcode() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
        return Promise.reject(new Error("Geolocation is not supported in this browser"));
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            async pos => {
                const { latitude, longitude } = pos.coords;

                try {
                    const json = await api
                        .post("getPostcodeFromCoords", {
                            json: { latitude, longitude }
                        })
                        .json();

                    resolve(json.postcode);
                } catch (err) {
                    // ky throws for non-2xx — try to surface server detail
                    try {
                        const detail = await err.response?.json();
                        reject(new Error(detail?.detail || detail?.error || "Reverse geocoding failed"));
                    } catch {
                        reject(new Error("Reverse geocoding failed"));
                    }
                }
            },
            err => {
                if (err.code === err.TIMEOUT) {
                    reject(new Error("Getting your location took too long. Please enter your postcode manually."));
                } else if (err.code === err.PERMISSION_DENIED) {
                    reject(new Error("Location access was denied. Please enter it manually."));
                } else {
                    reject(new Error(err.message || "Unable to get your location."));
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 20000,
                maximumAge: 5 * 60_000
            }
        );
    });
}
