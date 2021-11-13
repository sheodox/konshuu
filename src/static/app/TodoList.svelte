<style>
	h3 {
		text-transform: capitalize;
	}
	div {
		flex: 1;
	}
	ul {
		padding: 0;
		margin: 0;
		list-style: none;
		flex: 1;
	}
	.panel {
		margin-top: 0.3rem;
	}
	.panel-body {
		flex: 1;
		padding: 0 0.5rem 0.5rem 0.5rem;
	}
	input[type='text'] {
		font-size: 0.8rem;
	}
	.new-todo {
		display: flex;
		flex: 1;
	}
	.new-todo button {
		font-size: 0.8rem;
		padding: 0.4rem;
	}
	.new-todo input {
		flex: 1;
	}
	form,
	form label {
		display: flex;
		flex-shrink: 0;
	}
	form {
		margin: 0 auto var(--shdx-spacing-1) auto;
		width: 100%;
	}
	.header {
		display: flex;
		flex-direction: row;
		flex: 0;
		padding-bottom: 0;
	}
	.header h3 {
		flex: 1;
	}
	.header button {
		padding: 0.25rem 0.5rem;
	}
	small {
		color: gray;
		text-align: center;
	}
	progress {
		height: 2px;
		margin-top: var(--shdx-spacing-2);
		margin-bottom: var(--shdx-spacing-2);
	}
	.draggingOver {
		background: var(--shdx-gray-500);
	}
	.mobile-add-todo-button {
		display: none;
	}
	@media (max-width: 600px) {
		form {
			display: none;
		}
		.mobile-add-todo-button {
			display: block;
		}
	}
</style>

<div
	class="panel todo-list f-column"
	class:draggingOver={$draggingOverList === listId}
	on:drop|preventDefault={drop}
	on:dragover|preventDefault={dragOver}
>
	<div class="header">
		<h3>{listName}</h3>
		<button class="mobile-add-todo-button" on:click={promptNewTodo}>
			<Icon icon="plus" noPadding={true} />
			<span class="sr-only">Add todo</span>
		</button>
		{#if list.some((t) => !t.completed)}
			<button on:click={() => (showRescheduleModal = true)} title="Reschedule unfinished todos">
				<Icon icon="calendar-day" noPadding={true} />
				<span class="sr-only">Reschedule undone todos</span>
			</button>
		{/if}
	</div>
	<div class="panel-body f-column">
		<form on:submit|preventDefault={() => addTodo()}>
			<label class="new-todo input-group">
				<span class="sr-only">New todo</span>
				<input
					id={`new-todo-input-${calendarDate.getDay()}-${listType}`}
					bind:value={newTodoText}
					type="text"
					placeholder="new todo"
					class="new-todo-input"
					on:keydown={(e) => todoKeydown(e, listType, calendarDate)}
				/>
				<button disabled={!newTodoText}>
					<Icon icon="plus" noPadding={true} />
					<span class="sr-only">Add Todo</span>
				</button>
			</label>
		</form>
		<progress value={completedCount} max={list.length} aria-label="todo completion for this list" />
		<ul>
			{#each list as todo (todo.id)}
				<TodoItem {todo} {listType} {calendarDate} />
			{/each}
		</ul>
		{#if $hideCompleted && completedCount > 0}
			<small>
				{completedCount} completed todos hidden
			</small>
		{/if}
	</div>
</div>
{#if showRescheduleModal}
	<Reschedule
		bind:visible={showRescheduleModal}
		on:reschedule={rescheduleAll}
		{calendarDate}
		{listType}
		todoCount={list.length}
	/>
{/if}

<script lang="ts">
	import { hideCompleted, newTodo, rescheduleMany, reschedule, todoKeydown } from './stores/todo';
	import Reschedule from './Reschedule.svelte';
	import { Icon } from 'sheodox-ui';
	import TodoItem from './TodoItem.svelte';
	import { draggingOverList, getRescheduleDestination } from './reschedule-utils';
	import type { Todo, TodoListType } from '../../shared/types/todos';
	import type { CalendarDate } from '../../shared/dates';

	export let listName = ''; //list display name
	export let listType: TodoListType; //list type
	export let list: Todo[] = [];
	export let calendarDate: CalendarDate;

	const listId = `${listName}-${calendarDate.serialize()}`;

	let newTodoText = '',
		showRescheduleModal = false;

	$: completedCount = list.filter((todo) => todo.completed).length;

	async function addTodo(text = newTodoText.trim()) {
		newTodo({
			list: listType,
			text,
			date: calendarDate,
		});
		newTodoText = '';
	}

	function promptNewTodo() {
		const newTodo = prompt('New todo item:');
		addTodo(newTodo);
	}

	function rescheduleAll(e: CustomEvent<string>) {
		rescheduleMany({
			list: listType,
			from: calendarDate.serialize(),
			to: getRescheduleDestination(e.detail).serialize(),
		});
	}

	async function drop(event: DragEvent) {
		const todoId = event.dataTransfer.getData('todoId');
		$draggingOverList = null;
		reschedule(todoId, calendarDate.serialize());
	}

	function dragOver(event: DragEvent) {
		$draggingOverList = listId;
		event.dataTransfer.dropEffect = 'move';
	}
</script>
