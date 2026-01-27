import { el, mount } from 'redom';
import { syncInput } from '../../../../ui/dom.js';
import { DateInput, MileageInput, PostcodeInput } from '../../../Inputs/index.js';
import MileageOverride from '../../../Inputs/MileageOverride/index.js';
import { ValidationSummary } from '../../../Validation/index.js';

export default class MileageModalView {
    constructor() {
        this.dateInput = new DateInput({ name: 'date' });
        this.startPostcodeInput = new PostcodeInput({ name: 'startPostcode' });
        this.endPostcodeInput = new PostcodeInput({ name: 'endPostcode' });
        this.mileageInput = new MileageInput({ name: 'distance' });

        // Override UI
        this.overrideMileageCheckbox = el('input', { type: 'checkbox', name: 'overrideEnabled' });
        this.overrideMileageCheckboxContainer = el(
            'label.d-none',
            this.overrideMileageCheckbox,
            ' Override calculated miles'
        );

        this.mileageOverride = new MileageOverride(); // dispatches 'field-input' itself
        this.errorSummary = new ValidationSummary();

        this.fields = {
            date: this.dateInput,
            startPostcode: this.startPostcodeInput,
            endPostcode: this.endPostcodeInput,
            distance: this.mileageInput
        };

        this.cancelBtn = el('button.secondary', { type: 'button' }, 'Cancel');
        this.saveBtn = el('button', { type: 'button' }, 'Save Entry');
        this.closeBtn = el('button', { 'aria-label': 'Close', rel: 'prev' });

        this.el = this.buildDialogEl();
    }

    buildDialogEl = () =>
        el(
            'dialog',
            el(
                'article',
                el('header', this.closeBtn, (el('p', this.titleEl = el('strong', 'Add Mileage Entry')))),
                (this.content = el(
                    '.modal-content',
                    el('label', { for: this.dateInput.input.id }, 'Date of travel', this.dateInput),
                    el('label', { for: this.startPostcodeInput.input.id }, 'Start Location', this.startPostcodeInput),
                    el('label', { for: this.endPostcodeInput.input.id }, 'End Location', this.endPostcodeInput),

                    // This displays effective miles (distance)
                    el('label', { for: this.mileageInput.input.id }, 'Miles', this.mileageInput),

                    this.overrideMileageCheckboxContainer,
                    this.mileageOverride,
                    this.errorSummary.el
                )),
                el('footer', this.cancelBtn, this.saveBtn)
            )
        );

    onmount = () => {
        this.addCoreListeners();

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.dateInput.input.max = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
    };

    onunmount = () => {
        this.removeCoreListeners();
    };

    addCoreListeners = () => {
        this.el.addEventListener('uselocation', this.handleUseLocation);
        this.el.addEventListener('calculate', this.handleCalculate);

        this.closeBtn.addEventListener('click', this.handleClose);
        this.cancelBtn.addEventListener('click', this.handleCancel);
        this.saveBtn.addEventListener('click', this.handleSave);

        this.overrideMileageCheckbox.addEventListener('change', this.handleOverrideToggle);

        // Core fields still emit native input/change; forward them
        this.dateInput.addEventListener('input', this.handleNativeFieldInput);
        this.dateInput.addEventListener('change', this.handleNativeFieldInput);

        this.startPostcodeInput.addEventListener('input', this.handleNativeFieldInput);
        this.startPostcodeInput.addEventListener('change', this.handleNativeFieldInput);

        this.endPostcodeInput.addEventListener('input', this.handleNativeFieldInput);
        this.endPostcodeInput.addEventListener('change', this.handleNativeFieldInput);

        this.mileageInput.addEventListener?.('input', this.handleNativeFieldInput);
        this.mileageInput.addEventListener?.('change', this.handleNativeFieldInput);
    };

    removeCoreListeners = () => {
        this.el.removeEventListener('uselocation', this.handleUseLocation);
        this.el.removeEventListener('calculate', this.handleCalculate);

        this.closeBtn.removeEventListener('click', this.handleClose);
        this.cancelBtn.removeEventListener('click', this.handleCancel);
        this.saveBtn.removeEventListener('click', this.handleSave);

        this.overrideMileageCheckbox.removeEventListener('change', this.handleOverrideToggle);

        this.dateInput.removeEventListener('input', this.handleNativeFieldInput);
        this.dateInput.removeEventListener('change', this.handleNativeFieldInput);

        this.startPostcodeInput.removeEventListener('input', this.handleNativeFieldInput);
        this.startPostcodeInput.removeEventListener('change', this.handleNativeFieldInput);

        this.endPostcodeInput.removeEventListener('input', this.handleNativeFieldInput);
        this.endPostcodeInput.removeEventListener('change', this.handleNativeFieldInput);

        this.mileageInput.removeEventListener?.('input', this.handleNativeFieldInput);
        this.mileageInput.removeEventListener?.('change', this.handleNativeFieldInput);
    };

