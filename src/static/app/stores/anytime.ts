import { writable, derived, get } from 'svelte/store';
import { envoy, now } from './app';
import {
	Anytime,
	AnytimeTodo,
	AnytimeEditable,
	AnytimeTodoEditable,
	AnytimeTodoNew,
	AnytimeNew,
	AnytimeTag,
} from '../../../shared/types/anytime';
import {
	differenceInDays,
	differenceInHours,
	differenceInMinutes,
	differenceInSeconds,
	formatDuration,
	intervalToDuration,
	isBefore,
	startOfDay,
} from 'date-fns';
import { createPersistentToast } from 'sheodox-ui';

export type LastAnytimeView = null | { tag: string } | { anytime: string };
export type AnytimeSort = 'asc' | 'desc' | 'alpha-asc' | 'alpha-desc';

export const anytimes = writable<Anytime[]>([]);
export const tags = writable<AnytimeTag[]>([]);
export const anytimesInitialized = writable(false);
export const showAnytimeSidebar = writable(false);
export const lastAnytimeView = writable<LastAnytimeView>(null);
export const anytimeSort = writable<AnytimeSort>('desc');
export const tagsSorted = derived([tags], ([tags]) => {
	const sortedTags = [...tags];

	sortedTags.sort((a, b) => a.name.localeCompare(b.name));

	return sortedTags;
});

function isExpiredCountdown(anytime: Anytime, now: Date) {
	return anytime.type === 'countdown' && isBefore(anytime.countdownEnd, now);
}

export const hasExpiredCountdown = derived([anytimes, now], ([anytimes, now]) => {
	return anytimes.some((anytime) => {
		return isExpiredCountdown(anytime, now);
	});
});

const alertedExpiredCountdowns: Set<string> = new Set();
now.subscribe((now) => {
	get(anytimes).forEach((anytime) => {
		const hasAlerted = alertedExpiredCountdowns.has(anytime.id);

		if (!hasAlerted && isExpiredCountdown(anytime, now)) {
			alertedExpiredCountdowns.add(anytime.id);

			createPersistentToast({
				title: 'Countdown expired',
				message: `The countdown "${anytime.name}" has expired.`,
				href: '/anytime',
			});
		}
	});
});

function formatTimeToUnit(
	date: Date,
	now: Date,
	singular: string,
	plural: string,
	differenceFn: (date1: Date, date2: Date) => number
) {
	const diff = Math.abs(differenceFn(date, now));
	return `${diff.toLocaleString()} ${diff === 1 ? singular : plural}`;
}

export function formatRelative(date: Date, now: Date, units: string) {
	if (units === 'days') {
		return formatTimeToUnit(date, now, 'day', 'days', differenceInDays);
	} else if (units === 'hours') {
		return formatTimeToUnit(date, now, 'hour', 'hours', differenceInHours);
	} else if (units === 'minutes') {
		return formatTimeToUnit(date, now, 'minute', 'minutes', differenceInMinutes);
	} else if (units === 'seconds') {
		return formatTimeToUnit(date, now, 'second', 'seconds', differenceInSeconds);
	}

	const duration = intervalToDuration({ start: now, end: date }),
		secondsDifference = differenceInSeconds(date, now);
	// we don't show seconds for far off dates as it's distracting to see them change constantly, but for close
	// dates we should show the full timer
	if (Math.abs(secondsDifference) < 60) {
		return formatDuration(duration);
	}
	return formatDuration(duration, { format: ['years', 'months', 'days', 'hours', 'minutes'] });
}

export const anytimeTypes = [
	{
		name: 'Todo List',
		kind: 'todos',
		icon: 'list',
	},
	{
		name: 'Counter',
		kind: 'counter',
		icon: 'calculator',
	},
	{
		name: 'Countdown',
		kind: 'countdown',
		icon: 'angle-double-down',
	},
	{
		name: 'Countup',
		kind: 'countup',
		icon: 'angle-double-up',
	},
	{
		name: 'Notes',
		kind: 'notes',
		icon: 'sticky-note',
	},
];

