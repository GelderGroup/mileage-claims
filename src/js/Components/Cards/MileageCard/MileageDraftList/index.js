import { list, el } from 'redom';
import MileageDraftCard from '../MileageDraftCard';

export class MileageDraftList {
    constructor() {
        this.cardList = list('.draft-list__items', MileageDraftCard);
        this.emptyState = el('.draft-list__empty', 'No draft mileage entries.')

        this.el = el('.draft-list',
            this.cardList,
            this.emptyState
        );
    }

    update(drafts) {
        const items = drafts || [];
        this.cardList.update(items);

        const hasItems = items.length > 0;
        this.emptyState.classList.toggle('hidden', hasItems);
    }
}
