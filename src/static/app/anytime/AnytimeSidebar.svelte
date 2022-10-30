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
	.tag {
		width: 100%;
		display: flex;
		border-radius: 3px;
		border: 2px solid transparent;

		&.viewing-this-tag {
			color: white;
			background: var(--sx-gray-400);
		}
		&:hover {
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
			<div class="tag px-1" class:viewing-this-tag={$activeRouteParams.tagId === tag.id}>
				<Link
					href="/anytime/tag/{tag.id}"
					classes="{anytimeTagLinkClasses} justify-content-between"
					on:followed={() => ($lastAnytimeView = { tag: tag.id })}
				>
					<span>{tag.name}</span>
					<span class="sx-badge-gray my-0 sx-font-size-2" title="Anytimes with this tag"
						>{countTagUsage(tag.id, $anytimes)}</span
					>
				</Link>
				<MenuButton>
					<span slot="trigger">
						<span class="sr-only">Menu</span>
						<Icon icon="chevron-down" variant="icon-only" />
					</span>
					<ul slot="menu">
						<button on:click={() => renameTag(tag)}>Rename</button>
						<button on:click={() => deleteTag(tag)}>Delete</button>
					</ul>
				</MenuButton>
			</div>
		{:else}
			<p>You don't have any tags!</p>
		{/each}
	</div>
</aside>

<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { Icon, MenuButton, showConfirmModal, showPromptModal } from 'sheodox-ui';
	import { anytimes, tagsSorted, showAnytimeSidebar, anytimeOps, lastAnytimeView } from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import { isBelowMobileBreakpoint } from '../stores/app';
	import Link from '../Link.svelte';
	import page from 'page';
	import type { Anytime, AnytimeTag } from '../../../shared/types/anytime';

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

	async function renameTag(tag: AnytimeTag) {
		const newTagName = (await showPromptModal({ title: 'Edit Tag', label: 'New tag name', default: tag.name }))?.trim();
		if (newTagName) {
			anytimeOps.tag.edit(tag.id, newTagName);
		}
	}

	async function deleteTag(tag: AnytimeTag) {
		const confirmed = await showConfirmModal({
			title: 'Delete Tag',
			message: `Are you sure you want to delete "${tag.name}"?`,
		});
		if (confirmed) {
			anytimeOps.tag.delete(tag.id);
			if (tag.id === $activeRouteParams.tagId) {
				page('/anytime');
				$lastAnytimeView = null;
			}
		}
	}

	function countTagUsage(tagId: string, anytimes: Anytime[]) {
		return anytimes.reduce((total, anytime) => {
			return total + (anytime.tags.some((t) => t.anytimeTagId === tagId) ? 1 : 0);
		}, 0);
	}
</script>
