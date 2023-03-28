<style>
	.todo-list {
		overflow-y: auto;
	}
	.all-done {
		visibility: hidden;
	}
</style>

<div class="f-column f-1 todo-list">
	<div class="my-2" class:all-done={completedCount === data.todos.length}>
		<label class="sr-only" for="{listId}-progress"> todo completion for this list </label>
		<Progress value={completedCount} max={data.todos.length} variant="slim" id="{listId}-progress" />
	</div>
	{#if showNewTodo}
		<TodoEdit
			id={data.id}
			title="New Todo"
			bind:text={newText}
			bind:href={newHref}
			on:submit={createNew}
			on:cancel={cancelAdd}
		/>
	{/if}
	<ul class="m-0 p-0 f-column">
		{#each data.todos as todo (todo.id)}
			<AnytimeTodo {todo} anytimeId={data.id} />
		{:else}
			{#if !showNewTodo}
				<li class="text-align-center">
					<p>This list has no todos yet.</p>
					<button on:click={() => (showNewTodo = true)} class="secondary"><Icon icon="plus" />New Todo</button>
				</li>
			{/if}
		{/each}
	</ul>
</div>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Progress, Icon } from 'sheodox-ui';
	import { anytimeOps } from '../stores/anytime';
	import AnytimeTodo from './AnytimeTodo.svelte';
	import TodoEdit from '../TodoEdit.svelte';
	import type { Anytime } from '../../../shared/types/anytime';

	const dispatch = createEventDispatcher<{
		'cancel-new-todo': void;
	}>();

	export let data: Anytime;
	export let showNewTodo: boolean;
	let newText = '',
		newHref = '';

	$: listId = `anytime-todo-list-${data.id}`;
	$: completedCount = data.todos.reduce((total, todo) => total + (todo.completed ? 1 : 0), 0);

	function createNew() {
		anytimeOps.todo.new(data.id, {
			text: newText,
			href: newHref,
		});
		newText = '';
		newHref = '';
	}

	function cancelAdd() {
		showNewTodo = false;
		newText = '';
		newHref = '';
		dispatch('cancel-new-todo');
	}
</script>