    open() {
        mount(document.body, this.el);
        this.el.showModal();

        queueMicrotask(() => {
            const isTouch =
                (typeof window !== 'undefined' && 'ontouchstart' in window) ||
                (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

            if (!isTouch) this.dateInput.focus();
            else this.closeBtn.focus();
        });
    }

    close() {
        if (this.el.open) this.el.close();
    }

    render = (state, { initial = false } = {}) => {
        // values
        for (const [key, comp] of Object.entries(this.fields)) {
            syncInput(comp, state[key], { allowWhileFocused: initial });
        }

        const hasCalculated = state.distanceCalculated != null;
        const hasEffective = state.distance != null && Number(state.distance) > 0;
        const canShowOverride = hasCalculated || (state.id != null && hasEffective) || !!state.overrideEnabled;


        this.overrideMileageCheckboxContainer.classList.toggle('d-none', !canShowOverride);



        // Reflect checkbox state
        this.overrideMileageCheckbox.checked = !!state.overrideEnabled;

        // Show/hide override fields
        this.mileageOverride.visible = !!state.overrideEnabled;

        // Sync override values
        this.mileageOverride.update(state, { allowWhileFocused: initial });

        // flags
        this.setBusy(state.busy);
        this.setCalcBusy(state.calcBusy);
        this.setGeoBusy(state.geoBusy);

        // Disable override toggle while calculating/geocoding
        this.overrideMileageCheckbox.disabled = !!state.calcBusy || !!state.geoBusy || !canShowOverride;

        // validity + summary
        this.applyValidity(state);

        const errs = state.validation?.errorList || [];
        if (state.showSummary && errs.length) this.showErrors(errs);
        else this.clearErrors();
    };

    setGeoBusy(b) {
        this.startPostcodeInput.disabled = b;
        this.endPostcodeInput.disabled = b;

        this.startPostcodeInput.setGeoBusy?.(b);
        this.endPostcodeInput.setGeoBusy?.(b);
    }

    setBusy(b) {
        this.saveBtn.disabled = b;
        this.saveBtn.textContent = b ? 'Saving…' : 'Save Entry';
    }

    setCalcBusy(b) {
        this.mileageInput.calculateBtn.disabled = b;
    }

    applyValidity = (state) => {
        const aria = state.validation?.aria || {};
        const show = !!state.showSummary;

        for (const [key, c] of Object.entries(this.fields)) {
            const invalid = !!aria[key];
            if (!show) c.resetValidity?.();
            else if (invalid) c.setValidity?.({ invalid: true });
            else c.resetValidity?.();
        }
    };

    handleUseLocation = (e) => this.dispatch('request-use-location', { component: e.detail.component });
    handleCalculate = () => this.dispatch('request-calculate');

    handleOverrideToggle = (e) => this.dispatch('toggle-override', { checked: e.target.checked });

    handleClose = () => this.dispatch('request-close');
    handleCancel = () => this.dispatch('request-cancel');
    handleSave = () => this.dispatch('request-save-mileage');

    // For native DOM input/change events from Date/Postcode/Mileage inputs
    handleNativeFieldInput = (e) => {
        const name = e.target?.name;
        if (!name) return;
        this.dispatch('field-input', { name, value: e.target.value });
    };

    dispatch(name, detail = {}) {
        this.el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
    }

    showErrors(msgs) {
        this.errorSummary.show(msgs);
    }
    showError(msg) {
        this.errorSummary.showSingle(msg);
    }
    clearErrors() {
        this.errorSummary.clear();
    }

    focusFirstInvalid(order, aria) {
        const first = order.find(([k]) => aria[k]);
        first?.[1]?.focus?.();
    }

    setMode(mode) {
        this.mode = mode;
        this.titleEl.textContent =
            mode === "edit" ? "Edit mileage" : "Add mileage";
    }

}
