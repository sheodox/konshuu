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
    li:hover {
        background: var(--panel-header-bg);
        border-radius: 0.2rem;
    }
    label {
        flex: 1;
        font-size: 0.8rem;
    }
    button {
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
</style>

<div class="panel">
    <h3 class="header">{listName}</h3>
    <div class="panel-body">
		<ul>
            {#each list as todo}
				<li>
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
            {/each}
		</ul>
		<form on:submit|preventDefault={addTodo}>
			<label class="new-todo">
                <span class="sr-only">New todo</span>
				<input bind:value={newTodoText} type="text" placeholder="new todo" />
                <button>
                    <Icon icon="add" noPadding={true} />
                    <span class="sr-only">Add Todo</span>
                </button>
			</label>
		</form>
    </div>
</div>

<script>
    import {updateWeek} from './todosStore';
    import Icon from './Icon.svelte';
    export let listName = '';
    export let list = [];
    export let date = new Date();
    let newTodoText = '';

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
</script>