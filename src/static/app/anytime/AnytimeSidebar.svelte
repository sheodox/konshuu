<style lang="scss">
	div :global(.tag) {
		width: 100%;
		display: flex;
		border-radius: 3px;
		border: 2px solid transparent;
		padding-left: var(--sx-spacing-1);
		padding-right: var(--sx-spacing-1);

		&:hover {
			background-color: var(--sx-gray-transparent);
		}
	}
	div :global(.viewing-this-tag) {
		color: white;
		background: var(--sx-gray-600);
	}
</style>

<div class="f-row justify-content-between align-items-baseline p-2">
	<h2>Tags</h2>
	<button on:click={showAdd}><Icon icon="plus" />New Tag</button>
</div>
<div class="f-column gap-2 p-2">
	<div class="tag" class:viewing-this-tag={!$activeRouteParams.tagId}>
		<Link
			href="/anytime"
			classes="show-all-anytimes {anytimeTagLinkClasses}"
			on:followed={() => ($lastAnytimeView = null)}
		>
			<span>
				<Icon icon="th" /> All Anytimes
			</span>
		</Link>
	</div>
	{#each $tagsSorted as tag}
		<SidebarTag {tag} />
	{:else}
		<p>You don't have any tags!</p>
	{/each}
</div>

<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { Icon } from 'sheodox-ui';
	import { tagsSorted, showAnytimeSidebar, anytimeOps, lastAnytimeView } from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
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
