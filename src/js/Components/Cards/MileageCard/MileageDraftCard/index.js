import { el } from 'redom';
import './index.css';

const UNPARISHED_RE = /,\s*unparished area/gi;

function cleanLabel(label) {
    if (!label) return "";
    return label.replace(UNPARISHED_RE, "").trim();
}

function formatLocation(label, postcode) {
    const name = cleanLabel(label);
    if (!name && postcode) return postcode;
    if (!postcode) return name;
    const normalized = name.toUpperCase();
    const normalizedPC = postcode.toUpperCase();
    if (normalized.includes(normalizedPC)) {
        return name;
    }
    return `${name} (${postcode})`;
}

export default class MileageDraftCard {
    constructor() {
        // Main structure
        this.el = el('.draft-row',
            this.main = el('.draft-main',
                el('div.location-row',
                    el('span.location-label', 'From:'),
                    this.fromEl = el('span.location-from')
                ),
                el('div.location-row',
                    el('span.location-label', 'To:'),
                    this.toEl = el('span.location-to')
                ),
                this.subLine = el('small')
            ),
            this.meta = el('.draft-meta',
                this.dateEl = el('small.draft-date'),
                this.distanceEl = el('small.draft-distance'),
                this.actions = el('div.draft-actions',
                    this.editLink = el('button.draft-action-link', { type: 'button', 'aria-label': 'Edit draft' }, 'Edit'),
                    this.deleteLink = el('button.draft-action-link', { type: 'button', 'aria-label': 'Delete draft' }, 'Delete')
                )
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

        this.fromEl.textContent = formatLocation(startLabel, startPostcode);
        this.toEl.textContent = formatLocation(endLabel, endPostcode);

        // Optional secondary line – always just postcodes if present
        if (startPostcode || endPostcode) {
            this.subLine.textContent = `${startPostcode || ''} → ${endPostcode || ''}`.trim();
            this.subLine.hidden = false;
        } else {
            this.subLine.hidden = true;
        }

        this.dateEl.textContent = date || '';
        this.distanceEl.textContent =
            distance != null ? `${distance} miles` : 'Distance not set';

        this.editLink.onclick = () => {
            this.el.dispatchEvent(new CustomEvent('edit-draft', {
                bubbles: true,
                detail: entry
            }));
        };
        this.deleteLink.onclick = () => {
            this.el.dispatchEvent(new CustomEvent('delete-draft', {
                bubbles: true,
                detail: entry
            }));
        };
    }
}
