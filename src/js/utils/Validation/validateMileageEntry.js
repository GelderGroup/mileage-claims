export const validateMileageEntry = (data) => {
    const errors = {};

    if (!data.date) errors.date = "Date is required";
    if (!data.startPostcode?.trim()) errors.startPostcode = "Start postcode is required";
    if (!data.endPostcode?.trim()) errors.endPostcode = "End postcode is required";

    if (!data.distance || data.distance <= 0) {
        errors.distance = "Miles must be greater than 0";
    }

    // ---- override-specific validation
    if (data.overrideEnabled) {
        if (data.distanceCalculated == null) {
            errors.distance = "Mileage must be calculated before it can be overridden";
        }

        if (!data.distanceOverride || data.distanceOverride <= 0) {
            errors.distanceOverride = "Override miles must be greater than 0";
        }

        if (!data.distanceOverrideReason?.trim()) {
            errors.distanceOverrideReason = "Override reason is required";
        }

        if (!data.distanceOverrideDetails?.trim()) {
            errors.distanceOverrideDetails = "Override details are required";
        }
    }

    const isValid = Object.keys(errors).length === 0;

    return {
        isValid,
        errors,
        aria: {
            date: !!errors.date,
            startPostcode: !!errors.startPostcode,
            endPostcode: !!errors.endPostcode,
            distance: !!errors.distance,
            distanceOverride: !!errors.distanceOverride,
            distanceOverrideReason: !!errors.distanceOverrideReason,
            distanceOverrideDetails: !!errors.distanceOverrideDetails
        }
    };
};
