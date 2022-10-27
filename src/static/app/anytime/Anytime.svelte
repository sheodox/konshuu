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

	@media (max-width: 600px) {
		section {
			flex-direction: column;
		}
		:global(.anytime-item) {
			width: 100%;
			height: auto;
			min-height: auto !important;
		}
	}
</style>

<div class="f-row justify-content-center pb-2">
	<button on:click={() => toggleMode('new')} aria-pressed={mode === 'new'}>
		<Icon icon="plus" />
		<span>New Anytime</span>
	</button>
	<button on:click={() => toggleMode('tags')} aria-pressed={mode === 'tags'}>
		<Icon icon="tag" />
		<span>Manage Tags</span>
	</button>
	{#if !isViewingSingleAnytime}
		<button on:click={() => toggleMode('filters')} aria-pressed={mode === 'filters'}>
			<Icon icon="filter" />
			<span
				>Filter
				{#if $filterTags.length}
					({$filterTags.length})
				{/if}
			</span>
		</button>
	{/if}
</div>

<div class="f-column justify-content-center align-items-center">
	{#if showIntro}
		<p class="intro">
			An <strong>Anytime</strong> is just a widget for keeping track of things in your life not tied to a date.
		</p>
	{/if}

	{#if mode === 'tags'}
		<ManageTags />
	{:else if mode === 'new'}
		<NewAnytime on:close={() => (mode = '')} />
	{:else if mode === 'filters'}
		<FilterTags />
	{/if}
</div>
<section class="f-wrap gap-3 p-3 f-1 justify-content-center" class:is-viewing-single-anytime={isViewingSingleAnytime}>
	{#if mode === 'tags'}
		{#each $anytimes as anytime (anytime.id)}
			{#if isFiltered(anytime, $filterTags, $activeRouteParams.anytimeId)}
				<TagAssignment data={anytime} />
			{/if}
		{/each}
	{:else}
		{#each $anytimes as anytime (anytime.id + anytime.notes)}
			{#if isFiltered(anytime, $filterTags, $activeRouteParams.anytimeId)}
				<AnytimeItem data={anytime} />
			{/if}
		{/each}
	{/if}
</section>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { anytimes, anytimesInitialized, filterTags } from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import NewAnytime from './NewAnytime.svelte';
	import AnytimeItem from './AnytimeItem.svelte';
	import ManageTags from './ManageTags.svelte';
	import TagAssignment from './TagAssignment.svelte';
	import FilterTags from './FilterTags.svelte';
	import type { Anytime } from '../../../shared/types/anytime';

	type Mode = 'new' | 'tags' | 'filters' | '';
	let mode: Mode = !$anytimes.length ? 'new' : '';
	$: showIntro = !$anytimes.length && $anytimesInitialized;
	$: isViewingSingleAnytime = !!$activeRouteParams.anytimeId;

	function toggleMode(newMode: Mode) {
		if (mode === newMode) {
			mode = '';
		} else {
			mode = newMode;
		}
	}
	function isFiltered(anytime: Anytime, filters: string[], focusedAnytimeId: string) {
		if (focusedAnytimeId) {
			return anytime.id === focusedAnytimeId;
		}

		if (!filters.length) {
			return true;
		}
		return filters.every((tagId) => anytime.tags.some((assignment) => assignment.anytimeTagId === tagId));
	}
</script>
