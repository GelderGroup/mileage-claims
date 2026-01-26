import { el } from 'redom';
import { getLocationParts } from '../../../../utils/Formatting/formatPostcode';
import { MapPin, TrashIcon } from '../../../../utils/icons';

function formatFullLocation(parts) {
    if (parts.name && parts.postcode) return `${parts.name} (${parts.postcode})`;
    return parts.name || parts.postcode || '';
}

export default class MileageDraftCard {
    constructor() {
        this.el = el('article.draft-card', {
            role: 'button',
            tabindex: 0,
            title: 'Edit draft'
        },
            el('header.draft-header',
                this.dateEl = el('span.draft-date'),
                this.milesEl = el('span.draft-miles')
            ),
            el('.draft-route',
                el('span.map-pin-start', MapPin()),
                this.startEl = el('span.draft-route-start'),
                el('span.map-pin-end', MapPin()),
                this.endEl = el('span.draft-route-end'),
            ),
            el('footer.draft-actions',
                this.deleteAction = el('a.action.secondary', { title: 'Delete' }, TrashIcon())
            )
        );
    }

    onmount() {
        this.el.addEventListener('click', this.handleCardClick);
        this.el.addEventListener('keydown', this.handleCardKeydown);
        this.deleteAction.addEventListener('click', this.handleDelete);
    }

    onunmount() {
        this.el.removeEventListener('click', this.handleCardClick);
        this.el.removeEventListener('keydown', this.handleCardKeydown);
        this.deleteAction.removeEventListener('click', this.handleDelete);
    }

    handleCardClick = (e) => {
        // ignore clicks originating from the delete control (or anything inside footer if you prefer)
        if (e.target?.closest?.('.draft-actions')) return;
        this.fireEdit();
    };

    handleCardKeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.fireEdit();
        }
    };

    fireEdit = () => {
        if (!this.entry) return;
        this.el.dispatchEvent(new CustomEvent('edit-draft', { bubbles: true, detail: this.entry }));
    };

    handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation(); // <- critical so card click doesn’t also edit
        if (!this.entry) return;
        this.el.dispatchEvent(new CustomEvent('delete-draft', { bubbles: true, detail: this.entry }));
    };

    update(entry) {
        this.entry = entry;

        const {
            date,
            startLabel,
            endLabel,
            startPostcode,
            endPostcode,
            distance,
            overrideEnabled
        } = entry;

        const effectiveMiles = distance != null ? Number(distance) : null;

        let milesText = 'Miles not set';
        if (effectiveMiles != null && effectiveMiles > 0) {
            milesText = Number.isInteger(effectiveMiles)
                ? `${effectiveMiles} miles`
                : `${effectiveMiles.toFixed(1)} miles`;
        }

        const start = getLocationParts(startLabel, startPostcode);
        const end = getLocationParts(endLabel, endPostcode);
        const mileageDate = new Date(date);

        this.dateEl.textContent = mileageDate.toLocaleDateString();
        this.milesEl.textContent = overrideEnabled ? `${milesText} (override)` : milesText;
        this.milesEl.title = overrideEnabled ? 'Mileage has been overridden' : '';

        this.startEl.textContent = formatFullLocation(start);
        this.endEl.textContent = formatFullLocation(end);
    }
}
