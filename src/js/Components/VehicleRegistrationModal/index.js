export default class VehicleRegistrationModal {
    constructor(api, onVehicleRegistered) {
        this.api = api;
        this.onVehicleRegistered = onVehicleRegistered;

        this.el = el("dialog.vehicle-registration-modal",
            el("article",
                el("header",
                    this.cancelButton = el("button", { "aria-label": "Close", rel: "prev" }),
                    el("h3.heading", CarIcon(), "Register vehicle"),
                    el("p.subheading", "Enter your registration to continue.")
                ),
                this.form = el("form", { autocomplete: "off" },
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
        this.form.addEventListener("submit", this.handleSubmit);
        this.cancelButton.addEventListener("click", this.close);
    };

    onunmount = () => {
        this.lookup.el.removeEventListener("vehicle:search", this.handleSearch);
        this.lookup.el.removeEventListener("vehicle:found", this.handleVehicleFound);
        this.lookup.el.removeEventListener("vehicle:error", this.handleVehicleError);
        this.form.removeEventListener("submit", this.handleSubmit);
        this.cancelButton.removeEventListener("click", this.close);
    };

    handleSearch = () => {
        this.btnRegister.disabled = true;
        this.summary.setLoading();
    };

    handleVehicleFound = ({ detail }) => {
        this.selectedVehicle = detail;
        this.summary.update(this.selectedVehicle);
        this.btnRegister.disabled = false;
    };

    handleVehicleError = ({ detail }) => {
        this.summary.showError(detail?.message);
        this.btnRegister.disabled = true;
    };

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.onVehicleRegistered && !this.btnRegister.disabled) {
            this.onVehicleRegistered(this.vehicleData);
        }
        this.close();
    };

    open = () => this.el.showModal();
    close = () => { this.summary.clear(); this.el.close(); };

    get vehicleData() { return this.selectedVehicle; }
}
