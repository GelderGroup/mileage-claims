import { el } from 'redom';
import { PostcodeInput } from '../PostcodeInput';
import { DateInput } from '../DateInput';
import { CalculateButton } from '../CalculateButton';
import { MileageService } from '../../services/mileageService.js';
import './index.css';

export default class MileageModal {
    constructor() {
        this.onSave = null;
        this.onCancel = null;

        this.createElement();
    }

    createElement = () => {
        this.dateInput = new DateInput({
            name: 'date'
        });

        this.startPostcodeInput = new PostcodeInput({
            placeholder: 'Start postcode',
            name: 'start'
        });

        this.endPostcodeInput = new PostcodeInput({
            placeholder: 'End postcode',
            name: 'end'
        });

        this.milesInput = el('input', { type: 'number', placeholder: '0', step: '1', min: '0' });

        this.calculateBtn = new CalculateButton({
            name: 'calculate'
        });

        this.cancelBtn = el('button.secondary', { type: 'button' }, 'Cancel');
        this.saveBtn = el('button', { type: 'button' }, 'Save Entry');
        this.closeBtn = el('button', { 'aria-label': 'Close', rel: 'prev' });

        // Create modal structure
        this.el = el('dialog',
            el('article',
                el('header',
                    this.closeBtn,
                    this.titleElement = el('p', el('strong', 'Add Mileage Entry'))
                ),
                el('.modal-content',
                    el('label', 'Date', this.dateInput),
                    el('label', 'Start Location',
                        this.startPostcodeInput
                    ),
                    el('label', 'End Location',
                        this.endPostcodeInput
                    ),
                    el('label', 'Miles',
                        el('', { role: 'group' },
                            this.milesInput,
                            this.calculateBtn
                        )
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
        this.setupEventListeners();
    }

    setupEventListeners = () => {
        // Direct event handling - simple and clear
        this.el.addEventListener('uselocation', this.handleLocation);
        this.el.addEventListener('calculate', this.handleCalculate);
        this.closeBtn.addEventListener('click', this.handleClose);
        this.cancelBtn.addEventListener('click', this.handleCancel);
        this.saveBtn.addEventListener('click', this.handleSave);
    }

    onunmount = () => {
        this.teardownEventListeners();
    }

    teardownEventListeners = () => {
        // Clean up all events
        this.el.removeEventListener('uselocation', this.handleLocation);
        this.el.removeEventListener('calculate', this.handleCalculate);
        this.closeBtn.removeEventListener('click', this.handleClose);
        this.cancelBtn.removeEventListener('click', this.handleCancel);
        this.saveBtn.removeEventListener('click', this.handleSave);
    }

    // Public API: Open the modal
    open = () => {
        // Simple modal opening - mount and show
        document.body.appendChild(this.el);
        this.el.showModal();
        this.dateInput.focus();
    }

    // Public API: Close the modal
    close = () => {
        // Simple modal closing - close and unmount
        this.el.close();
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }

    handleClose = () => {
        this.close();
    }

    handleCancel = () => {
        // Trigger cancel callback if set
        if (this.onCancel) {
            this.onCancel();
        }
        this.close();
    }

    // Business logic handlers - clean and direct
    handleLocation = async (e) => {
        const inputName = e.detail.name;

        try {
            const postcode = await MileageService.getCurrentLocationPostcode();

            // Update the appropriate input based on the event
            if (inputName === 'start') {
                this.startPostcodeInput.value = postcode;
            } else if (inputName === 'end') {
                this.endPostcodeInput.value = postcode;
            }
        } catch (error) {
            alert(error.message);
        }
    }

    handleCalculate = async () => {
        const startPostcode = this.startPostcodeInput.value.trim();
        const endPostcode = this.endPostcodeInput.value.trim();

        try {
            // Disable calculate button during calculation
            this.calculateBtn.disabled = true;

            const miles = await MileageService.calculateDistance(startPostcode, endPostcode);
            this.milesInput.value = miles;
        } catch (error) {
            alert(error.message);
        } finally {
            // Re-enable calculate button
            this.calculateBtn.disabled = false;
        }
    }

    handleSave = () => {
        const data = {
            date: this.dateInput.value,
            startPostcode: this.startPostcodeInput.value,
            endPostcode: this.endPostcodeInput.value,
            miles: this.milesInput.value
        };

        // Validate the data using the service
        const validation = MileageService.validateMileageEntry(data);

        if (!validation.isValid) {
            alert('Please fix the following errors:\n' + validation.errors.join('\n'));
            return;
        }

        // Format postcodes for consistency
        data.startPostcode = MileageService.formatPostcode(data.startPostcode);
        data.endPostcode = MileageService.formatPostcode(data.endPostcode);

        if (this.onSave) {
            this.onSave(data);
        }

        this.close();
    }
}