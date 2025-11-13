import { el } from "../../../ui/dom.js";

export default class WelcomeCard {
    constructor(onRegister) {
        this.title = el("h4", "");
        this.sub = el("p", "Before submitting mileage claims, please register your vehicle.");
        this.btn = el("button", { type: "button" }, "Register Vehicle");
        this.el = el("section.welcome", el("article.contrast", this.title, this.sub, el("footer", this.btn)));
        this.onRegister = onRegister;
    }
    update(name) { this.title.textContent = `Welcome, ${name}!`; }
    onmount = () => this.btn.addEventListener("click", this.onRegister);
    onunmount = () => this.btn.removeEventListener("click", this.onRegister);
}
