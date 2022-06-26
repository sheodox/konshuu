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
	{#if $showGotoDate}
		<Modal bind:visible={$showGotoDate} title="Go To">
			<div class="modal-body">
				<label>
					Date to go to
					<br />
					<input type="date" id="go-to-date" bind:this={gotoDateInput} />
				</label>
			</div>
			<div class="modal-footer">
				<button on:click={() => ($showGotoDate = false)} class="secondary">Cancel</button>
				<button on:click={showDate} class="primary">Go To</button>
			</div>
		</Modal>
	{/if}
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
	import { showGotoDate, week, goTo } from './stores/todo';
	import { Loading, Modal } from 'sheodox-ui';
	import Weekly from './Weekly.svelte';
	import Day from './Day.svelte';
	import { CalendarDate } from '../../shared/dates';

	let gotoDateInput: HTMLInputElement;

	function showDate() {
		if (gotoDateInput.value) {
			goTo(CalendarDate.deserialize(gotoDateInput.value).asDate());
			$showGotoDate = false;
		}
	}
</script>
