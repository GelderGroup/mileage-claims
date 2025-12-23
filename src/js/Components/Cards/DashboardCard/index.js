// Dashboard component
import { el } from "redom";
import { PlusIcon } from "../../../utils/icons.js";
import { MileageDraftList } from "../MileageCard/MileageDraftList/index.js";
import "./index.css";

export default class DashboardCard {
    constructor({ onAddMileage, onChangeVehicle, onEditDraft }) {
        this.userName = document.getElementById("user-name");
        this.vehicleRegLink = document.getElementById("vehicle-reg");

        this.addBtn = el("button#add-mileage-btn.p-2.mb-0", {
            type: "button",
            "aria-label": "Add Mileage Entry",
            hidden: true
        }, PlusIcon());

        this.submitBtn = el("button", {
            type: "button",
            "aria-label": "Submit All Drafts",
            disabled: true
        }, "Submit All Drafts");

        this.alert = el("p.dashboard-toast", {
            role: "status",
            hidden: true,
        });

        this.draftsView = new MileageDraftList();

        this.el = el("section.dashboard",
            el("header.dashboard-header",
                el('.draft-label', 'Drafts'),
                this.addBtn
            ),
            el("div.dashboard-body", this.draftsView),
            el("footer.dashboard-footer", this.submitBtn),
            this.alert
        );

        this.onAddMileage = onAddMileage;
        this.onChangeVehicle = onChangeVehicle;
        this.onEditDraft = onEditDraft;
    }

    update(user, vehicle) {
        console.log("DashboardCard update", user, vehicle);
        this.userName.textContent = user.name;
        this.vehicleRegLink.textContent = vehicle.registration;

        this.addBtn.hidden = false;
        this.submitBtn.hidden = false;
        this.draftsView.el.hidden = false;
    }

    updateDrafts = (drafts) => {
        this.submitBtn.disabled = drafts.length === 0;
        this.draftsView.update(drafts);
    };

    showNeedsVehicle(name) {
        this.userName.textContent = `Welcome, ${name}!`;
        this.vehicleRegLink.textContent = " Register Vehicle";

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
        this.el.addEventListener("edit-draft", this.onEditDraft);
    };

    onunmount = () => {
        this.addBtn.removeEventListener("click", this.onAddMileage);
        this.vehicleRegLink.removeEventListener("click", this.onChangeVehicle);
        this.el.removeEventListener("edit-draft", this.onEditDraft);
    };
}
