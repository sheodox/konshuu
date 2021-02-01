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
    @media (max-width: 700px) {
        /* hide the button text with .sr-only styles when the screen is small or it'll wrap */
		.button-text {
			position: absolute;
			left: -10000px;
			top: auto;
			width: 1px;
			height: 1px;
			overflow: hidden;
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
			<span class="button-text">
				Previous Week
			</span>
		</button>
		<button
			on:click={resetWeek}
			disabled={$weekOffset === 0}
		>
			<Icon icon="align-center" />
			<span class="button-text">
				This Week
			</span>
		</button>
		<button
			on:click={nextWeek}
		>
            <span class="button-text">
				Next Week
			</span>
			<Icon icon="angle-right" />
		</button>
		<button on:click={() => hideCompleted.set(!$hideCompleted)}>
            {#if $hideCompleted}
                <Icon icon="eye" />
                <span class="button-text">
					Show Completed
				</span>
            {:else}
				<Icon icon="eye-slash" />
                <span class="button-text">
					Hide Completed
				</span>
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