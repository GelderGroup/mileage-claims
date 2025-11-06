import { el, svg } from 'redom';
import { VehiclesApi } from '../../../services/vehicles.js';
import VehicleLookupInput from '../VehicleLookupInput/index.js';
import { VehicleLookupApi } from '../../../services/vehicleLookup.js';
import { CarIcon } from '../../utils/icons.js';


export default class VehicleRegistrationModal {
    constructor(api) {
        this.selected = null;

        this.el = el('dialog',
            el('article',
                el('header',
                    el('h3', { style: 'display:flex;align-items:center;gap:.5rem;margin:0' }, CarIcon(), 'Register vehicle'),
                    el('p', { style: 'margin:.25rem 0 0;color:var(--pico-muted-color)' }, 'Enter your registration to continue.')
                ),
                el('form',
                    this.lookup = new VehicleLookupInput(api),
                    this.result = el('div', { 'aria-live': 'polite', style: 'margin-top:.75rem' }),
                    el('div', { style: 'display:flex;gap:.5rem;margin-top:.75rem' },
                        this.btnRegister = el('button', { type: 'submit', disabled: true }, 'Register vehicle'),
                        el('button', { type: 'button', class: 'secondary', onclick: () => this.el.close() }, 'Cancel')
                    )
                )
            )
        );
    }

    onmount = () => {
        this.lookup.el.addEventListener('vehicle:found', this.handleVehicleFound);

        // this.el.addEventListener('submit', (ev) => {
        //     ev.preventDefault();
        //     // if (this.onVehicleRegistered && this.selected) this.onVehicleRegistered(this.selected);
        //     // this.el.close();
        // });
    };

    onunmount = () => {
        this.lookup.el.removeEventListener('vehicle:found', this.handleVehicleFound);
    }

    handleVehicleFound = (vehicle) => {
        this.selected = vehicle;
        this.btnRegister.disabled = false;
        this.renderSummary(vehicle);
    }

    renderSummary(v) {
        console.log(v);
        console.log(typeof v);
        const chip = (label, good) =>
            el('span', { class: 'contrast', style: `padding:.15rem .45rem;border-radius:.5rem;${good ? '' : 'background:var(--pico-muted-border-color);'}` }, label);

        this.result.replaceWith(this.result = el('div', { style: 'margin-top:.75rem' },
            el('article', { style: 'margin:0' },
                el('header',
                    el('strong', `${v.registrationNumber} • ${v.make}`.trim()),
                    el('p', { style: 'margin:.25rem 0 0;color:var(--pico-muted-color)' }, `${v.colour} • ${v.yearOfManufacture}`)
                ),
                el('div', { class: 'grid', style: '--pico-grid-columns:2;gap:.5rem;margin:.5rem 0' },
                    el('div', chip(`MOT: ${v.motStatus}`, v.motStatus === 'Valid'), el('div', { style: 'font-size:.75rem;opacity:.8' }, `Exp ${v.motExpiryDate}`)),
                    el('div', chip(`Tax: ${v.taxStatus}`, v.taxStatus === 'Taxed'), el('div', { style: 'font-size:.75rem;opacity:.8' }, `Due ${v.taxDueDate}`))
                ),
                el('div', { class: 'grid', style: '--pico-grid-columns:2;gap:.5rem' },
                    this.spec('Fuel', v.fuelType), this.spec('Engine', `${v.engineCapacity} cc`),
                    this.spec('CO₂', `${v.co2Emissions} g/km`), this.spec('Euro', v.euroStatus || '—')
                )
            )
        ));
    }

    spec(label, value) { return el('div', el('small', label), el('div', { style: 'font-weight:600' }, value)); }

    open() {
        this.el.showModal();
    }

    close() {
        this.el.close();
        this.form.reset();
        this.messageDiv.style.display = 'none';
    }
}