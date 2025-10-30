import { el, mount, text, unmount } from 'redom';
import './index.css';

export default class MileageModal {
    constructor() {
        this.isOpen = false;
        this.onSave = null;
        this.onCancel = null;
        this.data = {};

        this.createElement();
    }

    createElement() {
        this.dateInput = el('input', { type: 'date' });
        this.fromInput = el('input', { type: 'text', placeholder: 'Start postcode' });
        this.toInput = el('input', { type: 'text', placeholder: 'End postcode' });
        this.milesInput = el('input', { type: 'number', placeholder: 'Miles' });
        this.overrideCheckbox = el('input', { type: 'checkbox' });
        this.overrideMilesInput = el('input', { type: 'number', placeholder: 'Enter miles manually' });

        this.fromLocationBtn = el('button.secondary',
            { type: 'button', title: 'Use current location' },
            '📍'
        );

        this.toLocationBtn = el('button.secondary',
            { type: 'button', title: 'Use current location' },
            '📍'
        );


        this.calculateBtn = el('button.contrast',
            { type: 'button', title: 'Calculate mileage' },
            '🧮'
        );

        this.cancelBtn = el('button.secondary', { type: 'button' }, 'Cancel');
        this.saveBtn = el('button', { type: 'button' }, 'Save Entry');
        this.closeBtn = el('button', { 'aria-label': 'Close', rel: 'prev' });

        // Create override section (initially hidden)
        this.overrideSection = el('label',
            'Override Miles',
            this.overrideMilesInput,
            {
                style: { display: 'none' }
            }
        );

        // Create modal structure
        this.el = el('dialog',
            el('article',
                el('header',
                    this.closeBtn,
                    this.titleElement = el('p', el('strong', 'Add Mileage Entry'))
                ),
                el('div.modal-content',
                    el('label', 'Date', this.dateInput),
                    el('label', 'Start Location',
                        el('div', { role: 'group' },
                            this.fromInput,
                            this.fromLocationBtn
                        )
                    ),
                    el('label', 'End Location',
                        el('div', { role: 'group' },
                            this.toInput,
                            this.toLocationBtn
                        )
                    ),
                    el('div.calculate-section',
                        el('label', 'Miles',
                            el('div', { role: 'group' },
                                this.milesInput,
                                this.calculateBtn
                            )
                        ),
                        el('label',
                            this.overrideCheckbox,
                            text(' Override calculated miles')
                        ),
                        this.overrideSection
                    )
                ),
                el('footer',
                    this.cancelBtn,
                    this.saveBtn
                )
            )
        );
    }

    onmount = () => {
        this.fromLocationBtn.addEventListener('click', () => this.useLocation('from'));
        this.toLocationBtn.addEventListener('click', () => this.useLocation('to'));
        this.calculateBtn.addEventListener('click', this.calculate);
        this.cancelBtn.addEventListener('click', this.close);
        this.saveBtn.addEventListener('click', this.save);
        this.closeBtn.addEventListener('click', this.close);
        this.overrideCheckbox.addEventListener('change', this.toggleOverride);

        this.el.addEventListener('click', this.handleBackdropClick);
        this.el.addEventListener('close', this.handleDialogClose);

        document.addEventListener('keydown', this.handleKeydown);
    }

    onunmount = () => {
        this.fromLocationBtn.removeEventListener('click', () => this.useLocation('from'));
        this.toLocationBtn.removeEventListener('click', () => this.useLocation('to'));
        this.calculateBtn.removeEventListener('click', this.calculate);
        this.cancelBtn.removeEventListener('click', this.close);
        this.saveBtn.removeEventListener('click', this.save);
        this.closeBtn.removeEventListener('click', this.close);
        this.overrideCheckbox.removeEventListener('change', this.toggleOverride);

        this.el.removeEventListener('click', this.handleBackdropClick);
        this.el.removeEventListener('close', this.handleDialogClose);

        document.removeEventListener('keydown', this.handleKeydown);

        this.cleanup();
    }

    handleBackdropClick = (e) => {
        if (e.target === this.el) {
            this.close();
        }
    };

    handleDialogClose = () => {
        this.cleanup();
    };

    handleKeydown = (e) => {
        if (e.key === 'Escape') {
            this.close();
        }
    };

    open(data = {}, options = {}) {
        this.data = { ...data };
        this.onSave = options.onSave;
        this.onCancel = options.onCancel;

        // Set title
        const title = this.titleElement.querySelector('strong');
        title.textContent = options.title || 'Add Mileage Entry';

        // Populate form
        this.populateForm();

        // Mount to DOM and show modal
        mount(document.body, this.el);
        this.isOpen = true;
        document.documentElement.classList.add('modal-is-open', 'modal-is-opening');
        this.el.showModal();

        // Remove opening animation
        setTimeout(() => {
            document.documentElement.classList.remove('modal-is-opening');
        }, 200);
    }

    close() {
        console.log('Closing modal');
        if (!this.isOpen) return;

        this.isOpen = false;
        document.documentElement.classList.add('modal-is-closing');

        setTimeout(() => {
            this.el.close();
            // Remove from DOM (triggers onunmount)
            if (this.el.parentNode) {
                unmount(this.el.parentNode, this.el);
            }
        }, 200);

        if (this.onCancel) {
            this.onCancel();
        }
    }

    cleanup() {
        document.documentElement.classList.remove('modal-is-open', 'modal-is-opening', 'modal-is-closing');
    }

    save() {
        const data = this.getFormData();

        if (this.onSave) {
            this.onSave(data);
        }

        this.close();
    }

    populateForm() {
        this.dateInput.value = this.data.date || new Date().toISOString().split('T')[0];
        this.fromInput.value = this.data.from || '';
        this.toInput.value = this.data.to || '';
        this.milesInput.value = this.data.miles || '';
        this.overrideCheckbox.checked = this.data.override || false;
        this.overrideMilesInput.value = this.data.overrideMiles || '';

        this.toggleOverride();
    }

    getFormData() {
        return {
            id: this.data.id || crypto.randomUUID(),
            date: this.dateInput.value,
            from: this.fromInput.value,
            to: this.toInput.value,
            miles: this.milesInput.value ? parseFloat(this.milesInput.value) : null,
            override: this.overrideCheckbox.checked,
            overrideMiles: this.overrideMilesInput.value ? parseFloat(this.overrideMilesInput.value) : null
        };
    }

    toggleOverride() {
        const isOverride = this.overrideCheckbox.checked;
        this.overrideSection.style.display = isOverride ? 'block' : 'none';
        this.milesInput.readOnly = isOverride;
    }

    useLocation(target) {
        if (!('geolocation' in navigator)) {
            alert('No geolocation');
            return;
        }

        navigator.geolocation.getCurrentPosition((coords) => {
            console.log('Would reverse-geocode', coords);
            const postcode = target === 'from' ? 'YO1 7EP' : 'YO1 9ZZ';

            if (target === 'from') {
                this.fromInput.value = postcode;
            } else {
                this.toInput.value = postcode;
            }
        });
    }

    calculate() {
        console.log('Would call mileage API', {
            from: this.fromInput.value,
            to: this.toInput.value
        });
        this.milesInput.value = Math.floor(Math.random() * 50) + 1;
    }
}