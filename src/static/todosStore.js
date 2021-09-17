import { writable, get } from 'svelte/store';
import { CalendarDate } from "../server/shared/dates";
import { socket } from './app-stores';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getStartOfWeek(offsetWeeks) {
	return CalendarDate.getStartOfWeekByOffset(new Date(), offsetWeeks).serialize();
}

export const week = writable([]);
export const weekOffset = writable(0);
export const hideCompleted = writable(false);
export const startOfViewedWeek = writable(getStartOfWeek(0));
export const today = writable(CalendarDate.now().serialize());
setInterval(() => {
	today.set(CalendarDate.now().serialize())
}, 1000);

function checkWeekStart() {
	startOfViewedWeek.set(getStartOfWeek(get(weekOffset)));
}
setInterval(checkWeekStart, 10 * 1000);

function initTodos() {
	socket.emit('init', get(startOfViewedWeek), todos => {
		todos.days.forEach(day => {
			day.date = CalendarDate.deserialize(day.date);
		})
		week.set(todos.days);
	});
}
// reinit whenever we change week, or the date rolls over
startOfViewedWeek.subscribe(start => {
	initTodos();
});

weekOffset.subscribe(offset => {
	startOfViewedWeek.set(getStartOfWeek(offset));
});

// initialize when the page loads, and any time the websocket reconnects (so we refresh any stale data)
socket.on('connect', initTodos);

function sortListChronologically(array) {
	array.sort((a, b) => {
		return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
	});
}

const processNew = (date, newTodo) => {
	week.update(week => {
		const matchingDay = week.find(day => day.date.serialize() === date),
			list = newTodo.list;

		if (matchingDay) {
			matchingDay[list].push(newTodo);
			sortListChronologically(matchingDay[list]);
		}
		return [...week];
	});
};
socket.on('todo:new', processNew);

socket.on('todo:update', (date, updatedTodo) => {
	week.update(week => {
		const matchingDay = week.find(day => day.date.serialize() === date);

		if (matchingDay) {
			const list = matchingDay[updatedTodo.list],
				oldIndex = list.findIndex(todo => todo.id === updatedTodo.id);

			list[oldIndex] = {...list[oldIndex], ...updatedTodo}
		}
		return week;
	});
});

const processDelete = (date, list, id) => {
	week.update(week => {
		const matchingDay = week.find(day => day.date.serialize() === date);

		if (matchingDay) {
			matchingDay[list] = matchingDay[list].filter(todo => todo.id !== id);
		}
		return week;
	});
}
socket.on('todo:delete', processDelete);

socket.on('todo:reschedule', batch => {
	batch.delete.forEach(({date, list, id}) => {
		processDelete(date, list, id);
	});

	batch.add.forEach(({date, todo}) => {
		processNew(date, todo);
	});
});

export const newTodo = todoData => {
	if (!todoData.text) {
		return;
	}
	socket.emit('todo:new', todoData);
};

export const updateTodo = (id, todoData) => {
	socket.emit('todo:update', id, todoData);
};

export const deleteTodo = id => {
	socket.emit('todo:delete', id);
};

export const reschedule = (id, to) => {
	socket.emit('todo:reschedule', id, to);
}

export const rescheduleMany = options => {
	socket.emit('todo:rescheduleMany', options);
};

export const nextWeek = () => {
	weekOffset.update(offset => offset + 1)
}
export const prevWeek = () => {
	weekOffset.update(offset => offset - 1)
}

export const resetWeek = () => {
	weekOffset.set(0);
}

export function copyToClipboard(text) {
	const el = document.createElement('textarea');
	document.body.appendChild(el);
	el.textContent = text;
	el.select();
	document.execCommand('copy');
	el.remove();
}
