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
        if (doReset) reset();

        // First paint is explicit and deterministic
        this.view.render(get(), { initial: true });

        // Then react to subsequent changes
        if (!this.unlisten) {
            this.unlisten = mileageStore.listen((s) => {
                this.view.render(s, { initial: false });
            });
        }

        this.view.open();
    };

    close = () => {
        this.view.close();
        this.unlisten?.();
        this.unlisten = null;
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

            if (target === this.view.startPostcodeInput) {
                set({ startPostcode: pc });
            } else if (target === this.view.endPostcodeInput) {
                set({ endPostcode: pc });
            }

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
            const milesNum = Number(miles) || 0;

            set({
                distance: milesNum,
                banner: null,
                showSummary: false
            });

            this.validateAndStore(get());
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
