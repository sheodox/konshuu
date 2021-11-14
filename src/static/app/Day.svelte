<style>
	div {
		flex-grow: 1;
		flex-shrink: 0;
		flex-basis: 15rem;
		overflow: auto;
		/* allow the .today background to stick out as a 1px border */
		padding: 1px;
	}
	.today {
		background: var(--shdx-accent-gradient);
		border-radius: 0.2rem;
	}
	h2 {
		white-space: nowrap;
		text-align: center;
	}
	/* this button lets you go between adjacent Saturday/Sundays on mobile.
	without this you need to hit prev/next week and scroll across the entire
	week just to get to the day that follows a week boundary. */
	.quick-week-switch {
		display: none;
	}
	@media (max-width: 600px) {
		div {
			scroll-snap-align: start;
			flex-basis: 100%;
			/* 100% width minus the horizontal padding */
			max-width: calc(100vw - 0.4rem);
		}

		.quick-week-switch {
			display: block;
		}
	}
</style>

<div
	id="todo-day-{day.date.getDay()}"
	class="f-column"
	class:today={day.date.serialize() === $today}
	use:scrollToView={day.date.isToday()}
>
	<h2>{day.date.dayName()} {day.date.toLocaleDateString()}</h2>
	<!-- don't show the work list on the weekend -->
	{#if !day.date.isWeekend()}
		<TodoList calendarDate={day.date} listName="Work" list={day.work} listType="work" />
	{/if}
	<TodoList calendarDate={day.date} listName="Home" list={day.home} listType="home" />
	{#if day.date.isWeekend()}
		<button class="quick-week-switch m-0 mt-1" on:click={quickWeekSwitch}>
			{#if day.date.getDay() === 6}
				<span class="mr-1">Next Week</span>
				<Icon icon="chevron-right" variant="icon-only" />
			{:else}
				<Icon icon="chevron-left" />
				Last Week
			{/if}
		</button>
	{/if}
</div>

<script lang="ts">
	import { tick } from 'svelte';
	import { Icon } from 'sheodox-ui';
	import { focusNewTodoInput, nextWeek, prevWeek, today } from './stores/todo';
	import TodoList from './TodoList.svelte';
	import type { DayTodos } from '../../shared/types/todos';

	export let day: DayTodos;

	function scrollToView(el: HTMLElement, isToday: boolean) {
		//if this Day is today, scroll it into view
		if (isToday) {
			//the first time this component is rendered we won't be able to scroll any further to the right.
			//e.x. if today is friday, the first time this function runs the Saturday element won't exist yet,
			//so scrolling into view now wouldn't center correctly. as it's probably useful to be able to see
			//the following days we want to wait for a tick to ensure all the days exist and horizontally scrolling
			//can center this day element
			tick().then(() => {
				el.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
					inline: 'center',
				});
			});
		}
	}

	function quickWeekSwitch() {
		const isNext = day.date.getDay() === 6;
		if (isNext) {
			nextWeek();
			focusNewTodoInput(0);
		} else {
			prevWeek();
			focusNewTodoInput(6);
		}
	}
</script>
