<fieldset>
	<legend>{weekly.name}</legend>
	<form on:submit|preventDefault={save} class="f-column gap-2">
		<TextInput id="{weekly.id}-name" type="text" bind:value={newName}>Name</TextInput>
		<TextInput id="{weekly.id}-goal" type="number" bind:value={newGoal}>Goal</TextInput>
		<small>Changing the goal here won't change the goal for past weeks.</small>
		<div class="f-row">
			<button
				disabled={(weekly.name === newName && newGoal === weekly.goal) || !newName || newGoal < 0}
				class="f-1 primary">Save</button
			>
			<button on:click={() => (showDeleteConfirm = true)} class="danger"><Icon icon="trash" />Delete</button>
		</div>
	</form>
</fieldset>

{#if showDeleteConfirm}
	<Modal bind:visible={showDeleteConfirm} title={`Delete "${weekly.name}"`}>
		<div class="modal-body">
			<p>Are you sure you want to delete this weekly?</p>
			<Checkbox id="hard-delete" bind:checked={hardDelete}>Completely delete all history of this weekly</Checkbox>
		</div>
		<div class="modal-footer">
			<button on:click={del} class="danger" disabled={hardDeleteDisabled}>
				{#if hardDeleteDisabled}
					Wait...
				{:else}
					Delete
				{/if}</button
			>
			<button on:click={() => (showDeleteConfirm = false)}>Cancel</button>
		</div>
	</Modal>
{/if}

<script lang="ts">
	import { Icon, TextInput, Modal, Checkbox } from 'sheodox-ui';
	import { weeklyOps } from './stores/weekly';
	import type { Weekly } from '../../shared/types/todos';

	export let weekly: Weekly;

	let newGoal = weekly.goal,
		newName = weekly.name,
		hardDelete = false,
		hardDeleteDisabled = false,
		showDeleteConfirm = false;

	$: if (hardDelete) {
		hardDeleteDisabled = true;
		setTimeout(() => (hardDeleteDisabled = false), 3000);
	}

	function save() {
		weeklyOps.edit(weekly.id, {
			goal: newGoal,
			name: newName,
		});
	}

	function del() {
		weeklyOps.delete(weekly.id, hardDelete);
		showDeleteConfirm = false;
	}
</script>
