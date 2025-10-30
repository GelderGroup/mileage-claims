<script>
    import MileageEntryCard from './MileageEntryCard.svelte';

    let { lines, onEdit, onRemove } = $props();
</script>

{#if lines.length === 0}
    <div class="empty-state">
        <p>No mileage entries yet. Click "Add Entry" to get started.</p>
    </div>
{:else}
    <div class="entries-list">
        {#each lines as line (line.id)}
            <MileageEntryCard {line} {onEdit} {onRemove} />
        {/each}
    </div>
{/if}

<style>
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--pico-muted-color);
    }

    .entries-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>
