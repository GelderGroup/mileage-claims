import MileageModalController from "./MileageModalController";
import MileageModalView from "./MileageModalView";

export default class MileageModal {
    constructor(opts = {}) {
        this.view = new MileageModalView();
        this.controller = new MileageModalController(this.view, { onMileageSubmitted: opts.onMileageSubmitted });
        this.el = this.view.el;
    }
    onmount = () => this.view.onmount?.();
    onunmount = () => this.view.onunmount?.();
    open = () => this.controller.open();   // ← ensures reset() runs first
    close = () => this.controller.close(); // ← keeps cleanup consistent
}
