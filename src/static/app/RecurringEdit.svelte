<RecurringForm
	mode="edit"
	on:save={submit}
	on:delete={deleteTodo}
	bind:name
	bind:list
	bind:startDate
	bind:repeats
	bind:repeatEvery
	bind:weeklyDayRepeats
/>

<script lang="ts">
	import { CalendarDate } from '../../shared/dates';
	import { Day, RecurringRepeats, TodoListType, RecurringTodo } from '../../shared/types/todos';
	import { recurringOps } from './stores/todo';
	import RecurringForm from './RecurringForm.svelte';
	import { createEventDispatcher } from 'svelte';

	export let todo: RecurringTodo;
	const dispatch = createEventDispatcher<{ done: void }>();

	let repeats: RecurringRepeats = todo.repeats,
		list: TodoListType = todo.list,
		name = todo.text,
		startDate: string = todo.startDate.serialize(),
		repeatEvery = todo.repeatEvery,
		weeklyDayRepeats: Day[] = [...todo.weeklyDayRepeats];

	function submit() {
		recurringOps.edit(todo.id, {
			text: name,
			list,
			startDate: CalendarDate.deserialize(startDate),
			repeats,
			repeatEvery,
			weeklyDayRepeats,
		});

		dispatch('done');
	}

	function deleteTodo() {
		if (
			confirm(
				`Are you sure you want to delete the recurring todo "${todo.text}"? This will delete all records of past completion.`
			)
		) {
			recurringOps.delete(todo.id);
			dispatch('done');
		}
	}
</script>
