<style>
	li {
		position: relative;
		align-items: center;
	}
	li:hover {
		background: var(--sx-gray-400);
		border-radius: 0.2rem;
	}
	button {
		padding: 0.3rem;
		text-align: left;
	}
	ul {
		list-style: none;
	}
</style>

{#if showEdit}
	<TodoEdit
		id={todo.id}
		bind:text={newText}
		bind:href={newHref}
		on:submit={saveTodo}
		on:cancel={() => (showEdit = false)}
	/>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<li
		class="todo-item f-row align-items-start"
		draggable="true"
		on:dragstart={dragStart}
		on:click={() => toggleTodo(!todo.completed)}
		bind:this={li}
	>
		<TodoCheckbox bind:checked={todo.completed} on:change={() => toggleTodo(todo.completed)} id={todo.id}>
			{#if todo.href && /^https?:/.test(todo.href)}
				<a href={todo.href} class="inline-link" target="_blank" rel="noopener noreferrer">{todo.text}</a>
			{:else}
				{todo.text}
			{/if}
		</TodoCheckbox>
		<MenuButton triggerClasses="small" contextTriggerElement={li}>
			<span slot="trigger">
				<span class="sr-only">Menu</span>
				<Icon icon="chevron-down" variant="icon-only" />
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
				{#if todo.href}
					<li>
						<button class="a" on:click={() => copyToClipboard(todo.href)}>
							<Icon icon="copy" />
							Copy URL
						</button>
					</li>
				{/if}
			</ul>
		</MenuButton>
	</li>
{/if}

{#if showReschedule}
	<Reschedule bind:visible={showReschedule} {listType} {calendarDate} on:reschedule={rescheduleTodo} todoCount={1} />
{/if}

<script lang="ts">
	import { updateTodo, deleteTodo, reschedule } from './stores/todo';
	import { copyToClipboard } from './stores/app';
	import { Icon, MenuButton } from 'sheodox-ui';
	import TodoCheckbox from './TodoCheckbox.svelte';
	import TodoEdit from './TodoEdit.svelte';
	import Reschedule from './Reschedule.svelte';
	import { getRescheduleDestination } from './reschedule-utils';
	import type { Todo, TodoListType } from '../../shared/types/todos';
	import type { CalendarDate } from '../../shared/dates';

	export let todo: Todo;
	export let calendarDate: CalendarDate;
	export let listType: TodoListType;

	let showReschedule = false,
		newText = '',
		newHref = '',
		showEdit = false,
		li: HTMLLIElement;

	function toggleTodo(completed: boolean) {
		updateTodo(todo.id, {
			completed,
		});
	}

	function editTodo() {
		showEdit = !showEdit;
		if (showEdit) {
			newText = todo.text;
			newHref = todo.href;
		}
	}

	function saveTodo() {
		updateTodo(todo.id, {
			text: newText,
			href: newHref,
			completed: todo.completed,
		});
		showEdit = false;
	}

	async function rescheduleTodo(e: CustomEvent<{ to: string; originalDate: CalendarDate }>) {
		//serialize the date the same way the date input would use for the value
		reschedule(todo.id, getRescheduleDestination(e.detail.to, e.detail.originalDate), listType);
	}

	function dragStart(event: DragEvent) {
		event.dataTransfer.setData('todoId', todo.id);
	}
</script>
