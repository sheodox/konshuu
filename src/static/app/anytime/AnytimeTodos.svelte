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
		<Progress value={completedCount} max={data.todos.length} aria-label="" variant="slim" id="{listId}-progress" />
	</div>
	{#if showNewTodo}
		<AnytimeTodoEdit
			id={data.id}
			title="New Todo"
			bind:text={newText}
			bind:href={newHref}
			on:submit={createNew}
			on:cancel={cancelAdd}
			showCancel={!!data.todos.length}
		/>
	{/if}
	<ul class="m-0 p-0 f-column">
		{#each data.todos as todo (todo.id)}
			<AnytimeTodo {todo} anytimeId={data.id} />
		{/each}
	</ul>
</div>

<script lang="ts">
	import { Progress } from 'sheodox-ui';
	import { anytimeOps } from '../stores/anytime';
	import AnytimeTodo from './AnytimeTodo.svelte';
	import AnytimeTodoEdit from './AnytimeTodoEdit.svelte';
	import type { Anytime } from '../../../shared/types/anytime';

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
	}
</script>
