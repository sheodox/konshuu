<style>
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
</style>

{#if $activeRoute === 'app'}
	<li>
		<button class="a" on:click={prevWeek}>
			<Icon icon="angle-left" />
			<span class="button-text"> Previous Week </span>
		</button>
	</li>

	<li>
		<button class="a" on:click={resetWeek} disabled={$weekOffset === 0}>
			<Icon icon="align-center" />
			<span class="button-text"> This Week </span>
		</button>
	</li>
	<li>
		<button class="a" on:click={nextWeek}>
			<span class="button-text"> Next Week </span>
			<Icon icon="angle-right" variant="append" />
		</button>
	</li>
{:else}
	<li>
		<Link classes="a" href="/">
			<Icon icon="calendar-week" />
			Todo Planner
		</Link>
	</li>
{/if}

<script lang="ts">
	import { weekOffset, resetWeek, nextWeek, prevWeek } from './stores/todo';
	import { Icon } from 'sheodox-ui';
	import { activeRoute } from './stores/routing';
	import Link from './Link.svelte';
</script>
