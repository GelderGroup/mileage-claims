import { map } from 'nanostores';
import { validateMileageEntry } from '../utils/Validation/validateMileageEntry.js';

export const mileageStore = map({
    date: '',
    startPostcode: '',
    endPostcode: '',
    distance: '',
    override: null,
    busy: false,
    calcBusy: false,
    errors: {},                 // { field: message }
    errorList: [],              // <-- array of messages
    aria: { date: false, startPostcode: false, endPostcode: false, distance: false },
    touched: { date: false, startPostcode: false, endPostcode: false, distance: false },
    showSummary: false
});

export const showSummary = (b) => mileageStore.setKey('showSummary', !!b);

export const touchField = (key) => {
    const t = mileageStore.get().touched;
    if (t[key]) return; // already touched, skip set
    mileageStore.setKey('touched', { ...t, [key]: true });
};

export const setBanner = (msg) => mileageStore.setKey('banner', msg);
export const clearBanner = () => mileageStore.setKey('banner', null);

export const touchAll = () =>
    mileageStore.setKey('touched', { date: true, startPostcode: true, endPostcode: true, distance: true });

export const resetTouches = () =>
    mileageStore.setKey('touched', { date: false, startPostcode: false, endPostcode: false, distance: false });

// ---- basic updaters
export const setField = (key, value) => {
    mileageStore.setKey(key, value);
};

export const setData = (patch) => {
    for (const [k, v] of Object.entries(patch)) mileageStore.setKey(k, v);
};

export const setBusy = (b) => mileageStore.setKey('busy', !!b);
export const setCalcBusy = (b) => mileageStore.setKey('calcBusy', !!b);

export const setValidation = (v) => {
    mileageStore.setKey('errors', v.errors);
    mileageStore.setKey('aria', v.aria);
    mileageStore.setKey('errorList', Object.values(v.errors)); // <-- here
};

export const clearErrors = () => {
    mileageStore.setKey('errors', {});
    mileageStore.setKey('errorList', []); // <-- reset list too
    mileageStore.setKey('aria', { date: false, startPostcode: false, endPostcode: false, distance: false });
    mileageStore.setKey('showSummary', false);
};


// optional: quick validator you can call for whole-form checks
export const validateNow = () => {
    const data = mileageStore.get();
    const v = validateMileageEntry(data);
    setValidation(v);
    return v;
};

// optional: debounced field validation (used next step)
let _t;
export const validateDebounced = (delay = 180) => {
    clearTimeout(_t);
    _t = setTimeout(validateNow, delay);
};