export const anytimeOps = {
	new(data: AnytimeNew) {
		envoy.emit('anytime:new', data);
	},
	anytimeToEditable(data: Anytime): AnytimeEditable {
		return {
			notes: data.notes,
			name: data.name,
			count: data.count,
			countdownEnd: data.countdownEnd,
			showCountUp: data.showCountUp,
			showCountDown: data.showCountDown,
			resetsDaily: data.resetsDaily,
		};
	},
	edit(id: string, data: AnytimeEditable) {
		// if we're not editing a countdown, we need to not include a null date
		data.countdownEnd = data.countdownEnd ? data.countdownEnd : undefined;
		envoy.emit('anytime:edit', id, data);
	},
	increment(id: string) {
		envoy.emit('anytime:increment', id);
	},
	decrement(id: string) {
		envoy.emit('anytime:decrement', id);
	},
	delete(id: string) {
		envoy.emit('anytime:delete', id);
	},
	resetDay(id: string) {
		const time = startOfDay(get(now)).getTime();
		envoy.emit('anytime:resetDay', id, time);
	},
	todo: {
		new(anytimeId: string, data: AnytimeTodoNew) {
			data.href = data.href.trim();
			data.text = data.text.trim();
			envoy.emit('anytime:todo:new', anytimeId, data);
		},
		edit(id: string, data: AnytimeTodoEditable) {
			data.href = data.href.trim();
			data.text = data.text.trim();
			envoy.emit('anytime:todo:edit', id, data);
		},
		delete(anytimeId: string, id: string) {
			envoy.emit('anytime:todo:delete', anytimeId, id);
		},
		deleteCompleted(anytimeId: string) {
			envoy.emit('anytime:todo:deleteCompleted', anytimeId);
		},
	},
	tag: {
		new(name: string) {
			envoy.emit('anytime:tag:new', name);
		},
		edit(id: string, name: string) {
			envoy.emit('anytime:tag:edit', id, name);
		},
		delete(id: string) {
			envoy.emit('anytime:tag:delete', id);
		},
		assign(anytimeId: string, anytimeTagId: string) {
			envoy.emit('anytime:tag:assign', anytimeId, anytimeTagId);
		},
		unassign(anytimeId: string, assignmentId: string) {
			envoy.emit('anytime:tag:unassign', anytimeId, assignmentId);
		},
	},
};

envoy.on('anytime:init', (data: { anytimes: Anytime[]; tags: AnytimeTag[] }) => {
	anytimes.set(data.anytimes);
	tags.set(data.tags);
	anytimesInitialized.set(true);
});
envoy.on('anytime:new', (anytime: Anytime) => {
	anytimes.update((a) => [...a, anytime]);
});

function updateAnytime(id: string, updateFn: (anytime: Anytime) => Anytime) {
	anytimes.update((anytimes) => {
		return anytimes.map((anytime) => {
			if (anytime.id === id) {
				return updateFn(anytime);
			}
			return anytime;
		});
	});
}

envoy.on('anytime:edit', (anytime: Anytime) => {
	updateAnytime(anytime.id, (old: Anytime) => {
		// keep the original todos, they won't come along with edits
		return {
			...anytime,
			todos: old.todos,
			tags: old.tags,
		};
	});
});

envoy.on('anytime:increment', (anytimeId: string) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			//inc/dec are atomic operations that dont't return any data in particular (as to avoid issues caused by out of order updates)
			//the current updatedAt isn't sent with messages, we can assume a new date puts us pretty close to the real thing
			updatedAt: new Date(),
			count: anytime.count + 1,
		};
	});
});

envoy.on('anytime:decrement', (anytimeId: string) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			//inc/dec are atomic operations that dont't return any data in particular (as to avoid issues caused by out of order updates)
			//the current updatedAt isn't sent with messages, we can assume a new date puts us pretty close to the real thing
			updatedAt: new Date(),
			count: anytime.count - 1,
		};
	});
});

envoy.on('anytime:delete', (id: string) => {
	anytimes.update((anytimes) => {
		return anytimes.filter((a) => a.id !== id);
	});
});

envoy.on('anytime:todo:new', (anytimeId: string, anytimeTodo: AnytimeTodo) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			todos: [...anytime.todos, anytimeTodo],
		};
	});
});

envoy.on('anytime:todo:edit', (anytimeId: string, anytimeTodo: AnytimeTodo) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			todos: anytime.todos.map((todo) => (todo.id === anytimeTodo.id ? anytimeTodo : todo)),
		};
	});
});

envoy.on('anytime:todo:delete', (anytimeId: string, anytimeTodoId: string) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			todos: anytime.todos.filter((todo) => todo.id !== anytimeTodoId),
		};
	});
});

envoy.on('anytime:todo:deleteCompleted', (anytimeId: string) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			// filter down to only those uncompleted
			todos: anytime.todos.filter((todo) => !todo.completed),
		};
	});
});

envoy.on('anytime:tag:new', (tag: AnytimeTag) => {
	tags.update((tags) => [...tags, tag]);
});

envoy.on('anytime:tag:edit', (tag: AnytimeTag) => {
	tags.update((tags) => tags.map((t) => (t.id === tag.id ? tag : t)));
});

envoy.on('anytime:tag:delete', (id: string) => {
	tags.update((tags) => tags.filter((t) => t.id !== id));
	anytimes.update((anytimes) => {
		return anytimes.map((anytime) => {
			return {
				...anytime,
				tags: anytime.tags.filter((tag) => tag.anytimeTagId !== id),
			};
		});
	});
});

envoy.on('anytime:tag:assign', (anytimeId: string, assignment) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			tags: [...anytime.tags, assignment],
		};
	});
});

envoy.on('anytime:tag:unassign', (anytimeId: string, assignmentId) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			tags: anytime.tags.filter((tag) => tag.id !== assignmentId),
		};
	});
});

envoy.on('connect', initAnytime);
function initAnytime() {
	envoy.emit('anytime:init');
}
