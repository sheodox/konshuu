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
    }
	input[type="text"] {
        font-size: 0.8rem;
        width: 100%;
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
    small {
        color: gray;
        text-align: center;
    }
    progress {
        height: 2px;
    }
    .draggingOver {
        background: var(--panel-header-bg);
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
        {#if list.some(t => !t.completed)}
            <button
                on:click={() => showRescheduleModal = true}
                title="Reschedule unfinished todos"
            >
                <Icon icon="calendar-day" noPadding={true}/>
                <span class="sr-only">Reschedule undone todos</span>
            </button>
        {/if}
	</div>
    <progress value={completedCount} max={list.length} aria-label="todo completion for this list"></progress>
	<div class="panel-body f-column">
		<ul>
            {#each list as todo (todo.todo_id)}
				<TodoItem {todo} {listType} {date} />
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
                    <Icon icon="plus" noPadding={true} />
                    <span class="sr-only">Add Todo</span>
                </button>
			</label>
		</form>
    </div>
</div>
{#if showRescheduleModal}
	<Reschedule bind:visible={showRescheduleModal} on:reschedule={reschedule} todoDate={date} {listType}/>
{/if}

<script>
	import {updateWeek, hideCompleted} from './todosStore';
	import Reschedule from './Reschedule.svelte';
	import {Icon} from 'sheodox-ui';
	import TodoItem from './TodoItem.svelte';
    import {draggingOverList, getRescheduleDestination, serializeDate} from "./reschedule-utils";
    export let listName = ''; //list display name
	export let listType = ''; //list type
	export let list = [];
    export let date;
    const listId = `${listName}-${date.getDay()}`
    let newTodoText = '',
        showRescheduleModal = false;

    $: completedCount = list.filter(todo => todo.completed).length;

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

    async function reschedule(e) {
        //serialize the date the same way the date input would use for the value
        await fetch(`/list/reschedule/${listType}/${serializeDate(date)}/${serializeDate(getRescheduleDestination(e.detail))}`);
        await updateWeek();
	}

	async function drop(event) {
        const todoId = event.dataTransfer.getData('todoId');
        $draggingOverList = null;
        await fetch(`/list/reschedule-one/${encodeURIComponent(todoId)}/${serializeDate(date)}/`)
        await updateWeek();
    }
    function dragOver(event) {
        $draggingOverList = listId;
        event.dataTransfer.dropEffect = "move"
    }
</script>