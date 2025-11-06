// VehicleLookupInput.js
import { el } from "redom";

export default class VehicleLookupInput {
    constructor(api) {
        this.api = api;
        this.el = el('div',
            el('label', { for: 'reg', style: 'display:block;margin:.5rem 0 .25rem;color:var(--pico-muted-color);font-size:.9rem' }, 'Vehicle lookup'),
            el('div', { role: 'group' },
                this.input = el('input#reg', { placeholder: 'AB12CDE', required: true, style: 'text-transform:uppercase;letter-spacing:.5px' }),
                this.btn = el('button', { type: 'button' }, 'Search')
            )
        );
    }

    onmount = () => {
        this.btn.addEventListener('click', this.lookup);
        this.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.lookup(); } });
        // enforce uppercase value
        this.input.addEventListener('input', () => {
            const p = this.input.selectionStart; this.input.value = this.input.value.toUpperCase(); this.input.setSelectionRange(p, p);
        });
    };

    lookup = async () => {
        const reg = this.input.value.trim();
        if (!reg) return;
        this.btn.disabled = true;
        try {
            const v = await this.api.byReg(reg);
            this.el.dispatchEvent(new CustomEvent('vehicle:found', { bubbles: true, detail: v }));
        } catch (err) {
            this.el.dispatchEvent(new CustomEvent('vehicle:error', { bubbles: true, detail: err }));
            alert('Lookup failed. Check the registration and try again.');
        } finally {
            this.btn.disabled = false;
        }
    };
}
