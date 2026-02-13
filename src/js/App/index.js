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
import BulkSubmitModal from "../Components/Modals/BulkSubmitModal/index.js";
import { getMileageSubmissions } from "../services/submissions.js";

export default class App {
    constructor() {
        this.entryModal = new MileageModal({ onMileageSubmitted: this.handleMileageSubmitted });
        this.vehicleRegistrationModal = new VehicleRegistrationModal(VehicleLookupApi);

        this.vehicleRegistrationModal.onVehicleRegistered = this.handleVehicleRegistered;

        this.appInfoLink = document.getElementById("app-info");

        this.el = el(
            '',
            this.content = el(''),
            this.entryModal,
            this.vehicleRegistrationModal
        );

        this.loadingView = new LoadingCard();

        // single main view for both "needs vehicle" and "has vehicle"
        this.dashboardView = new DashboardCard({
            onAddMileage: this.handleAddMileage,
            onEditDraft: this.handleEditDraft,
            onDeleteDraft: this.handleDeleteDraft,
            onChangeVehicle: this.handleChangeVehicle,
            onSubmitAllDrafts: this.handleSubmitDrafts,
            onModeChange: this.handleModeChange
        });

        this.bulkSubmitModal = new BulkSubmitModal(this.handleBulkConfirm);
    }

    handleAddMileage = () => {
        this.entryModal.setMode("add");
        this.entryModal.open();
    }

    handleChangeVehicle = (e) => {
        e.preventDefault();
        this.vehicleRegistrationModal.open();
    };

    onmount = async () => {
        await this.initAuth();
        this.appInfoLink.addEventListener("click", this.handleInfoClick);
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
            // const { hasVehicle } = await VehiclesApi.getActive();
            const hasVehicle = true; // temp until we fix the API issue - assume true for now to show the main app
            hasVehicle ? this.showMainApp() : this.showNeedsVehicle();
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
        this.dashboardView.showNeedsVehicle();
        setChildren(this.content, [this.dashboardView]);
    };

    showMainApp = () => {
        this.dashboardView.reset();
        setChildren(this.content, [this.dashboardView]);
        this.dashboardView.setMode("drafts");
        this.refreshDrafts();
    };

    handleVehicleRegistered = async (raw) => {
        try {
            const res = await VehiclesApi.confirmFromLookup(raw); // returns { vehicle: {...} }
            this.showMainApp(res.vehicle);
            this.dashboardView.showToast("Vehicle registered successfully.");
        } catch (e) {
            this.dashboardView.showToast("Couldn't register vehicle. Please try again.");
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
            this.dashboardView.update(drafts);
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

            // effective distance (what user sees initially)
            distance: entry.distance,

            // calculated distance (drives override availability)
            distanceCalculated:
                entry.distanceCalculated != null
                    ? Number(entry.distanceCalculated)
                    : null,

            // override state
            overrideEnabled: !!entry.overrideEnabled,

            distanceOverride:
                entry.distanceOverride != null
                    ? Number(entry.distanceOverride)
                    : null,

            distanceOverrideReason: entry.distanceOverrideReason || '',
            distanceOverrideDetails: entry.distanceOverrideDetails || '',

            showSummary: false,
            banner: null
        });

        this.entryModal.setMode("edit");
        this.entryModal.openForEdit();
    };


    handleDeleteDraft = async (e) => {
        const entry = e.detail;
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

    handleSubmitDrafts = async () => {
        const drafts = await getMileageDrafts();
        if (drafts.length === 0) {
            this.dashboardView.showToast("No drafts to submit.");
            return;
        }
        this.bulkSubmitModal.open(drafts);
    };

    handleBulkConfirm = async ({ ids }) => {
        this.bulkSubmitModal.setBusy(true);
        try {
            await VehiclesApi.submitAllDrafts({ ids });
            this.bulkSubmitModal.close();
            this.dashboardView.showToast("Mileage drafts submitted successfully.");
            await this.refreshDrafts();
        } catch (err) {
            console.error("Error submitting drafts:", err);
            this.bulkSubmitModal.setBusy(false);
            this.dashboardView.showToast("Couldn't submit drafts. Please try again.");
        }
    };

    onunmount = () => {
        this.appInfoLink.removeEventListener("click", this.handleInfoClick);
    };

    handleInfoClick = (e) => {
        e.preventDefault();
        alert(`Mileage Claims App\nVersion: ${appVersion}`);
    }

    handleModeChange = (mode) => {
        if (mode === "drafts") {
            this.refreshDrafts();
        } else {
            this.refreshSubmissions();
        }
    };

    refreshSubmissions = async () => {
        try {
            const submissions = await getMileageSubmissions(); // new service
            this.dashboardView.updateSubmissions(submissions);
        } catch (err) {
            console.error(err);
        }
    };

}