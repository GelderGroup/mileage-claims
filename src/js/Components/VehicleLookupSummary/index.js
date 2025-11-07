import { el } from "redom";
import "./index.css";

export default class VehicleLookupSummary {
    constructor() {
        this.el = el(".mt-1",
            el("article.contrast.vehicle-card",
                el("h6.section-title", "Identity"),
                this.identityList = el("dl.kvlist",
                    el("dt", "Make"), (this.makeVal = el("dd.pill muted")),
                    el("dt", "Colour"), (this.colVal = el("dd.pill muted")),
                    el("dt", "Year"), (this.yearVal = el("dd.pill muted"))
                ),
                el("hr"),
                el("h6.section-title", "Status"),
                this.statusList = el("dl.kvlist",
                    el("dt", "MOT"), (this.motVal = el("dd.pill")),
                    el("dt", "Tax"), (this.taxVal = el("dd.pill"))
                ),
                el("hr"),
                el("h6.section-title", "Details"),
                this.detailsList = el("dl.kvlist",
                    el("dt", "Engine"), (this.engineVal = el("dd.pill muted")),
                    el("dt", "CO₂"), (this.co2Val = el("dd.pill muted")),
                    el("dt", "Fuel"), (this.fuelVal = el("dd.pill muted"))
                )
            )
        );
    }

    update = v => {
        const s = x => (x ?? "—");
        this.makeVal.textContent = v?.make ?? "—";
        this.colVal.textContent = v?.colour ?? "—";
        this.yearVal.textContent = v?.yearOfManufacture ?? "—";

        this.motVal.textContent = s(v.motStatus);
        this.motVal.className = `pill ${v?.motStatus === "Valid" ? "success" : "warning"}`;

        this.taxVal.textContent = s(v.taxStatus);
        this.taxVal.className = `pill ${v?.taxStatus === "Taxed" ? "success" : "warning"}`;

        this.engineVal.textContent = v?.engineCapacity ? `${v.engineCapacity}cc` : "—";
        this.co2Val.textContent = v?.co2Emissions ? `${v.co2Emissions} g/km` : "—";
        this.fuelVal.textContent = s(v.fuelType);
    };
}
