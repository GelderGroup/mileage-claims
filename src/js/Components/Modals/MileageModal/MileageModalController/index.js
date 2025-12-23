import { formatPostcode } from '../../../../utils/Formatting/formatPostcode.js';
import { calculateDistance, saveMileageEntry } from '../../../../services/mileageService.js';
import { validateMileageEntry } from '../../../../utils/Validation/validateMileageEntry.js';
import {
    clearErrors,
    getPayload,
    mileageStore,
    resetDataForNewEntry,
    resetTouches,
    setBanner,
    setBusy,
    setCalcBusy,
    setData,
    setField,
    setGeoBusy,
    setValidation,
    showSummary,
    touchAll,
    touchField,
    validateDebounced,
    validateNow
} from '../../../../stores/mileageStore.js';
import { getCurrentLocationPostcode } from '../../../../services/postcodeService.js';

export default class MileageModalController {
    constructor(view, { onMileageSubmitted } = {}) {
        this.view = view;
        this.onMileageSubmitted = onMileageSubmitted;

        const root = this.view.el;
        root.addEventListener('request-close', this.close);
        root.addEventListener('request-cancel', this.close);
        root.addEventListener('request-use-location', this.useLocation);
        root.addEventListener('request-calculate', this.calculate);
        root.addEventListener('request-save-mileage', this.save);
        root.addEventListener('field-input', (e) => {
            const { name, value } = e.detail;
            touchField(name);
            setField(name, value);
            validateDebounced(250);
        });
    }

    open = () => {
        if (!this.unsubscribe) {
            let isInitialRender = true;
            this.unsubscribe = mileageStore.subscribe(s => {
                this.view.render(s, { initial: isInitialRender });
                isInitialRender = false;
            });
        }
        this.reset();
        this.view.open();
    };

    close = () => {
        this.view.close();
        this.reset();
        this.unsubscribe?.();
        this.unsubscribe = null;
    };

    reset = () => {
        const today = new Date().toISOString().split('T')[0];

        resetDataForNewEntry();
        setData({ date: today });   // keep your default date logic
        resetTouches();
        clearErrors();
        showSummary(false);
    };

    useLocation = async (e) => {
        // don’t start another lookup if one is already in progress
        if (mileageStore.get().geoBusy) return;

        setGeoBusy(true);
        showSummary(false); // okay to hide old validation summary before starting

        try {
            const pc = await getCurrentLocationPostcode();

            const target = e.detail.component;
            if (target === this.view.startPostcodeInput) {
                setData({ startPostcode: pc });
                touchField('startPostcode');
            } else if (target === this.view.endPostcodeInput) {
                setData({ endPostcode: pc });
                touchField('endPostcode');
            }

            const v = validateNow();
            setValidation(v);

            setGeoBusy(false); // <- success path: clear busy, THEN exit
        } catch (err) {
            setGeoBusy(false); // <- clear busy FIRST
            this.view.showError(err?.message || 'Could not get your location.'); // <- and don’t touch store after this
        }
    };

    calculate = async () => {
        if (mileageStore.get().calcBusy) return;

        clearErrors();
        showSummary(false);

        const data = mileageStore.get();
        const all = validateMileageEntry(data);
        const fields = ['startPostcode', 'endPostcode'];
        const errors = this.pickFields(all.errors, fields);
        const aria = this.pickFields(all.aria, fields);
        const v = { isValid: Object.keys(errors).length === 0, errors, aria };

        setValidation({ ...all, errors, aria });

        if (!v.isValid) {
            // borders come from subscription; summary is gated by showSummary(false)
            this.view.focusFirstInvalid(
                [['startPostcode', this.view.startPostcodeInput], ['endPostcode', this.view.endPostcodeInput]],
                v.aria
            );
            return;
        }

        try {
            setCalcBusy(true);

            const a = formatPostcode(data.startPostcode).trim();
            const b = formatPostcode(data.endPostcode).trim();
            const miles = await calculateDistance(a, b);

            setData({ distance: Number(miles) || 0 });
            touchField('distance');
            clearErrors();
            showSummary(false);

            const v2 = validateNow();
            setValidation(v2);
        } catch (err) {
            setBanner(err?.message || 'Could not calculate mileage.');
        } finally {
            setCalcBusy(false);
        }
    };

    pickFields = (obj, keys) =>
        Object.fromEntries(Object.entries(obj).filter(([k]) => keys.includes(k)));


    save = async () => {
        if (mileageStore.get().busy) return;

        clearErrors();
        touchAll();

        const data = getPayload();
        const v = validateMileageEntry(data);

        setValidation(v);
        showSummary(true);

        if (!v.isValid) return;

        data.startPostcode = formatPostcode(data.startPostcode);
        data.endPostcode = formatPostcode(data.endPostcode);

        try {
            setBusy(true);
            await saveMileageEntry(data);
            this.onMileageSubmitted?.({ success: true, data, message: 'Mileage claim submitted successfully!' });
            this.close();
        } catch (err) {
            this.view.showError(err?.message || 'Failed to submit mileage claim. Please try again.');
            this.onMileageSubmitted?.({ success: false, error: err?.message, data });
        } finally {
            setBusy(false);
        }
    };
}
