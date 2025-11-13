import { el } from "../../ui/dom.js";
export default class LoadingCard {
    constructor(msg = "Checking your vehicle registration…") {
        this.el = el("article.contrast", { "aria-busy": "true" }, el("p", msg));
    }
}
