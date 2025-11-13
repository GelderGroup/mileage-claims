export const formatPostcode = (postcode) => {
    if (!postcode) return "";
    const cleaned = postcode.replace(/\s/g, "").toUpperCase();
    return cleaned.length >= 5 ? cleaned.slice(0, -3) + " " + cleaned.slice(-3) : cleaned;
}