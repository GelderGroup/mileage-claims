import { batched } from 'nanostores';
import { formatPostcode } from '../../../../utils/Formatting/formatPostcode.js';
import { calculateDistance, saveMileageEntry } from '../../../../services/mileageService.js';
import { validateMileageEntry } from '../../../../utils/Validation/validateMileageEntry.js';
import { getCurrentLocationPostcode } from '../../../../services/postcodeService.js';
import { mileageStore, get, set, reset } from '../../../../stores/mileageStore.js';

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
        root.addEventListener('field-input', this.onFieldInput);
    }

    open = ({ reset: doReset = true } = {}) => {
        if (doReset) reset(); // <-- move BEFORE subscribe

        if (!this.unsubscribe) {
            let isInitialRender = true;
            this.unsubscribe = mileageStore.subscribe((s) => {
                this.view.render(s, { initial: isInitialRender });
                isInitialRender = false;
            });
        }

        this.view.open();
    };

    close = () => {
        this.view.close();
        reset();                 // <-- add this
        this.unsubscribe?.();
        this.unsubscribe = null;
    };

    onFieldInput = (e) => {
        const { name, value } = e.detail;
        set({ [name]: value, showSummary: false, banner: null });
    };

    // --- helpers

    validateAndStore = (stateOverride = null) => {
        const data = stateOverride ?? get();
        const v = validateMileageEntry(data);
        const errorList = Object.values(v.errors || {});
        const validation = { ...v, errorList };

        set({ validation });
        return validation;
    };

    payloadFromState = (s) => ({
        id: s.id ?? null,                       // <-- add this
        date: s.date,
        startPostcode: formatPostcode(s.startPostcode).trim(),
        endPostcode: formatPostcode(s.endPostcode).trim(),
        distance: Number(s.distance || 0),
    });

    // --- actions

    useLocation = async (e) => {
        if (get().geoBusy) return;

        set({ geoBusy: true, banner: null, showSummary: false });

        try {
            const pc = await getCurrentLocationPostcode();
            const target = e.detail.component;

            batched(() => {
                if (target === this.view.startPostcodeInput) {
                    set({ startPostcode: pc });
                } else if (target === this.view.endPostcodeInput) {
                    set({ endPostcode: pc });
                }
            });

            this.validateAndStore();
        } catch (err) {
            set({ banner: err?.message || 'Could not get your location.' });
        } finally {
            set({ geoBusy: false });
        }
    };

    calculate = async () => {
        if (get().calcBusy) return;

        set({ banner: null, showSummary: false });

        const s = get();
        const all = validateMileageEntry(s);

        // keep only postcode errors/aria for calculate
        const keep = new Set(['startPostcode', 'endPostcode']);
        const errors = Object.fromEntries(Object.entries(all.errors || {}).filter(([k]) => keep.has(k)));
        const aria = Object.fromEntries(Object.entries(all.aria || {}).filter(([k]) => keep.has(k)));

        const v = {
            ...all,
            isValid: Object.keys(errors).length === 0,
            errors,
            aria,
            errorList: Object.values(errors)
        };

        set({ validation: v });

        if (!v.isValid) {
            set({ showSummary: true }); // option B
            this.view.focusFirstInvalid?.(
                [['startPostcode', this.view.startPostcodeInput], ['endPostcode', this.view.endPostcodeInput]],
                v.aria
            );
            return;
        }

        try {
            set({ calcBusy: true });

            const a = formatPostcode(s.startPostcode).trim();
            const b = formatPostcode(s.endPostcode).trim();
            const miles = await calculateDistance(a, b);

            batched(() => {
                set({ distance: Number(miles) || 0 });
                set({ showSummary: false, banner: null });
            });

            console.log('store distance after calc:', get().distance);

            // now validate whole form (including distance) for save readiness
            this.validateAndStore();
        } catch (err) {
            set({ banner: err?.message || 'Could not calculate mileage.' });
        } finally {
            set({ calcBusy: false });
        }
    };


    save = async () => {
        const s = get();
        if (s.busy) return;

        // validate + show summary
        const v = this.validateAndStore(s);
        set({ showSummary: true });

        if (!v.isValid) return;

        const payload = this.payloadFromState(get());

        try {
            set({ busy: true, banner: null });
            await saveMileageEntry(payload);

            this.onMileageSubmitted?.({
                success: true,
                data: payload,
                message: 'Mileage claim submitted successfully!'
            });

            this.close();
        } catch (err) {
            set({ banner: err?.message || 'Failed to submit mileage claim. Please try again.' });
            this.onMileageSubmitted?.({ success: false, error: err?.message, data: payload });
        } finally {
            set({ busy: false });
        }
    };
}
