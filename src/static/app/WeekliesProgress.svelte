<style>
	p {
		font-size: var(--sx-font-size-4);
	}
</style>

<div class="f-column gap-3 f-1">
	{#each visibleProgress as progress (progress.weeklyId)}
		<WeeklyProgress {progress} />
	{:else}
		<div class="px-5 f-column f-1 align-items-center text-align-center">
			<p>Weeklies are todos that repeat every week that need to be completed a set number of times.</p>
			<p>Weeklies don't need to be completed on any specific day, use them when you want more flexible scheduling.</p>
			<button class="primary" on:click={() => dispatch('openNew')}>Create a new Weekly</button>
		</div>
	{/each}
</div>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { weeklies, weeklyProgressOrdered } from './stores/weekly';
	import WeeklyProgress from './WeeklyProgress.svelte';

	// if a weekly is soft deleted we want to show existing progresses, just not anything going forward
	$: visibleProgress = $weeklyProgressOrdered.filter((p) => {
		// if there is no id it's a placeholder progress, not real progress, until progress is made.
		// for soft deleted weeklies we want to show any old progress.
		if (p.id) {
			return true;
		}

		// for any soft deleted weeklies we don't want to show any placeholder progresses
		const weekly = $weeklies.find((w) => w.id === p.weeklyId);
		return weekly && !weekly.deleted;
	});

	const dispatch = createEventDispatcher<{
		openNew: void;
	}>();
</script>
