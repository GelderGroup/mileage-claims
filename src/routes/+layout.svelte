<script>
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Mileage Claims</title>
</svelte:head>

<header>
	<nav class="container">
		<ul>
			<li><strong><a href="/">Mileage Claims</a></strong></li>
		</ul>
		<ul>
			<li><a href="/claims">New Claim</a></li>
		</ul>
	</nav>
</header>

<main class="container">
	{@render children?.()}
</main>

<footer class="container">
	<small>© 2025 Gelder Group</small>
</footer>

<style>
	header, footer {
		background: var(--pico-background-color);
		border-bottom: 1px solid var(--pico-muted-border-color);
		padding: 0.5rem 0;
	}
	footer {
		border-top: 1px solid var(--pico-muted-border-color);
		text-align: center;
		margin-top: 2rem;
	}
</style>
