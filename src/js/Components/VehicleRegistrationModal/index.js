import { el } from "redom";
import VehicleLookupInput from "../VehicleLookupInput/index.js";
import { CarIcon } from "../../utils/icons.js";
import "./index.css";
import VehicleLookupSummary from "../VehicleLookupSummary/index.js";

export default class VehicleRegistrationModal {
    constructor(api) {
        this.el = el("dialog.vehicle-registration-modal",
            el("article",
                el("header",
                    this.cancelButton = el("button", { "aria-label": "Close", rel: "prev" }),
                    el("h3.heading", CarIcon(), "Register vehicle"),
                    el("p.subheading", "Enter your registration to continue.")
                ),
                el("form", { autocomplete: "off" },
                    this.lookup = new VehicleLookupInput(api),
                    this.summary = new VehicleLookupSummary(),
                    el("footer",
                        this.btnRegister = el("button", { type: "submit", disabled: true }, "Register vehicle")
                    )
                )
            )
        );
    }

    onmount = () => {
        this.lookup.el.addEventListener("vehicle:search", this.handleSearch);
        this.lookup.el.addEventListener("vehicle:found", this.handleVehicleFound);
        this.lookup.el.addEventListener("vehicle:error", this.handleVehicleError);
        this.cancelButton.addEventListener("click", this.close);
    };

    onunmount = () => {
        this.lookup.el.removeEventListener("vehicle:search", this.handleSearch);
        this.lookup.el.removeEventListener("vehicle:found", this.handleVehicleFound);
        this.lookup.el.removeEventListener("vehicle:error", this.handleVehicleError);
        this.cancelButton.removeEventListener("click", this.close);
    };

    handleSearch = () => {
        this.btnRegister.disabled = true;
        this.summary.setLoading();   // shows card with aria-busy
    };

    handleVehicleFound = ({ detail }) => {
        this.summary.update(detail);
        this.btnRegister.disabled = false;
    };

    handleVehicleError = ({ detail }) => {
        this.summary.showError(detail?.message);
        this.btnRegister.disabled = true;
    };

    update = (vehicle) => this.summary.update(vehicle);
    open = () => this.el.showModal();
    close = () => { this.summary.clear(); this.el.close(); };
}
