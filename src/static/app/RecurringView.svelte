<style></style>

<fieldset>
	<legend>{todo.text} - ({todo.list})</legend>
	<div class="f-row justify-content-between">
		<p>
			Starting {startAsDate.toLocaleDateString()},
			{#if todo.repeats === 'daily'}
				repeats every {todo.repeatEvery} day(s).
			{:else if todo.repeats === 'weekly'}
				repeats every {todo.repeatEvery} week(s) on {formatWeekdays(todo.weeklyDayRepeats)}.
			{:else if todo.repeats === 'monthly'}
				repeats every {todo.repeatEvery} month(s) on the {formatMonthly(startAsDate)}.
			{:else if todo.repeats === 'yearly'}
				repeats every {todo.repeatEvery} year(s) on {formatYearly(startAsDate)}.
			{/if}
		</p>
		<button on:click={edit}>
			<Icon icon="cog" variant="icon-only" />
			<span class="sr-only">Edit recurring todo</span>
		</button>
	</div>
</fieldset>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { format } from 'date-fns';
	import { createEventDispatcher } from 'svelte';
	import type { RecurringTodo, Day } from '../../shared/types/todos';

	const dispatch = createEventDispatcher<{ edit: void }>();

	export let todo: RecurringTodo;
	$: startAsDate = todo.startDate.asDate();

	function formatYearly(date: Date) {
		return format(date, 'MMMM do');
	}
	function formatMonthly(date: Date) {
		return format(date, 'do');
	}

	function formatWeekdays(days: Day[]) {
		if (!days.length) {
			return 'but no days of the week are configured.';
		}

		const formatted: string[] = [];

		// assemble a nice list of days in the order of weekdays, so it doesn't look
		// like a random assortment of days because of the order they clicked
		if (days.includes('sunday')) {
			formatted.push('Sunday');
		}
		if (days.includes('monday')) {
			formatted.push('Monday');
		}
		if (days.includes('tuesday')) {
			formatted.push('Tuesday');
		}
		if (days.includes('wednesday')) {
			formatted.push('Wednesday');
		}
		if (days.includes('thursday')) {
			formatted.push('Thursday');
		}
		if (days.includes('friday')) {
			formatted.push('Friday');
		}
		if (days.includes('saturday')) {
			formatted.push('Saturday');
		}

		return formatted.length > 1
			? formatted.slice(0, days.length - 1).join(', ') + ', and ' + formatted.at(-1)
			: formatted[0];
	}

	function edit() {
		dispatch('edit');
	}
</script>
