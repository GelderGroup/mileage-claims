import { el } from "redom";

export default class MileageOverrideSelect {
    constructor() {
        this.el = el('select', { name: 'distanceOverrideReason', 'aria-label': 'Select reason for override...' },
            el('option', { value: '', selected: true, disabled: true }, 'Select reason for override...'),
            el('option', 'Quicker alternative route'),
            el('option', 'Road Closed/Accident'),
            el('option', 'Avoiding heavy traffic'),
            el('option', 'Unsuitable road for vehicle'),
            el('option', 'Other')
        );
    }

    get value() {
        return this.el.value;
    }

    set value(val) {
        this.el.value = val || '';
    }
}