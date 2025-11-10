import { el } from "redom";
import './index.css';

export default class DashboardCard {
    constructor({ onAddMileage, onChangeVehicle }) {
        this.greet = el("h4");

        // Inline vehicle row
        this.vehicleLabel = el("strong", "Active vehicle:");
        this.vehicleReg = el("span");
        this.changeLink = el("a.secondary", { href: "#", role: "button" }, "Change");
        this.vehicleRow = el(".vehicle-info",
            this.vehicleLabel, this.vehicleReg, this.changeLink
        );

        this.addBtn = el("button.primary", { type: "button" }, "Add Mileage Entry");
        this.alert = el("p", { role: "status", hidden: true });

        this.el = el("section",
            el("article.contrast",
                this.greet,
                this.vehicleRow,
                el("footer", this.addBtn),
                this.alert
            )
        );

        this.onAddMileage = onAddMileage;
        this.onChangeVehicle = onChangeVehicle;
    }

    update(user, vehicle) {
        this.greet.textContent = `Welcome, ${user.name}!`;
        this.vehicleReg.textContent = ` ${vehicle.registration}`;
    }

    showToast(msg) {
        this.alert.textContent = msg;
        this.alert.hidden = false;
        setTimeout(() => (this.alert.hidden = true), 4000);
    }

    onmount = () => {
        this.addBtn.addEventListener("click", this.onAddMileage);
        this.changeLink.addEventListener("click", this.onChangeVehicle);
    };

    onunmount = () => {
        this.addBtn.removeEventListener("click", this.onAddMileage);
        this.changeLink.removeEventListener("click", this.onChangeVehicle);
    };
}
