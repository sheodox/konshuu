<style>
	.time {
		text-align: center;
	}
</style>

<div class="f-column align-items-center justify-content-center f-1">
	{#if hasValidDate}
		<div class="time sx-font-size-6 my-4">
			{formatRelative(data.countdownEnd, $now)}
			<br />
			{isPast ? 'since' : 'until'} <strong>{formatAbsolute(data.countdownEnd)}</strong>
		</div>
	{:else}
		Invalid countdown start!
	{/if}
</div>

<script lang="ts">
	import { Anytime } from '../../../shared/types/anytime';
	import { now } from '../stores/app';
	import { formatDuration, intervalToDuration, differenceInSeconds, isBefore } from 'date-fns';

	export let data: Anytime;

	const locale = navigator.languages[0],
		weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' }),
		absoluteFormat = new Intl.DateTimeFormat(locale, {
			dateStyle: 'short',
			timeStyle: 'short',
		});

	$: hasValidDate = data.countdownEnd && data.countdownEnd instanceof Date;
	$: isPast = hasValidDate && isBefore(data.countdownEnd, $now);

	function formatAbsolute(date: Date) {
		return `${weekdayFormat.format(date)} ${absoluteFormat.format(date)}`;
	}

	function formatRelative(date: Date, now: Date) {
		const duration = intervalToDuration({ start: now, end: date }),
			secondsDifference = Math.abs(differenceInSeconds(date, now));
		// we don't show seconds for far off dates as it's distracting to see them change constantly, but for close
		// dates we should show the full timer
		if (secondsDifference < 60) {
			return formatDuration(duration);
		}
		return formatDuration(duration, { format: ['years', 'months', 'weeks', 'days', 'hours', 'minutes'] });
	}
</script>
