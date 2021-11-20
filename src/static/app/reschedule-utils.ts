import { writable } from 'svelte/store';
import { CalendarDate } from '../../shared/dates';

export const draggingOverList = writable(null);

export const DAY_MS = 24 * 60 * 60 * 1000;

function getDateForDayIndexPastSunday(dayIndex: number, originalDate: CalendarDate) {
	// example: find the date of the next monday
	// 8 days is the day offset from this week's sunday to next monday,
	// subtract however many days of the current week has passed
	const daysUntilMonday = dayIndex - originalDate.getDay();
	return new Date(originalDate.asDate().getTime() + DAY_MS * daysUntilMonday);
}

export function getRescheduleDestination(target: string, originalDate: CalendarDate) {
	let date;
	if (target === 'today') {
		date = new Date();
	} else if (target === 'tomorrow') {
		date = new Date(Date.now() + DAY_MS);
	} else if (target === 'next-monday') {
		date = getDateForDayIndexPastSunday(8, originalDate);
	} else if (target === 'saturday') {
		date = getDateForDayIndexPastSunday(6, originalDate);
	} else if (target === 'next-week') {
		date = new Date(originalDate.asDate().getTime() + DAY_MS * 7);
	} else {
		// the date input gives a date like 'YYYY-MM-DD'
		const [year, month, day] = target.split('-');
		date = new Date(+year, +month - 1, +day);
	}

	return CalendarDate.fromDate(date);
}
