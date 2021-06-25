<style>
    .week {
        display: flex;
        flex-direction: row;
        flex: 1;
        overflow: auto;
    }
    @media (max-width: 600px) {
        .week {
            scroll-snap-type: y mandatory;
        }
    }
</style>

<div class="week">
    {#each $week as day, index}
        <Day day={day} dayNumber={index} />
    {/each}
</div>

<script>
    import {week} from './todosStore';
    import Day from './Day.svelte';
</script>