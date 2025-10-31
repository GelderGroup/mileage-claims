import { el } from "redom";
import pkg from '../../../package.json' assert { type: 'json' };
import '@picocss/pico/css/pico.min.css';
import MileageModal from "../Components/MileageModal";

export default class App {
    constructor() {
        this.el = el('',
            this.showModalButton = el('button', { type: 'button' }, 'Add Mileage Entry'),
            this.entryModal = new MileageModal()
        );
    }

    onmount = () => {
        this.displayAppVersion();
        this.showModalButton.addEventListener('click', this.openModal);
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