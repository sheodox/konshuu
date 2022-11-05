<style lang="scss">
	.weekly.done {
		opacity: 0.5;

		fieldset {
			border-color: transparent;
		}
	}
	fieldset {
		--fieldset-background-color: var(--sx-gray-500);
		border: none;
		background-color: var(--sx-gray-500);
		overflow: hidden;

		legend {
			font-size: var(--sx-font-size-3);
			color: var(--sx-text-color);
			border-radius: 2px;
			position: relative;
			margin-left: var(--sx-spacing-3);
			span {
				background: var(--fieldset-background-color);
				font-weight: bold;
			}

			&::after,
			&::before {
				content: ' ';
				width: 0;
				height: 0;
				position: absolute;
				background-color: transparent;
				border: 0.65rem solid transparent;
			}
			&::after {
				border-left-color: var(--fieldset-background-color);
			}
			&::before {
				transform: translateX(-100%);
				border-right-color: var(--fieldset-background-color);
			}
		}
	}
</style>

<div class="weekly" class:done={showing === 'view' && progress.progress >= progress.goal}>
	<fieldset>
		<legend><span>{weekly.name}</span></legend>

		<div class="f-row justify-content-between align-items-center">
			<div>
				<button on:click={progressUp} title="Mark one completion" disabled={showing === 'edit'}>
					<Icon icon="check-circle" variant="icon-only" />
					<span class="sr-only">Mark one completion</span>
				</button>
				<label for="prog-{weekly.id}">
					{progress.progress} of {progress.goal} time{progress.goal === 1 ? '' : 's'}
				</label>
			</div>
			<button on:click={toggleEdit} title="Edit progress this weeek" aria-pressed={showing === 'edit'}
				><Icon icon="cog" variant="icon-only" /><span class="sr-only">Edit</span></button
			>
		</div>
		{#if progress.progress < progress.goal}
			<Progress value={Math.min(progress.progress, progress.goal)} max={progress.goal} id="prog-{weekly.id}" />
		{/if}
		{#if showing === 'edit'}
			<form on:submit|preventDefault={edit} class="f-column gap-2 mt-4">
				<TextInput id="{weekly.id}-progress" type="number" bind:value={newProgress}>Current Progress</TextInput>
				<TextInput id="{weekly.id}-goal" type="number" bind:value={newGoal}>Goal This Week</TextInput>
				<small>Changing the goal here only affects this week's goal.</small>
				{#if progress.updatedAt}
					<small>Last updated {progress.updatedAt.toLocaleString()}</small>
				{/if}
				<div class="f-row">
					<button disabled={newProgress < 0 || newGoal < 0} class="f-1 primary">Save</button>
					<button type="button" on:click={clear} class="danger">Clear Progress</button>
					<button type="button" on:click={() => (showing = 'view')}>Cancel</button>
				</div>
			</form>
		{/if}
	</fieldset>
</div>

<script lang="ts">
	import { Icon, Progress, TextInput } from 'sheodox-ui';
	import { weeklies, weeklyOps } from './stores/weekly';
	import { WeeklyProgress } from '../../shared/types/todos';
	import { startOfViewedWeek } from './stores/todo';
	import { CalendarDate } from '../../shared/dates';

	export let progress: WeeklyProgress;
	let showing: 'view' | 'edit' = 'view';

	let newProgress: number, newGoal: number;

	$: weekly = $weeklies.find((w) => w.id === progress.weeklyId);

	function progressUp() {
		weeklyOps.progress(weekly.id, progress.id, CalendarDate.deserialize($startOfViewedWeek));
	}
	function toggleEdit() {
		if (showing === 'view') {
			newProgress = progress.progress;
			newGoal = progress.goal;
			showing = 'edit';
		} else {
			showing = 'view';
		}
	}

	function edit() {
		weeklyOps.progressEdit(weekly.id, progress.id, CalendarDate.deserialize($startOfViewedWeek), {
			goal: newGoal,
			progress: newProgress,
		});

		showing = 'view';
	}

	function clear() {
		weeklyOps.progressDelete(progress.id);
		showing = 'view';
	}
</script>
