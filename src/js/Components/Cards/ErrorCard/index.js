import { el } from "redom";

export default class ErrorCard {
    constructor(message = "Something went wrong.", onRetry) {
        const msg = el("p.alert", { role: "alert" }, message);
        this.retryBtn = onRetry ? el("button", { type: "button" }, "Retry") : null;
        this.el = el("article.contrast", msg, this.retryBtn && el("footer", this.retryBtn));
        this.onRetry = onRetry;
    }
    onmount = () => { if (this.retryBtn) this.retryBtn.addEventListener("click", this.onRetry); };
    onunmount = () => { if (this.retryBtn) this.retryBtn.removeEventListener("click", this.onRetry); };
}
