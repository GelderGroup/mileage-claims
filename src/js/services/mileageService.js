// Service for handling mileage-related business logic
import { SwaAuth } from "./swaAuth.js";

export class MileageService {
    static async getCurrentLocationPostcode() {
        if (!("geolocation" in navigator)) throw new Error("Geolocation is not supported by this browser");
        const position = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        console.log("Would reverse-geocode", position);
        return "SW1A 1AA"; // TODO: replace with real reverse-geocode
    }

    static async calculateDistance(startPostcode, endPostcode) {
        if (!startPostcode?.trim() || !endPostcode?.trim()) throw new Error("Both start and end postcodes are required");
        const miles = Math.floor(Math.random() * 100) + 10;
        console.log(`Calculated ${miles} miles from ${startPostcode} to ${endPostcode}`);
        await new Promise(r => setTimeout(r, 500));
        return miles;
    }

    static validateMileageEntry(data) {
        const errors = [];
        if (!data.date) errors.push("Date is required");
        if (!data.startPostcode?.trim()) errors.push("Start postcode is required");
        if (!data.endPostcode?.trim()) errors.push("End postcode is required");
        if (!data.distance || data.distance <= 0) errors.push("Miles must be greater than 0");
        return { isValid: errors.length === 0, errors };
    }

    static formatPostcode(postcode) {
        if (!postcode) return "";
        const cleaned = postcode.replace(/\s/g, "").toUpperCase();
        return cleaned.length >= 5 ? cleaned.slice(0, -3) + " " + cleaned.slice(-3) : cleaned;
    }

    // POST: include cookies, no bearer
    static async saveMileageEntry(mileageData) {
        const submissionData = { ...mileageData, submittedAt: new Date().toISOString(), status: "submitted" };
        const res = await fetch("/api/saveMileageEntryEasyAuth", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" }, // no Authorization needed
            body: JSON.stringify(submissionData),
        });
        if (!res.ok) throw new Error((await res.text()) || `Server error: ${res.status}`);
        return res.json();
    }

    // GET: include cookies, no bearer
    static async getMileageEntries() {
        // optional: ensure logged in (SWA cookie present)
        const p = await SwaAuth.me();
        if (!p) throw new Error("Not authenticated");
        const res = await fetch("/api/getMileageEntries", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch entries: ${res.status}`);
        return res.json();
    }
}

// Convenience re-exports
export const getCurrentLocationPostcode = MileageService.getCurrentLocationPostcode;
export const calculateDistance = MileageService.calculateDistance;
export const validateMileageEntry = MileageService.validateMileageEntry;
export const formatPostcode = MileageService.formatPostcode;
