<style>
    .week {
        display: flex;
        flex-direction: row;
        height: 100%;
    }
    .day {
		margin: 0.2rem;
	}

    @media (max-width: 1000px) {
        .week {
            flex-direction: column;
        }
    }
    .controls {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
</style>

<div class="controls panel">
    <button
        on:click={prevWeek}
    >
        <Icon icon="arrow_back_ios"></Icon>
        Previous Week
    </button>
        <button
            on:click={resetWeek}
            disabled={$weekOffset === 0}
        >
            <Icon icon="vertical_align_center" />
            This Week
        </button>
	<button
		on:click={nextWeek}
	>
		Next Week
		<Icon icon="arrow_forward_ios"></Icon>
	</button>
</div>
<div class="week">
    {#each $week as day, index}
        <div class="day">
			<Day day={day} dayNumber={index} />
		</div>
    {/each}
</div>

<script>
    import {week, prevWeek, nextWeek, resetWeek, weekOffset} from './todosStore';
    import Icon from './Icon.svelte';
    import Day from './Day.svelte';
</script>