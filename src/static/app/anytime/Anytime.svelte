<style>
	section {
		align-content: start;
		display: flex;
		flex-direction: row;
	}
	.no-anytimes {
		width: 20rem;
		max-width: 90%;
	}
	:global(.anytime-item) {
		width: 20rem;
		max-width: 100%;
		height: 30rem;
		border-radius: 3px;
		background-color: var(--sx-gray-600);
		padding: var(--sx-spacing-2);
	}
	.is-viewing-single-anytime :global(.anytime-item) {
		width: 40rem;
		max-width: 100%;
		min-height: 60rem;
		height: auto;
	}

	.intro {
		max-width: 100%;
		width: 30rem;
		text-align: center;
	}

	.anytime-container {
		display: flex;
	}

	@media (max-width: 600px) {
		section {
			flex-direction: column;
			justify-content: start;
		}
		:global(.anytime-item) {
			width: 100%;
			height: auto;
			min-height: auto !important;
		}
		.toolbar-button-text {
			/* sr-only styles */
			position: absolute;
			left: -10000px;
			top: auto;
			width: 1px;
			height: 1px;
			overflow: hidden;
		}
		.anytime-container {
			flex-direction: column;
		}
	}
</style>

<div class="anytime-container">
	<Sidebar bind:menuOpen={$isSidebarOpen} docked>
		<div slot="header" class="f-row align-items-center">
			<Logo />
			<h1 class="ml-2">Konshuu</h1>
		</div>
		<AnytimeSidebar />
	</Sidebar>
	<div class="f-column f-1">
		<div class="f-row justify-content-between pb-2">
			<div />
			<div>
				{#if $activeRouteParams.anytimeId || $activeRouteParams.tagId}
					<Link href="/anytime" classes="button" on:followed={() => ($lastAnytimeView = null)}
						><Icon icon="th" />
						<span class="toolbar-button-text">All Anytimes</span></Link
					>
				{/if}
				<button on:click={() => (showNew = true)} aria-pressed={showNew}>
					<Icon icon="plus" />
					<span class="toolbar-button-text">New Anytime</span>
				</button>
				<button on:click={() => toggleMode('tags')} aria-pressed={mode === 'tags'}>
					<Icon icon="tag" />
					<span class="toolbar-button-text">Set Tags</span>
				</button>
			</div>
			<div>
				<MenuButton>
					<span slot="trigger">
						<Icon icon="sort" />
						<span class="toolbar-button-text">Sort</span>
					</span>
					<ul slot="menu">
						{#each sortModes as s}
							<li>
								<button on:click={() => ($anytimeSort = s.dir)} aria-pressed={$anytimeSort === s.dir}>
									<span>{s.text}</span>
								</button>
							</li>
						{/each}
					</ul>
				</MenuButton>
			</div>
		</div>
		<div class={anytimeSectionClasses} class:is-viewing-single-anytime={isViewingSingleAnytime}>
			{#if showIntro}
				<section class={anytimeSectionClasses}>
					<div class="f-column justify-content-center align-items-center p-3 no-anytimes">
						<span class="sx-font-size-9">
							<Icon icon="scroll" />
						</span>
						<p class="intro">
							An <strong>Anytime</strong> is just a widget for keeping track of things in your life not tied to a date.
						</p>
						<p>
							Open the menu with the <Icon icon="bars" /><span class="sr-only">Anytime Menu</span> button in the top left
							to create tags to organize your anytimes.
						</p>
						<button on:click={() => (showNew = true)} class="primary">
							<Icon icon="plus" />
							New Anytime
						</button>
					</div>
				</section>
			{/if}

			{#if sortedAnytimes.length}
				{#if sortedPinnedAnytimes.length}
					<section class={anytimeSectionClasses}>
						{#each sortedPinnedAnytimes as anytime (anytime.id + anytime.notes)}
							{#if mode === 'tags'}
								<TagAssignment data={anytime} />
							{:else}
								<AnytimeItem data={anytime} />
							{/if}
						{/each}
					</section>
				{/if}

				{#if sortedUnPinnedAnytimes.length}
					<section class={anytimeSectionClasses}>
						{#each sortedUnPinnedAnytimes as anytime (anytime.id + anytime.notes)}
							{#if mode === 'tags'}
								<TagAssignment data={anytime} />
							{:else}
								<AnytimeItem data={anytime} />
							{/if}
						{/each}
					</section>
				{/if}
			{:else}
				<section class={anytimeSectionClasses}>
					<AnytimeEmpty on:new-tag={onNewTag} on:new-anytime={onNewAnytime} />
				</section>
			{/if}
		</div>
	</div>
</div>

{#if showNew}
	<NewAnytime bind:visible={showNew} on:close={() => (showNew = false)} />
{/if}

<script lang="ts">
	import { Icon, MenuButton, Sidebar } from 'sheodox-ui';
	import {
		anytimes,
		anytimesInitialized,
		showAnytimeSidebar,
		lastAnytimeView,
		anytimeSort,
		AnytimeSort,
		anytimeOps,
		tags,
	} from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import NewAnytime from './NewAnytime.svelte';
	import AnytimeItem from './AnytimeItem.svelte';
	import TagAssignment from './TagAssignment.svelte';
	import AnytimeSidebar from './AnytimeSidebar.svelte';
	import Link from '../Link.svelte';
	import AnytimeEmpty from './AnytimeEmpty.svelte';
	import type { Anytime, AnytimeTag } from '../../../shared/types/anytime';
	import { appTitle, isSidebarOpen } from '../stores/app';
	import Logo from '../Logo.svelte';

	const sortModes = [
		{ dir: 'desc', text: 'Newest First' },
		{ dir: 'asc', text: 'Oldest First' },
		{ dir: 'alpha-asc', text: 'Name A-Z' },
		{ dir: 'alpha-desc', text: 'Name Z-A' },
	] as const;

	const anytimeSectionClasses = 'f-wrap gap-3 p-3 f-1 justify-content-center';

	type Mode = 'tags' | 'view';
	let mode: Mode = 'view';
	let showNew = false;

	$: showIntro = !$anytimes.length && $anytimesInitialized;
	$: isViewingSingleAnytime = !!$activeRouteParams.anytimeId;
	$: viewingThisSingleAnytime = $anytimes.find((a) => a.id === $activeRouteParams.anytimeId);
	$: sortedAnytimes = sortAnytimes($anytimes, $anytimeSort, $activeRouteParams.anytimeId, $tags);
	$: $appTitle = viewingThisSingleAnytime ? viewingThisSingleAnytime.name : 'Anytime';
	$: sortedPinnedAnytimes = sortedAnytimes.filter((anytime) => anytime.pinned);
	$: sortedUnPinnedAnytimes = sortedAnytimes.filter((anytime) => !anytime.pinned);

	function onNewTag() {
		$showAnytimeSidebar = true;
		anytimeOps.tag.new();
	}

	function onNewAnytime() {
		showNew = true;
	}

	function sortAnytimes(anytimes: Anytime[], order: AnytimeSort, focusedAnytimeId: string, tags: AnytimeTag[]) {
		const sorted = anytimes.filter((anytime) => isFiltered(anytime, focusedAnytimeId, tags));
		sorted.sort((a, b) => {
			if (['asc', 'desc'].includes(order)) {
				const aTime = a.createdAt.getTime(),
					bTime = b.createdAt.getTime();

				return order === 'asc' ? aTime - bTime : bTime - aTime;
			}
			return order === 'alpha-asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
		});
		return sorted;
	}

	function toggleMode(newMode: Mode) {
		if (mode === newMode) {
			mode = 'view';
		} else {
			mode = newMode;
		}
	}
	function isFiltered(anytime: Anytime, focusedAnytimeId: string, tags: AnytimeTag[]) {
		if (focusedAnytimeId) {
			return anytime.id === focusedAnytimeId;
		}

		const hasTagHiddenFromAllAnytimes = anytime.tags.some((tag) => {
			return tags.find(({ id }) => id === tag.anytimeTagId)?.showOnAllAnytimes === false;
		});

		// show all anytimes on the main list (unless they have a tag that hides them from it)
		if (!$activeRouteParams.tagId && !hasTagHiddenFromAllAnytimes) {
			return true;
		}
		return anytime.tags.some((tag) => tag.anytimeTagId === $activeRouteParams.tagId);
	}
</script>
