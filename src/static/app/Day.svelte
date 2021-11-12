<style>
	div {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		flex-shrink: 0;
		flex-basis: 15rem;
		padding: 0.3rem;
		margin: 0.2rem;
		overflow: auto;
	}
	.today {
		background: var(--shdx-accent-gradient);
		border-radius: 0.2rem;
	}
	h2 {
		white-space: nowrap;
		text-align: center;
	}
	@media (max-width: 600px) {
		div {
			scroll-snap-align: start;
			flex-basis: 100%;
			/* 100% width minus the horizontal padding */
			max-width: calc(100vw - 0.4rem);
		}
	}
</style>

<div class:today={day.date.serialize() === $today} use:scrollToView={day.date.isToday()}>
	<h2>{day.date.dayName()} {day.date.toLocaleDateString()}</h2>
	<!-- don't show the work list on the weekend -->
	{#if !day.date.isWeekend()}
		<TodoList calendarDate={day.date} listName="Work" list={day.work} listType="work" />
	{/if}
	<TodoList calendarDate={day.date} listName="Home" list={day.home} listType="home" />
</div>

<script lang="ts">
	import { tick } from 'svelte';
	import { today } from './stores/todo';
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
</script>
