import { el } from "../../../ui/dom.js";
import { MileageDraftList } from "../MileageCard/MileageDraftList/index.js";
import "./index.css";

export default class DashboardCard {
    constructor({ onAddMileage, onChangeVehicle }) {
        // header text
        this.greet = el("p.dashboard-greeting");
        this.vehicleLabel = el("span.vehicle-label", "Active vehicle:");
        this.vehicleRegLink = el('a', { href: "#" });

        // actions
        this.addBtn = el(
            "button.primary.add-mileage",
            { type: "button" },
            "Add Mileage Entry"
        );
        this.submitBtn = el(
            "button.secondary.submit-drafts",
            { type: "button" },
            "Submit All Drafts"
        );

        this.alert = el("p.dashboard-toast", {
            role: "status",
            hidden: true
        });

        this.el = el(
            "section.dashboard",
            el(
                "header.dashboard-header",
                this.greet,
                el("div.vehicle-info", this.vehicleLabel, this.vehicleRegLink),
                this.addBtn
            ),
            this.draftsView = new MileageDraftList(),
            el("footer.dashboard-footer", this.submitBtn),
            this.alert
        );

        this.onAddMileage = onAddMileage;
        this.onChangeVehicle = onChangeVehicle;
    }

    // normal "has vehicle" state
    update(user, vehicle) {
        this.greet.textContent = `Welcome, ${user.name}!`;
        this.vehicleLabel.textContent = "Active vehicle:";
        this.vehicleRegLink.textContent = ` ${vehicle.registration}`;

        this.addBtn.hidden = false;
        this.submitBtn.hidden = false;
        this.draftsView.el.hidden = false;
    }

    // "no active vehicle yet" state (used by App.showNeedsVehicle)
    showNeedsVehicle(name) {
        this.greet.textContent = `Welcome, ${name}!`;
        this.vehicleLabel.textContent = "Active vehicle:";
        this.vehicleReg.textContent = " None set";
        this.changeLink.textContent = "Register Vehicle";

        this.addBtn.hidden = true;
        this.submitBtn.hidden = true;
        this.draftsView.el.hidden = true;
    }

    showToast(msg) {
        this.alert.textContent = msg;
        this.alert.hidden = false;
        setTimeout(() => (this.alert.hidden = true), 4000);
    }

    onmount = () => {
        this.addBtn.addEventListener("click", this.onAddMileage);
        this.vehicleRegLink.addEventListener("click", this.onChangeVehicle);
    };

    onunmount = () => {
        this.addBtn.removeEventListener("click", this.onAddMileage);
        this.vehicleRegLink.removeEventListener("click", this.onChangeVehicle);
    };
}
