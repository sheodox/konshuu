<style>
</style>

<Checkbox checked={complete} on:change={change}>{todo.text}</Checkbox>

<script lang="ts">
	import { Checkbox } from 'sheodox-ui';
	import { recurringCompletionOps, recurringTodoCompletion } from './stores/todo';
	import type { CalendarDate } from '../../shared/dates';
	import type { RecurringTodo } from '../../shared/types/todos';

	export let calendarDate: CalendarDate;
	export let todo: RecurringTodo;

	$: complete = $recurringTodoCompletion.some(
		(comp) => comp.date.isSameDate(calendarDate) && comp.recurringTodoId === todo.id
	);

	function change() {
		const completion = $recurringTodoCompletion.find(
			(comp) => comp.date.isSameDate(calendarDate) && comp.recurringTodoId === todo.id
		);

		if (complete && completion) {
			recurringCompletionOps.delete(completion.id);
		} else if (!completion) {
			recurringCompletionOps.complete({
				date: calendarDate,
				recurringTodoId: todo.id,
			});
		}
	}
</script>
