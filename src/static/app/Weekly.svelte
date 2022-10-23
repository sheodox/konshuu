<style>
	section {
		overflow: auto;
	}
</style>

<section class="f-column">
	<div class="f-row justify-content-between align-items-center">
		{#if showing === 'progress'}
			<h2>Progress</h2>
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
