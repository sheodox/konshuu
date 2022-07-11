<style>
</style>

{#each routes as route}
	<li>
		<Link href={route.href} classes={$activeRoute === route.id ? 'active' : ''}>{route.name}</Link>
	</li>
{/each}

<script lang="ts">
	import { activeRoute } from './stores/routing';
	import Link from './Link.svelte';

	const routes = [
		{
			name: 'Week',
			id: 'app',
			href: '/',
		},
		{
			name: 'Anytime',
			id: 'anytime',
			href: '/anytime',
		},
	];
</script>
