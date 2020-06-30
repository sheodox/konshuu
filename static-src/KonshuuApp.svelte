<style>
    .week {
        display: flex;
        flex-direction: row;
        flex: 1;
        overflow: auto;
    }

    @media (max-width: 1000px) {
        .week {
            flex-direction: column;
			overflow: unset;
		}
    }
    .controls {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
    .error-banner {
        text-align: center;
        color: black;
        background: var(--accent-red);
    }
</style>
{#if $updateError}
    <div class="error-banner">
        <p>{$updateError}</p>
    </div>
{/if}
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
        <Day day={day} dayNumber={index} />
    {/each}
</div>

<script>
    import {week, prevWeek, nextWeek, resetWeek, weekOffset, updateError} from './todosStore';
    import Icon from './Icon.svelte';
    import Day from './Day.svelte';
</script>