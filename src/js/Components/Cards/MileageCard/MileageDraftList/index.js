import { list, el } from 'redom';
import MileageDraftCard from '../MileageDraftCard';
import './index.css';

export class MileageDraftList {
    constructor() {
        this.cardList = list('.draft-list__items', MileageDraftCard);
        this.emptyState = el('.draft-list__empty', 'No draft mileage entries.');

        // Group header and list visually
        this.header = el('div.draft-list-header',
            el('h4', 'Unsubmitted mileage entries')
        );

        this.el = el('.draft-list',
            this.header,
            this.cardList,
            this.emptyState
        );

        // Forward edit/delete events
        this.cardList.el.addEventListener('edit-draft', (e) => {
            this.el.dispatchEvent(new CustomEvent('edit-draft', { bubbles: true, detail: e.detail }));
        });
        this.cardList.el.addEventListener('delete-draft', (e) => {
            this.el.dispatchEvent(new CustomEvent('delete-draft', { bubbles: true, detail: e.detail }));
        });
    }

    update(entries) {
        const items = entries || [];
        this.cardList.update(items);
        if (!items.length) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
        }
    }
}
