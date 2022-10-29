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
	import { lastAnytimeView } from './stores/anytime';
	import Link from './Link.svelte';
	import { hasExpiredCountdown } from './stores/anytime';
	import type { LastAnytimeView } from './stores/anytime';

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
			href: '/anytime' + restoreAnytimeRoute($lastAnytimeView),
			icon: 'bell',
			iconTitle: 'A countdown has expired',
			showIcon: $hasExpiredCountdown,
		},
	];

	function restoreAnytimeRoute(val: LastAnytimeView) {
		if (!val) {
			return '';
		}
		if ('tag' in val) {
			return `/tag/${val.tag}`;
		}
		if ('anytime' in val) {
			return `/${val.anytime}`;
		}
	}
</script>
