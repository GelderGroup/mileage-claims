import { el } from 'redom';

export class DateInput {
    constructor(props = {}) {
        this.props = props;
        this.createElement();
    }

    createElement = () => {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Use provided value or default to today
        const value = this.props.value || today;

        this.el = el('input', {
            type: 'date',
            value: value,
            name: this.props.name || 'date'
        });
    }

    // Getter for value
    get value() {
        return this.el.value;
    }

    // Setter for value
    set value(newValue) {
        this.el.value = newValue;
    }

    // Method to reset to today's date
    resetToToday = () => {
        const today = new Date().toISOString().split('T')[0];
        this.value = today;
    }

    // Method to focus the input
    focus = () => {
        this.el.focus();
    }

    addEventListener(event, handler) {
        this.el.addEventListener(event, handler);
    }

    removeEventListener(event, handler) {
        this.el.removeEventListener(event, handler);
    }
}