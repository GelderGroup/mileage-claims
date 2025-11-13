import { el } from "../../ui/dom.js";

export default class ValidationSummaryItem {
    constructor() {
        this.el = el('li.validation-summary-item');
    }

    update = data => this.el.textContent = data;
}