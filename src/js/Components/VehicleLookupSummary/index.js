import { el } from "redom";
import "./index.css";

const safe = x => (x ?? "—");

const motClass = status => `pill ${status === "Valid" ? "success" : "warning"}`;
const taxClass = status => `pill ${status === "Taxed" ? "success" : "warning"}`;

export default class VehicleLookupSummary {
    constructor() {
        this.alert = el("p.alert", { role: "alert", hidden: true });
        this.card = el("article.contrast.vehicle-card", { hidden: true },
            el("h6.section-title", "Identity"),
            this.identityList = el("dl.kvlist",
                el("dt", "Make"), (this.makeVal = el("dd.pill muted")),
                el("dt", "Colour"), (this.colVal = el("dd.pill muted")),
                el("dt", "Year"), (this.yearVal = el("dd.pill muted")),
            ),
            el("hr"),
            el("h6.section-title", "Status"),
            this.statusList = el("dl.kvlist",
                el("dt", "MOT"), (this.motVal = el("dd.pill")),
                el("dt", "Tax"), (this.taxVal = el("dd.pill")),
            ),
            el("hr"),
            el("h6.section-title", "Details"),
            this.detailsList = el("dl.kvlist",
                el("dt", "Engine"), (this.engineVal = el("dd.pill muted")),
                el("dt", "CO₂"), (this.co2Val = el("dd.pill muted")),
                el("dt", "Fuel"), (this.fuelVal = el("dd.pill muted")),
            )
        );
        this.el = el(".mt-1", this.alert, this.card);
    }

    setLoading() {
        this.alert.hidden = true;
        this.card.hidden = false;
        this.card.setAttribute("aria-busy", "true");
    }

    showError(message) {
        this.card.hidden = true;
        this.card.removeAttribute("aria-busy");
        this.alert.textContent = message || "Lookup failed. Please try again.";
        this.alert.hidden = false;
    }

    clear() {
        this.alert.hidden = true;
        this.card.hidden = true;
        this.card.removeAttribute("aria-busy");
    }

    update = v => {
        if (!v) {
            this.clear();
            return;
        }

        this.makeVal.textContent = safe(v.make);
        this.colVal.textContent = safe(v.colour);
        this.yearVal.textContent = safe(v.yearOfManufacture);

        this.motVal.textContent = safe(v.motStatus);
        this.motVal.className = motClass(v.motStatus);

        this.taxVal.textContent = safe(v.taxStatus);
        this.taxVal.className = taxClass(v.taxStatus);

        this.engineVal.textContent = v.engineCapacity ? `${v.engineCapacity}cc` : "—";
        this.co2Val.textContent = v.co2Emissions ? `${v.co2Emissions} g/km` : "—";
        this.fuelVal.textContent = safe(v.fuelType);

        this.alert.hidden = true;
        this.card.hidden = false;
        this.card.removeAttribute("aria-busy");
    };
}
