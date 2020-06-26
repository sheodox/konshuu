<style>
    div {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 0.3rem;
		margin: 0.2rem;
	}
    .today {
        background: var(--accent-gradient);
        border-radius: 0.2rem;
    }
    .today h2 {
        color: black;
    }
</style>

<div class:today={isToday}>
    <h2>{day.dayName} {day.date.toLocaleDateString()}</h2>
	<!-- don't show the work list on the weekend -->
    {#if dayNumber !== 0 && dayNumber !== 6}
		<TodoList date={day.date} listName="Work" list={day.work} />
    {/if}
	<TodoList date={day.date} listName="Home" list={day.home} />
</div>

<script>
    import TodoList from './TodoList.svelte';
    export let day = {};
    export let dayNumber = 0;

    let isToday = false;
    $: {
        isToday = new Date().toLocaleDateString() === day.date.toLocaleDateString();
    }
</script>