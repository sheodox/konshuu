<style>
	input {
		width: 100%;
	}
</style>

<label>
	Date
	<br />
	<input type="date" bind:value={date} class="py-2" />
</label>

<label>
	Time
	<br />
	<input type="time" bind:value={time} class="py-2" />
</label>

<script lang="ts">
	import { AnytimeNew } from '../../../shared/types/anytime';

	export let data: Partial<AnytimeNew>;
	export let valid = false;
	let { date, time } = getInitial();

	$: parseDate(date, time);

	function parseDate(dateString: string, timeString: string) {
		if (!dateString || !timeString || dateString === '' || timeString === '') {
			valid = false;
			return;
		}

		const [year, month, day] = dateString.split('-').map((num) => +num),
			[hours, minutes] = timeString.split(':').map((num) => +num);

		data.countdownEnd = new Date(year, month - 1, day, hours, minutes, 0, 0);
		valid = true;
	}

	function padZero(num: number) {
		return ('' + num).padStart(2, '0');
	}

	function getInitial() {
		const date = data.countdownEnd,
			hasValidDate = date instanceof Date;
		return {
			date: hasValidDate ? [date.getFullYear(), padZero(date.getMonth() + 1), padZero(date.getDate())].join('-') : '',
			time: hasValidDate ? [date.getHours(), date.getMinutes()].map(padZero).join(':') : '',
		};
	}
</script>
