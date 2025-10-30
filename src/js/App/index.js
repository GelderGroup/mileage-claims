import { el } from "redom";
import '@picocss/pico/css/pico.min.css';

export default class App {
    constructor() {
        this.el = el('div', 'Mileage Claims App');
    }
}