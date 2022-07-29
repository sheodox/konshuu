<style>
	section {
		align-content: start;
		display: flex;
		flex-direction: row;
	}
	:global(.anytime-item) {
		width: 20rem;
		max-width: 100%;
		border-radius: 3px;
		height: 30rem;
		background-color: var(--sx-gray-600);
		padding: var(--sx-spacing-2);
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
	<button on:click={() => toggleMode('filters')} aria-pressed={mode === 'filters'}>
		<Icon icon="filter" />
		<span
			>Filter
			{#if $filterTags.length}
				({$filterTags.length})
			{/if}
		</span>
	</button>
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
<section class="f-wrap gap-3 p-3 f-1 justify-content-center">
	{#if mode === 'tags'}
		{#each $anytimes as anytime (anytime.id)}
			<TagAssignment data={anytime} />
		{/each}
	{:else}
		{#each $anytimes as anytime (anytime.id + anytime.notes)}
			{#if isFiltered(anytime, $filterTags)}
				<AnytimeItem data={anytime} />
			{/if}
		{/each}
	{/if}
</section>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { anytimes, anytimesInitialized, filterTags } from '../stores/anytime';
	import NewAnytime from './NewAnytime.svelte';
	import AnytimeItem from './AnytimeItem.svelte';
	import ManageTags from './ManageTags.svelte';
	import TagAssignment from './TagAssignment.svelte';
	import FilterTags from './FilterTags.svelte';
	import type { Anytime } from '../../../shared/types/anytime';

	type Mode = 'new' | 'tags' | 'filters' | '';
	let mode: Mode = !$anytimes.length ? 'new' : '';
	$: showIntro = !$anytimes.length && $anytimesInitialized;

	function toggleMode(newMode: Mode) {
		if (mode === newMode) {
			mode = '';
		} else {
			mode = newMode;
		}
	}
	function isFiltered(anytime: Anytime, filters: string[]) {
		if (!filters.length) {
			return true;
		}
		return filters.every((tagId) => anytime.tags.some((assignment) => assignment.anytimeTagId === tagId));
	}
</script>
