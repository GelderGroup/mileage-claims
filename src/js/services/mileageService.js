// Service for handling mileage-related business logic
import { AuthService } from './authService.js';

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

    /**
     * Save mileage entry to Azure backend
     * @param {Object} mileageData - Validated mileage entry data
     * @returns {Promise<Object>} Response from server
     */
    static async saveMileageEntry(mileageData) {
        try {
            // Get authentication token
            const token = await AuthService.getAccessToken();
            const userInfo = await AuthService.getUserInfo();

            // Prepare data for submission
            const submissionData = {
                ...mileageData,
                submittedBy: userInfo.email,
                submittedAt: new Date().toISOString(),
                status: 'submitted'
            };

            // Call Azure Function API
            const response = await fetch('/api/saveMileageEntry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to save mileage entry:', error);
            throw new Error(`Failed to save mileage entry: ${error.message}`);
        }
    }

    /**
     * Get user's mileage entries from Azure backend
     * @returns {Promise<Array>} Array of mileage entries
     */
    static async getMileageEntries() {
        try {
            const token = await AuthService.getAccessToken();

            const response = await fetch('/api/getMileageEntries', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch entries: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get mileage entries:', error);
            throw error;
        }
    }
}

// For convenience, also export individual functions
export const getCurrentLocationPostcode = MileageService.getCurrentLocationPostcode;
export const calculateDistance = MileageService.calculateDistance;
export const validateMileageEntry = MileageService.validateMileageEntry;
export const formatPostcode = MileageService.formatPostcode;