<style>
	li {
        position: relative;
	}
	li:hover {
        background: var(--panel-header-bg);
        border-radius: 0.2rem;
	}
	label {
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
</style>

{#if !todo.completed || !$hideCompleted}
	<li class="todo-item f-row align-items-start">
		<input
			type="checkbox"
			bind:checked={todo.completed}
			on:change={() => toggleTodo(todo.todo_id)}
			id={todo.todo_id}
		/>
		<label class:muted={todo.completed} for={todo.todo_id}>
			{todo.text}
		</label>
		<ButtonDropdown small={true} openDirection="left">
			<span class="sr-only" slot="button">Menu</span>
			<ul slot="menu">
				<li>
					<button class="a" on:click={removeTodo}>
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
					<button class="a" on:click={() => showReschedule = true}>
						<Icon icon="calendar-day" />
						Reschedule
					</button>
				</li>
			</ul>
		</ButtonDropdown>
	</li>
{/if}

{#if showReschedule}
	<Reschedule bind:visible={showReschedule} {listType} todoDate={date} on:reschedule={rescheduleTodo} />
{/if}

<script>
	import {hideCompleted, updateWeek} from "./todosStore";
	import {Icon, ButtonDropdown} from 'sheodox-ui';
	import Reschedule from './Reschedule.svelte';
	import {getRescheduleDestination, serializeDate} from "./reschedule-utils";

	export let todo;
	export let date;
	export let listType;

	const encodedId = encodeURIComponent(todo.todo_id);
	let showReschedule = false;

	async function toggleTodo() {
		await fetch(`/list/toggle/${encodedId}`);
		await updateWeek();
	}

	async function removeTodo() {
		await fetch(`/list/remove/${encodedId}`);
		await updateWeek();
	}

	async function editTodo() {
		let newTodo = prompt("Enter a todo", todo.text);
		if (newTodo && newTodo.trim()) {
			await fetch(`/list/edit/${encodedId}/${encodeURIComponent(newTodo.trim())}`);
			await updateWeek();
		}
	}

	async function rescheduleTodo(e) {
		//serialize the date the same way the date input would use for the value
		await fetch(`/list/reschedule-one/${encodedId}/${serializeDate(getRescheduleDestination(e.detail))}`);
		await updateWeek();
	}
</script>