import { el, setChildren } from "redom";
import { AuthApi } from "../services/swaAuth.js";
import { VehiclesApi } from "../services/vehicles.js";
import { VehicleLookupApi } from "../services/vehicleLookup.js";

import {
    MileageModal,
    VehicleRegistrationModal,
    DashboardCard,
    LoadingCard,
    ErrorCard
} from "../Components/index.js";

import { appVersion } from "../config/appInfo.js";
import { getMileageDrafts, deleteMileageDraft } from "../services/mileageService.js";

import "@picocss/pico/css/pico.min.css";
import { set } from "../stores/mileageStore.js";

export default class App {
    constructor() {
        this.entryModal = new MileageModal({ onMileageSubmitted: this.handleMileageSubmitted });
        this.vehicleRegistrationModal = new VehicleRegistrationModal(VehicleLookupApi);

        this.vehicleRegistrationModal.onVehicleRegistered = this.handleVehicleRegistered;

        this.el = el(
            '',
            this.content = el(''),
            this.entryModal,
            this.vehicleRegistrationModal
        );

        this.loadingView = new LoadingCard();

        // single main view for both "needs vehicle" and "has vehicle"
        this.dashboardView = new DashboardCard({
            onAddMileage: () => this.entryModal.open(),
            onEditDraft: this.handleEditDraft,
            onDeleteDraft: this.handleDeleteDraft,
            onChangeVehicle: this.handleChangeVehicle
        });
    }

    handleChangeVehicle = (e) => {
        e.preventDefault();
        this.vehicleRegistrationModal.open();
    };

    onmount = async () => {
        const ver = document.getElementById("ver");
        if (ver) ver.textContent = `v${appVersion}`;
        await this.initAuth();
    };

    initAuth = async () => {
        setChildren(this.content, [this.loadingView]);
        const principal = await AuthApi.me();
        if (!principal) {
            AuthApi.login();
            return;
        }
        await this.afterLogin(principal);
    };

    afterLogin = async (principal) => {
        this.userInfo = {
            name: AuthApi.getName(principal),
            email: AuthApi.getEmail(principal)
        };

        try {
            const { hasVehicle, vehicle } = await VehiclesApi.getActive();
            hasVehicle ? this.showMainApp(vehicle) : this.showNeedsVehicle();
        } catch (e) {
            console.error("VehiclesApi.get failed", e);
            setChildren(this.content, [
                new ErrorCard(
                    "We couldn't check your vehicle right now. Try again.",
                    () => this.initAuth()
                )
            ]);
        }
    };

    // 👉 now uses DashboardCard in a "no vehicle yet" mode
    showNeedsVehicle = () => {
        this.dashboardView.showNeedsVehicle(this.userInfo.name);
        setChildren(this.content, [this.dashboardView]);
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
        const { success, message } = evt.detail || {};
        if (success) this.dashboardView.showToast(message || "Mileage submitted.");

        this.refreshDrafts();
    };

    refreshDrafts = async () => {
        try {
            const drafts = await getMileageDrafts();
            this.dashboardView.updateDrafts(drafts);
        } catch (err) {
            console.error(err);
            // optionally show a toast
        }
    };

    handleEditDraft = (e) => {
        const entry = e.detail;

        set({
            id: entry.id,
            date: entry.date,
            startPostcode: entry.startPostcode,
            endPostcode: entry.endPostcode,
            distance: entry.distance
            // and any override fields, if they exist in the entry
            // isOverride, overrideDistance, overrideReason
        });

        this.entryModal.openForEdit();
    };

    handleDeleteDraft = async (e) => {
        const entry = e.detail; console.log("Deleting draft:", entry);
        if (!entry?.id) return;

        if (!confirm("Are you sure you want to delete this draft?")) return;
        try {
            await deleteMileageDraft(entry.id);
            this.dashboardView.showToast("Draft deleted.");
            this.refreshDrafts();
        } catch (err) {
            console.error("Error deleting draft:", err);
            this.dashboardView.showToast("Couldn't delete draft. Please try again.");
        }
    };
}
