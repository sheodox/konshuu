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
			scroll-snap-type: x mandatory;
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
</style>

<div class="f-row gap-2 justify-content-center">
	<button class="a" on:click={prevWeek}>
		<Icon icon="angle-left" />
		<span class="button-text"> Previous Week </span>
	</button>
	<button class="a" on:click={resetWeek} disabled={$weekOffset === 0}>
		<Icon icon="align-center" />
		<span class="button-text"> This Week </span>
	</button>
	<button class="a" on:click={nextWeek}>
		<span class="button-text"> Next Week </span>
		<Icon icon="angle-right" variant="append" />
	</button>
	<button class="a" on:click={() => ($showGotoDate = !$showGotoDate)}>
		<Icon icon="calendar-alt" />
		<span class="button-text">Go To</span>
	</button>
</div>

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
	import { weekOffset, resetWeek, nextWeek, prevWeek, showGotoDate, week, goTo } from './stores/todo';
	import { Loading, Modal, Icon } from 'sheodox-ui';
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
