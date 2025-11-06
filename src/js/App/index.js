import { el } from "redom";
import pkg from '../../../package.json' assert { type: 'json' };
import '@picocss/pico/css/pico.min.css';
import MileageModal from "../Components/MileageModal";
import VehicleRegistrationModal from "../Components/VehicleRegistrationModal";
import { SwaAuth } from "../services/swaAuth.js";
import { VehiclesApi } from "../../services/vehicles.js";

export default class App {
    constructor() {
        this.entryModal = new MileageModal();
        this.vehicleRegistrationModal = new VehicleRegistrationModal();

        // Set up callback for mileage submission
        this.entryModal.onMileageSubmitted = this.handleMileageSubmitted;

        // Set up callback for vehicle registration
        this.vehicleRegistrationModal.onVehicleRegistered = this.handleVehicleRegistered;

        this.el = el('',
            el('main',
                this.contentContainer = el('.container',
                    el('p', 'Please sign in with your Microsoft 365 account to submit mileage claims.')
                )
            ),
            this.entryModal,
            this.vehicleRegistrationModal
        );

        this.showModalButton = el('button', {
            type: 'button',
            disabled: true
        }, 'Add Mileage Entry')
    }

    onmount = async () => {
        this.displayAppVersion();
        this.setupEventListeners();

        const principal = await SwaAuth.me();
        if (!principal) { SwaAuth.login(); return; }        // <-- auto redirect
        await this.afterLogin(principal);
    };

    displayAppVersion = () => {
        document.getElementById('ver').textContent = `v${pkg.version}`;
    }

    setupEventListeners = () => {
        this.showModalButton.addEventListener('click', this.openModal);
    }

    afterLogin = async (principal) => {
        this.userInfo = { name: SwaAuth.getName(principal), email: SwaAuth.getEmail(principal) };
        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(el('p', `Welcome, ${this.userInfo.name}! Checking your vehicle registration...`));

        try {
            const result = await VehiclesApi.get();
            const { hasVehicle, vehicle } = result;

            console.log(result);
            console.log(typeof result)

            if (hasVehicle === true) {
                this.showMainApp(this.userInfo, vehicle);
            } else {
                this.showVehicleRegistrationRequired(this.userInfo);
            }
        } catch (err) {
            // If you want to treat 401 specially, inspect the message or add a tiny helper in http()
            console.error('getUserVehicle failed:', err);
            this.showVehicleRegistrationRequired(this.userInfo);
        }
    };

    showMainApp = (userInfo, vehicle) => {
        this.showModalButton.disabled = false;
        this.contentContainer.innerHTML = '';

        this.contentContainer.appendChild(
            el('div',
                el('p', `Welcome, ${userInfo.name}!`),
                el('p', `Vehicle: ${vehicle.registration} - ${vehicle.make} ${vehicle.model}`)
            )
        );
        this.contentContainer.appendChild(this.showModalButton);

        // Add vehicle change button
        const changeVehicleButton = el('button', {
            type: 'button',
            style: 'margin-left: 1rem; background-color: var(--secondary);'
        }, 'Change Vehicle');

        changeVehicleButton.addEventListener('click', () => {
            this.vehicleRegistrationModal.open();
        });

        this.contentContainer.appendChild(changeVehicleButton);
    }

    showVehicleRegistrationRequired = (userInfo) => {
        this.showModalButton.disabled = true;
        this.contentContainer.innerHTML = '';

        this.contentContainer.appendChild(
            el('div',
                el('p', `Welcome, ${userInfo.name}!`),
                el('p', 'You need to register your vehicle details before you can submit mileage claims.'),
                el('button', {
                    type: 'button'
                }, 'Register Vehicle')
            )
        );

        // Set up register button click
        const registerButton = this.contentContainer.querySelector('button');
        registerButton.addEventListener('click', () => {
            this.vehicleRegistrationModal.open();
        });
    }

    handleVehicleRegistered = (vehicleData) => this.showMainApp(this.userInfo, vehicleData);

    handleMileageSubmitted = (event) => {
        const { success, message, error } = event.detail;

        if (success) {
            // Show success message
            const successMsg = el('div', {
                style: 'color: var(--ins-color); padding: 1rem; margin: 1rem 0; border-left: 4px solid var(--ins-color);'
            }, message);

            this.contentContainer.insertBefore(successMsg, this.showModalButton);

            // Remove success message after 5 seconds
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 5000);
        } else if (error) {
            console.error('Mileage submission failed:', error);
        }
    }

    openModal = () => {
        this.entryModal.open();
    }

    onunmount = () => {
        this.showModalButton.removeEventListener('click', this.openModal);
    }
}