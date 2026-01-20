import { list, el } from 'redom';
import MileageDraftCard from '../MileageDraftCard';

export class MileageDraftList {
    constructor() {
        this.cardList = list('.draft-list__items', MileageDraftCard);
        this.emptyState = el('.draft-list__empty', 'No draft mileage entries.');

        this.totalEl = el('.draft-list__total.hidden'); // new

        this.el = el('.draft-list',
            this.cardList,
            this.emptyState,
            this.totalEl
        );
    }

    update(drafts) {
        const items = drafts || [];
        this.cardList.update(items);

        const hasItems = items.length > 0;
        this.emptyState.classList.toggle('hidden', hasItems);

        if (!hasItems) {
            this.totalEl.classList.add('hidden');
            this.totalEl.textContent = '';
            return;
        }

        const total = items.reduce((acc, d) => acc + (Number(d.distance) || 0), 0);
        const totalFmt = Number.isInteger(total) ? String(total) : total.toFixed(1);

        this.totalEl.textContent = `${totalFmt} miles total`;
        this.totalEl.classList.remove('hidden');
    }
}
