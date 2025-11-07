import crypto from "node:crypto";
/**
 * Creates a new empty mileage line with default values
 * @returns {Object} A new mileage line object
 */
export function createEmptyLine() {
    // Get today's date in YYYY-MM-DD format for HTML date input
    const today = new Date().toISOString().split('T')[0];

    return {
        id: crypto.randomUUID(),
        date: today,
        from: '',
        to: '',
        miles: null,
        override: false,
        overrideMiles: null
    };
}

/**
 * Validates that a mileage line has required fields
 * @param {Object} line - The mileage line to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateLine(line) {
    if (!line) return false;
    if (!line.date) return false;
    if (!line.from || !line.to) return false;

    // If override is enabled, need override miles
    if (line.override && (!line.overrideMiles || line.overrideMiles <= 0)) {
        return false;
    }

    // If not override, need calculated miles
    if (!line.override && (!line.miles || line.miles <= 0)) {
        return false;
    }

    return true;
}

/**
 * Calculates total miles from an array of mileage lines
 * @param {Array} lines - Array of mileage line objects
 * @returns {number} Total miles
 */
export function calculateTotalMiles(lines) {
    return lines.reduce((total, line) => {
        const miles = line.override
            ? parseFloat(line.overrideMiles ?? '0') || 0
            : parseFloat(line.miles ?? '0') || 0;
        return total + miles;
    }, 0);
}