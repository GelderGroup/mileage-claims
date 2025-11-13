import { el } from '../../../ui/dom.js';
import './index.css';
import { LocateFixedIcon } from '../../../utils/icons.js';
import { attachValidity } from '../../../utils/Validation/a11y/inputValidity.js';

export default class PostcodeInput {
    constructor(props = {}) {
        const baseId = props.id || crypto.randomUUID();
        const inputId = `${baseId}-input`;
        const helpId = `${baseId}-help`;
        const buttonDescription = 'Use current location';
        const helpDescription = 'Enter a postcode or tap the target button to use your current location.';

        this.el = el('',
            el('.postcode-group', { role: 'group' },
                this.input = el('input', { id: inputId, type: 'text', name: props.name || 'postcode', 'aria-describedby': helpId, autocomplete: 'off' }),
                this.button = el('button.secondary', { title: buttonDescription, 'aria-label': buttonDescription }, LocateFixedIcon())
            ),
            this.help = el('small.help', { id: helpId }, helpDescription)
        );

        const { setValidity, resetValidity } = attachValidity({ inputEl: this.input });

        this.setValidity = setValidity;
        this.resetValidity = resetValidity;
    }

    onmount = () => {
        this.button.addEventListener('click', this.handleUseLocation);
    }

    onunmount = () => {
        this.button.removeEventListener('click', this.handleUseLocation);
    }

    get value() {
        return this.input.value;
    }

    set value(val) {
        this.input.value = val || '';
    }

    // Event dispatch proxy methods
    addEventListener(type, listener, options) {
        if (type === 'input' || type === 'change') this.input.addEventListener(type, listener, options);
        else this.el.addEventListener(type, listener, options);
    }

    removeEventListener(type, listener, options) {
        if (type === 'input' || type === 'change') this.input.removeEventListener(type, listener, options);
        else this.el.removeEventListener(type, listener, options);
    }

    dispatchEvent(event) {
        return this.el.dispatchEvent(event);
    }

    handleUseLocation = () => {
        this.dispatchEvent(new CustomEvent('uselocation', {
            bubbles: true,
            detail: {
                component: this
            }
        }));
    }

    focus() {
        this.input.focus();
    }

    clear() {
        this.value = '';
    }
}