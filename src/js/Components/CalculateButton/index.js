import { el } from '../../ui/dom.js';
import { CalculatorIcon } from '../../utils/icons';

export class CalculateButton {
    constructor(props = {}) {
        const { disabled = false, title = 'Calculate mileage', name } = props;

        // Store props
        this.name = name;
        this._disabled = disabled;

        this.el = el('button.secondary', {
            type: 'button',
            title: title,
            'aria-label': title,
            disabled: disabled
        }, CalculatorIcon());
    }

    onmount = () => {
        this.el.addEventListener('click', this.handleClick);
    }

    onunmount = () => {
        this.el.removeEventListener('click', this.handleClick);
    }

    // Getter and setter for disabled state
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = value;
        this.el.disabled = value;
    }

    // Event dispatch proxy methods
    addEventListener = (type, listener, options) => {
        this.el.addEventListener(type, listener, options);
    }

    removeEventListener = (type, listener, options) => {
        this.el.removeEventListener(type, listener, options);
    }

    dispatchEvent = (event) => {
        return this.el.dispatchEvent(event);
    }

    handleClick = () => {
        if (!this.disabled) {
            this.dispatchEvent(new CustomEvent('calculate', {
                bubbles: true,
                detail: {
                    component: this,
                    name: this.name
                }
            }));
        }
    }

    // Focus the button
    focus = () => {
        this.el.focus();
    }
}