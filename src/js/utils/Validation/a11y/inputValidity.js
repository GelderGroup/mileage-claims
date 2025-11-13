// attachValidity.js
export function attachValidity({ inputEl } = {}) {
    if (!inputEl) throw new Error('attachValidity requires { inputEl }');

    function setValidity({ invalid = false } = {}) {
        if (invalid) {
            inputEl.setAttribute('aria-invalid', 'true');
            inputEl.classList.add('is-invalid');
            inputEl.classList.remove('is-valid');
        } else {
            // neutral (do NOT mark as valid)
            inputEl.removeAttribute('aria-invalid');
            inputEl.classList.remove('is-invalid', 'is-valid');
        }
    }

    function resetValidity() {
        // neutral
        inputEl.removeAttribute('aria-invalid');
        inputEl.classList.remove('is-invalid', 'is-valid');
    }

    return { setValidity, resetValidity };
}
