<style>
	hr {
		width: 50%;
		border-color: var(--sx-pink-500);
	}
</style>

<div class="f-column gap-6">
	<div>
		<form on:submit|preventDefault={newWeekly}>
			<fieldset class="f-column gap-2">
				<legend>New Weekly</legend>
				<TextInput bind:value={name} id="weekly-new-name">Name</TextInput>
				<TextInput bind:value={goal} id="weekly-new-goal" type="number">Goal</TextInput>
				<button disabled={goal < 1 || !name} class="primary">Create</button>
			</fieldset>
		</form>
	</div>
	{#if visibleWeeklies.length}
		<hr />
		<div class="f-column gap-3">
			{#each visibleWeeklies as weekly (weekly.id)}
				<WeeklyEdit {weekly} />
			{/each}
		</div>
	{/if}
</div>

<script lang="ts">
	import { TextInput } from 'sheodox-ui';
	import { weekliesOrdered, weeklyOps } from './stores/weekly';
	import WeeklyEdit from './WeeklyEdit.svelte';

	$: visibleWeeklies = $weekliesOrdered.filter((w) => !w.deleted);

	let name = '',
		goal = 1;

	function newWeekly() {
		weeklyOps.new(name, goal);

		name = '';
		goal = 1;
	}
</script>
