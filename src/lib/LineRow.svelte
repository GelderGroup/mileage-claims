<script>
    let { line = $bindable(), onremove } = $props();

    async function calc() {
        console.log('Would call mileage API', { from: line.from, to: line.to });
        line.miles = Math.floor(Math.random() * 50) + 1;
    }

    /**
     * @param {string} target
     */
    function useLoc(target) {
        if (!('geolocation' in navigator)) return alert('No geolocation');
        navigator.geolocation.getCurrentPosition((coords) => {
            console.log('Would reverse-geocode', coords);
            target === 'from' ? (line.from = 'YO1 7EP') : (line.to = 'YO1 9ZZ');
        });
    }
</script>

<div class="row">
    <label>
        <span class="lbl">Date</span>
        <input type="date" bind:value={line.date} />
    </label>

    <label>
        <span class="lbl">From</span>
        <div class="input-group">
            <input type="text" placeholder="Postcode" bind:value={line.from} />
            <button class="secondary" onclick={() => useLoc('from')} title="Use current location"
                >📍</button
            >
        </div>
    </label>

    <label>
        <span class="lbl">To</span>
        <div class="input-group">
            <input type="text" placeholder="Postcode" bind:value={line.to} />
            <button class="secondary" onclick={() => useLoc('to')} title="Use current location"
                >📍</button
            >
        </div>
    </label>

    <div class="miles">
        <button class="contrast" onclick={calc}>Calc</button>
        <span class="mile-value"
            >{line.override ? (line.overrideMiles ?? '') : (line.miles ?? '')}</span
        >
    </div>

    <label class="override">
        <input type="checkbox" bind:checked={line.override} /> Override
    </label>

    <button class="remove contrast outline" onclick={onremove}>Remove</button>
</div>

<style>
    .row {
        display: grid;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--pico-background-color);
        border: 1px solid var(--pico-muted-border-color);
        border-radius: 0.4rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .input-group {
        display: flex;
        gap: 0.25rem;
    }

    .lbl {
        font-size: 0.8rem;
        color: var(--pico-muted-color);
        display: block;
        margin-bottom: 0.2rem;
    }

    .miles {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .mile-value {
        font-weight: 600;
        min-width: 2ch;
    }

    .override {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    @media (min-width: 700px) {
        .row {
            grid-template-columns: 1fr 1.5fr 1.5fr auto auto auto;
            align-items: end;
        }
    }
</style>
