import { writable, get, derived } from 'svelte/store';
import { CalendarDate } from '../../../shared/dates';
import { socket, envoy } from './app';
import {
	Todo,
	DayTodosData,
	DayTodos,
	TodoListType,
	RescheduleBatch,
	TodoCreatable,
	TodoEditable,
	RescheduleManyOptions,
	Weekly,
	WeeklyProgress,
	RecurringTodo,
	RecurringTodoCompletion,
	RecurringTodoCreatable,
	RecurringTodoCompletionCreatable,
} from '../../../shared/types/todos';
import { weeklies, weeklyProgress } from './weekly';
import {
	differenceInCalendarDays,
	differenceInCalendarMonths,
	differenceInCalendarWeeks,
	differenceInCalendarYears,
	isBefore,
} from 'date-fns';

function getStartOfWeek(offsetWeeks: number) {
	return CalendarDate.getStartOfWeekByOffset(new Date(), offsetWeeks).serialize();
}

export const week = writable<DayTodos[]>([]);
export const recurringTodos = writable<RecurringTodo[]>([]);
export const recurringTodosOrdered = derived(recurringTodos, (recurringTodos) => {
	const sorted = [...recurringTodos];

	sorted.sort((a, b) => {
		return a.text.localeCompare(b.text);
	});

	return sorted;
});
export const recurringTodoCompletion = writable<RecurringTodoCompletion[]>([]);
export const weekOffset = writable(0);
export const hideCompleted = writable(false);
export const startOfViewedWeek = writable(getStartOfWeek(0));
export const showGotoDate = writable(false);
export const today = writable(CalendarDate.now().serialize());
setInterval(() => {
	today.set(CalendarDate.now().serialize());
}, 1000);

function checkWeekStart() {
	startOfViewedWeek.set(getStartOfWeek(get(weekOffset)));
}
setInterval(checkWeekStart, 10 * 1000);

function initTodos() {
	socket.emit('init', get(startOfViewedWeek));
}

export function goTo(date: Date) {
	weekOffset.set(CalendarDate.getStartOfWeekDate(date).getWeekOffset());
	scrollToDay(CalendarDate.fromDate(date).getDay());
}

