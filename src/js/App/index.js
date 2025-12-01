import { el, setChildren } from "../ui/dom.js";
import { AuthApi } from "../services/swaAuth.js";
import { VehiclesApi } from "../services/vehicles.js";
import { VehicleLookupApi } from "../services/vehicleLookup.js";

import {
    MileageModal,
    VehicleRegistrationModal,
    WelcomeCard,
    DashboardCard,
    LoadingCard,
    ErrorCard
} from "../Components/index.js";

import { appVersion } from "../config/appInfo.js";
import { getMileageDrafts } from "../services/mileageService.js";

import "@picocss/pico/css/pico.min.css";

export default class App {
    constructor() {
        this.entryModal = new MileageModal({ onMileageSubmitted: this.handleMileageSubmitted });
        this.vehicleRegistrationModal = new VehicleRegistrationModal(VehicleLookupApi);

        this.vehicleRegistrationModal.onVehicleRegistered = this.handleVehicleRegistered;

        this.content = el(".mt-3");
        this.el = el("", el("main", this.content), this.entryModal, this.vehicleRegistrationModal);

        this.loadingView = new LoadingCard();
        this.welcomeView = new WelcomeCard(() => this.vehicleRegistrationModal.open());
        this.dashboardView = new DashboardCard({
            onAddMileage: () => this.entryModal.open(),
            onChangeVehicle: this.handleChangeVehicle
        });
    }

    handleChangeVehicle = e => {
        e.preventDefault();
        this.vehicleRegistrationModal.open();
    }

    onmount = async () => {
        const ver = document.getElementById("ver"); if (ver) ver.textContent = `v${appVersion}`;
        await this.initAuth();
    };

    initAuth = async () => {
        setChildren(this.content, [this.loadingView]);
        const principal = await AuthApi.me();
        if (!principal) { AuthApi.login(); return; }
        await this.afterLogin(principal);
    };

    afterLogin = async (principal) => {
        this.userInfo = { name: AuthApi.getName(principal), email: AuthApi.getEmail(principal) };
        try {
            const { hasVehicle, vehicle } = await VehiclesApi.getActive();
            hasVehicle ? this.showMainApp(vehicle) : this.showNeedsVehicle();
        } catch (e) {
            console.error("VehiclesApi.get failed", e);
            setChildren(this.content, [new ErrorCard("We couldn't check your vehicle right now. Try again.", () => this.initAuth())]);
        }
    };

    showNeedsVehicle = () => {
        this.welcomeView.update(this.userInfo.name);
        setChildren(this.content, [this.welcomeView]);
    };

    showMainApp = (vehicle) => {
        this.dashboardView.update(this.userInfo, vehicle);
        this.refreshDrafts();
        setChildren(this.content, [this.dashboardView]);
    };

    handleVehicleRegistered = async (raw) => {
        try {
            const res = await VehiclesApi.confirmFromLookup(raw); // returns { vehicle: {...} }
            this.showMainApp(res.vehicle);
            this.dashboardView.showToast("Vehicle registered successfully.");
        } catch (e) {
            this.dashboardView.showToast("Couldn’t register vehicle. Please try again.");
        }
    };

    handleMileageSubmitted = (evt) => {
        console.log("Mileage submitted:", evt);
        const { success, message } = evt.detail || {};
        if (success) this.dashboardView.showToast(message || "Mileage submitted.");

        this.refreshDrafts();
    };

    refreshDrafts = async () => {
        try {
            const drafts = await getMileageDrafts();
            this.dashboardView.draftsView.update(drafts);
        } catch (err) {
            console.error(err);
            // optionally show a toast
        }
    };

    handleEditDraft = (e) => {
        const entry = e.detail;
        // populate store (including id) then open modal
        setData({
            id: entry.id,
            date: entry.date,
            startPostcode: entry.startPostcode,
            endPostcode: entry.endPostcode,
            distance: entry.distance,
            // and any override fields, if they exist in the entry
        });
        this.entryModal.open();
    };

}
