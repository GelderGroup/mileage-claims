export const formatPostcode = (postcode) => {
    if (!postcode) return "";
    const cleaned = postcode.replace(/\s/g, "").toUpperCase();
    return cleaned.length >= 5 ? cleaned.slice(0, -3) + " " + cleaned.slice(-3) : cleaned;
}

const UNPARISHED_RE = /,\s*unparished area/gi;
const POSTCODE_RE = /([A-Z]{1,2}\d[\dA-Z]?\s*\d[A-Z]{2})$/i;

function cleanLabel(label) {
    if (!label) return "";
    let text = label.replace(UNPARISHED_RE, "").trim();

    // Drop anything after the first comma (and the comma itself)
    const commaIndex = text.indexOf(',');
    if (commaIndex !== -1) {
        text = text.slice(0, commaIndex).trim();
    }

    return text;
}


// Return { name, postcode } with postcode stripped/aligned sensibly
export const getLocationParts = (label, postcode) => {
    const rawName = cleanLabel(label) || "";
    const pc = (postcode || "").toUpperCase();

    // If we only have a postcode, use that
    if (!rawName && pc) {
        return { name: "", postcode: pc };
    }

    // If no explicit postcode, try to pull one out of the label (e.g. "Scampton LN1 2DS")
    if (!pc && rawName) {
        const m = rawName.match(POSTCODE_RE);
        if (m) {
            const extracted = m[1].toUpperCase();
            const base = rawName.slice(0, m.index).replace(/[-,(]+\s*$/, "").trim();
            return { name: base, postcode: extracted };
        }
        return { name: rawName, postcode: "" };
    }

    // If we have both, but the name already includes the postcode, strip it from the name
    if (pc && rawName.toUpperCase().includes(pc)) {
        const idx = rawName.toUpperCase().indexOf(pc);
        const base = rawName.slice(0, idx).replace(/[-,(]+\s*$/, "").trim();
        return { name: base, postcode: pc };
    }

    return { name: rawName, postcode: pc };
}