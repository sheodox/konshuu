export const DAY_MS = 24 * 60 * 60 * 1000;

// a date class that targets just a date without a time, do date math without
// being tripped up by time zones
export class CalendarDate {
	private readonly year: number;
	private readonly month: number;
	private readonly date: number;

	constructor(year: number, month: number, day: number) {
		// throwing these into a Date object so if date math is done that crosses month/year boundaries
		// we'll get the actual date, not something like the -2nd of September
		const date = new Date(year, month, day);
		this.year = date.getFullYear();
		this.month = date.getMonth();
		this.date = date.getDate();
	}

	asDate() {
		return new Date(this.year, this.month, this.date);
	}

	getWeek() {
		return new Week(this.asDate());
	}

	getDay() {
		return this.asDate().getDay();
	}

	static now() {
		return CalendarDate.fromDate(new Date());
	}

	static fromDate(date: Date) {
		return new CalendarDate(date.getFullYear(), date.getMonth(), date.getDate());
	}

	static fromDateWithWeekOffset(date: Date, weekOffset: number) {
		return new CalendarDate(date.getFullYear(), date.getMonth(), date.getDate() + 7 * weekOffset);
	}

	static getStartOfWeekByOffset(date: Date, weekOffset: number) {
		return CalendarDate.getStartOfWeekDate(CalendarDate.fromDateWithWeekOffset(date, weekOffset).asDate());
	}

	static getStartOfWeekDate(date: Date) {
		const dayOfWeek = date.getDay();
		return new CalendarDate(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek);
	}

	// get a CalendarDate instance from a serialized string
	static deserialize(serialized: string) {
		const segments = serialized.split('-').map((segment) => parseInt(segment, 10));

		return new CalendarDate(segments[0], segments[1] - 1, segments[2]);
	}

	isSameDate(otherDate: CalendarDate) {
		return this.serialize() === otherDate.serialize();
	}

	serialize() {
		const pad = (num: number) => ('' + num).padStart(2, '0');

		//turn this into an ISO8601 date (Feb 2, 2020 → 2020-02-02)
		return [this.year, pad(this.month + 1), pad(this.date)].join('-');
	}

	toLocaleDateString() {
		return this.asDate().toLocaleDateString();
	}

	isToday() {
		const now = CalendarDate.now();
		return now.serialize() === this.serialize();
	}

	isTomorrow() {
		const tomorrow = CalendarDate.fromDate(new Date(CalendarDate.now().asDate().getTime() + DAY_MS));
		return this.serialize() === tomorrow.serialize();
	}

	dayName() {
		const day = this.asDate().getDay();
		return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
	}

	isWeekend() {
		const day = this.asDate().getDay();
		return day === 0 || day === 6;
	}
}

export class Week {
	private date: Date;

	constructor(containedDate: Date) {
		//clone it just in case
		containedDate = new Date(containedDate.getTime());
		containedDate.setHours(12);
		containedDate.setMinutes(12);
		containedDate.setMilliseconds(12);

		this.date = containedDate;
	}

	getDayDate(dayOfWeek: number) {
		const { weekStart } = this.getWeekBounds();
		const dayDate = new Date(weekStart.getTime() + dayOfWeek * DAY_MS);
		return new CalendarDate(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
	}

	getWeekStart() {
		//sunday at the beginning of the week
		return new Date(this.date.getTime() - this.date.getDay() * DAY_MS);
	}

	getWeekBounds() {
		//since date doesn't have a setDay() we're just gonna do some math to get dates at the beginning and end of week
		const weekEnd = new Date(this.date.getTime() + (6 - this.date.getDay()) * DAY_MS); //saturday at the end of this week

		return { weekStart: this.getWeekStart(), weekEnd };
	}
}
