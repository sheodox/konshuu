<style>
	select {
		width: 100%;
	}
</style>

<Modal bind:visible title="New Anytime">
	<form on:submit|preventDefault={create}>
		<div class="modal-body f-column gap-2">
			<TextInput id="new-anytime-name" bind:value={name}>Name</TextInput>
			{#if viewingTag}
				<div class="mt-2">
					<Checkbox bind:checked={useCurrentFilters}>Assign tag "{viewingTag.name}"</Checkbox>
				</div>
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
		</div>
		<div class="modal-footer">
			<button on:click={close} class="secondary" type="button">Cancel</button>
			<button class="primary" disabled={!name || !kind || !typeSettingsValid}>Create</button>
		</div>
	</form>
</Modal>

<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Checkbox, TextInput, Modal } from 'sheodox-ui';
	import { anytimeOps, anytimeTypes, tags } from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import CountdownSettings from './CountdownSettings.svelte';
	import CountupSettings from './CountupSettings.svelte';
	import { AnytimeNew } from '../../../shared/types/anytime';
	const dispatch = createEventDispatcher<{ close: void }>();

	export let visible: boolean;

	let name = '',
		kind = 'todos',
		useCurrentFilters = true,
		kindSpecificData: Partial<AnytimeNew> = {},
		typeSettingsValid = true;
	$: viewingTag = $tags.find(({ id }) => id === $activeRouteParams.tagId);

	$: kind && reset();

	function create() {
		anytimeOps.new({
			name,
			type: kind,
			tags: !!viewingTag && useCurrentFilters ? [$activeRouteParams.tagId] : [],
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

	onMount(() => {
		document.getElementById('text-input-new-anytime-name')?.focus();
	});
</script>
