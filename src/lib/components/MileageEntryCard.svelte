<script>
    let { line, onEdit, onRemove } = $props();

    function formatMiles(line) {
        if (line.override) {
            return `${line.overrideMiles || 0} miles (manual)`;
        }
        return `${line.miles || 0} miles`;
    }
</script>

<div class="entry-card">
    <div class="entry-details">
        <div class="entry-date">{line.date}</div>
        <div class="entry-route">
            <strong>{line.from || 'Start'}</strong> →
            <strong>{line.to || 'End'}</strong>
        </div>
        <div class="entry-miles">
            {formatMiles(line)}
        </div>
    </div>
    <div class="entry-actions">
        <button class="secondary" onclick={() => onEdit(line)}>Edit</button>
        <button class="contrast outline" onclick={() => onRemove(line.id)}>Remove</button>
    </div>
</div>

<style>
    .entry-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid var(--pico-muted-border-color);
        border-radius: var(--pico-border-radius);
        background-color: var(--pico-card-background-color);
    }

    .entry-details {
        flex: 1;
    }

    .entry-date {
        font-size: 0.875rem;
        color: var(--pico-muted-color);
        margin-bottom: 0.25rem;
    }

    .entry-route {
        margin-bottom: 0.25rem;
    }

    .entry-miles {
        font-size: 0.875rem;
        color: var(--pico-muted-color);
    }

    .entry-actions {
        display: flex;
        gap: 0.5rem;
    }

    .entry-actions button {
        margin: 0;
        padding: 0.5rem 1rem;
    }
</style>
