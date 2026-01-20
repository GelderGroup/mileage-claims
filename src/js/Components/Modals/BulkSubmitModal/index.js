import { el, mount } from "redom";

/**
 * BulkSubmitModal
 * - dumb UI: shows a summary + optional details
 * - emits "bulk:confirm" with { ids } when user submits
 * - emits "bulk:cancel" when closed/cancelled
 */
export default class BulkSubmitModal {
    constructor(confirmHandler) {
        this.confirmHandler = confirmHandler;
        this.drafts = [];

        this.el = el(
            "dialog.bulk-submit-modal",
            el(
                "article",
                el(
                    "header",
                    this.closeBtn = el("button", { "aria-label": "Close", rel: "prev" }),
                    this.titleEl = el("h3", "Submit drafts"),
                    this.subEl = el("p", { style: "margin:0; opacity:.75;" })
                ),
                this.content = el(
                    ".modal-content",
                    this.summaryEl = el("div"),
                    this.toggleBtn = el("button.secondary", { type: "button" }, "Show details"),
                    this.detailsWrap = el(
                        "div.d-none",
                        { style: "max-height: 40vh; overflow:auto; margin-top:.5rem;" },
                        this.listEl = el("ul", { style: "margin:0; padding-left: 1.1rem;" })
                    )
                ),
                el(
                    "footer",
                    this.cancelBtn = el("button.secondary", { type: "button" }, "Cancel"),
                    this.submitBtn = el("button", { type: "button" }, "Submit drafts")
                )
            )
        );
    }

    // --- lifecycle
    onmount = () => {
        this.closeBtn.addEventListener("click", this.close);
        this.cancelBtn.addEventListener("click", this.close);
        this.toggleBtn.addEventListener("click", this.toggleDetails);
        this.submitBtn.addEventListener("click", this.confirm);
    };

    onunmount = () => {
        this.closeBtn.removeEventListener("click", this.close);
        this.cancelBtn.removeEventListener("click", this.close);
        this.toggleBtn.removeEventListener("click", this.toggleDetails);
        this.submitBtn.removeEventListener("click", this.confirm);
    };

    // --- public API
    open = (drafts) => {
        this.drafts = Array.isArray(drafts) ? drafts : [];
        this.render();

        // mount if you follow that pattern elsewhere
        if (!this.el.isConnected) mount(document.body, this);

        this.el.showModal();
    };

    close = () => {
        if (this.el.open) this.el.close();
        this.drafts = [];
        this.hideDetails();
    };

    setBusy = (b) => {
        this.submitBtn.disabled = !!b;
        this.cancelBtn.disabled = !!b;
        this.closeBtn.disabled = !!b;
        this.toggleBtn.disabled = !!b;
        this.submitBtn.textContent = b ? "Submitting…" : "Submit drafts";
    };

    // --- internal
    render = () => {
        const n = this.drafts.length;
        const totalMiles = this.sumMiles(this.drafts);
        const overrides = this.drafts.filter((d) => !!d.overrideEnabled).length;
        const { min, max } = this.dateRange(this.drafts);

        this.titleEl.textContent = `Submit ${n} draft${n === 1 ? "" : "s"}?`;
        this.subEl.textContent = [
            `${totalMiles} miles total`,
            overrides ? `${overrides} override${overrides === 1 ? "" : "s"}` : "No overrides",
            (min && max) ? `${min}${min === max ? "" : `–${max}`}` : ""
        ].filter(Boolean).join(" • ");

        // summary block (simple, readable)
        this.summaryEl.innerHTML = "";
        this.summaryEl.append(
            el("p", { style: "margin:.25rem 0; opacity:.9;" },
                "You’re about to submit these mileage drafts. You can’t edit them afterwards."
            ),
            overrides
                ? el("p", { style: "margin:.25rem 0; opacity:.75;" },
                    "Overridden entries will be submitted with their override reason and details."
                )
                : el("span") // keep DOM shape stable
        );

        // details list
        this.listEl.innerHTML = "";
        this.drafts.forEach((d) => {
            const miles = this.formatMiles(d.distance);
            const label = `${this.formatShortDate(d.date)} • ${miles} mi • ${this.shortRoute(d.startLabel, d.endLabel)}`;
            this.listEl.append(
                el("li",
                    el("span", label),
                    d.overrideEnabled ? el("span", { style: "margin-left:.35rem; opacity:.7;" }, "(override)") : ""
                )
            );
        });

        // Details toggle makes sense only if there’s something to show
        this.toggleBtn.classList.toggle("d-none", n <= 1);
        this.toggleBtn.textContent = "Show details";
        this.hideDetails();
    };

    toggleDetails = () => {
        const isHidden = this.detailsWrap.classList.contains("d-none");
        if (isHidden) {
            this.detailsWrap.classList.remove("d-none");
            this.toggleBtn.textContent = "Hide details";
        } else {
            this.hideDetails();
        }
    };

    hideDetails = () => {
        this.detailsWrap.classList.add("d-none");
        this.toggleBtn.textContent = "Show details";
    };

    confirm = () => {
        const ids = this.drafts.map(d => d.id).filter(Boolean);
        this.confirmHandler?.({ ids, drafts: this.drafts });
    };

    // --- helpers
    sumMiles = (drafts) => {
        const total = drafts.reduce((acc, d) => acc + (Number(d.distance) || 0), 0);
        // display-friendly formatting: integer or 1dp
        return Number.isInteger(total) ? String(total) : total.toFixed(1);
    };

    formatMiles = (v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) return "—";
        return Number.isInteger(n) ? String(n) : n.toFixed(1);
    };

    // expects ISO date or something parseable; if not, just return the original string
    formatShortDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return String(iso);
        return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    };

    dateRange = (drafts) => {
        const dates = drafts
            .map((d) => new Date(d.date))
            .filter((d) => !Number.isNaN(d.getTime()))
            .sort((a, b) => a - b);

        if (!dates.length) return { min: null, max: null };

        const min = dates[0].toLocaleDateString(undefined, { day: "2-digit", month: "short" });
        const max = dates[dates.length - 1].toLocaleDateString(undefined, { day: "2-digit", month: "short" });
        return { min, max };
    };

    shortRoute = (a, b) => {
        const left = (a || "").trim();
        const right = (b || "").trim();
        if (!left && !right) return "";
        if (!left) return right;
        if (!right) return left;
        return `${left} → ${right}`;
    };
}
