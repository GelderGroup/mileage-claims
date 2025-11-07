import { el } from "redom";
import './index.css';


export default class VehicleLookupSummary {
    constructor() {
        this.el = el('.mt-1',
            el('article',
                el('header',
                    this.vehicleTitle = el('strong'),
                    this.vehicleSubtitle = el('p')
                ),
                el('.grid',
                    this.motChip = el(''),
                    this.taxChip = el('')
                ),
                el('.grid',
                    this.engineChip = el(''),
                    this.co2Chip = el('')
                )
            )
        );
    }

    update = vehicle => {
        this.vehicleTitle.textContent = `${vehicle.registrationNumber} • ${vehicle.make}`;
        this.vehicleSubtitle.textContent = `${vehicle.colour} • ${vehicle.yearOfManufacture}`;
        this.motChip.textContent = `MOT: ${vehicle.motStatus}`, vehicle.motStatus === 'Valid';
        this.taxChip.textContent = `Tax: ${vehicle.taxStatus}`, vehicle.taxStatus === 'Taxed';
        this.engineChip.textContent = `Engine: ${vehicle.engineCapacity} cc`;
        this.co2Chip.textContent = `CO₂: ${vehicle.co2Emissions} g/km`;
    }
}