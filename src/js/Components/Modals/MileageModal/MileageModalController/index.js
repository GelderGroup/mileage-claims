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

        // NEW: wire override toggle from the view
        root.addEventListener('toggle-override', this.onToggleOverride);
    }

    open = ({ reset: doReset = true } = {}) => {
        if (doReset) reset();

        this.view.render(get(), { initial: true });

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

    // --- helpers

    validateAndStore = (stateOverride = null) => {
        const data = stateOverride ?? get();
        const v = validateMileageEntry(data);
        const errorList = Object.values(v.errors || {});
        const validation = { ...v, errorList };

        set({ validation });
        return validation;
    };

    resetOverrideState = () => ({
        overrideEnabled: false,
        distanceOverride: null,
        distanceOverrideReason: '',
        distanceOverrideDetails: ''
    });

    clearCalculatedState = () => ({
        distanceCalculated: null,
        distance: null,
        ...this.resetOverrideState()
    });

    payloadFromState = (s) => ({
        id: s.id ?? null,
        date: s.date,
        startPostcode: formatPostcode(s.startPostcode).trim(),
        endPostcode: formatPostcode(s.endPostcode).trim(),

        // effective distance is always `distance`
        distance: Number(s.distance || 0),

        // NEW fields
        distanceCalculated: s.distanceCalculated == null ? null : Number(s.distanceCalculated),
        overrideEnabled: !!s.overrideEnabled,
        distanceOverride: s.distanceOverride == null ? null : Number(s.distanceOverride),
        distanceOverrideReason: s.distanceOverrideReason ?? '',
        distanceOverrideDetails: s.distanceOverrideDetails ?? ''
    });

    validatePostcodesOnly = (s) => {
        const all = validateMileageEntry(s);

        const keep = new Set(['startPostcode', 'endPostcode']);
        const errors = Object.fromEntries(Object.entries(all.errors || {}).filter(([k]) => keep.has(k)));
        const aria = Object.fromEntries(Object.entries(all.aria || {}).filter(([k]) => keep.has(k)));

        return {
            ...all,
            isValid: Object.keys(errors).length === 0,
            errors,
            aria,
            errorList: Object.values(errors)
        };
    };

    // --- events / actions

    onFieldInput = (e) => {
        const { name, value } = e.detail;

        // If either postcode changes AFTER a calculation, invalidate calc + override
        if (name === 'startPostcode' || name === 'endPostcode') {
            const s = get();
            const next = { [name]: value, showSummary: false, banner: null };

            if (s.distanceCalculated != null) {
                set({ ...next, ...this.clearCalculatedState() });
                this.validateAndStore();
                return;
            }

            set(next);
            this.validateAndStore();
            return;
        }

        // Override field edits: keep effective `distance` in sync when override is enabled
        if (name === 'distanceOverride') {
            const s = get();
            const miles = value === '' ? null : Number(value);

            set({
                [name]: value,
                ...(s.overrideEnabled ? { distance: miles } : null),
                showSummary: false,
                banner: null
            });

            this.validateAndStore();
            return;
        }

        set({ [name]: value, showSummary: false, banner: null });
        this.validateAndStore();
    };

    onToggleOverride = (e) => {
        const { checked } = e.detail;
        const s = get();

        const hasEffective = s.distance != null && Number(s.distance) > 0;
        const canOverride = s.distanceCalculated != null || (s.id != null && hasEffective);

        if (checked && !canOverride) {
            set({ banner: 'Please calculate mileage before overriding.', overrideEnabled: false });
            return;
        }

        if (!checked) {
            // when turning off: prefer calculated if we have it, else keep effective
            set({
                overrideEnabled: false,
                distance: s.distanceCalculated ?? s.distance,
                ...this.resetOverrideState(),
                showSummary: false,
                banner: null
            });
            this.validateAndStore();
            return;
        }

        // turning on: default override to calculated if present, else current effective distance
        const base = s.distanceCalculated ?? s.distance;

        set({
            overrideEnabled: true,
            distanceOverride: s.distanceOverride ?? base,
            distance: s.distanceOverride ?? base,
            banner: null,
            showSummary: false
        });

        this.validateAndStore();
    };

    useLocation = async (e) => {
        if (get().geoBusy) return;

        set({ geoBusy: true, banner: null, showSummary: false });

        try {
            const pc = await getCurrentLocationPostcode();
            const target = e.detail.component;

            if (target === this.view.startPostcodeInput) {
                // location change should invalidate calculation/override if it existed
                const s = get();
                set({
                    startPostcode: pc,
                    ...(s.distanceCalculated != null ? this.clearCalculatedState() : null)
                });
            } else if (target === this.view.endPostcodeInput) {
                const s = get();
                set({
                    endPostcode: pc,
                    ...(s.distanceCalculated != null ? this.clearCalculatedState() : null)
                });
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
        const v = this.validatePostcodesOnly(s);
        set({ validation: v });

        if (!v.isValid) {
            set({ showSummary: true });
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
                distanceCalculated: milesNum,
                distance: milesNum,
                ...this.resetOverrideState(),
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
