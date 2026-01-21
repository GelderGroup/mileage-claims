import { el } from "redom";
import MileageOverrideSelect from "../MileageOverrideSelect/index.js";

export default class MileageOverride {
    constructor() {
        this.select = new MileageOverrideSelect();

        this.el = el(
            "fieldset.d-none",
            this.mileageInput = el("input", {
                type: "number",
                name: "distanceOverride",
                "aria-label": "Enter override mileage"
            }),
            // ensure the select component's underlying element has name="distanceOverrideReason"
            this.select,
            this.description = el("textarea", {
                name: "distanceOverrideDetails",
                "aria-label": "Enter details for override...",
                placeholder: "Enter details for override...",
                maxlength: "500",
                rows: "4"
            })
        );
    }

    // --- re:dom lifecycle
    onmount = () => {
        this.mileageInput.addEventListener("input", this.redispatchInput);
        this.mileageInput.addEventListener("change", this.redispatchInput);

        // MileageOverrideSelect might be a component; listen on its root element
        this.select.el?.addEventListener?.("input", this.redispatchInput);
        this.select.el?.addEventListener?.("change", this.redispatchInput);

        this.description.addEventListener("input", this.redispatchInput);
        this.description.addEventListener("change", this.redispatchInput);
    };

    onunmount = () => {
        this.mileageInput.removeEventListener("input", this.redispatchInput);
        this.mileageInput.removeEventListener("change", this.redispatchInput);

        this.select.el?.removeEventListener?.("input", this.redispatchInput);
        this.select.el?.removeEventListener?.("change", this.redispatchInput);

        this.description.removeEventListener("input", this.redispatchInput);
        this.description.removeEventListener("change", this.redispatchInput);
    };

    // --- visibility
    set visible(isVisible) {
        this.el.classList.toggle("d-none", !isVisible);
    }

    // --- helpers
    reset = () => {
        this.mileageInput.value = "";
        this.select.value = "";
        this.description.value = "";
    };

    // Re-dispatch a standard "field-input" event the parent already understands
    redispatchInput = (e) => {
        const name = e?.target?.name;
        if (!name) return;

        this.el.dispatchEvent(
            new CustomEvent("field-input", {
                bubbles: true,
                detail: { name, value: e.target.value }
            })
        );
    };

    // --- state sync
    update = (state, { allowWhileFocused = false } = {}) => {
        // If user is typing, optionally dont stomp their input
        if (allowWhileFocused || document.activeElement !== this.mileageInput) {
            this.mileageInput.value = state.distanceOverride ?? "";
        }

        // Select component drives its own element; set via its API
        this.select.value = state.distanceOverrideReason ?? "";

        if (allowWhileFocused || document.activeElement !== this.description) {
            this.description.value = state.distanceOverrideDetails ?? "";
        }
    };

    // Optional: keep this if you still find it handy
    get value() {
        return {
            distanceOverride: this.mileageInput.value,
            distanceOverrideReason: this.select.value,
            distanceOverrideDetails: this.description.value
        };
    }
}
