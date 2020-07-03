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
    .completed {
        color: gray;
	}
    .panel {
        margin: 0.5rem 0;
        display: flex;
        flex-direction: column;
    }
    .panel-body {
        display: flex;
        flex-direction: column;
        flex: 1;
    }
    li {
        display: flex;
        align-items: center;
    }
    li.todo-item:hover {
        background: var(--panel-header-bg);
        border-radius: 0.2rem;
    }
    .todo-list label {
        flex: 1;
    }
    .todo-item {
		font-size: 0.8rem;
	}
	.todo-list button {
        padding: 0.3rem;
    }
	input[type="text"] {
        font-size: 0.8rem;
        width: 100%;
    }
    .new-todo {
        display: flex;
    }
    .new-todo input {
        flex: 1;
    }
    form, form label {
        display: flex;
        flex-shrink: 0;
    }
    .header {
        display: flex;
        flex-direction: row;
        flex: 0;
    }
    .header h3 {
        flex: 1;
    }
    .header button {
        padding: 0 0.5rem;
    }
    .reschedule-modal {
        text-align: center;
    }
    .reschedule-modal form {
        justify-content: center;
    }
    small {
        color: gray;
        text-align: center;
    }
</style>

<div class="panel todo-list">
    <div class="header">
		<h3>{listName}</h3>
        {#if list.some(t => !t.completed)}
            <button
                on:click={() => showRescheduleModal = true}
                title="Reschedule unfinished todos"
            >
                <Icon icon="schedule" noPadding={true}/>
                <span class="sr-only">Reschedule undone todos</span>
            </button>
        {/if}
	</div>
    <div class="panel-body">
		<ul>
            {#each list as todo}
                {#if !todo.completed || !$hideCompleted}
                    <li class="todo-item">
                        <input
                            type="checkbox"
                            bind:checked={todo.completed}
                            on:change={() => toggleTodo(todo.todo_id)}
                            id={todo.todo_id}
                        />
                        <label class:completed={todo.completed} for={todo.todo_id}>
                            {todo.text}
                        </label>
                        <button
                            on:click={() => removeTodo(todo.todo_id)}>
                            <Icon icon="clear" noPadding={true} />
                            <span class="sr-only">
                                Remove todo: {todo.text}
                            </span>
                        </button>
                    </li>
                {/if}
            {/each}
		</ul>
        {#if $hideCompleted && completedCount > 0}
			<small>
                {completedCount} completed todos hidden
			</small>
        {/if}
		<form on:submit|preventDefault={addTodo}>
			<label class="new-todo input-group">
                <span class="sr-only">New todo</span>
				<input bind:value={newTodoText} type="text" placeholder="new todo" />
                <button disabled={!newTodoText}>
                    <Icon icon="add" noPadding={true} />
                    <span class="sr-only">Add Todo</span>
                </button>
			</label>
		</form>
    </div>
</div>
{#if showRescheduleModal}
	<Modal title="Reschedule" bind:visible={showRescheduleModal}>
        <div class="reschedule-modal">
			<p>
				When should these todos be rescheduled to?
			</p>
            {#if !isToday}
				<button on:click={() => reschedule('today')}>
					Today
				</button>
            {/if}
            {#if !isTomorrow}
				<button on:click={() => reschedule('tomorrow')}>
					Tomorrow
				</button>
            {/if}
			<br>
			<p>Or a custom date...</p>
			<form on:submit|preventDefault={() => reschedule(customReschedule)}>
				<label class="input-group">
					<input type="date" bind:value={customReschedule} required>
					<button disabled={!customReschedule}>
						Reschedule
					</button>
				</label>
			</form>
		</div>
	</Modal>
{/if}

<script>
	import {updateWeek, hideCompleted} from './todosStore';
	import Modal from './Modal.svelte';
	import Icon from './Icon.svelte';
    export let listName = ''; //list display name
	export let listType = ''; //list type
	export let list = [];
    export let date = new Date();
    let newTodoText = '',
        customReschedule,
        showRescheduleModal = false;

    $: completedCount = list.filter(todo => todo.completed).length;

    const DAY_MS = 24 * 60 * 60 * 1000;
    $: isToday = date.toLocaleDateString() === new Date().toLocaleDateString()
    $: isTomorrow = date.toLocaleDateString() === new Date(Date.now() + DAY_MS).toLocaleDateString()

    async function addTodo() {
        const text = newTodoText.trim();
        if (!text) {
        	return;
        }
    	const enc = str => encodeURIComponent(str);
		await fetch(`/list/add/${enc(date.getTime())}/${enc(listName)}/${enc(text)}`)
		await updateWeek();
        newTodoText = '';
    }

    async function toggleTodo(id) {
		await fetch(`/list/toggle/${encodeURIComponent(id)}`);
		await updateWeek();
	}

	async function removeTodo(id) {
		await fetch(`/list/remove/${encodeURIComponent(id)}`);
		await updateWeek();
    }
    async function reschedule(target) {
        let newDate;
        if (target === 'today') {
        	newDate = new Date();
		}
        else if (target === 'tomorrow') {
        	newDate = new Date(Date.now() + DAY_MS);
        }
        else { // the date input gives a date like 'YYYY-MM-DD'
            const [year, month, day] = target.split('-');
            newDate = new Date(+year, +month - 1, +day);
        }
        //serialize the date the same way the date input would use for the value
        const serializeDate = date => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        await fetch(`/list/reschedule/${listType}/${serializeDate(date)}/${serializeDate(newDate)}`);
        await updateWeek();
        showRescheduleModal = false;
	}
</script>