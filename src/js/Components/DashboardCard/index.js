import { el } from "redom";

export default class DashboardCard {
    constructor({ onAddMileage, onChangeVehicle }) {
        this.greet = el("h4");
        this.vehicle = el("p");
        this.addBtn = el("button", { type: "button", class: "primary" }, "Add Mileage Entry");
        this.changeBtn = el("button", { type: "button", class: "secondary" }, "Change Vehicle");
        this.alert = el("p", { role: "status", hidden: true });

        this.el = el("section",
            el("article.contrast",
                this.greet, this.vehicle,
                el("footer", this.addBtn, this.changeBtn),
                this.alert
            )
        );

        this.onAddMileage = onAddMileage;
        this.onChangeVehicle = onChangeVehicle;
    }

    update(user, vehicle) {
        this.greet.textContent = `Welcome, ${user.name}!`;
        this.vehicle.textContent = `Vehicle: ${vehicle.registration}`;
    }

    showToast(msg) { this.alert.textContent = msg; this.alert.hidden = false; setTimeout(() => (this.alert.hidden = true), 4000); }
    onmount = () => { this.addBtn.addEventListener("click", this.onAddMileage); this.changeBtn.addEventListener("click", this.onChangeVehicle); };
    onunmount = () => { this.addBtn.removeEventListener("click", this.onAddMileage); this.changeBtn.removeEventListener("click", this.onChangeVehicle); };
}
