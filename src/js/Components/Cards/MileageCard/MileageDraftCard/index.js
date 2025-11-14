// MileageDraftCard
import { el } from 'redom';

export default class MileageDraftCard {
    constructor() {
        this.el = el('.draft-row',
            this.main = el('.draft-main',
                this.title = el('strong'),
                this.subLine = el('small')
            ),
            this.meta = el('.draft-meta',
                this.dateEl = el('small.draft-date'),
                this.distanceEl = el('small.draft-distance'),
                this.editBtn = el('button.secondary', 'Edit')
            )
        );
    }

    update(entry) {
        const {
            date,
            startLabel,
            endLabel,
            startPostcode,
            endPostcode,
            distance
        } = entry;

        this.title.textContent =
            `${startLabel || startPostcode} → ${endLabel || endPostcode}`;

        this.subLine.textContent =
            `${startPostcode} → ${endPostcode}`;

        this.dateEl.textContent = date || '';

        this.distanceEl.textContent =
            distance != null ? `${distance} miles` : 'Distance not set';

        this.editBtn.onclick = () => {
            this.el.dispatchEvent(new CustomEvent('edit-draft', {
                bubbles: true,
                detail: entry
            }));
        };
    }
}
