<RecurringHeader bind:mode />

{#if mode === 'view'}
	<div class="f-column gap-2 f-1">
		{#each $recurringTodosOrdered as todo (todo.id)}
			<RecurringView {todo} on:edit={() => editMode(todo)} />
		{:else}
			<p class="text-align-center">You don't have any recurring todos yet!</p>
		{/each}
	</div>
{:else if mode === 'new'}
	<RecurringNew on:done={toView} />
{:else if mode === 'edit'}
	<RecurringEdit todo={editingTodo} on:done={toView} />
{/if}

<script lang="ts">
	import RecurringNew from './RecurringNew.svelte';
	import RecurringEdit from './RecurringEdit.svelte';
	import RecurringView from './RecurringView.svelte';
	import RecurringHeader from './RecurringHeader.svelte';
	import { recurringTodosOrdered } from './stores/todo';
	import { RecurringTodo } from '../../shared/types/todos';

	let mode: 'view' | 'edit' | 'new' = 'view';
	let editingTodo: RecurringTodo;

	function editMode(todo: RecurringTodo) {
		editingTodo = todo;
		mode = 'edit';
	}

	function toView() {
		mode = 'view';
	}
</script>
