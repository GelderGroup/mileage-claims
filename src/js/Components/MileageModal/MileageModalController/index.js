import { formatPostcode } from '../../../utils/Formatting/formatPostcode.js';
import { calculateDistance, getCurrentLocationPostcode, saveMileageEntry } from '../../../services/mileageService.js';
import { validateMileageEntry } from '../../../utils/Validation/validateMileageEntry.js';
import {
    clearErrors,
    mileageStore,
    resetTouches,
    setBanner,
    setBusy,
    setCalcBusy,
    setData,
    setField,
    setValidation,
    showSummary,
    touchAll,
    touchField,
    validateDebounced,
    validateNow
} from '../../../stores/mileageStore.js';

export default class MileageModalController {
    constructor(view, { onSubmitted } = {}) {
        this.view = view;
        this.onSubmitted = onSubmitted;

        const root = this.view.el;
        root.addEventListener('request-close', this.close);
        root.addEventListener('request-cancel', this.close);
        root.addEventListener('request-use-location', this.useLocation);
        root.addEventListener('request-calculate', this.calculate);
        root.addEventListener('request-save', this.save);
        root.addEventListener('field-input', (e) => {
            const { name, value } = e.detail;
            // showSummary(false);
            touchField(name);
            setField(name, value);
            validateDebounced(250);
        });
    }

    open = () => {
        if (!this.unsubscribe) {
            this._first = true;
            this.unsubscribe = mileageStore.subscribe(s => {
                this.view.render(s, { initial: this._first });
                this._first = false;
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
        setData({ date: today, startPostcode: '', endPostcode: '', distance: '' });
        resetTouches();
        clearErrors();
        showSummary(false);
    }

    useLocation = async (e) => {
        try {
            const pc = await getCurrentLocationPostcode();
            const target = e.detail.component;
            if (target === this.view.startPostcodeInput) {
                setData({ startPostcode: pc });
                touchField('startPostcode');
            }
            else if (target === this.view.endPostcodeInput) {
                setData({ endPostcode: pc });
                touchField('endPostcode');
            }
            showSummary(false);
            const v = validateNow();
            setValidation(v);
        } catch (err) {
            this.view.showError(err?.message || 'Could not get your location.');
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

        const data = { ...mileageStore.get() };
        const v = validateMileageEntry(data);

        setValidation(v);
        showSummary(true);

        if (!v.isValid) return;

        data.startPostcode = formatPostcode(data.startPostcode);
        data.endPostcode = formatPostcode(data.endPostcode);

        try {
            setBusy(true);
            await saveMileageEntry(data);
            this.onSubmitted?.({ success: true, data, message: 'Mileage claim submitted successfully!' });
            this.close();
        } catch (err) {
            this.view.showError(err?.message || 'Failed to submit mileage claim. Please try again.');
            this.onSubmitted?.({ success: false, error: err?.message, data });
        } finally {
            setBusy(false);
        }
    };
}
