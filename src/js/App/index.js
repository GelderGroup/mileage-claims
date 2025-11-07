import { el, setChildren } from "redom";
import pkg from "../../../package.json" assert { type: "json" };
import MileageModal from "../Components/MileageModal";
import VehicleRegistrationModal from "../Components/VehicleRegistrationModal";
import { SwaAuth } from "../services/swaAuth.js";
import { VehiclesApi } from "../../services/vehicles.js";
import { VehicleLookupApi } from "../../services/vehicleLookup.js";

import WelcomeCard from "../Components/WelcomeCard";
import DashboardCard from "../Components/DashboardCard";
import LoadingCard from "../Components/LoadingCard";
import ErrorCard from "../Components/ErrorCard";

import "@picocss/pico/css/pico.min.css";

export default class App {
    constructor() {
        this.entryModal = new MileageModal();
        this.vehicleRegistrationModal = new VehicleRegistrationModal(VehicleLookupApi);
        this.entryModal.onMileageSubmitted = this.handleMileageSubmitted;
        this.vehicleRegistrationModal.onVehicleRegistered = this.handleVehicleRegistered;

        this.content = el(".mt-3");
        this.el = el("", el("main", this.content), this.entryModal, this.vehicleRegistrationModal);

        this.loadingView = new LoadingCard();
        this.welcomeView = new WelcomeCard(() => this.vehicleRegistrationModal.open());
        this.dashboardView = new DashboardCard({
            onAddMileage: () => this.entryModal.open(),
            onChangeVehicle: () => this.vehicleRegistrationModal.open()
        });
    }

    onmount = async () => {
        const ver = document.getElementById("ver"); if (ver) ver.textContent = `v${pkg.version}`;
        await this.initAuth();
    };

    initAuth = async () => {
        setChildren(this.content, [this.loadingView]);
        const principal = await SwaAuth.me();
        if (!principal) { SwaAuth.login(); return; }
        await this.afterLogin(principal);
    };

    afterLogin = async (principal) => {
        this.userInfo = { name: SwaAuth.getName(principal), email: SwaAuth.getEmail(principal) };
        try {
            const { hasVehicle, vehicle } = await VehiclesApi.get();
            hasVehicle ? this.showMainApp(vehicle) : this.showNeedsVehicle();
        } catch (e) {
            console.error("VehiclesApi.get failed", e);
            setChildren(this.content, [new ErrorCard("We couldn’t check your vehicle right now. Try again.", () => this.initAuth())]);
        }
    };

    showNeedsVehicle = () => {
        this.welcomeView.update(this.userInfo.name);
        setChildren(this.content, [this.welcomeView]);
    };

    showMainApp = (vehicle) => {
        this.dashboardView.update(this.userInfo, vehicle);
        setChildren(this.content, [this.dashboardView]);
    };

    handleVehicleRegistered = async (vehicleData) => {
        await VehiclesApi.upsert(vehicleData);
        this.showMainApp(vehicleData);
        this.dashboardView.showToast("Vehicle registered successfully.");
    };

    handleMileageSubmitted = (evt) => {
        const { success, message } = evt.detail || {};
        if (success) this.dashboardView.showToast(message || "Mileage submitted.");
    };
}
