import { el, svg } from 'redom';
import { VehiclesApi } from '../../../services/vehicles.js';
import VehicleLookup from '../VehicleLookup/index.js';
import { VehicleLookupApi } from '../../../services/vehicleLookup.js';

const CarIcon = () => svg('svg.lucide.lucide-car-icon.lucide-car', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    svg('path', { d: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2' }),
    svg('circle', { cx: 7, cy: 17, r: 2 }),
    svg('path', { d: 'M9 17h6' }),
    svg('circle', { cx: 17, cy: 17, r: 2 })
);
export default class VehicleRegistrationModal {
    constructor() {
        this.onVehicleRegistered = null; // Callback for when vehicle is registered

        this.el = el('dialog',
            el('article',
                el('header',
                    el('h3', { style: 'display:flex;align-items:center;gap:.5rem;margin:0' },
                        CarIcon(), 'Register vehicle'
                    ),
                    el('p', { style: 'margin:.25rem 0 0;color:var(--pico-muted-color)' },
                        'Enter your registration to continue.'
                    )
                ),
                this.form = el('form',
                    el('label', { for: 'vrm', style: 'display:block;margin:.75rem 0 .25rem;color:var(--pico-muted-color);font-size:.9rem' },
                        'Vehicle lookup'
                    ),
                    el('', { role: 'group' },
                        this.vrm = el('input#vrm', {
                            name: 'registrationNumber',
                            placeholder: 'AB12CDE',
                            required: true,
                            style: 'text-transform:uppercase;letter-spacing:.5px'
                        }),
                        el('button', { type: 'button', class: 'secondary', onclick: () => this.testLookup?.() }, 'Search')
                    ),
                    this.submitButton = el('button', { type: 'submit', disabled: true }, 'Register vehicle')
                ),
                this.messageDiv = el('div', { style: 'margin-top:.75rem;display:none' })
            )
        );

        this.setupEventListeners();
    }

    setupEventListeners() {
        // // Auto-uppercase registration input
        // this.regInput.addEventListener('input', (e) => {
        //     e.target.value = e.target.value.toUpperCase();
        // });

        // // Form submission
        // this.form.addEventListener('submit', this.handleSubmit);

        // // Lookup button (for future government API integration)
        // this.lookupButton.addEventListener('click', this.handleLookup);

        // // Close modal when clicking outside
        // this.el.addEventListener('click', (e) => {
        //     if (e.target === this.el) {
        //         this.close();
        //     }
        // });
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const registration = this.regInput.value.trim();
        const make = this.makeInput.value.trim();
        const model = this.modelInput.value.trim();

        if (!registration || !make || !model) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }

        try {
            this.submitButton.disabled = true;
            this.submitButton.textContent = 'Registering...';

            try {
                await VehiclesApi.upsert({ registration, make, model });

                this.showMessage('Vehicle registered successfully!', 'success');

                setTimeout(() => {
                    this.onVehicleRegistered?.({ registration, make, model });
                    this.close();
                }, 1500);
            } catch (err) {
                this.showMessage(err.message || 'Failed to register vehicle', 'error');
            }

        } catch (error) {
            console.error('Vehicle registration failed:', error);
            this.showMessage(`Registration failed: ${error.message}`, 'error');
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Register Vehicle';
        }
    }

    handleLookup = async () => {
        const registration = this.regInput.value.trim();

        if (!registration) {
            this.showMessage('Please enter a registration number first.', 'error');
            return;
        }

        this.lookupButton.disabled = true;
        this.lookupButton.textContent = 'Looking up...';

        try {
            // TODO: Implement government vehicle API lookup
            this.showMessage('Vehicle lookup feature coming soon!', 'info');
        } catch (error) {
            this.showMessage('Lookup failed. Please enter details manually.', 'error');
        } finally {
            this.lookupButton.disabled = false;
            this.lookupButton.textContent = 'Lookup Details';
        }
    }

    showMessage(message, type = 'info') {
        this.messageDiv.textContent = message;
        this.messageDiv.style.display = 'block';

        // Set background color based on type
        switch (type) {
            case 'success':
                this.messageDiv.style.backgroundColor = 'var(--ins-color)';
                this.messageDiv.style.color = 'white';
                break;
            case 'error':
                this.messageDiv.style.backgroundColor = 'var(--del-color)';
                this.messageDiv.style.color = 'white';
                break;
            default:
                this.messageDiv.style.backgroundColor = 'var(--card-background-color)';
                this.messageDiv.style.color = 'var(--color)';
        }
    }

    open() {
        this.el.showModal();
        this.regInput.focus();
    }

    close() {
        this.el.close();
        this.form.reset();
        this.messageDiv.style.display = 'none';
    }
}