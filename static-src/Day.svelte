<style>
    div {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 0;
		flex-basis: 15rem;
		padding: 0.3rem;
		margin: 0.2rem;
	}
    .today {
        background: var(--accent-gradient);
        border-radius: 0.2rem;
    }
    h2 {
        white-space: nowrap;
        text-align: center;
    }
</style>

<div class:today={isToday} use:scrollToView={isToday}>
    <h2>{day.dayName} {day.date.toLocaleDateString()}</h2>
	<!-- don't show the work list on the weekend -->
    {#if dayNumber !== 0 && dayNumber !== 6}
		<TodoList date={day.date} listName="Work" list={day.work} listType="work" />
    {/if}
	<TodoList date={day.date} listName="Home" list={day.home} listType="home" />
</div>

<script>
    import {tick} from 'svelte';
    import TodoList from './TodoList.svelte';
    export let day = {};
    export let dayNumber = 0;

    let isToday = false;
    let dayContainer;
    $: {
        isToday = new Date().toLocaleDateString() === day.date.toLocaleDateString();
    }
    async function scrollToView(el) {
    	//if this Day is today, scroll it into view
		if (isToday) {
			//the first time this component is rendered we won't be able to scroll any further to the right.
			//e.x. if today is friday, the first time this function runs the Saturday element won't exist yet,
			//so scrolling into view now wouldn't center correctly. as it's probably useful to be able to see
            //the following days we want to wait for a tick to ensure all the days exist and horizontally scrolling
            //can center this day element
			await tick();
			el.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center'
			});
		}
	}
</script>