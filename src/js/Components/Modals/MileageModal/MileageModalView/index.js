import { el, mount, unmount, syncInput } from '../../../../ui/dom.js';
import { DateInput, MileageInput, PostcodeInput } from '../../../Inputs/index.js';
import MileageOverride from '../../../Inputs/MileageOverride/index.js';
import { ValidationSummary } from '../../../Validation/index.js';

export default class MileageModalView {
    constructor() {
        this.dateInput = new DateInput({ name: 'date' });
        this.startPostcodeInput = new PostcodeInput({ name: 'startPostcode' });
        this.endPostcodeInput = new PostcodeInput({ name: 'endPostcode' });
        this.mileageInput = new MileageInput();
        this.overrideMileageCheckbox = el('input', { type: 'checkbox', name: 'override-mileage' });
        this.overrideMileageCheckboxContainer = el('label.d-none', this.overrideMileageCheckbox, ' Override Mileage');
        this.mileageOverride = new MileageOverride();
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

    buildDialogEl = () => el('dialog',
        el('article',
            el('header', this.closeBtn, this.titleElement = el('p', el('strong', 'Add Mileage Entry'))),
            this.content = el('.modal-content',
                el('label', { for: this.dateInput.input.id }, 'Date of travel', this.dateInput),
                el('label', { for: this.startPostcodeInput.input.id }, 'Start Location', this.startPostcodeInput),
                el('label', { for: this.endPostcodeInput.input.id }, 'End Location', this.endPostcodeInput),
                el('label', { for: this.mileageInput.input.id }, 'Calculated Miles', this.mileageInput),
                this.overrideMileageCheckboxContainer,
                this.mileageOverride,
                this.errorSummary.el
            ),
            el('footer', this.cancelBtn, this.saveBtn)
        )
    );

    onmount = () => {
        this.addCoreListeners();
    };

    onunmount = () => {
        this.removeCoreListeners();
    };

    addCoreListeners = () => {
        this.el.addEventListener('uselocation', this.handleUseLocation);
        this.el.addEventListener('calculate', this.handleCalculate);
        this.overrideMileageCheckbox.addEventListener('change', this.handleOverrideToggle);
        this.closeBtn.addEventListener('click', this.handleClose);
        this.cancelBtn.addEventListener('click', this.handleCancel);
        this.saveBtn.addEventListener('click', this.handleSave);

        // field input -> store
        const wire = c => {
            c.addEventListener('input', this.handleFieldInput);
            c.addEventListener('change', this.handleFieldInput); // covers date pickers
        };
        wire(this.dateInput);
        wire(this.startPostcodeInput);
        wire(this.endPostcodeInput);
    };

    removeCoreListeners = () => {
        this.el.removeEventListener('uselocation', this.handleUseLocation);
        this.el.removeEventListener('calculate', this.handleCalculate);
        this.overrideMileageCheckbox.removeEventListener('change', this.handleOverrideToggle);
        this.closeBtn.removeEventListener('click', this.handleClose);
        this.cancelBtn.removeEventListener('click', this.handleCancel);
        this.saveBtn.removeEventListener('click', this.handleSave);

        const unwire = c => {
            c.removeEventListener('input', this.handleFieldInput);
            c.removeEventListener('change', this.handleFieldInput);
        };
        unwire(this.dateInput);
        unwire(this.startPostcodeInput);
        unwire(this.endPostcodeInput);
    };

    open() {
        mount(document.body, this.el);
        this.el.showModal();

        queueMicrotask(() => {
            const isTouch =
                (typeof window !== 'undefined' && 'ontouchstart' in window) ||
                (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

            if (!isTouch) {
                // desktop / laptop → ok to focus date input
                this.dateInput.focus();
            } else {
                // mobile → just focus the dialog or close button to avoid auto picker
                this.closeBtn.focus();
            }
        });
    }

    close() {
        if (this.el.open) this.el.close();
        // don’t unmount here; let the parent decide lifecycle
    }

    logElStatus = () => {
        console.log(`this.el.isConnected: ${this.el.isConnected}`);
        console.log(`this.el.open: ${this.el.open}`);
        console.log(this.el.parentNode);
    }

    render = (state, { initial = false } = {}) => {
        // values
        for (const [key, comp] of Object.entries(this.fields)) {
            syncInput(comp, state[key], { allowWhileFocused: initial });
        }
        // flags
        this.setBusy(state.busy);
        this.setCalcBusy(state.calcBusy);
        this.setGeoBusy(state.geoBusy);
        // validity + summary
        this.applyValidity(state);
        if (state.showSummary && state.errorList?.length) this.showErrors(state.errorList);
        else this.clearErrors();
    };

    setGeoBusy(b) {
        // disable inputs while geocoding
        this.startPostcodeInput.disabled = b;
        this.endPostcodeInput.disabled = b;

        // show spinner on the "Use my location" buttons (if you have them)
        this.startPostcodeInput.setGeoBusy?.(b);
        this.endPostcodeInput.setGeoBusy?.(b);
    }


    setBusy(b) { this.saveBtn.disabled = b; this.saveBtn.textContent = b ? 'Saving…' : 'Save Entry'; }
    setCalcBusy(b) { this.mileageInput.calculateBtn.disabled = b; }
    applyValidity = (state) => {
        for (const [key, c] of Object.entries(this.fields)) {
            const touched = !!state.touched[key];
            const invalid = !!state.aria[key];
            if (!touched) c.resetValidity?.();
            else if (invalid) c.setValidity?.({ invalid: true });
            else c.resetValidity?.();
        }
    };

    handleUseLocation = (e) => this.dispatch('request-use-location', { component: e.detail.component });
    handleCalculate = () => this.dispatch('request-calculate');
    handleOverrideToggle = (e) => this.dispatch('toggle-override', { checked: e.target.checked });
    handleClose = () => this.dispatch('request-close');
    handleCancel = () => this.dispatch('request-cancel');
    handleSave = () => this.dispatch('request-save');

    handleFieldInput = (e) => {
        const name = e.target?.name;
        if (!name) return;
        this.dispatch('field-input', { name, value: e.target.value });
    };

    dispatch(name, detail = {}) { this.el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail })); }

    // view helpers unchanged

    showErrors(msgs) { this.errorSummary.show(msgs); }
    showError(msg) { this.errorSummary.showSingle(msg); }
    clearErrors() { this.errorSummary.clear(); }

    focusFirstInvalid(order, aria) {
        const first = order.find(([k]) => aria[k]);
        first?.[1]?.focus?.();
    }
}
