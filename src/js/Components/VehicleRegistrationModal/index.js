import { el } from 'redom';
import VehicleLookupInput from '../VehicleLookupInput/index.js';
import { CarIcon } from '../../utils/icons.js';
import './index.css';
import VehicleLookupSummary from '../VehicleLookupSummary/index.js';

export default class VehicleRegistrationModal {
    constructor(api) {
        this.el = el('dialog.vehicle-registration-modal',
            el('article',
                el('header',
                    this.cancelButton = el('button', { 'aria-label': 'Close', rel: 'prev' }),
                    el('h3.heading', CarIcon(), 'Register vehicle'),
                    el('p.subheading', 'Enter your registration to continue.')
                ),
                el('form',
                    this.lookup = new VehicleLookupInput(api),
                    this.summary = new VehicleLookupSummary(),
                    el('footer',
                        this.btnRegister = el('button', { type: 'submit', disabled: true }, 'Register vehicle')
                    )
                )
            )
        );
    }

    onmount = () => {
        this.lookup.el.addEventListener('vehicle:found', this.handleVehicleFound);
        this.cancelButton.addEventListener('click', this.close);
    };

    onunmount = () => {
        this.lookup.el.removeEventListener('vehicle:found', this.handleVehicleFound);
        this.cancelButton.removeEventListener('click', this.close);
    }

    handleVehicleFound = ({ detail }) => {
        this.btnRegister.disabled = false;
        this.update(detail);
    }

    update = (vehicle) => {
        this.summary.update(vehicle);
    }

    open = () => this.el.showModal();

    close = () => this.el.close();
}