import { el } from "../../ui/dom.js";
import MileageOverrideSelect from "../MileageOverrideSelect";

export default class MileageOverride {
    constructor() {
        this.el = el('fieldset.d-none',

            this.mileageInput = el('input', { type: 'number', name: 'override-mileage', 'aria-label': 'Enter override mileage' }),
            this.select = new MileageOverrideSelect(),
            this.description = el('textarea', {
                name: 'override-description',
                'aria-label': 'Enter description for override...',
                placeholder: 'Enter description for override...',
                maxlength: '500',
                rows: '4'
            })
        );
    }

    set visible(isVisible) {
        if (isVisible) {
            this.el.classList.remove('d-none');
        } else {
            this.el.classList.add('d-none');
        }
    }

    reset = () => {
        this.select.value = '';
        this.description.value = '';
    }

    get value() {
        return {
            mileage: this.mileageInput.value,
            reason: this.select.value,
            description: this.description.value
        };
    }
}