import { el } from "../../ui/dom.js";
import "./index.css";

const normalizeApiError = (err) => {
    const status = err?.status ?? err?.response?.status;
    const errors = err?.errors ?? err?.response?.data?.errors;
    const first = Array.isArray(errors) ? errors[0] : null;
    let message = first?.detail || first?.title || "Lookup failed. Check the registration and try again.";
    if (status === 404) message = "Vehicle not found. Check the registration and try again.";
    if (status === 503) message = "Service unavailable. Please try again shortly.";
    return { status, code: first?.code, title: first?.title, detail: first?.detail, message };
};

export default class VehicleLookupInput {
    constructor(api) {
        this.api = api;
        this.el = el("",
            el("label", { for: "reg" }, "Vehicle lookup"),
            el("", { role: "group" },
                this.input = el("input#reg", { placeholder: "AB12 CDE", required: true, autocomplete: "off", maxlength: 8, minlength: 2 }),
                this.btn = el("button", { type: "button" }, "Search")
            )
        );
    }

    onmount = () => {
        this.btn.addEventListener("click", this.lookup);
        this.input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); this.lookup(); } });
    };

    lookup = async () => {
        const reg = this.input.value.trim();
        if (!reg) return;
        this.btn.disabled = true;
        this.el.dispatchEvent(new CustomEvent("vehicle:search", { bubbles: true }));
        try {
            const v = await this.api.byReg(reg);
            this.el.dispatchEvent(new CustomEvent("vehicle:found", { bubbles: true, detail: v }));
        } catch (err) {
            const e = normalizeApiError(err);
            this.el.dispatchEvent(new CustomEvent("vehicle:error", { bubbles: true, detail: e }));
        } finally {
            this.btn.disabled = false;
        }
    };
}
