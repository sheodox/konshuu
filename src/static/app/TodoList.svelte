<style>
	.todo-list {
		margin-top: 2px;
	}
	h3 {
		text-transform: capitalize;
	}
	ul {
		list-style: none;
	}
	.panel-body {
		padding: 0 0.5rem 0.5rem 0.5rem;
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
	.header button {
		padding: 0.25rem 0.5rem;
	}
	small {
		color: gray;
		text-align: center;
	}
	progress {
		height: 2px;
	}
	.dragging-over {
		background: var(--shdx-gray-500);
	}
	.mobile-add-todo-button {
		display: none;
	}
	.header button {
		/* negative --shdx-spacing-1, used to prevent the header height 
		jumping when the reschedule button show up */
		margin-top: -4px;
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
	class="panel todo-list f-column f-1 mt-2"
	class:dragging-over={$draggingOverList === listId}
	on:drop|preventDefault={drop}
	on:dragover|preventDefault={dragOver}
>
	<div class="header f-row f-0">
		<h3 class="f-1">{listName}</h3>
		<button class="mobile-add-todo-button" on:click={promptNewTodo}>
			<Icon icon="plus" variant="icon-only" />
			<span class="sr-only">Add todo</span>
		</button>
		{#if list.some((t) => !t.completed)}
			<button on:click={() => (showRescheduleModal = true)} title="Reschedule unfinished todos">
				<Icon icon="calendar-day" variant="icon-only" />
				<span class="sr-only">Reschedule undone todos</span>
			</button>
		{/if}
	</div>
	<div class="panel-body f-column f-1">
		<form on:submit|preventDefault={() => addTodo()}>
			<label class="f-row f-1 input-group">
				<span class="sr-only">New todo</span>
				<input
					id={`new-todo-input-${calendarDate.getDay()}-${listType}`}
					bind:value={newTodoText}
					type="text"
					placeholder="new todo"
					class="shdx-font-size-2 f-1"
					on:keydown={(e) => todoKeydown(e, listType, calendarDate)}
					autocomplete="off"
				/>
				<button disabled={!newTodoText} class="p-1 shdx-font-size-2">
					<Icon icon="plus" variant="icon-only" />
					<span class="sr-only">Add Todo</span>
				</button>
			</label>
		</form>
		<progress value={completedCount} max={list.length} aria-label="todo completion for this list" class="my-2" />
		<ul class="m-0 p-0 f-1">
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

	function rescheduleAll(e: CustomEvent<{ originalDate: CalendarDate; to: string }>) {
		rescheduleMany({
			list: listType,
			from: calendarDate,
			to: getRescheduleDestination(e.detail.to, e.detail.originalDate),
		});
	}

	async function drop(event: DragEvent) {
		const todoId = event.dataTransfer.getData('todoId');
		$draggingOverList = null;
		reschedule(todoId, calendarDate);
	}

	function dragOver(event: DragEvent) {
		$draggingOverList = listId;
		event.dataTransfer.dropEffect = 'move';
	}
</script>
