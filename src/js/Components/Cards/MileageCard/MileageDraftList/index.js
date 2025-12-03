import { list, el } from 'redom';
import MileageDraftCard from '../MileageDraftCard';
import './index.css';

export class MileageDraftList {
    constructor() {
        this.cardList = list('.draft-list__items', MileageDraftCard);
        this.emptyState = el('.draft-list__empty', 'No draft mileage entries.');

        this.el = el('.draft-list',
            el('h4', 'Drafts'),
            this.cardList,
            this.emptyState
        );
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
