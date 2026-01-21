// Dashboard component
import { el } from "redom";
import { PlusIcon } from "../../../utils/icons.js";
import { MileageDraftList } from "../MileageCard/MileageDraftList/index.js";
import "./index.css";

export default class DashboardCard {
    constructor({ onAddMileage, onChangeVehicle, onEditDraft, onDeleteDraft, onSubmitAllDrafts }) {
        // this.userName = document.getElementById("user-name");
        this.vehicleRegLink = document.getElementById("vehicle-reg");

        this.addBtn = el("button#add-mileage-btn.p-1.mb-0", {
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
        this.totalEl = el('.drafts-total');

        this.el = el("section.dashboard",
            el("header.dashboard-header",
                el('.draft-label', 'Drafts'),
                this.addBtn
            ),
            el("div.dashboard-body", this.draftsView),
            el("footer.dashboard-footer",
                this.totalEl,
                this.submitBtn
            ),
            this.alert
        );

        this.onAddMileage = onAddMileage;
        this.onChangeVehicle = onChangeVehicle;
        this.onEditDraft = onEditDraft;
        this.onDeleteDraft = onDeleteDraft;
        this.onSubmitAllDrafts = onSubmitAllDrafts;
    }

    update(user, vehicle) {
        // this.userName.textContent = user.name;
        this.vehicleRegLink.textContent = vehicle.registration;

        this.addBtn.hidden = false;
        this.submitBtn.hidden = false;
        this.draftsView.el.hidden = false;
    }

    updateDrafts = (drafts) => {
        const total = (drafts || []).reduce((acc, d) => acc + (Number(d.distance) || 0), 0);
        const totalFmt = Number.isInteger(total) ? String(total) : total.toFixed(1);

        this.totalEl.textContent = drafts.length ? `${totalFmt} miles total` : '';
        this.submitBtn.disabled = drafts.length === 0;
        this.draftsView.update(drafts);
    };

    showNeedsVehicle(name) {
        // this.userName.textContent = `Welcome, ${name}!`;
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
        this.el.addEventListener("delete-draft", this.onDeleteDraft);
        this.submitBtn.addEventListener("click", this.onSubmitAllDrafts);
    };

    onunmount = () => {
        this.addBtn.removeEventListener("click", this.onAddMileage);
        this.vehicleRegLink.removeEventListener("click", this.onChangeVehicle);
        this.el.removeEventListener("edit-draft", this.onEditDraft);
        this.el.removeEventListener("delete-draft", this.onDeleteDraft);
        this.submitBtn.removeEventListener("click", this.onSubmitAllDrafts);
    };
}


