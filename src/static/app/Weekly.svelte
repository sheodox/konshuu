<style>
	section {
		width: 30rem;
		min-width: 30rem;
		overflow: auto;
	}
	@media (max-width: 600px) {
		section {
			scroll-snap-align: start;
			flex-basis: 100%;
			/* 100% width minus the horizontal padding */
			max-width: calc(100vw - 0.4rem);
			min-width: 100%;
		}
	}
</style>

<section class="f-column">
	<div class="f-row justify-content-between align-items-center">
		{#if showing === 'progress'}
			<h2>Weeklies</h2>
			<button on:click={() => (showing = 'edit')}>Edit</button>
		{:else}
			<h2>Edit Weeklies</h2>
			<button on:click={() => (showing = 'progress')} class="primary">Back</button>
		{/if}
	</div>
	{#if showing === 'progress'}
		<WeekliesProgress on:openNew={() => (showing = 'edit')} />
	{:else}
		<WeekliesEdit />
	{/if}
</section>

<script lang="ts">
	import WeekliesProgress from './WeekliesProgress.svelte';
	import WeekliesEdit from './WeekliesEdit.svelte';

	let showing: 'progress' | 'edit' = 'progress';
</script>
