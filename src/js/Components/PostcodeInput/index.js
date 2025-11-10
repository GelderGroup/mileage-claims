import { el, svg } from 'redom';
import './index.css';
export class PostcodeInput {
    constructor(props = {}) {
        const {
            id,             // optional explicit id
            name,           // optional name (for event IDs etc.)
            placeholder = '',
            value = ''
        } = props;

        // generate a unique, predictable base id if none supplied
        const baseId = id || `postcode-${++uniqueIdCounter}`;
        this.name = name || baseId;

        this.el = el('', {}, [
            el('div', { role: 'group' }, [
                this.input = el('input', {
                    id: `${baseId}-input`,
                    type: 'text',
                    placeholder,
                    value,
                    'aria-describedby': `${baseId}-help`
                }),
                this.button = el('button', {
                    class: 'secondary',
                    title: 'Use current location',
                    'aria-label': 'Use current location'
                }, [
                    svg('svg.lucide.lucide-locate-fixed', {
                        width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none',
                        stroke: 'currentColor', 'stroke-width': 2,
                        'stroke-linecap': 'round', 'stroke-linejoin': 'round'
                    }, [
                        svg('line', { x1: 2, x2: 5, y1: 12, y2: 12 }),
                        svg('line', { x1: 19, x2: 22, y1: 12, y2: 12 }),
                        svg('line', { x1: 12, x2: 12, y1: 2, y2: 5 }),
                        svg('line', { x1: 12, x2: 12, y1: 19, y2: 22 }),
                        svg('circle', { cx: 12, cy: 12, r: 7 }),
                        svg('circle', { cx: 12, cy: 12, r: 3 })
                    ])
                ])
            ]),
            el('small', { id: `${baseId}-help` },
                'Enter a postcode or tap the target button to use your current location.'
            )
        ]);
    }

    onmount = () => {
        this.button.addEventListener('click', this.handleUseLocation);
    }

    onunmount = () => {
        this.button.removeEventListener('click', this.handleUseLocation);
    }

    get value() {
        return this.input.value;
    }

    set value(val) {
        this.input.value = val || '';
    }

    // Event dispatch proxy methods
    addEventListener(type, listener, options) {
        this.el.addEventListener(type, listener, options);
    }

    removeEventListener(type, listener, options) {
        this.el.removeEventListener(type, listener, options);
    }

    dispatchEvent(event) {
        return this.el.dispatchEvent(event);
    }

    handleUseLocation = () => {
        this.dispatchEvent(new CustomEvent('uselocation', {
            bubbles: true,
            detail: {
                component: this,
                name: this.name
            }
        }));
    }

    focus() {
        this.input.focus();
    }

    clear() {
        this.value = '';
    }
}