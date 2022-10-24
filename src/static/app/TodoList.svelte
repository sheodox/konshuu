<style lang="scss">
	section {
		padding: 2px;
		border-radius: 0.2rem;

		&.today {
			background: var(--sx-accent-gradient);
		}
		&.dragging-over {
			background: var(--sx-blue-500);
			box-shadow: 0 0 1.5rem var(--sx-blue-700);

			.todo-list {
				background: var(--sx-gray-500);
			}
		}
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
		margin: 0 auto var(--sx-spacing-1) auto;
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
	.mobile-add-todo-button {
		display: none;
	}
	.header button {
		/* negative --sx-spacing-1, used to prevent the header height 
		jumping when the reschedule button show up */
		margin-top: -4px;
	}
	.all-done {
		visibility: hidden;
	}
	.recurring-container {
		$recColor: var(--sx-pink-400);
		border-color: #{$recColor};

		legend {
			font-size: var(--sx-font-size-1);
			background: #{$recColor};
			border: 1px solid #{$recColor};
			color: black;
			border-radius: 2px;
		}

		/* override some checkbox styling so the label is bigger and can accept clicks along the whole row */
		:global(div) {
			display: flex;
			border-radius: 0.2rem;

			&:hover {
				background: var(--sx-gray-400);
			}
		}
		:global(input) {
			width: 1.5rem;
		}
		:global(label) {
			flex: 1;
			padding-top: var(--sx-spacing-1);
			padding-bottom: var(--sx-spacing-1);
		}
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

<section class:today={isToday} class="f-column f-1 mt-2" class:dragging-over={$draggingOverList === listId}>
	<div class="panel todo-list f-column f-1" on:drop|preventDefault={drop} on:dragover|preventDefault={dragOver}>
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
						class="sx-font-size-2 f-1"
						on:keydown={(e) => todoKeydown(e, listType, calendarDate)}
						autocomplete="off"
					/>
					<button disabled={!newTodoText} class="p-1 sx-font-size-2">
						<Icon icon="plus" variant="icon-only" />
						<span class="sr-only">Add Todo</span>
					</button>
				</label>
			</form>
			<progress
				value={completedCount}
				max={todayTodosTotal}
				aria-label="todo completion for this list"
				class="my-2"
				class:all-done={completedCount === todayTodosTotal}
			/>
			<ul class="m-0 p-0">
				{#each list as todo (todo.id)}
					<TodoItem {todo} {listType} {calendarDate} />
				{/each}
			</ul>
			{#if recurringTodos.length}
				<fieldset class="recurring-container p-1" class:mt-2={list.length}>
					<legend class="px-1 fw-bold">Recurring</legend>
					{#each recurringTodos as todo (todo.id)}
						<RecurringTodoItem {todo} {calendarDate} />
					{/each}
				</fieldset>
			{/if}
			{#if $hideCompleted && completedCount > 0}
				<small>
					{completedCount} completed todos hidden
				</small>
			{/if}
		</div>
	</div>
</section>

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
	import {
		hideCompleted,
		newTodo,
		rescheduleMany,
		reschedule,
		todoKeydown,
		recurringTodos as recurringTodosStore,
		getRecurringTodosForList,
		recurringTodoCompletion,
	} from './stores/todo';
	import Reschedule from './Reschedule.svelte';
	import { Icon } from 'sheodox-ui';
	import TodoItem from './TodoItem.svelte';
	import { draggingOverList, getRescheduleDestination } from './reschedule-utils';
	import RecurringTodoItem from './RecurringTodoItem.svelte';
	import type { Todo, TodoListType } from '../../shared/types/todos';
	import type { CalendarDate } from '../../shared/dates';

	export let listName = ''; //list display name
	export let listType: TodoListType; //list type
	export let list: Todo[] = [];
	export let calendarDate: CalendarDate;
	export let isToday: boolean;

	const listId = `${listName}-${calendarDate.serialize()}`;
	$: recurringTodos = getRecurringTodosForList(listType, calendarDate, $recurringTodosStore);

	let newTodoText = '',
		showRescheduleModal = false;

	$: completedCount =
		list.filter((todo) => todo.completed).length +
		recurringTodos.reduce(
			(complete, todo) =>
				complete +
				($recurringTodoCompletion.some((comp) => calendarDate.isSameDate(comp.date) && todo.id === comp.recurringTodoId)
					? 1
					: 0),
			0
		);

	$: todayTodosTotal = list.length + recurringTodos.length;

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
		reschedule(todoId, calendarDate, listType);
	}

	function dragOver(event: DragEvent) {
		$draggingOverList = listId;
		event.dataTransfer.dropEffect = 'move';
	}
</script>
