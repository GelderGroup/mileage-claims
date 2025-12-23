import { map } from 'nanostores';

const initial = () => ({
    id: null,

    date: new Date().toISOString().slice(0, 10),
    startPostcode: '',
    endPostcode: '',
    distance: 0,

    // (optional) override bits if drafts can contain them
    overrideEnabled: false,
    distanceOverride: '',
    distanceOverrideReason: '',
    distanceOverrideDetails: '',

    busy: false,
    calcBusy: false,
    geoBusy: false,

    showSummary: false,
    banner: null,

    // single validation shape
    validation: { isValid: true, errors: {}, aria: {}, errorList: [] }
});

export const mileageStore = map(initial());

export const get = () => mileageStore.get();

export const set = (patch) => {
    mileageStore.set({ ...mileageStore.get(), ...patch });
};

export const reset = () => {
    mileageStore.set(initial());
};
