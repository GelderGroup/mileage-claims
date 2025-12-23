const getInputEl = (comp) =>
    comp?.input ?? comp?.inputEl ?? comp?.el?.querySelector?.('input') ?? comp?.el ?? comp;

// sync value into input without fighting the user
export const syncInput = (comp, next, { allowWhileFocused = false } = {}) => {
    const el = getInputEl(comp);
    if (!el) return;
    const v = next ?? '';
    const isComposing = el.isComposing || el.composing; // some browsers set this
    const focused = document.activeElement === el;

    if (!allowWhileFocused && (focused || isComposing)) return;
    if (el.value !== v) el.value = v;
};
