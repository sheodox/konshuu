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
    @media (max-width: 700px) {
        header.controls {
            flex-direction: column;
        }
    }
    .controls {
        display: flex;
        flex-direction: row;
		justify-content: space-evenly;
	}
	.error-banner {
        text-align: center;
        color: black;
        background: var(--accent-red);
    }
    svg.logo {
        --svg-size: 3rem;
        width: var(--svg-size);
		height: var(--svg-size);
    }
    header > div {
        display: flex;
        flex-direction: row;
        align-self: center;
    }
</style>
{#if $updateError}
    <div class="error-banner">
        <p>{$updateError}</p>
    </div>
{/if}
<header class="controls panel">
    <div>
		<svg viewbox="0 0 100 100" class="logo">
			<image xlink:href="/logo.svg"></image>
		</svg>
		<h1>
			Konshuu
		</h1>
    </div>

    <div>
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
</header>
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