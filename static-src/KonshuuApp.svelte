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

<Header slim={true} appName="Konshuu">
	<svg viewbox="0 0 100 100" slot="logo">
		<image xlink:href="/logo.svg"></image>
	</svg>

    <div slot="nav">
		<button
			on:click={prevWeek}
		>
			<Icon icon="angle-left" />
			Previous Week
		</button>
		<button
			on:click={resetWeek}
			disabled={$weekOffset === 0}
		>
			<Icon icon="align-center" />
			This Week
		</button>
		<button
			on:click={nextWeek}
		>
			Next Week
			<Icon icon="angle-right" />
		</button>
		<button on:click={() => hideCompleted.set(!$hideCompleted)}>
            {#if $hideCompleted}
                <Icon icon="eye" />
                Show Completed
            {:else}
				<Icon icon="eye-slash" />
				Hide Completed
            {/if}
		</button>
	</div>
</Header>

<div class="week">
    {#each $week as day, index}
        <Day day={day} dayNumber={index} />
    {/each}
</div>

<script>
    import {week, prevWeek, nextWeek, resetWeek, weekOffset, updateError, hideCompleted} from './todosStore';
    import {Icon, Header} from 'sheodox-ui';
    import Day from './Day.svelte';
</script>