<style>
	.week {
		display: flex;
		flex-direction: row;
		flex: 1;
		overflow: auto;
	}
	.loading {
		flex: 1;
		place-self: center;
	}
	@media (max-width: 600px) {
		.week {
			scroll-snap-type: y mandatory;
		}
	}
</style>

<div class="week gap-2 p-1">
	{#if $week.length}
		{#each $week as day}
			<Day {day} />
		{/each}
		<Weekly />
	{:else}
		<div class="loading">
			<Loading size="large" />
		</div>
	{/if}
</div>

<script lang="ts">
	import { week } from './stores/todo';
	import { Loading } from 'sheodox-ui';
	import Weekly from './Weekly.svelte';
	import Day from './Day.svelte';
</script>
