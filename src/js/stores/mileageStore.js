import { map, batched } from 'nanostores';

const initial = () => ({
    date: new Date().toISOString().slice(0, 10),
    startPostcode: '',
    endPostcode: '',
    distance: 0,

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
    batched(() => {
        mileageStore.set(initial());
    });
};
