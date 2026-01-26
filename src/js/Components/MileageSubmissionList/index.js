import { list, el } from "redom";
import MileageSubmissionGroup from "../MileageSubmissionGroup";

export default class MileageSubmissionList {
    constructor() {
        this.groupList = list(".submission-list__items", MileageSubmissionGroup);
        this.emptyState = el(".draft-list__empty", "No submitted mileage yet.");

        this.el = el(".draft-list", // reuse your existing spacing styles
            this.groupList,
            this.emptyState
        );
    }

    update(groups) {
        const items = groups || [];
        this.groupList.update(items);
        this.emptyState.classList.toggle("hidden", items.length > 0);
    }
}
