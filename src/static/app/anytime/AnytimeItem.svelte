<style>
	form button {
		margin: 0;
	}
</style>

<div class="anytime-item f-column">
	<div class="f-row justify-content-between align-items-center todo-header">
		<h2>
			<Link href="/anytime/{data.id}" on:followed={() => ($lastAnytimeView = { anytime: data.id })}>{data.name}</Link>
		</h2>
		<div class="f-row align-items-center gap-2">
			{#if data.type === 'todos' && mode === 'view'}
				<button
					on:click={() => (showNewTodo = !showNewTodo)}
					title="Add todo"
					aria-pressed={showNewTodo}
					class="small px-2 m-0"
					bind:this={addTodoButton}
				>
					<Icon icon="plus" variant="icon-only" />
					<span class="sr-only">Add Todo</span>
				</button>
			{/if}
			<MenuButton triggerClasses="small px-3 m-0">
				<span slot="trigger">
					<Icon icon="ellipsis-v" variant="icon-only" />
					<span class="sr-only">Options</span>
				</span>
				<ul slot="menu">
					<li>
						<button on:click={switchMode} aria-pressed={mode === 'edit'} disabled={!allowSettings}>
							<Icon icon="cog" />
							Settings
						</button>
					</li>
					<li>
						<button on:click={togglePin}>
							<Icon icon="thumbtack" />
							{data.pinned ? 'Unpin' : 'Pin to top'}
						</button>
					</li>
					<li>
						<button on:click={confirmDelete}>
							<Icon icon="trash" />
							Delete
						</button>
					</li>
				</ul>
			</MenuButton>
		</div>
	</div>

	{#if mode === 'view'}
		{#if data.type === 'counter'}
			<AnytimeCounter {data} />
		{:else if data.type === 'todos'}
			<AnytimeTodos {data} bind:showNewTodo on:cancel-new-todo={() => addTodoButton?.focus()} />
		{:else if data.type === 'countdown'}
			<AnytimeCountdown {data} />
		{:else if data.type === 'countup'}
			<Countup {data} />
		{:else if data.type === 'notes'}
			<Notes bind:allowSettings {data} />
		{:else}
			<p>Unknown type <code>{data.type}</code></p>
		{/if}
	{:else if mode === 'edit'}
		<form on:submit|preventDefault={submit} class="f-column gap-2 f-1">
			<div class="f-column gap-2 f-1">
				<TextInput id="name-{data.id}" bind:value={editingData.name}>Name</TextInput>

				{#if data.type === 'counter'}
					<AnytimeCounterSettings bind:data={editingData} id={data.id} />
				{:else if data.type === 'todos'}
					<AnytimeTodoSettings {data} />
				{:else if data.type === 'countdown'}
					<CountdownSettings bind:data={editingData} bind:valid={typeSettingsValid} />
				{:else if data.type === 'countup'}
					<CountupSettings bind:data={editingData} bind:valid={typeSettingsValid} />
				{:else if data.type === 'notes'}
					<div />
				{:else}
					<p>Unknown type <code>{data.type}</code></p>
				{/if}
			</div>

			<p class="m-0 sx-font-size-2 text-align-center">Last updated {data.updatedAt.toLocaleString()}</p>
			<button class="primary" disabled={!typeSettingsValid}>Save</button>
			<button class="secondary" type="button" on:click={switchMode}>Cancel</button>
		</form>
	{/if}
</div>

<script lang="ts">
	import { MenuButton, Icon, TextInput, showConfirmModal } from 'sheodox-ui';
	import { anytimeOps, lastAnytimeView } from '../stores/anytime';
	import AnytimeCountdown from './AnytimeCountdown.svelte';
	import AnytimeCounter from './AnytimeCounter.svelte';
	import AnytimeCounterSettings from './AnytimeCounterSettings.svelte';
	import AnytimeTodos from './AnytimeTodos.svelte';
	import AnytimeTodoSettings from './AnytimeTodoSettings.svelte';
	import CountdownSettings from './CountdownSettings.svelte';
	import Countup from './Countup.svelte';
	import CountupSettings from './CountupSettings.svelte';
	import Notes from './Notes.svelte';
	import Link from '../Link.svelte';
	import type { Anytime, AnytimeEditable } from '../../../shared/types/anytime';

	export let data: Anytime;

	let editingData: AnytimeEditable = data,
		addTodoButton: HTMLElement,
		showNewTodo = false,
		typeSettingsValid = true,
		allowSettings = true,
		mode = 'view';

	function switchMode() {
		if (mode === 'view') {
			editingData = anytimeOps.anytimeToEditable(data);
			mode = 'edit';
		} else {
			mode = 'view';
		}
	}

	function togglePin() {
		anytimeOps.edit(data.id, { ...anytimeOps.anytimeToEditable(data), pinned: !data.pinned });
	}

	function submit() {
		anytimeOps.edit(data.id, editingData);
		switchMode();
	}

	async function confirmDelete() {
		if (
			await showConfirmModal({ message: `Are you sure you want to delete "${data.name}"?`, title: 'Delete Anytime' })
		) {
			anytimeOps.delete(data.id);
		}
	}
</script>
