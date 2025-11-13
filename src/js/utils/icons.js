import { svg } from "../ui/dom.js";

export const CarIcon = () => svg('svg.lucide.lucide-car-icon.lucide-car', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    svg('path', { d: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2' }),
    svg('circle', { cx: 7, cy: 17, r: 2 }),
    svg('path', { d: 'M9 17h6' }),
    svg('circle', { cx: 17, cy: 17, r: 2 })
);

export const LocateFixedIcon = () => svg('svg.lucide.lucide-locate-fixed', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    svg('line', { x1: 2, x2: 5, y1: 12, y2: 12 }),
    svg('line', { x1: 19, x2: 22, y1: 12, y2: 12 }),
    svg('line', { x1: 12, x2: 12, y1: 2, y2: 5 }),
    svg('line', { x1: 12, x2: 12, y1: 19, y2: 22 }),
    svg('circle', { cx: 12, cy: 12, r: 7 }),
    svg('circle', { cx: 12, cy: 12, r: 3 })
);

export const CalculatorIcon = () => svg('svg.lucide.lucide-calculator', { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" },
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
);