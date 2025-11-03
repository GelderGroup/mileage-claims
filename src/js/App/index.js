import { el } from "redom";
import pkg from '../../../package.json' assert { type: 'json' };
import '@picocss/pico/css/pico.min.css';
import MileageModal from "../Components/MileageModal";
import LoginComponent from "../Components/LoginComponent";
import VehicleRegistrationModal from "../Components/VehicleRegistrationModal";
import { AuthService } from "../services/authService.js";

export default class App {
    constructor() {
        this.loginComponent = new LoginComponent();
        this.entryModal = new MileageModal();
        this.vehicleRegistrationModal = new VehicleRegistrationModal();

        // Set up callback for auth state changes
        this.loginComponent.onAuthStateChange = this.handleAuthStateChange;

        // Set up callback for mileage submission
        this.entryModal.onMileageSubmitted = this.handleMileageSubmitted;

        // Set up callback for vehicle registration
        this.vehicleRegistrationModal.onVehicleRegistered = this.handleVehicleRegistered;

        this.el = el('',
            el('header',
                el('nav',
                    el('h1', 'Mileage Claims'),
                    this.loginComponent
                )
            ),
            el('main',
                this.contentContainer = el('.container',
                    el('p', 'Please sign in with your Microsoft 365 account to submit mileage claims.'),
                    this.showModalButton = el('button', {
                        type: 'button',
                        disabled: true
                    }, 'Add Mileage Entry')
                )
            ),
            this.entryModal,
            this.vehicleRegistrationModal
        );
    } onmount = () => {
        this.displayAppVersion();
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners = () => {
        this.showModalButton.addEventListener('click', this.openModal);
    }

    handleAuthStateChange = async (event) => {
        const { isAuthenticated } = event.detail;

        if (isAuthenticated) {
            const userInfo = await AuthService.getUserInfo();
            this.contentContainer.innerHTML = '';

            // Show loading message
            this.contentContainer.appendChild(
                el('p', `Welcome, ${userInfo.name}! Checking your vehicle registration...`)
            );

            try {
                // Check if user has registered a vehicle
                const response = await fetch(`/api/getUserVehicle?userId=${encodeURIComponent(userInfo.email)}`);
                const result = await response.json();

                if (response.ok && result.hasVehicle) {
                    // User has a vehicle registered - show main app
                    this.showMainApp(userInfo, result.vehicle);
                } else {
                    // User needs to register a vehicle
                    this.showVehicleRegistrationRequired(userInfo);
                }
            } catch (error) {
                console.error('Error checking vehicle registration:', error);
                // On error, assume no vehicle and show registration
                this.showVehicleRegistrationRequired(userInfo);
            }
        } else {
            this.showModalButton.disabled = true;
            this.contentContainer.innerHTML = '';
            this.contentContainer.appendChild(
                el('p', 'Please sign in with your Microsoft 365 account to submit mileage claims.')
            );
            this.contentContainer.appendChild(this.showModalButton);
        }
    }

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

    handleVehicleRegistered = async (vehicleData) => {
        // Refresh the auth state to show the main app
        const userInfo = await AuthService.getUserInfo();
        this.showMainApp(userInfo, vehicleData);
    }

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

    checkAuthState = async () => {
        const isAuthenticated = await AuthService.isAuthenticated();
        if (isAuthenticated) {
            this.handleAuthStateChange({ detail: { isAuthenticated: true } });
        }
    }

    openModal = () => {
        this.entryModal.open();
    }
    onunmount = () => {
        this.showModalButton.removeEventListener('click', this.openModal);
    }

    displayAppVersion = () => {
        const versionElement = document.getElementById('app-version');
        if (versionElement) {
            versionElement.textContent = `v${pkg.version}`;
        }
    }
}