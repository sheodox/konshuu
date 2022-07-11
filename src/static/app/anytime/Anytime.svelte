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
		}
	}
</style>

<div class="f-row justify-content-center pb-2">
	<button on:click={() => (showNew = !showNew)} aria-pressed={showNew}>
		<Icon icon="plus" />
		<span>New Anytime</span>
	</button>
</div>

<div class="f-column justify-content-center align-items-center">
	{#if showIntro}
		<p class="intro">
			An <strong>Anytime</strong> is just a widget for keeping track of things in your life not tied to a date.
		</p>
	{/if}

	{#if showNew}
		<NewAnytime bind:visible={showNew} />
	{/if}
</div>
<section class="f-wrap gap-3 p-3 f-1 justify-content-center">
	{#each $anytimes as anytime (anytime.id)}
		<AnytimeItem data={anytime} />
	{/each}
</section>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { anytimes, anytimesInitialized } from '../stores/anytime';
	import NewAnytime from './NewAnytime.svelte';
	import AnytimeItem from './AnytimeItem.svelte';

	let showNew = !$anytimes.length;
	$: showIntro = !$anytimes.length && $anytimesInitialized;
</script>
