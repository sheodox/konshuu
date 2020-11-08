export const DAY_MS = 24 * 60 * 60 * 1000;

export const serializeDate = date => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

function getDateForDayIndexPastSunday(dayIndex) {
	// example: find the date of the next monday
	// 8 days is the day offset from this week's sunday to next monday,
	// subtract however many days of the current week has passed
	const daysUntilMonday = dayIndex - new Date().getDay();
	return new Date(Date.now() + DAY_MS * daysUntilMonday);
}

export function getRescheduleDestination(target) {
	if (target === 'today') {
		return new Date();
	}
	else if (target === 'tomorrow') {
		return new Date(Date.now() + DAY_MS);
	}
	else if (target === 'next-monday') {
		return getDateForDayIndexPastSunday(8);
	}
	else if (target === 'saturday') {
		return getDateForDayIndexPastSunday(6);
	}
	else { // the date input gives a date like 'YYYY-MM-DD'
		const [year, month, day] = target.split('-');
		return new Date(+year, +month - 1, +day);
	}
}