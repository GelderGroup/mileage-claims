// mapVehicleLookupToCanonical.js
export function mapVehicleLookupToCanonical(
    raw,
    { ownerId, sourceName = "vehicleLookup", fetchedAt = new Date().toISOString() }
) {
    const s = (v) => (v ?? null);
    const num = (v) => (v === undefined || v === null || v === "" ? null : Number(v));
    const isoDate = (v) => {
        if (!v) return null;
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    };
    const isoFromYYYYMM = (v) => {
        if (!v || !/^\d{4}-\d{2}$/.test(v)) return null;
        const d = new Date(`${v}-01T00:00:00Z`);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    };
    const up = (v) => (typeof v === "string" ? v.trim().toUpperCase() : v);
    const normalizeReg = (v) => (typeof v === "string" ? v.replace(/\s+/g, "").toUpperCase() : null);

    const registration = s(raw?.registrationNumber);
    const plateId = normalizeReg(registration);

    // Derived flags (nullable)
    const isMotValid = raw?.motStatus ? raw.motStatus === "Valid" : null;
    const isTaxed = raw?.taxStatus ? raw.taxStatus === "Taxed" : null;

    const canonical = {
        make: up(s(raw?.make)),
        colour: up(s(raw?.colour)),
        year: num(raw?.yearOfManufacture),
        fuelType: up(s(raw?.fuelType)),
        engineCc: num(raw?.engineCapacity),
        co2Gkm: num(raw?.co2Emissions),

        motStatus: s(raw?.motStatus),
        taxStatus: s(raw?.taxStatus),

        firstRegistered: isoFromYYYYMM(raw?.monthOfFirstRegistration),
        taxDueDate: isoDate(raw?.taxDueDate),
        artEndDate: isoDate(raw?.artEndDate),
        dateOfLastV5CIssued: isoDate(raw?.dateOfLastV5CIssued),

        isMotValid,
        isTaxed,
    };

    // Optional extras
    if (raw?.wheelplan != null) canonical.wheelplan = s(raw.wheelplan);
    if (raw?.typeApproval != null) canonical.typeApproval = s(raw.typeApproval);
    if (raw?.euroStatus != null) canonical.euroStatus = s(raw.euroStatus);
    if (raw?.realDrivingEmissions != null) canonical.realDrivingEmissions = s(raw.realDrivingEmissions);
    if (raw?.revenueWeight != null) canonical.revenueWeightKg = num(raw.revenueWeight);

    // Fingerprint (string) to help server decide if this is the "same car"
    const fingerprint = [
        canonical.make,
        canonical.year,
        canonical.engineCc,
        canonical.fuelType,
        canonical.firstRegistered,
        canonical.co2Gkm
    ].map((x) => (x == null ? "" : String(x))).join("|");

    return {
        ownerId,
        registration,             // as provided
        plateId,                  // normalized registration
        canonical,
        fingerprint,              // for server-side "same vehicle?" checks
        source: {
            name: sourceName,
            schemaVersion: "v1",
            fetchedAt,
            raw,                    // full snapshot
        },
    };
}
