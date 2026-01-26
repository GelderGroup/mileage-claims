import { el, list } from "redom";
import MileageSubmissionCard from "../MileageSubmissionCard";

function fmtMiles(n) {
    const num = Number(n) || 0;
    return Number.isInteger(num) ? `${num} miles` : `${num.toFixed(1)} miles`;
}

export default class MileageSubmissionGroup {
    constructor() {
        this.itemsList = list(".submission-group__items", MileageSubmissionCard);

        this.el = el("details.submission-group",
            this.summaryEl = el("summary",
                this.whenEl = el("span"),
                this.metaEl = el("span")
            ),
            this.itemsList
        );
    }

    update(group) {
        // group: { submittedAt, totalMiles, items: [] }
        const when = group.submittedAt ? new Date(group.submittedAt) : null;
        const whenText = when ? when.toLocaleDateString() : "Submitted";

        const count = group.items?.length || 0;
        const total = fmtMiles(group.totalMiles);

        this.whenEl.textContent = whenText;
        this.metaEl.textContent = ` • ${total} • ${count} entr${count === 1 ? "y" : "ies"}`;

        this.itemsList.update(group.items || []);
    }
}
