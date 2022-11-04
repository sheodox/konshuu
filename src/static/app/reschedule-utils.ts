import { writable } from 'svelte/store';
import { addDays } from 'date-fns';
import { CalendarDate } from '../../shared/dates';

export const draggingOverList = writable(null);

export const DAY_MS = 24 * 60 * 60 * 1000;

function getDateForDayIndexPastSunday(dayIndex: number, originalDate: CalendarDate) {
	// example: find the date of the next monday
	// 8 days is the day offset from this week's sunday to next monday,
	// subtract however many days of the current week has passed
	const daysUntil = dayIndex - originalDate.getDay();
	return addDays(originalDate.asDate().getTime(), daysUntil);
}

export function getRescheduleDestination(target: string, originalDate: CalendarDate) {
	let date;
	if (target === 'today') {
		date = new Date();
	} else if (target === 'tomorrow') {
		date = addDays(Date.now(), 1);
	} else if (target === 'next-monday') {
		date = getDateForDayIndexPastSunday(8, originalDate);
	} else if (target === 'saturday') {
		date = getDateForDayIndexPastSunday(6, originalDate);
	} else if (target === 'next-week') {
		date = addDays(originalDate.asDate(), 7);
	} else {
		// the date input gives a date like 'YYYY-MM-DD'
		const [year, month, day] = target.split('-');
		date = new Date(+year, +month - 1, +day);
	}

	return CalendarDate.fromDate(date);
}
