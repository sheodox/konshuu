<RecurringHeader bind:mode />

{#if mode === 'view'}
	<div class="mt-3">
		<TabList bind:selectedTab {tabs} />
	</div>
	<div class="f-column gap-3 f-1">
		{#each tabs as tab}
			<Tab tabId={tab.id} {selectedTab}>
				{#each filterList($recurringTodosOrdered, tab.id) as todo (todo.id)}
					<RecurringView {todo} on:edit={() => editMode(todo)} />
				{:else}
					<p class="text-align-center">You don't have any recurring todos yet!</p>
				{/each}
			</Tab>
		{/each}
	</div>
{:else if mode === 'new'}
	<RecurringNew on:done={toView} />
{:else if mode === 'edit'}
	<RecurringEdit todo={editingTodo} on:done={toView} />
{/if}

<script lang="ts">
	import { TabList, Tab } from 'sheodox-ui';
	import RecurringNew from './RecurringNew.svelte';
	import RecurringEdit from './RecurringEdit.svelte';
	import RecurringView from './RecurringView.svelte';
	import RecurringHeader from './RecurringHeader.svelte';
	import { recurringTodosOrdered } from './stores/todo';
	import type { RecurringTodo } from '../../shared/types/todos';

	let mode: 'view' | 'edit' | 'new' = 'view';
	let editingTodo: RecurringTodo;
	let selectedTab = 'home';

	const tabs = [
		{
			id: 'home',
			title: 'Home',
		},
		{
			id: 'work',
			title: 'Work',
		},
	];

	function editMode(todo: RecurringTodo) {
		editingTodo = todo;
		mode = 'edit';
	}

	function toView() {
		mode = 'view';
	}

	function filterList(todos: RecurringTodo[], list: string) {
		return todos.filter((todo) => todo.list === list);
	}
</script>
