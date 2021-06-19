import {writable} from 'svelte/store';
import {CalendarDate} from "../server/shared/dates";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const week = writable([]);
export const updateError = writable(null);
export const weekOffset = writable(0);
export const hideCompleted = writable(false);
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

	try {
		const today = CalendarDate.fromDate(new Date(timestampInWeek)),
			newWeek = await fetch(`/todo/week/${today.serialize()}`).then(res => res.json())

		newWeek.days.forEach(day => {
			day.date = CalendarDate.deserialize(day.date);
		})
		updateError.set(null);
		week.set(newWeek.days);
	}catch(e) {
		updateError.set('Error connecting to the Konshuu server!');
	}
}

weekOffset.subscribe(o => {
	offset = o
	updateWeek();
});
setInterval(updateWeek, 10000);

export function copyToClipboard(text) {
	const el = document.createElement('textarea');
	document.body.appendChild(el);
	el.textContent = text;
	el.select();
	document.execCommand('copy');
	el.remove();
}
