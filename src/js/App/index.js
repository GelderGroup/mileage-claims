import { el } from "redom";
import pkg from '../../../package.json' assert { type: 'json' };
import '@picocss/pico/css/pico.min.css';
import MileageModal from "../Components/MileageModal";
import LoginComponent from "../Components/LoginComponent";
import { AuthService } from "../services/authService.js";

export default class App {
    constructor() {
        this.loginComponent = new LoginComponent();
        this.entryModal = new MileageModal();

        // Set up callback for auth state changes
        this.loginComponent.onAuthStateChange = this.handleAuthStateChange;

        // Set up callback for mileage submission
        this.entryModal.onMileageSubmitted = this.handleMileageSubmitted;

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
            this.entryModal
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
            this.showModalButton.disabled = false;
            const userInfo = await AuthService.getUserInfo();
            this.contentContainer.innerHTML = '';
            this.contentContainer.appendChild(
                el('p', `Welcome, ${userInfo.name}! You can now submit mileage claims.`)
            );
            this.contentContainer.appendChild(this.showModalButton);

            // Add test button for standard user attributes
            const testStdButton = el('button', {
                type: 'button',
                style: 'margin-left: 1rem; background-color: var(--secondary);'
            }, 'Show Standard User Attributes');

            testStdButton.addEventListener('click', async () => {
                try {
                    testStdButton.textContent = 'Loading...';
                    testStdButton.disabled = true;

                    const stdAttrs = await AuthService.getStandardUserAttributes();

                    const resultDiv = el('div', {
                        style: 'margin: 1rem 0; padding: 1rem; background-color: var(--card-background-color); border-radius: var(--border-radius); white-space: pre-wrap; font-family: monospace;'
                    }, stdAttrs ? JSON.stringify(stdAttrs, null, 2) : 'Not found or not accessible');

                    // Remove any existing result
                    const existingResult = this.contentContainer.querySelector('.ext-test-result');
                    if (existingResult) existingResult.remove();

                    resultDiv.className = 'ext-test-result';
                    this.contentContainer.appendChild(resultDiv);

                } catch (error) {
                    console.error('Standard attribute test failed:', error);
                    const errorDiv = el('div', {
                        style: 'margin: 1rem 0; padding: 1rem; background-color: var(--del-color); color: white; border-radius: var(--border-radius);'
                    }, `Error: ${error.message}`);

                    errorDiv.className = 'ext-test-result';
                    this.contentContainer.appendChild(errorDiv);
                } finally {
                    testStdButton.textContent = 'Show Standard User Attributes';
                    testStdButton.disabled = false;
                }
            });

            this.contentContainer.appendChild(testStdButton);
        } else {
            this.showModalButton.disabled = true;
            this.contentContainer.innerHTML = '';
            this.contentContainer.appendChild(
                el('p', 'Please sign in with your Microsoft 365 account to submit mileage claims.')
            );
            this.contentContainer.appendChild(this.showModalButton);
        }
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