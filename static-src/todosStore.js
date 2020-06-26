import {writable} from 'svelte/store';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const week = writable([]);
export const weekOffset = writable(0);
let offset;

export const nextWeek = () => {
	weekOffset.update(offset => offset + 1)
}
export const prevWeek = () => {
	weekOffset.update(offset => offset - 1)
}

export const resetWeek = () => {
	weekOffset.set(0);
}

export const updateWeek = async () => {
	const today = new Date();
	today.setHours(12);
	const timestampInWeek = today.getTime() + offset * WEEK_MS;

	const newWeek = (await fetch(`/list/week/${encodeURIComponent(timestampInWeek)}`).then(res => res.json()))
	newWeek.days.forEach(day => {
		day.date = new Date(day.date);
	})
	week.set(newWeek.days);
}

weekOffset.subscribe(o => {
	offset = o
	updateWeek();
});
setInterval(updateWeek, 10000);

