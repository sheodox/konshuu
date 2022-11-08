<RecurringForm
	mode="new"
	on:save={submit}
	bind:name
	bind:list
	bind:startDate
	bind:repeats
	bind:repeatEvery
	bind:weeklyDayRepeats
/>

<script lang="ts">
	import { CalendarDate } from '../../shared/dates';
	import { Day, RecurringRepeats, TodoListType } from '../../shared/types/todos';
	import { recurringOps } from './stores/todo';
	import RecurringForm from './RecurringForm.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ done: void }>();

	let repeats: RecurringRepeats = 'weekly',
		list: TodoListType = 'home',
		name = '',
		startDate: string = CalendarDate.fromDate(new Date()).serialize(),
		repeatEvery = 1,
		weeklyDayRepeats: Day[] = [];

	function submit() {
		recurringOps.new({
			text: name,
			list,
			startDate: CalendarDate.deserialize(startDate),
			repeats,
			repeatEvery,
			weeklyDayRepeats,
		});
		dispatch('done');
	}
</script>
