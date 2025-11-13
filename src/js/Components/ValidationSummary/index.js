import { el, list } from '../../ui/dom.js';
import './index.css';
import ValidationSummaryItem from '../ValidationSummaryItem';

export class ValidationSummary {
    constructor({ title = 'Please fix the following:' } = {}) {
        this.validationList = list('ul', ValidationSummaryItem);

        this.el = el(
            'aside.contrast.outline.form-errors.d-none', // hidden by default
            { role: 'alert', 'aria-live': 'polite', tabindex: -1 },
            el('strong', title),
            this.validationList
        );
    }

    show(messages = [], { focus = false } = {}) {
        this.validationList.update(messages);
        if (messages.length) {
            this.el.classList.remove('d-none');
            if (focus) this.el.focus();
        } else {
            this.hide();
        }
    }

    showSingle(message, opts) {
        this.show([message], opts);
    }

    clear() { this.hide(); }

    hide() {
        this.validationList.update([]);
        this.el.classList.add('d-none');
    }
}
