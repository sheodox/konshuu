<style>
	.time {
		text-align: center;
	}
	.expired {
		color: var(--sx-green-400);
	}
</style>

<div class="f-column align-items-center justify-content-center f-1" class:expired={hasExpired}>
	{#if hasValidDate}
		<div class="time sx-font-size-6 my-4">
			{#if !hasExpired}
				<strong>{formatAbsolute(data.countdownEnd)}</strong> is in
				<br />
				{formatRelative(data.countdownEnd, $now)}
			{:else}
				<strong>{formatAbsolute(data.countdownEnd)}</strong>
				<br />
				has passed!
			{/if}
		</div>
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
	import { formatDuration, intervalToDuration, differenceInSeconds } from 'date-fns';
	import { anytimeOps } from '../stores/anytime';

	export let data: Anytime;

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

	function formatRelative(date: Date, now: Date) {
		const duration = intervalToDuration({ start: now, end: date }),
			secondsDifference = differenceInSeconds(date, now);
		// we don't show seconds for far off dates as it's distracting to see them change constantly, but for close
		// dates we should show the full timer
		if (secondsDifference < 60) {
			return formatDuration(duration);
		}
		return formatDuration(duration, { format: ['years', 'months', 'weeks', 'days', 'hours', 'minutes'] });
	}
</script>
