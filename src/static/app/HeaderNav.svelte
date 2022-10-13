<style>
</style>

{#each routes as route}
	<li>
		<Link href={route.href} classes={$activeRoute === route.id ? 'active' : ''}>
			{#if route.showIcon}
				<span title={route.iconTitle}>
					<Icon icon={route.icon} />
				</span>
			{/if}
			{route.name}</Link
		>
	</li>
{/each}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { activeRoute } from './stores/routing';
	import Link from './Link.svelte';
	import { hasExpiredCountdown } from './stores/anytime';

	$: routes = [
		{
			name: 'Week',
			id: 'app',
			href: '/',
			icon: '',
			iconTitle: '',
			showIcon: false,
		},
		{
			name: 'Anytime',
			id: 'anytime',
			href: '/anytime',
			icon: 'bell',
			iconTitle: 'A countdown has expired',
			showIcon: $hasExpiredCountdown,
		},
	];
</script>
