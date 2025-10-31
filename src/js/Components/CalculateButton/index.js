import { el, svg } from 'redom';

export class CalculateButton {
    constructor(props = {}) {
        const { disabled = false, title = 'Calculate mileage', name } = props;

        // Store props
        this.name = name;
        this._disabled = disabled;

        this.el = el('button.contrast', {
            type: 'button',
            title: title,
            'aria-label': title,
            disabled: disabled
        }, [
            svg('svg.lucide.lucide-calculator', {
                width: "24",
                height: "24",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
            }, [
                svg('rect', { width: "16", height: "20", x: "4", y: "2", rx: "2" }),
                svg('line', { x1: "8", x2: "16", y1: "6", y2: "6" }),
                svg('line', { x1: "16", x2: "16", y1: "14", y2: "18" }),
                svg('path', { d: "M16 10h.01" }),
                svg('path', { d: "M12 10h.01" }),
                svg('path', { d: "M8 10h.01" }),
                svg('path', { d: "M12 14h.01" }),
                svg('path', { d: "M8 14h.01" }),
                svg('path', { d: "M12 18h.01" }),
                svg('path', { d: "M8 18h.01" })
            ])
        ]);
    }

    onmount = () => {
        this.el.addEventListener('click', this.handleClick);
    }

    onunmount = () => {
        this.el.removeEventListener('click', this.handleClick);
    }

    // Getter and setter for disabled state
    get disabled() {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = value;
        this.el.disabled = value;
    }

    // Event dispatch proxy methods
    addEventListener = (type, listener, options) => {
        this.el.addEventListener(type, listener, options);
    }

    removeEventListener = (type, listener, options) => {
        this.el.removeEventListener(type, listener, options);
    }

    dispatchEvent = (event) => {
        return this.el.dispatchEvent(event);
    }

    handleClick = () => {
        if (!this.disabled) {
            this.dispatchEvent(new CustomEvent('calculate', {
                bubbles: true,
                detail: {
                    component: this,
                    name: this.name
                }
            }));
        }
    }

    // Focus the button
    focus = () => {
        this.el.focus();
    }
}