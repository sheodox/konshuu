<style>
	section {
		align-content: start;
		display: flex;
		flex-direction: row;
	}
	section :global(.anytime-item) {
		width: 20rem;
		max-width: 100%;
		border-radius: 3px;
		height: 30rem;
		background-color: var(--sx-gray-600);
		padding: var(--sx-spacing-2);
	}

	@media (max-width: 600px) {
		section {
			flex-direction: column;
		}
		section :global(.anytime-item) {
			width: 100%;
		}
	}
</style>

<section class="f-wrap gap-3 p-3 f-1 justify-content-center">
	{#each $anytimes as anytime (anytime.id)}
		<AnytimeItem data={anytime} />
	{/each}
	<NewAnytime />
</section>

<script lang="ts">
	import { anytimes } from '../stores/anytime';
	import NewAnytime from './NewAnytime.svelte';
	import AnytimeItem from './AnytimeItem.svelte';
</script>
