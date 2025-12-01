import { el } from "../../../ui/dom.js";
import { MileageDraftList } from "../MileageCard/MileageDraftList/index.js";
import "./index.css";

export default class DashboardCard {
    constructor({ onAddMileage, onChangeVehicle }) {
        // header text
        this.greet = el("p", { class: "dashboard-greeting" });
        this.vehicleLabel = el("span", { class: "vehicle-label" }, "Active vehicle:");
        this.vehicleReg = el("span", { class: "vehicle-reg" });
        this.changeLink = el(
            "button",
            { type: "button", class: "secondary outline change-vehicle" },
            "Change"
        );

        // actions
        this.addBtn = el(
            "button",
            { type: "button", class: "primary add-mileage" },
            "Add Mileage Entry"
        );
        this.submitBtn = el(
            "button",
            { type: "button", class: "secondary submit-drafts" },
            "Submit All Drafts"
        );

        this.alert = el("p", {
            role: "status",
            hidden: true,
            class: "dashboard-toast"
        });

        // ROOT: this is now the “app”, not a Pico <article> card
        this.el = el(
            "section.dashboard",
            // HEADER: logo + welcome + vehicle info + add button
            el(
                "header.dashboard-header",
                el(
                    "div.dashboard-brand",
                    el("img", {
                        src: "images/gelder-logo.min.svg",
                        alt: "Gelder Mileage Claims",
                        class: "dashboard-logo"
                    })
                ),
                el(
                    "div.dashboard-header-main",
                    this.greet,
                    el(
                        "div.vehicle-info",
                        this.vehicleLabel,
                        this.vehicleReg,
                        this.changeLink
                    ),
                    this.addBtn
                )
            ),

            // BODY: drafts list
            this.draftsView = new MileageDraftList(),

            // FOOTER: submit button
            el(
                "footer.dashboard-footer",
                this.submitBtn
            ),

            // TOAST
            this.alert
        );

        this.onAddMileage = onAddMileage;
        this.onChangeVehicle = onChangeVehicle;
    }

    // normal "has vehicle" state
    update(user, vehicle) {
        this.greet.textContent = `Welcome, ${user.name}!`;
        this.vehicleLabel.textContent = "Active vehicle:";
        this.vehicleReg.textContent = ` ${vehicle.registration}`;
        this.changeLink.textContent = "Change";

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
        this.changeLink.addEventListener("click", this.onChangeVehicle);
        this.submitBtn.addEventListener("click", () => {
            // hook up "submit all drafts" here when ready
        });
    };

    onunmount = () => {
        this.addBtn.removeEventListener("click", this.onAddMileage);
        this.changeLink.removeEventListener("click", this.onChangeVehicle);
        // same for submitBtn if you attach a real handler above
    };
}
