<style>
	hr {
		width: 50%;
		border-color: var(--sx-pink-500);
	}
</style>

<div class="f-column gap-6">
	<div>
		<form on:submit|preventDefault={newWeekly}>
			<Fieldset legend="New Weekly">
				<div class="mt-2 f-column gap-2">
					<TextInput bind:value={name} id="weekly-new-name">Name</TextInput>
					<TextInput bind:value={goal} id="weekly-new-goal" type="number">Goal</TextInput>
					<button disabled={goal < 1 || !name} class="primary">Create</button>
				</div>
			</Fieldset>
		</form>
	</div>
	{#if visibleWeeklies.length}
		<hr />
		<div class="f-column gap-4">
			{#each visibleWeeklies as weekly (weekly.id)}
				<WeeklyEdit {weekly} />
			{/each}
		</div>
	{/if}
</div>

<script lang="ts">
	import { Fieldset, TextInput } from 'sheodox-ui';
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
