<style>
	.time {
		text-align: center;
	}
	.expired {
		color: var(--sx-green-400);
	}
	button {
		font-weight: normal;
	}
</style>

<div class="f-column align-items-center justify-content-center f-1 gap-2" class:expired={hasExpired}>
	{#if hasValidDate}
		<button class="time sx-font-size-6 my-4" on:click={() => (showEditUnits = !showEditUnits)}>
			{#if !hasExpired}
				<strong>{formatAbsolute(data.countdownEnd)}</strong> is in
				<br />
				{formatRelative(data.countdownEnd, $now, units)}
			{:else}
				<strong>{formatAbsolute(data.countdownEnd)}</strong>
				<br />
				has passed!
			{/if}
		</button>

		{#if showEditUnits}
			<TimerUnits bind:units />
		{/if}
	{:else}
		Invalid countdown end!
	{/if}
</div>
{#if hasExpired}
	<button on:click={remove} class="secondary">Delete Countdown</button>
{/if}

<script lang="ts">
	import { Anytime } from '../../../shared/types/anytime';
	import { now } from '../stores/app';
	import { differenceInSeconds } from 'date-fns';
	import { anytimeOps, formatRelative } from '../stores/anytime';
	import TimerUnits from './TimerUnits.svelte';

	export let data: Anytime;

	let showEditUnits = false,
		units = 'natural';

	const locale = navigator.languages[0],
		weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' }),
		absoluteFormat = new Intl.DateTimeFormat(locale, {
			dateStyle: 'short',
			timeStyle: 'short',
		});

	$: hasValidDate = data.countdownEnd && data.countdownEnd instanceof Date;
	$: hasExpired = hasValidDate && differenceInSeconds(data.countdownEnd, $now) <= 0;

	function remove() {
		anytimeOps.delete(data.id);
	}

	function formatAbsolute(date: Date) {
		return `${weekdayFormat.format(date)} ${absoluteFormat.format(date)}`;
	}
</script>
