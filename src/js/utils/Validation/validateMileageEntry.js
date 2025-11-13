export const validateMileageEntry = (data) => {
    const errors = {};

    if (!data.date) errors.date = "Date is required";
    if (!data.startPostcode?.trim()) errors.startPostcode = "Start postcode is required";
    if (!data.endPostcode?.trim()) errors.endPostcode = "End postcode is required";
    if (!data.distance || data.distance <= 0) errors.distance = "Miles must be greater than 0";

    //TODO Add validation for override distance, reason, details

    const isValid = Object.keys(errors).length === 0;

    return {
        isValid,
        errors,
        aria: {
            date: !!errors.date,
            startPostcode: !!errors.startPostcode,
            endPostcode: !!errors.endPostcode,
            distance: !!errors.distance,
        }
    };
}