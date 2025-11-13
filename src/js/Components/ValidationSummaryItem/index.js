import { el } from "redom";

export default class ValidationSummaryItem {
    constructor() {
        this.el = el('li.validation-summary-item');
    }

    update = data => this.el.textContent = data;
}