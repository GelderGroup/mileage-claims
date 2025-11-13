import { el } from "redom";
import { CalculateButton } from "../CalculateButton";
import { attachValidity } from "../../utils/Validation/a11y/inputValidity";

export default class MileageInput {
    constructor() {
        this.input = el('input', {
            type: 'number',
            placeholder: '0',
            step: '1',
            min: '0',
            disabled: true,
            name: 'distance'
        });

        this.calculateBtn = new CalculateButton({ name: 'calculate' });

        this.el = el('', el('', { role: 'group' },
            this.input,
            this.calculateBtn
        ));

        const { setValidity, resetValidity } = attachValidity({ inputEl: this.input });

        this.setValidity = setValidity;
        this.resetValidity = resetValidity;
    }

    get value() {
        return this.input.value;
    }

    set value(val) {
        this.input.value = val || '';
    }

    // optional helper: visually indicate that calculation is pending or failed
    setCalculating(state) {
        this.calculateBtn.disabled = state;
        this.input.classList.toggle('calculating', state);
    }

    // optional convenience: mark invalid when no miles are present
    ensureCalculated() {
        const valid = !!this.value && parseFloat(this.value) > 0;
        this.setValidity({
            invalid: !valid,
            message: valid ? '' : 'Please calculate mileage before submitting'
        });
        return valid;
    }
}
