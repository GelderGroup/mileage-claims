import { el } from 'redom';
import { getLocationParts } from '../../../../utils/Formatting/formatPostcode';
import { FilePenLineIcon, TrashIcon } from '../../../../utils/icons';

function formatFullLocation(parts) {
    if (parts.name && parts.postcode) return `${parts.name} (${parts.postcode})`;
    return parts.name || parts.postcode || '';
}

export default class MileageDraftCard {
    constructor() {
        this.el = el('.draft-row',
            this.main = el('.draft-main',
                this.header = el('.draft-header',
                    this.dateEl = el('span.draft-date'),
                    this.milesEl = el('span.draft-miles')
                ),
                this.route = el('.draft-route',
                    el('span', 'Start: ', this.startEl = el('span.draft-route-start')),
                    el('span.draft-route-arrow', '→'),
                    el('span', 'End: ', this.endEl = el('span.draft-route-end'))
                ),
                this.actions = el('.draft-actions',
                    this.editAction = el('a.action', { title: 'Edit' },
                        FilePenLineIcon()
                    ),
                    this.deleteAction = el('a.action.danger', { title: 'Delete' },
                        TrashIcon()
                    )
                )
            )
        );
    }

    onmount() {
        this.editAction.addEventListener('click', this.handleEdit);
        this.deleteAction.addEventListener('click', this.handleDelete);
    }

    onunmount() {
        this.editAction.removeEventListener('click', this.handleEdit);
        this.deleteAction.removeEventListener('click', this.handleDelete);
    }

    handleEdit = (e) => {
        e.preventDefault();
        if (!this.entry) return;
        this.el.dispatchEvent(new CustomEvent('edit-draft', { bubbles: true, detail: this.entry }));
    };

    handleDelete = (e) => {
        e.preventDefault();
        if (!this.entry) return;
        this.el.dispatchEvent(new CustomEvent('delete-draft', { bubbles: true, detail: this.entry }));
    };

    update(entry) {
        this.entry = entry;

        const { date, startLabel, endLabel, startPostcode, endPostcode, distance } = entry;

        const start = getLocationParts(startLabel, startPostcode);
        const end = getLocationParts(endLabel, endPostcode);

        this.dateEl.textContent = date || '';
        this.milesEl.textContent = distance != null ? `${distance} miles` : 'Miles not set';

        this.startEl.textContent = `${formatFullLocation(start)}`;
        this.endEl.textContent = `${formatFullLocation(end)}`;
    }
}
