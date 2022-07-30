<style>
	.time {
		text-align: center;
	}
</style>

<div class="f-column align-items-center justify-content-center f-1">
	{#if hasValidDate}
		<button class="time sx-font-size-6 my-4 fw-normal" on:click={() => (showEditUnits = !showEditUnits)}>
			{formatRelative(data.countdownEnd, $now, units)}
			<br />
			{isPast ? 'since' : 'until'} <strong>{formatAbsolute(data.countdownEnd)}</strong>
		</button>
		{#if showEditUnits}
			<TimerUnits bind:units />
		{/if}
	{:else}
		Invalid countdown start!
	{/if}
</div>

<script lang="ts">
	import { Anytime } from '../../../shared/types/anytime';
	import { now } from '../stores/app';
	import { isBefore } from 'date-fns';
	import TimerUnits from './TimerUnits.svelte';
	import { formatRelative } from '../stores/anytime';

	export let data: Anytime;

	const locale = navigator.languages[0],
		weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' }),
		absoluteFormat = new Intl.DateTimeFormat(locale, {
			dateStyle: 'short',
			timeStyle: 'short',
		});

	let units = 'natural',
		showEditUnits = false;

	$: hasValidDate = data.countdownEnd && data.countdownEnd instanceof Date;
	$: isPast = hasValidDate && isBefore(data.countdownEnd, $now);

	function formatAbsolute(date: Date) {
		return `${weekdayFormat.format(date)} ${absoluteFormat.format(date)}`;
	}
</script>
