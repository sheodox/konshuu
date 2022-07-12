<style>
	.tag-cloud {
		max-width: 100%;
		width: 60rem;
	}
	.no-tags {
		width: 20rem;
		max-width: 100%;
		text-align: center;
	}
</style>

<div class="tag-cloud f-row f-wrap justify-content-center">
	{#each $tagsSorted as tag (tag.id)}
		<button
			on:click={() => toggleFilter(tag)}
			class:primary={isFilteringBy(tag, $filterTags)}
			aria-pressed={isFilteringBy(tag, $filterTags)}
		>
			<span>{tag.name}</span>
		</button>
	{:else}
		<p class="no-tags">You have no tags assigned to anything.</p>
	{/each}
</div>

<script lang="ts">
	import { tags, filterTags, tagsSorted } from '../stores/anytime';
	import type { AnytimeTag } from '../../../shared/types/anytime';

	function isFilteringBy(tag: AnytimeTag, filters: string[]) {
		return filters.includes(tag.id);
	}

	function toggleFilter(tag: AnytimeTag) {
		if (isFilteringBy(tag, $filterTags)) {
			$filterTags = $filterTags.filter((id) => id !== tag.id);
		} else {
			$filterTags = [...$filterTags, tag.id];
		}
	}
</script>
