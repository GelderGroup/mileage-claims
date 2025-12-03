import { el } from "../../../ui/dom.js";
import { MileageDraftList } from "../MileageCard/MileageDraftList/index.js";
import "./index.css";

export default class DashboardCard {
    constructor({ onAddMileage, onChangeVehicle, onDeleteDraft }) {
        this.userName = el("span.user-name");
        this.metaSeparator = el("span.meta-sep", " · ");
        this.vehicleRegLink = el('a', { href: "#" });

        this.metaLine = el(
            "p.dashboard-meta",
            this.userName,
            this.metaSeparator,
            this.vehicleRegLink
        );

        // actions
        this.addBtn = el(
            "button.secondary",
            { type: "button", 'aria-label': "Add Mileage Entry" },
            "Add Mileage Entry"
        );
        this.submitBtn = el(
            "button",
            { type: "button", 'aria-label': "Submit All Drafts" },
            "Submit All Drafts"
        );

        this.alert = el("p.dashboard-toast", {
            role: "status",
            hidden: true
        });

        // Main layout: header, scrollable list, fixed footer
        this.draftsView = new MileageDraftList();

        this.listContainer = el('div.dashboard-list-container', this.draftsView.el);

        this.footer = el("footer.dashboard-footer", this.submitBtn);

        this.el = el(
            "section.dashboard",
            el(
                "header.dashboard-header",
                this.metaLine,
                this.addBtn
            ),
            this.listContainer,
            this.footer,
            this.alert
        );

        this.onAddMileage = onAddMileage;
        this.onChangeVehicle = onChangeVehicle;
        this.onDeleteDraft = onDeleteDraft;

        // Listen for edit/delete events from draftsView
        this.draftsView.el.addEventListener('edit-draft', (e) => {
            if (this.onEditDraft) this.onEditDraft(e.detail);
        });
        this.draftsView.el.addEventListener('delete-draft', (e) => {
            if (this.onDeleteDraft) this.onDeleteDraft(e.detail);
        });
    }

    // normal "has vehicle" state
    update(user, vehicle) {
        this.userName.textContent = `Welcome, ${user.name}!`;
        this.vehicleRegLink.textContent = ` ${vehicle.registration}`;

        this.addBtn.hidden = false;
        this.submitBtn.hidden = false;
        this.draftsView.el.hidden = false;
        this.listContainer.hidden = false;
        this.footer.hidden = false;
    }

    // "no active vehicle yet" state (used by App.showNeedsVehicle)
    showNeedsVehicle(name) {
        this.userName.textContent = `Welcome, ${name}!`;
        this.vehicleRegLink.textContent = " Register Vehicle";

        this.addBtn.hidden = true;
        this.submitBtn.hidden = true;
        this.draftsView.el.hidden = true;
        this.listContainer.hidden = true;
        this.footer.hidden = true;
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
