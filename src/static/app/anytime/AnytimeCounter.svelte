<style>
	.inc-btn {
		font-size: var(--sx-font-size-7);
		flex: 1;
		width: 100%;
	}
	button:disabled {
		visibility: hidden;
	}
	.count {
		font-family: monospace;
		width: 100%;
		text-align: center;
	}
	.reset-buttons {
		width: 100%;
	}
</style>

<div class="f-column align-items-center justify-content-center f-1">
	{#if mode === 'counter'}
		<button on:click={increment} disabled={!data.showCountUp || !canCount} class="inc-btn">
			<Icon icon="plus" variant="icon-only" />
			<span class="sr-only">Increment</span>
		</button>
		<div class="count sx-badge-gray">
			{#if data.resetsDaily && canCount}
				<span>{new Date(data.currentDayTime).toLocaleDateString()} </span>
				<br />
			{/if}
			<span class="sx-font-size-9">
				{data.count}
			</span>
		</div>
		<button on:click={decrement} disabled={!data.showCountDown || !canCount} class="inc-btn">
			<Icon icon="minus" variant="icon-only" />
			<span class="sr-only">Decrement</span>
		</button>
	{:else if mode === 'history'}
		<div class="f-1">
			<table>
				<thead>
					<tr>
						<th>Day</th>
						<th>Count</th>
					</tr>
				</thead>
				<tbody>
					{#each data.countHistory as hist}
						<tr>
							<td>{new Date(hist.time).toLocaleDateString()}</td>
							<td>{hist.count}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
	{#if data.resetsDaily}
		<div class="f-row reset-buttons gap-1">
			{#if dayStart !== data.currentDayTime}
				<button class="f-3 m-0 primary" on:click={startDay}>Start New Day</button>
			{/if}
			{#if data.countHistory.length}
				<button class="f-1 m-0" on:click={toggleMode}>
					{#if mode === 'counter'}
						<Icon icon="history" /> History
					{:else if mode === 'history'}
						<Icon icon="calculator" /> Counter
					{/if}
				</button>
			{/if}
		</div>
	{/if}
</div>

<script lang="ts">
	import { startOfDay } from 'date-fns';
	import { Icon } from 'sheodox-ui';
	import { anytimeOps } from '../stores/anytime';
	import { now } from '../stores/app';
	import type { Anytime } from '../../../shared/types/anytime';

	export let data: Anytime;
	let mode: 'counter' | 'history' = 'counter';

	$: dayStart = startOfDay($now).getTime();
	// if the counter is a daily reset timer, we need to start the day before counting makes any sense
	$: canCount = !data.resetsDaily || data.currentDayTime > 0;

	function increment() {
		anytimeOps.increment(data.id);
	}
	function decrement() {
		anytimeOps.decrement(data.id);
	}

	function startDay() {
		anytimeOps.resetDay(data.id);
	}

	function toggleMode() {
		mode = mode === 'counter' ? 'history' : 'counter';
	}
</script>
