import { el } from "redom";

export default class VehicleLookupInput {
    constructor(vehicleLookupApi) {
        this.vehicleLookupApi = vehicleLookupApi;
        this.el = el('.vehicle-lookup',
            el('h2', 'Vehicle Lookup'),
            this.form = el('form',
                el('label', { for: 'reg-input' }, 'Enter Vehicle Registration Number:'),
                el('', { role: 'group' },
                    this.regInput = el('input', { type: 'text' }),
                    this.lookupBtn = el('button', { type: 'button' }, 'Search')
                )
            ),
            this.resultContainer = el('.lookup-result')
        );
    }

    onmount = () => {
        this.lookupBtn.addEventListener('click', this.handleLookup);
    }

    onmount = () => {
        this.lookupBtn.addEventListener('click', this.handleLookup);
    }

    handleLookup = async () => {
        const regNum = this.regInput.value.trim();
        if (!regNum) { return; }
        try {
            const result = await this.vehicleLookupApi.byReg(regNum);
            console.log('Lookup result:', result);
        } catch (err) {
            console.error('Vehicle lookup failed:', err);
            alert(`Vehicle lookup failed: ${err.message}`);
        }
    }
}