function scrollToDay(dayOfWeek: number) {
	document.getElementById(`todo-day-${dayOfWeek}`).scrollIntoView({
		behavior: 'smooth',
		block: 'start',
		inline: 'center',
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
envoy.on('connect', initTodos);

function sortListChronologically(array: Todo[]) {
	array.sort((a, b) => {
		return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
	});
}

const processNew = (date: CalendarDate, newTodo: Todo) => {
	week.update((week) => {
		const matchingDay = week.find((day) => day.date.isSameDate(date)),
			list = newTodo.list as TodoListType;

		if (matchingDay) {
			matchingDay[list].push(newTodo);
			sortListChronologically(matchingDay[list]);
		}
		return [...week];
	});
};

envoy.on(
	'todo:init',
	(initData: {
		todos: DayTodosData;
		weeklies: Weekly[];
		weeklyProgress: WeeklyProgress[];
		recurringTodos: RecurringTodo[];
		recurringTodoCompletion: RecurringTodoCompletion[];
	}) => {
		week.set(initData.todos.days);
		weeklies.set(initData.weeklies);
		weeklyProgress.set(initData.weeklyProgress);
		recurringTodos.set(initData.recurringTodos);
		recurringTodoCompletion.set(initData.recurringTodoCompletion);
	}
);

envoy.on('todo:new', processNew);

envoy.on('todo:update', (date: CalendarDate, updatedTodo: Todo) => {
	week.update((week) => {
		const matchingDay = week.find((day) => day.date.isSameDate(date));

		if (matchingDay) {
			const list = matchingDay[updatedTodo.list as TodoListType],
				oldIndex = list.findIndex((todo) => todo.id === updatedTodo.id);

			list[oldIndex] = { ...list[oldIndex], ...updatedTodo };
		}
		return week;
	});
});

const processDelete = (date: CalendarDate, list: TodoListType, id: string) => {
	week.update((week) => {
		const matchingDay = week.find((day) => day.date.isSameDate(date));

		if (matchingDay) {
			matchingDay[list] = matchingDay[list].filter((todo) => todo.id !== id);
		}
		return week;
	});
};
envoy.on('todo:delete', processDelete);

envoy.on('todo:reschedule', (batch: RescheduleBatch) => {
	batch.delete.forEach(({ date, list, id }) => {
		processDelete(date, list, id);
	});

	batch.add.forEach(({ date, todo }) => {
		processNew(date, todo);
	});
});

envoy.on('recurring:new', (rec: RecurringTodo) => {
	recurringTodos.update((recs) => {
		return [...recs, rec];
	});
});

envoy.on('recurring:edit', (rec: RecurringTodo) => {
	recurringTodos.update((recs) => {
		return recs.map((r) => (r.id === rec.id ? rec : r));
	});
});

envoy.on('recurring:delete', (id: string) => {
	recurringTodos.update((recs) => {
		return recs.filter((r) => r.id !== id);
	});
});

envoy.on('recurring-completion:new', (prog: RecurringTodoCompletion) => {
	recurringTodoCompletion.update((progs) => {
		// no need to check if this is for the current week, changing week overwrites progress,
		// and having unneeded progress in the store won't impact what's showing
		return [...progs, prog];
	});
});

envoy.on('recurring-completion:delete', (id) => {
	recurringTodoCompletion.update((progs) => {
		return progs.filter((prog) => prog.id !== id);
	});
});

export const recurringOps = {
	new(data: RecurringTodoCreatable) {
		envoy.emit('recurring:new', data);
	},
	edit(id: string, data: RecurringTodoCreatable) {
		envoy.emit('recurring:edit', id, data);
	},
	delete(id: string) {
		envoy.emit('recurring:delete', id);
	},
};
export const recurringCompletionOps = {
	complete(data: RecurringTodoCompletionCreatable) {
		envoy.emit('recurring-completion:new', data);
	},
	delete(id: string) {
		envoy.emit('recurring-completion:delete', id);
	},
};

function isDateApplicable(date: CalendarDate, todo: RecurringTodo) {
	const asDate = {
		// the date we're trying to see if fits on the schedule of a recurring todo
		date: date.asDate(),
		// the first day a recurring todo is valid
		startDate: todo.startDate.asDate(),
	};

	if (isBefore(asDate.date, asDate.startDate)) {
		return false;
	}

	if (todo.repeats === 'daily') {
		// if the difference between the dates falls on a multiple of repeatEvery
		return differenceInCalendarDays(asDate.date, asDate.startDate) % todo.repeatEvery === 0;
	} else if (todo.repeats === 'weekly') {
		// ensure it's a valid day of the week
		if (!todo.weeklyDayRepeats.includes(date.dayId())) {
			return false;
		}

		//valid if it's a correct multiple of repeatEvery
		return differenceInCalendarWeeks(asDate.date, asDate.startDate) % todo.repeatEvery === 0;
	} else if (todo.repeats === 'monthly') {
		// must be the same day of the month first of all
		if (asDate.date.getDate() !== asDate.startDate.getDate()) {
			return false;
		}

		//valid if it's a correct multiple of repeatEvery
		return differenceInCalendarMonths(asDate.date, asDate.startDate) % todo.repeatEvery === 0;
	} else if (todo.repeats === 'yearly') {
		// must have the same month/date first of all
		if (
			asDate.date.getDate() !== asDate.startDate.getDate() ||
			asDate.date.getMonth() !== asDate.startDate.getMonth()
		) {
			return false;
		}

		// valid if it's a correct multiple of repeatEvery
		return differenceInCalendarYears(asDate.date, asDate.startDate) % todo.repeatEvery === 0;
	}
}

// TODO: someday make RecurringView show the next few dates as an example,
// this function would need to do the reverse of isDateApplicable and extrapolate
// a few dates out given the recurring settings
// function getNextApplicableDates(todo: RecurringTodo, numApplicable: number) {}

export function getRecurringTodosForList(list: TodoListType, date: CalendarDate, todos: RecurringTodo[]) {
	return todos.filter((todo) => {
		if (todo.list !== list) {
			return;
		}

		return isDateApplicable(date, todo);
	});
}

export const newTodo = (todoData: TodoCreatable) => {
	if (!todoData.text) {
		return;
	}

	todoData.text = todoData.text.trim();

	envoy.emit('todo:new', todoData);
};

export const updateTodo = (id: string, todoData: TodoEditable) => {
	envoy.emit('todo:update', id, todoData);
};

export const deleteTodo = (id: string) => {
	envoy.emit('todo:delete', id);
};

export const reschedule = (id: string, to: CalendarDate, list: TodoListType) => {
	if (!id) {
		return;
	}

	envoy.emit('todo:reschedule', id, to, list);
};

export const rescheduleMany = (options: RescheduleManyOptions) => {
	envoy.emit('todo:rescheduleMany', options);
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

export function focusNewTodoInput(day: number, list: TodoListType = 'home') {
	// mobile doesn't show the new todo input (it's just a "+" button that opens
	// a prompt dialog), but this function is still used to at least scroll to the day
	const dayElement = document.querySelector(`#todo-day-${day}`);
	if (dayElement) {
		dayElement.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'center',
		});
	}
	const input = document.querySelector(`#new-todo-input-${day}-${list}`) as HTMLInputElement;
	if (input) {
		input.focus();
	}
}

export function todoKeydown(e: KeyboardEvent, listName: TodoListType, date: CalendarDate) {
	if (e.altKey && e.ctrlKey) {
		const dayOfWeek = date.getDay(),
			nextDay = dayOfWeek + 1,
			prevDay = dayOfWeek - 1;

		if (e.key === 'ArrowRight') {
			if (nextDay === 7) {
				nextWeek();
				focusNewTodoInput(0, 'home');
			} else if (nextDay === 1) {
				// if you're coming from Sunday, the first list on Monday is 'work'
				// keeping you focused on the second list suddenly when the first
				// list was focused before feels really weird, send them to work
				focusNewTodoInput(nextDay, 'work');
			} else {
				// for left/right we need to be able to skip to the home list if work is focused,
				// as there's no home list for weekends
				focusNewTodoInput(nextDay, nextDay === 6 ? 'home' : listName);
			}
		} else if (e.key === 'ArrowLeft') {
			if (prevDay === -1) {
				prevWeek();
				focusNewTodoInput(6, 'home');
			} else if (prevDay === 5) {
				focusNewTodoInput(prevDay, 'work');
			} else {
				focusNewTodoInput(prevDay, prevDay === 0 ? 'home' : listName);
			}
		} else if (e.key === 'ArrowUp') {
			// for up and down, there is only one list it can be no matter where you start
			focusNewTodoInput(dayOfWeek, 'work');
		} else if (e.key === 'ArrowDown') {
			focusNewTodoInput(dayOfWeek, 'home');
		}
	}
}
