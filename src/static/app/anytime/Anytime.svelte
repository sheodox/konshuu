<style>
	section {
		align-content: start;
		display: flex;
		flex-direction: row;
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

<div class="f-row justify-content-between pb-2">
	<button on:click={() => ($showAnytimeSidebar = !$showAnytimeSidebar)} aria-pressed={$showAnytimeSidebar}>
		<Icon icon="bars" variant="icon-only" />
		<span class="sr-only">Anytime Menu</span>
	</button>

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

<div class="anytime-container">
	<AnytimeSidebar />
	<div class="f-column justify-content-center align-items-center p-3">
		{#if showIntro}
			<p class="intro">
				An <strong>Anytime</strong> is just a widget for keeping track of things in your life not tied to a date.
			</p>
		{/if}
	</div>

	<section class="f-wrap gap-3 p-3 f-1 justify-content-center" class:is-viewing-single-anytime={isViewingSingleAnytime}>
		{#if mode === 'tags'}
			{#each sortedAnytimes as anytime (anytime.id)}
				{#if isFiltered(anytime, $activeRouteParams.anytimeId)}
					<TagAssignment data={anytime} />
				{/if}
			{/each}
		{:else}
			{#each sortedAnytimes as anytime (anytime.id + anytime.notes)}
				{#if isFiltered(anytime, $activeRouteParams.anytimeId)}
					<AnytimeItem data={anytime} />
				{/if}
			{/each}
		{/if}
	</section>
</div>

{#if showNew}
	<NewAnytime bind:visible={showNew} on:close={() => (showNew = false)} />
{/if}

<script lang="ts">
	import { Icon, MenuButton } from 'sheodox-ui';
	import {
		anytimes,
		anytimesInitialized,
		showAnytimeSidebar,
		lastAnytimeView,
		anytimeSort,
		AnytimeSort,
	} from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import NewAnytime from './NewAnytime.svelte';
	import AnytimeItem from './AnytimeItem.svelte';
	import TagAssignment from './TagAssignment.svelte';
	import AnytimeSidebar from './AnytimeSidebar.svelte';
	import Link from '../Link.svelte';
	import type { Anytime } from '../../../shared/types/anytime';

	const sortModes = [
		{ dir: 'desc', text: 'Newest First' },
		{ dir: 'asc', text: 'Oldest First' },
		{ dir: 'alpha-asc', text: 'Name A-Z' },
		{ dir: 'alpha-desc', text: 'Name Z-A' },
	] as const;

	type Mode = 'tags' | 'view';
	let mode: Mode = 'view';
	let showNew = false;

	$: showIntro = !$anytimes.length && $anytimesInitialized;
	$: isViewingSingleAnytime = !!$activeRouteParams.anytimeId;
	$: sortedAnytimes = sortAnytimes($anytimes, $anytimeSort);

	function sortAnytimes(anytimes: Anytime[], order: AnytimeSort) {
		const sorted = [...anytimes];
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
	function isFiltered(anytime: Anytime, focusedAnytimeId: string) {
		if (focusedAnytimeId) {
			return anytime.id === focusedAnytimeId;
		}

		if (!$activeRouteParams.tagId) {
			return true;
		}
		return anytime.tags.some((tag) => tag.anytimeTagId === $activeRouteParams.tagId);
	}
</script>
