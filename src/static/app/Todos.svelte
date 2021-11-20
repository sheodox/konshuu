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
	{#each $week as day}
		<Day {day} />
	{:else}
		<div class="loading">
			<Loading size="large" />
		</div>
	{/each}
</div>

<script lang="ts">
	import { week } from './stores/todo';
	import { Loading } from 'sheodox-ui';
	import Day from './Day.svelte';
</script>
