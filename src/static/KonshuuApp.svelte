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
        background: var(--shdx-red-400);
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

    <nav slot="nav">
		<ul>
			<li>
				<button
					class="a"
					on:click={prevWeek}
				>
					<Icon icon="angle-left" />
					<span class="button-text">
						Previous Week
					</span>
				</button>
			</li>

            <li>
				<button
					class="a"
					on:click={resetWeek}
					disabled={$weekOffset === 0}
				>
					<Icon icon="align-center" />
					<span class="button-text">
						This Week
					</span>
				</button>
			</li>
            <li>
				<button
					class="a"
					on:click={nextWeek}
				>
					<span class="button-text">
						Next Week
					</span>
					<Icon icon="angle-right" />
				</button>
			</li>
            <li>
                <UserMenu />
			</li>
		</ul>
	</nav>
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
	import UserMenu from "./UserMenu.svelte";
</script>