<script>
    import LineRow from '$lib/LineRow.svelte';

    let lines = $state([createEmptyLine()]);

    function addLine() {
        lines.push(createEmptyLine());
    }

    function createEmptyLine() {
        return {
            id: crypto.randomUUID(),
            date: '',
            from: '',
            to: '',
            miles: null,
            override: false,
            overrideMiles: null
        };
    }

    function removeLine(id) {
        lines = lines.filter((l) => l.id !== id);
    }

    let totalMiles = $derived(
        lines.reduce((total, line) => {
            const miles = line.override
                ? parseFloat(line.overrideMiles ?? '0') || 0
                : parseFloat(line.miles ?? '0') || 0;
            return total + miles;
        }, 0)
    );
</script>

<h1>New Mileage Claim</h1>

<div class="claim-container">
    {#each lines as line, i (line.id)}
        <LineRow bind:line={lines[i]} onremove={() => removeLine(line.id)} />
    {/each}

    <div class="actions">
        <button onclick={addLine}>Add line</button>
        <p><strong>Total:</strong> {totalMiles} miles</p>
    </div>
</div>

<style>
    .claim-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.5rem;
        border-top: 1px solid var(--pico-muted-border-color);
    }
</style>
