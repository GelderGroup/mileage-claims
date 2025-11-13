import { map } from 'nanostores';
import { validateMileageEntry } from '../utils/Validation/validateMileageEntry.js';

export const mileageStore = map({
    id: null,                 // NEW

    date: '',
    startPostcode: '',
    endPostcode: '',
    distance: '',

    distanceOverride: '',
    distanceOverrideReason: '',
    distanceOverrideDetails: '',

    busy: false,
    calcBusy: false,
    geoBusy: false,
    touched: {},
    aria: {},
    errors: {},
    errorList: [],
    showSummary: false
});

// used when opening a fresh modal
export const resetDataForNewEntry = () => {
    mileageStore.setKey('id', null);
    mileageStore.setKey('date', '');
    mileageStore.setKey('startPostcode', '');
    mileageStore.setKey('endPostcode', '');
    mileageStore.setKey('distance', '');
    mileageStore.setKey('distanceOverride', '');
    mileageStore.setKey('distanceOverrideReason', '');
    mileageStore.setKey('distanceOverrideDetails', '');
}

export const setGeoBusy = (v) => {
    mileageStore.setKey('geoBusy', !!v);
}

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

export function getPayload() {
    const s = mileageStore.get();

    const distance =
        typeof s.distance === 'number'
            ? s.distance
            : Number(s.distance || 0);

    const distanceOverride =
        s.distanceOverride === '' || s.distanceOverride == null
            ? null
            : Number(s.distanceOverride);

    return {
        id: s.id || null,  // NEW — store should have this when editing

        date: s.date,
        startPostcode: s.startPostcode,
        endPostcode: s.endPostcode,
        distance,

        distanceOverride,
        distanceOverrideReason: s.distanceOverrideReason?.trim() || null,
        distanceOverrideDetails: s.distanceOverrideDetails?.trim() || null
    };
}


