import { el } from 'redom';

export default class MileageDraftCard {
    constructor() {
        this.el = el('.draft-card',
            this.header = el('.draft-card__header',
                this.title = el('strong'),
                this.dateEl = el('span.draft-card__date')
            ),
            this.meta = el('.draft-card__meta',
                this.routeLine = el('div.draft-card__route'),
                this.distanceEl = el('div.draft-card__distance')
            ),
            this.actions = el('.draft-card__actions',
                this.editBtn = el('button.secondary', 'Edit'),
                // keep room for future actions (submit/delete)
            )
        );
    }

    update(entry) {
        const {
            id,
            date,
            startLabel,
            endLabel,
            startPostcode,
            endPostcode,
            distance
        } = entry;

        // Header
        this.title.textContent = `${startLabel || startPostcode} → ${endLabel || endPostcode}`;
        this.dateEl.textContent = date || '';

        // Meta
        this.routeLine.textContent =
            `${startPostcode} → ${endPostcode}`;
        this.distanceEl.textContent =
            (distance != null ? `${distance} miles` : 'Distance not set');

        // Actions
        this.editBtn.onclick = () => {
            this.el.dispatchEvent(new CustomEvent('edit-draft', {
                bubbles: true,
                detail: entry
            }));
        };
    }
}
