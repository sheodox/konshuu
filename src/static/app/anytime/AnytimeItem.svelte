<style>
	form button {
		margin: 0;
	}

	.todo-header button {
		padding: 0.25rem 0.5rem;
	}

	hr {
		width: 100%;
		border-color: var(--sx-gray-200);
	}
</style>

<div class="anytime-item f-column">
	<div class="f-row justify-content-between align-items-baseline todo-header">
		<h2>{data.name}</h2>
		<div class="f-row">
			{#if data.type === 'todos' && mode === 'view'}
				<button on:click={() => (showNewTodo = !showNewTodo)} title="Add todo">
					<Icon icon="plus" variant="icon-only" />
					<span class="sr-only">Add Todo</span>
				</button>
			{/if}
			<button on:click={switchMode}>
				<Icon icon="ellipsis-v" variant="icon-only" />
				<span class="sr-only">Options</span>
			</button>
		</div>
	</div>

	{#if mode === 'view'}
		{#if data.type === 'counter'}
			<AnytimeCounter {data} />
		{:else if data.type === 'todos'}
			<AnytimeTodos {data} bind:showNewTodo />
		{:else}
			<p>Unknown type <code>{data.type}</code></p>
		{/if}
	{:else if mode === 'edit'}
		<form on:submit|preventDefault={submit} class="f-column gap-2">
			<TextInput id="name-{data.id}" bind:value={editingData.name}>Name</TextInput>

			{#if data.type === 'counter'}
				<AnytimeCounterSettings bind:data={editingData} id={data.id} />
			{:else if data.type === 'todos'}
				<AnytimeTodoSettings {data} />
			{:else}
				<p>Unknown type <code>{data.type}</code></p>
			{/if}

			<hr />

			<button class="primary">Save</button>
			<button class="secondary" type="button" on:click={switchMode}>Cancel</button>
			<button class="danger" type="button" on:click={confirmDelete}>Delete "{data.name}"</button>
		</form>
	{/if}
</div>

<script lang="ts">
	import { Icon, TextInput } from 'sheodox-ui';
	import type { Anytime, AnytimeEditable } from '../../../shared/types/anytime';
	import { anytimeOps } from '../stores/anytime';
	import AnytimeCounter from './AnytimeCounter.svelte';
	import AnytimeCounterSettings from './AnytimeCounterSettings.svelte';
	import AnytimeTodos from './AnytimeTodos.svelte';
	import AnytimeTodoSettings from './AnytimeTodoSettings.svelte';

	export let data: Anytime;
	let editingData: AnytimeEditable = data;
	let showNewTodo = !data.todos.length;

	let mode = 'view';

	function switchMode() {
		if (mode === 'view') {
			editingData = {
				count: data.count,
				name: data.name,
				showCountUp: data.showCountUp,
				showCountDown: data.showCountDown,
			};
			mode = 'edit';
		} else {
			mode = 'view';
		}
	}

	function submit() {
		anytimeOps.edit(data.id, editingData);
		switchMode();
	}

	function confirmDelete() {
		if (confirm(`Are you sure you want to delete "${data.name}"?`)) {
			anytimeOps.delete(data.id);
		}
	}
</script>
