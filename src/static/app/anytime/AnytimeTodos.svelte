<style>
	.todo-list {
		overflow-y: auto;
	}
	progress {
		height: 2px;
	}
	.all-done {
		visibility: hidden;
	}
</style>

<div class="f-column f-1 todo-list">
	<progress
		value={completedCount}
		max={data.todos.length}
		aria-label="todo completion for this list"
		class="my-2"
		class:all-done={completedCount === data.todos.length}
	/>
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
	{#each data.todos as todo (todo.id)}
		<AnytimeTodo {todo} anytimeId={data.id} />
	{/each}
</div>

<script lang="ts">
	import type { Anytime } from '../../../shared/types/anytime';
	import { anytimeOps } from '../stores/anytime';
	import AnytimeTodo from './AnytimeTodo.svelte';
	import AnytimeTodoEdit from './AnytimeTodoEdit.svelte';

	export let data: Anytime;
	export let showNewTodo: boolean;
	let newText = '',
		newHref = '';

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
