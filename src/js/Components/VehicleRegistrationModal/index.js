import { el } from 'redom';

export default class VehicleRegistrationModal {
    constructor() {
        this.onVehicleRegistered = null; // Callback for when vehicle is registered

        this.modal = el('dialog', {
            style: 'max-width: 500px; padding: 2rem;'
        },
            el('article',
                el('header',
                    el('h2', 'Vehicle Registration Required'),
                    el('p', 'Please register your vehicle details to continue.')
                ),
                this.form = el('form',
                    el('label', 'Vehicle Registration Number:',
                        this.regInput = el('input', {
                            type: 'text',
                            placeholder: 'e.g., AB12 XYZ',
                            required: true,
                            style: 'text-transform: uppercase;'
                        })
                    ),
                    el('label', 'Make:',
                        this.makeInput = el('input', {
                            type: 'text',
                            placeholder: 'e.g., Ford',
                            required: true
                        })
                    ),
                    el('label', 'Model:',
                        this.modelInput = el('input', {
                            type: 'text',
                            placeholder: 'e.g., Focus',
                            required: true
                        })
                    ),
                    el('div', { style: 'display: flex; gap: 1rem; margin-top: 1rem;' },
                        this.submitButton = el('button', {
                            type: 'submit'
                        }, 'Register Vehicle'),
                        this.lookupButton = el('button', {
                            type: 'button',
                            style: 'background-color: var(--secondary);'
                        }, 'Lookup Details')
                    )
                ),
                this.messageDiv = el('div', {
                    style: 'margin-top: 1rem; padding: 1rem; border-radius: var(--border-radius); display: none;'
                })
            )
        );

        this.el = this.modal;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auto-uppercase registration input
        this.regInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        // Form submission
        this.form.addEventListener('submit', this.handleSubmit);

        // Lookup button (for future government API integration)
        this.lookupButton.addEventListener('click', this.handleLookup);

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
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

            // Get current user info
            const userInfo = await import('../services/authService.js').then(module =>
                module.AuthService.getUserInfo()
            );

            if (!userInfo) {
                throw new Error('User not authenticated');
            }

            // Save vehicle to database
            const response = await fetch('/api/saveUserVehicle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userInfo.email,
                    registration: registration,
                    make: make,
                    model: model
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Vehicle registered successfully!', 'success');

                // Call callback after short delay
                setTimeout(() => {
                    if (this.onVehicleRegistered) {
                        this.onVehicleRegistered({
                            registration,
                            make,
                            model
                        });
                    }
                    this.close();
                }, 1500);
            } else {
                throw new Error(result.error || 'Failed to register vehicle');
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
        this.modal.showModal();
        this.regInput.focus();
    }

    close() {
        this.modal.close();
        this.form.reset();
        this.messageDiv.style.display = 'none';
    }
}