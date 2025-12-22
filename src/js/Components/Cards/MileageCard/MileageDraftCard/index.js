import { el } from 'redom';
import { getLocationParts } from '../../../../utils/Formatting/formatPostcode';

function formatFullLocation(parts) {
    if (parts.name && parts.postcode) {
        return `${parts.name} (${parts.postcode})`;
    }
    return parts.name || parts.postcode || '';
}

export default class MileageDraftCard {
    constructor() {
        this.el = el('.draft-row',
            this.main = el('.draft-main',
                // Collapsed summary
                this.summaryEl = el('.draft-summary',
                    this.summaryHeader = el('.draft-summary-header',
                        this.dateEl = el('span.draft-summary-date'),
                        this.milesEl = el('span.draft-summary-miles')
                    ),
                    this.summaryRoute = el('.draft-summary-route'),
                    this.toggleLink = el('a.secondary.draft-toggle', { href: '#' }, 'Details…')
                ),
                // Expanded content
                this.extraEl = el('.draft-extra',
                    this.startRow = el('.draft-extra-row',
                        el('strong', 'Start:'),
                        this.startFullEl = el('span')
                    ),
                    this.endRow = el('.draft-extra-row',
                        el('strong', 'End:'),
                        this.endFullEl = el('span')
                    ),
                    this.actionsEl = el('.draft-extra-actions',
                        this.editAction = el('a', { href: '#' }, 'Edit'),
                        this.deleteAction = el('a', { href: '#' }, 'Delete')
                    )
                )
            )
        );
    }

    // RE:DOM hook: attach listeners
    onmount() {
        this.toggleLink.addEventListener('click', this.handleToggle);
        this.editAction.addEventListener('click', this.handleEdit);
        this.deleteAction.addEventListener('click', this.handleDelete);
    }

    // RE:DOM hook: detach listeners
    onunmount() {
        this.toggleLink.removeEventListener('click', this.handleToggle);
        this.editAction.removeEventListener('click', this.handleEdit);
        this.deleteAction.removeEventListener('click', this.handleDelete);
    }

    handleToggle = (e) => {
        e.preventDefault();

        const isOpen = this.el.classList.contains('draft-row--open');

        // Close any other open rows in the same list
        const container = this.el.parentElement; // .draft-list__items
        if (container) {
            container.querySelectorAll('.draft-row--open').forEach(row => {
                if (row !== this.el) {
                    row.classList.remove('draft-row--open');
                    const link = row.querySelector('.draft-toggle');
                    if (link) link.textContent = 'Details…';
                }
            });
        }

        if (isOpen) {
            this.el.classList.remove('draft-row--open');
            this.toggleLink.textContent = 'Details…';
        } else {
            this.el.classList.add('draft-row--open');
            this.toggleLink.textContent = 'Hide details';
        }
    };

    handleEdit = (e) => {
        e.preventDefault();
        if (!this.entry) return;

        this.el.dispatchEvent(new CustomEvent('edit-draft', {
            bubbles: true,
            detail: this.entry
        }));
    };

    handleDelete = (e) => {
        e.preventDefault();
        if (!this.entry) return;

        this.el.dispatchEvent(new CustomEvent('delete-draft', {
            bubbles: true,
            detail: this.entry
        }));
    };

    update(entry) {
        this.entry = entry; // keep for handlers
        this.el.classList.remove('draft-row--open');
        this.toggleLink.textContent = 'Details…';

        const {
            date,
            startLabel,
            endLabel,
            startPostcode,
            endPostcode,
            distance
        } = entry;

        const start = getLocationParts(startLabel, startPostcode);
        const end = getLocationParts(endLabel, endPostcode);

        // Collapsed summary
        this.dateEl.textContent = date || '';
        this.milesEl.textContent =
            distance != null ? `${distance} miles` : 'Miles not set';

        const startSummary = start.postcode || start.name || '';
        const endSummary = end.postcode || end.name || '';
        this.summaryRoute.textContent = `${startSummary} \u2192 ${endSummary}`;

        // Expanded details
        this.startFullEl.textContent = formatFullLocation(start);
        this.endFullEl.textContent = formatFullLocation(end);
    }
}
