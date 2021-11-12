import { writable, get } from 'svelte/store';
import { CalendarDate } from '../../../shared/dates';
import { socket } from './app';
import type {
	Todo,
	DayTodosData,
	DayTodos,
	TodoListType,
	RescheduleBatch,
	TodoSerialized,
	TodoCreatable,
	TodoEditable,
} from '../../../shared/types/todos';

function getStartOfWeek(offsetWeeks: number) {
	return CalendarDate.getStartOfWeekByOffset(new Date(), offsetWeeks).serialize();
}

export const week = writable<DayTodos[]>([]);
export const weekOffset = writable(0);
export const hideCompleted = writable(false);
export const startOfViewedWeek = writable(getStartOfWeek(0));
export const today = writable(CalendarDate.now().serialize());
setInterval(() => {
	today.set(CalendarDate.now().serialize());
}, 1000);

function checkWeekStart() {
	startOfViewedWeek.set(getStartOfWeek(get(weekOffset)));
}
setInterval(checkWeekStart, 10 * 1000);

function deserializeTodo(todo: TodoSerialized): Todo {
	return {
		...todo,
		date: CalendarDate.deserialize(todo.date),
	};
}

function initTodos() {
	socket.emit('init', get(startOfViewedWeek), (todos: DayTodosData) => {
		const days = todos.days.map((day) => {
			return {
				...day,
				date: CalendarDate.deserialize(day.date),
				home: day.home.map(deserializeTodo),
				work: day.work.map(deserializeTodo),
			};
		});
		week.set(days);
	});
}
// reinit whenever we change week, or the date rolls over
startOfViewedWeek.subscribe(() => {
	initTodos();
});

weekOffset.subscribe((offset) => {
	startOfViewedWeek.set(getStartOfWeek(offset));
});

// initialize when the page loads, and any time the websocket reconnects (so we refresh any stale data)
socket.on('connect', initTodos);

function sortListChronologically(array: Todo[]) {
	array.sort((a, b) => {
		return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
	});
}

const processNew = (date: string, newTodo: Todo) => {
	week.update((week) => {
		const matchingDay = week.find((day) => day.date.serialize() === date),
			list = newTodo.list as TodoListType;

		if (matchingDay) {
			matchingDay[list].push(newTodo);
			sortListChronologically(matchingDay[list]);
		}
		return [...week];
	});
};
socket.on('todo:new', processNew);

socket.on('todo:update', (date: string, updatedTodo: Todo) => {
	week.update((week) => {
		const matchingDay = week.find((day) => day.date.serialize() === date);

		if (matchingDay) {
			const list = matchingDay[updatedTodo.list as TodoListType],
				oldIndex = list.findIndex((todo) => todo.id === updatedTodo.id);

			list[oldIndex] = { ...list[oldIndex], ...updatedTodo };
		}
		return week;
	});
});

const processDelete = (date: string, list: TodoListType, id: string) => {
	week.update((week) => {
		const matchingDay = week.find((day) => day.date.serialize() === date);

		if (matchingDay) {
			matchingDay[list] = matchingDay[list].filter((todo) => todo.id !== id);
		}
		return week;
	});
};
socket.on('todo:delete', processDelete);

socket.on('todo:reschedule', (batch: RescheduleBatch) => {
	batch.delete.forEach(({ date, list, id }: { date: string; list: TodoListType; id: string }) => {
		processDelete(date, list, id);
	});

	batch.add.forEach(({ date, todo }) => {
		processNew(date, todo);
	});
});

export const newTodo = (todoData: TodoCreatable) => {
	if (!todoData.text) {
		return;
	}

	socket.emit('todo:new', todoData);
};

export const updateTodo = (id: string, todoData: TodoEditable) => {
	socket.emit('todo:update', id, todoData);
};

export const deleteTodo = (id: string) => {
	socket.emit('todo:delete', id);
};

export const reschedule = (id: string, to: string) => {
	socket.emit('todo:reschedule', id, to);
};

export const rescheduleMany = (options: { list: TodoListType; from: string; to: string }) => {
	socket.emit('todo:rescheduleMany', options);
};

export const nextWeek = () => {
	weekOffset.update((offset) => offset + 1);
};
export const prevWeek = () => {
	weekOffset.update((offset) => offset - 1);
};

export const resetWeek = () => {
	weekOffset.set(0);
};

export function copyToClipboard(text: string) {
	const el = document.createElement('textarea');
	document.body.appendChild(el);
	el.textContent = text;
	el.select();
	document.execCommand('copy');
	el.remove();
}
