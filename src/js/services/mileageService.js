// Service for handling mileage-related business logic
export class MileageService {

    /**
     * Get user's current location and convert to postcode
     * @returns {Promise<string>} Promise that resolves to postcode string
     */
    static async getCurrentLocationPostcode() {
        if (!('geolocation' in navigator)) {
            throw new Error('Geolocation is not supported by this browser');
        }

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        console.log('Would reverse-geocode', position);

        // TODO: Replace with actual reverse geocoding API call
        const postcode = 'SW1A 1AA'; // Dummy postcode from reverse-geocoding

        return postcode;
    }

    /**
     * Calculate distance between two postcodes
     * @param {string} startPostcode 
     * @param {string} endPostcode 
     * @returns {Promise<number>} Distance in miles
     */
    static async calculateDistance(startPostcode, endPostcode) {
        if (!startPostcode?.trim() || !endPostcode?.trim()) {
            throw new Error('Both start and end postcodes are required');
        }

        // TODO: Replace with actual distance calculation API
        // For now, return a random distance for demo purposes
        const miles = Math.floor(Math.random() * 100) + 10; // Random miles between 10-110

        console.log(`Calculated ${miles} miles from ${startPostcode} to ${endPostcode}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return miles;
    }

    /**
     * Validate mileage entry data
     * @param {Object} data - Mileage entry data
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    static validateMileageEntry(data) {
        const errors = [];

        if (!data.date) {
            errors.push('Date is required');
        }

        if (!data.startPostcode?.trim()) {
            errors.push('Start postcode is required');
        }

        if (!data.endPostcode?.trim()) {
            errors.push('End postcode is required');
        }

        if (!data.miles || data.miles <= 0) {
            errors.push('Miles must be greater than 0');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Format postcode for consistency
     * @param {string} postcode 
     * @returns {string} Formatted postcode
     */
    static formatPostcode(postcode) {
        if (!postcode) return '';

        // Basic UK postcode formatting - add space before last 3 characters
        const cleaned = postcode.replace(/\s/g, '').toUpperCase();
        if (cleaned.length >= 5) {
            return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
        }
        return cleaned;
    }
}

// For convenience, also export individual functions
export const getCurrentLocationPostcode = MileageService.getCurrentLocationPostcode;
export const calculateDistance = MileageService.calculateDistance;
export const validateMileageEntry = MileageService.validateMileageEntry;
export const formatPostcode = MileageService.formatPostcode;