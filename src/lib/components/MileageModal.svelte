<script>
    import PostcodeInput from './PostcodeInput.svelte';
    import CalculateButton from './CalculateButton.svelte';

    let {
        isOpen = $bindable(),
        line = $bindable(),
        onSave,
        onCancel,
        title = 'Add Mileage Entry'
    } = $props();

    let dialog;

    // Watch for isOpen changes to control the modal
    $effect(() => {
        if (!dialog) return;

        if (isOpen && !dialog.open) {
            // Need to open the modal
            openModal();
        } else if (!isOpen && dialog.open) {
            // Need to close the modal (but only if it's actually open)
            closeModal();
        }
    });

    // Listen for dialog close events (ESC key, etc.)
    $effect(() => {
        if (!dialog) return;

        function handleDialogClose() {
            // Dialog was closed by ESC key or other means
            // Clean up Pico CSS classes immediately
            document.documentElement.classList.remove(
                'modal-is-open',
                'modal-is-opening',
                'modal-is-closing'
            );

            // Sync our state with the dialog state
            if (isOpen) {
                onCancel?.();
                // Set isOpen to false without triggering closeModal again
                isOpen = false;
            }
        }

        dialog.addEventListener('close', handleDialogClose);

        return () => {
            dialog.removeEventListener('close', handleDialogClose);
        };
    });

    function openModal() {
        document.documentElement.classList.add('modal-is-open', 'modal-is-opening');
        dialog.showModal();

        // Remove opening animation class after animation completes
        setTimeout(() => {
            document.documentElement.classList.remove('modal-is-opening');
        }, 200);
    }

    function closeModal() {
        document.documentElement.classList.add('modal-is-closing');

        setTimeout(() => {
            dialog.close();
            document.documentElement.classList.remove('modal-is-open', 'modal-is-closing');
        }, 200);
    }

    function handleSave() {
        onSave?.(line);
        isOpen = false;
    }

    function handleCancel() {
        onCancel?.();
        isOpen = false;
    }

    function handleBackdropClick(event) {
        // Close modal if clicking the backdrop (dialog element itself)
        if (event.target === dialog) {
            // Handle backdrop click similar to ESC key
            document.documentElement.classList.remove(
                'modal-is-open',
                'modal-is-opening',
                'modal-is-closing'
            );
            dialog.close();
            onCancel?.();
            isOpen = false;
        }
    }

    async function calc() {
        console.log('Would call mileage API', { from: line.from, to: line.to });
        line.miles = Math.floor(Math.random() * 50) + 1;
    }

    function useLoc(target) {
        if (!('geolocation' in navigator)) return alert('No geolocation');
        navigator.geolocation.getCurrentPosition((coords) => {
            console.log('Would reverse-geocode', coords);
            target === 'from' ? (line.from = 'YO1 7EP') : (line.to = 'YO1 9ZZ');
        });
    }
</script>

<dialog bind:this={dialog} onclick={handleBackdropClick}>
    <article>
        <header>
            <button aria-label="Close" rel="prev" onclick={handleCancel}></button>
            <p><strong>{title}</strong></p>
        </header>

        <div class="modal-content">
            <label>
                Date
                <input type="date" bind:value={line.date} />
            </label>

            <label>
                Start Location
                <PostcodeInput
                    placeholder="Start postcode"
                    bind:value={line.from}
                    onUseLocation={() => useLoc('from')}
                />
            </label>

            <label>
                End Location
                <PostcodeInput
                    placeholder="End postcode"
                    bind:value={line.to}
                    onUseLocation={() => useLoc('to')}
                />
            </label>

            <div class="calculate-section">
                <label>
                    Miles
                    <div role="group">
                        <input
                            type="number"
                            bind:value={line.miles}
                            placeholder="Miles"
                            readonly={!line.override}
                        />
                        <CalculateButton onCalculate={calc} />
                    </div>
                </label>

                <label>
                    <input type="checkbox" bind:checked={line.override} />
                    Override calculated miles
                </label>

                {#if line.override}
                    <label>
                        Override Miles
                        <input
                            type="number"
                            bind:value={line.overrideMiles}
                            placeholder="Enter miles manually"
                        />
                    </label>
                {/if}
            </div>
        </div>

        <footer>
            <button class="secondary" onclick={handleCancel}> Cancel </button>
            <button onclick={handleSave}> Save Entry </button>
        </footer>
    </article>
</dialog>

<style>
    .modal-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin: 1rem 0;
    }

    .calculate-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background-color: var(--pico-card-sectioning-background-color);
        border-radius: var(--pico-border-radius);
    }
</style>
