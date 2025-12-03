import { el } from 'redom';

const UNPARISHED_RE = /,\s*unparished area/gi;

function cleanLabel(label) {
    if (!label) return "";
    return label.replace(UNPARISHED_RE, "").trim();
}

function formatLocation(label, postcode) {
    const name = cleanLabel(label);
    if (!name && postcode) return postcode;
    if (!postcode) return name;

    // If label ALREADY contains the postcode, do not append it
    const normalized = name.toUpperCase();
    const normalizedPC = postcode.toUpperCase();

    if (normalized.includes(normalizedPC)) {
        return name;             // e.g. "Scampton (LN1 2DS)"
    }

    return `${name} (${postcode})`;
}

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

        const fromText = formatLocation(startLabel, startPostcode);
        const toText = formatLocation(endLabel, endPostcode);

        // Uniform main line
        this.title.textContent = `${fromText} → ${toText}`;

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

        this.editBtn.onclick = () => {
            this.el.dispatchEvent(new CustomEvent('edit-draft', {
                bubbles: true,
                detail: entry
            }));
        };
    }
}
