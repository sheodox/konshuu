<style lang="scss">
	aside {
		background-color: var(--sx-gray-600);
		border-radius: 0 5px 5px 0;
		border: 1px solid var(--sx-gray-400);
		border-left-color: var(--sx-gray-600);
		box-shadow: var(--sx-shadow-1);
		width: 20rem;
		max-width: 95%;
		height: calc(100vh - 120px);
		overflow-y: auto;
		position: relative;

		&.closed {
			pointer-events: none;
			display: none;
		}

		:global(.show-all-anytimes) {
			background-color: var(--sx-gray-transparent);
		}
	}
	@media (max-width: 600px) {
		aside {
			border: 1px solid var(--sx-gray-400);
			margin: 0 auto;
			border-radius: 5px;
			height: auto;
			width: 100%;
		}
	}
</style>

<aside
	class="p-2"
	class:closed={!$sidebarOpen}
	style="margin-{$isBelowMobileBreakpoint ? 'top' : 'left'}: -{20 - 20 * $sidebarOpen}rem; opacity: {$sidebarOpen};"
>
	<div class="f-row justify-content-between align-items-baseline mb-2">
		<h2>Tags</h2>
		<button on:click={showAdd}><Icon icon="plus" />New Tag</button>
	</div>
	<div class="f-column gap-2">
		{#if $activeRouteParams.tagId}
			<div class="tag mb-2 text-align-center">
				<Link
					href="/anytime"
					classes="show-all-anytimes {anytimeTagLinkClasses} justify-content-center"
					on:followed={() => ($lastAnytimeView = null)}
				>
					<span>
						<Icon icon="arrow-left" /> Show All Anytimes
					</span>
				</Link>
			</div>
		{/if}
		{#each $tagsSorted as tag}
			<SidebarTag {tag} />
		{:else}
			<p>You don't have any tags!</p>
		{/each}
	</div>
</aside>

<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { Icon } from 'sheodox-ui';
	import { tagsSorted, showAnytimeSidebar, anytimeOps, lastAnytimeView } from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import { isBelowMobileBreakpoint } from '../stores/app';
	import Link from '../Link.svelte';
	import SidebarTag from './SidebarTag.svelte';

	const anytimeTagLinkClasses = 'sx-font-size-4 f-1 py-2 f-row align-items-center';

	async function showAdd() {
		anytimeOps.tag.new();
	}

	const sidebarOpen = tweened(undefined, {
		duration: 100,
		easing: cubicInOut,
		interpolate(a: number, b: number) {
			return (t: number) => {
				return a > b ? 1 - t : t;
			};
		},
	});

	$: $sidebarOpen = $showAnytimeSidebar ? 1 : 0;
</script>
