import { el } from "redom";
import { MapPin } from "../../utils/icons";
import { getLocationParts } from "../../utils/Formatting/formatPostcode";


function formatFullLocation(parts) {
    if (parts.name && parts.postcode) return `${parts.name} (${parts.postcode})`;
    return parts.name || parts.postcode || '';
}

export default class MileageSubmissionCard {
    constructor() {
        this.el = el("article.draft-card", // reuse your styling
            el("header.draft-header",
                this.dateEl = el("span.draft-date"),
                this.milesEl = el("span.draft-miles")
            ),
            el(".draft-route",
                el("span.map-pin-start", MapPin()),
                this.startEl = el("span.draft-route-start"),
                el("span.map-pin-end", MapPin()),
                this.endEl = el("span.draft-route-end"),
            )
            // no footer/actions
        );
    }

    update(entry) {
        const { date, startLabel, endLabel, startPostcode, endPostcode, distance, overrideEnabled } = entry;

        const effectiveMiles = distance != null ? Number(distance) : null;
        let milesText = "Miles not set";
        if (effectiveMiles != null && effectiveMiles > 0) {
            milesText = Number.isInteger(effectiveMiles)
                ? `${effectiveMiles} miles`
                : `${effectiveMiles.toFixed(1)} miles`;
        }

        const start = getLocationParts(startLabel, startPostcode);
        const end = getLocationParts(endLabel, endPostcode);

        this.dateEl.textContent = new Date(date).toLocaleDateString();
        this.milesEl.textContent = overrideEnabled ? `${milesText} (override)` : milesText;

        this.startEl.textContent = formatFullLocation(start);
        this.endEl.textContent = formatFullLocation(end);
    }
}
