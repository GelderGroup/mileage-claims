import { el } from '../../../ui/dom.js';
import { attachValidity } from '../../../utils/Validation/a11y/inputValidity.js';

export default class DateInput {
    constructor(props = {}) {
        const id = props.id || crypto.randomUUID();

        this.input = el('input', {
            id: `${id}-input`,
            type: 'date',
            name: props.name || 'date'
        });

        this.el = this.input;

        const { setValidity, resetValidity } = attachValidity({ inputEl: this.input });

        this.setValidity = setValidity;
        this.resetValidity = resetValidity;
    }

    onmount = () => this.el.addEventListener('pointerdown', this.handleDateInputPointerDown);

    onunmount = () => this.el.removeEventListener('pointerdown', this.handleDateInputPointerDown);

    handleDateInputPointerDown = e => e.target.showPicker?.();

    get value() { return this.el.value; }
    set value(v) { this.el.value = v; }

    resetToToday = () => this.value = new Date().toISOString().split('T')[0];

    focus = () => this.el.focus();
    addEventListener(ev, fn) { this.el.addEventListener(ev, fn); }
    removeEventListener(ev, fn) { this.el.removeEventListener(ev, fn); }
}
