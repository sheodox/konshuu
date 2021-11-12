<style>
	li {
		position: relative;
	}
	li:hover {
		background: var(--shdx-gray-400);
		border-radius: 0.2rem;
	}
	li :global(div) {
		flex: 1;
		display: flex;
	}
	li :global(label) {
		font-size: 0.8rem;
		flex: 1;
		padding-left: 0.2rem;
	}
	button {
		padding: 0.3rem;
		text-align: left;
	}
	ul {
		list-style: none;
	}
	@media (max-width: 600px) {
		li :global(label) {
			font-size: var(--shdx-font-size-3);
		}
	}
</style>

{#if !todo.completed || !$hideCompleted}
	<li
		class="todo-item f-row align-items-start px-1"
		draggable="true"
		on:dragstart={dragStart}
		class:muted={todo.completed}
		bind:this={li}
	>
		<Checkbox bind:checked={todo.completed} on:change={() => toggleTodo()} id={todo.id}>
			{todo.text}
		</Checkbox>
		<MenuButton triggerClasses="small" contextTriggerElement={li}>
			<span slot="trigger">
				<span class="sr-only">Menu</span>
				<Icon icon="chevron-down" noPadding={true} />
			</span>
			<ul slot="menu">
				<li>
					<button class="a" on:click={() => deleteTodo(todo.id)}>
						<Icon icon="times" />
						Delete
					</button>
				</li>
				<li>
					<button class="a" on:click={editTodo}>
						<Icon icon="edit" />
						Edit
					</button>
				</li>
				<li>
					<button class="a" on:click={() => (showReschedule = true)}>
						<Icon icon="calendar-day" />
						Reschedule
					</button>
				</li>
				<li>
					<button class="a" on:click={() => copyToClipboard(todo.text)}>
						<Icon icon="copy" />
						Copy
					</button>
				</li>
			</ul>
		</MenuButton>
	</li>
{/if}

{#if showReschedule}
	<Reschedule bind:visible={showReschedule} {listType} {calendarDate} on:reschedule={rescheduleTodo} todoCount={1} />
{/if}

<script lang="ts">
	import { hideCompleted, copyToClipboard, updateTodo, deleteTodo, reschedule } from './stores/todo';
	import { Icon, Checkbox, MenuButton } from 'sheodox-ui';
	import Reschedule from './Reschedule.svelte';
	import { getRescheduleDestination } from './reschedule-utils';
	import type { Todo, TodoListType } from '../../shared/types/todos';
	import type { CalendarDate } from '../../shared/dates';

	export let todo: Todo;
	export let calendarDate: CalendarDate;
	export let listType: TodoListType;

	let showReschedule = false,
		li: HTMLLIElement;

	function toggleTodo() {
		updateTodo(todo.id, {
			completed: todo.completed,
		});
	}

	function editTodo() {
		let newTodo = prompt('Enter a todo', todo.text);
		if (newTodo && newTodo.trim()) {
			updateTodo(todo.id, {
				text: newTodo,
			});
		}
	}

	async function rescheduleTodo(e: CustomEvent<string>) {
		//serialize the date the same way the date input would use for the value
		reschedule(todo.id, getRescheduleDestination(e.detail).serialize());
	}

	function dragStart(event: DragEvent) {
		event.dataTransfer.setData('todoId', todo.id);
	}
</script>
