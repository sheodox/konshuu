<style>
	.anytime-item {
		background-color: transparent;
		border: 1px solid var(--sx-gray-400);
		background-color: var(--sx-gray-600);
	}
	select {
		width: 100%;
	}
</style>

<div class="anytime-item p-2 f-column gap-2">
	<h2>New Anytime</h2>
	<TextInput id="new-anytime-name" bind:value={name}>Name</TextInput>
	{#if hasFilters}
		<Checkbox bind:checked={useCurrentFilters}>Assign current filtered tags</Checkbox>
	{/if}

	<div class="f-column gap-2 f-1">
		<label>
			Choose a type
			<br />
			<select bind:value={kind} class="py-2">
				{#each anytimeTypes as type}
					<option value={type.kind}>
						{type.name}
					</option>
				{/each}
			</select>
		</label>

		{#if kind === 'countdown'}
			<CountdownSettings bind:valid={typeSettingsValid} bind:data={kindSpecificData} />
		{:else if kind === 'countup'}
			<CountupSettings bind:valid={typeSettingsValid} bind:data={kindSpecificData} />
		{/if}
	</div>
	<button on:click={create} class="primary" disabled={!name || !kind || !typeSettingsValid}>Create</button>
	<button on:click={close} class="secondary">Cancel</button>
</div>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Checkbox, TextInput } from 'sheodox-ui';
	import { anytimeOps, anytimeTypes, filterTags } from '../stores/anytime';
	import CountdownSettings from './CountdownSettings.svelte';
	import CountupSettings from './CountupSettings.svelte';
	import { AnytimeNew } from '../../../shared/types/anytime';
	const dispatch = createEventDispatcher<{ close: void }>();

	let name = '',
		kind = '',
		useCurrentFilters = true,
		kindSpecificData: Partial<AnytimeNew> = {},
		typeSettingsValid = true;
	$: hasFilters = !!$filterTags.length;

	$: kind && reset();

	function create() {
		anytimeOps.new({
			name,
			type: kind,
			tags: hasFilters && useCurrentFilters ? $filterTags : [],
			countdownEnd: kindSpecificData.countdownEnd,
		});
		name = '';
		close();
	}
	function close() {
		dispatch('close');
	}

	function reset() {
		typeSettingsValid = true;
		kindSpecificData = {};
	}
</script>
