import type { CalendarDate } from '../dates';

import type { Todo as RawTodo } from '@prisma/client';

export interface Todo extends Omit<RawTodo, 'date'> {
	date: CalendarDate;
}

export type TodoCreatable = Pick<Todo, 'text' | 'list' | 'date'>;
export type TodoEditable = Partial<Pick<Todo, 'text' | 'list' | 'date' | 'completed'>>;

export type TodoListType = 'work' | 'home';

export interface DayTodos {
	date: CalendarDate;
	dayName: string;
	work: Todo[];
	home: Todo[];
}

export interface DayTodosData {
	days: DayTodos[];
}

export interface RescheduleDeleteCommand {
	id: string;
	date: CalendarDate;
	list: TodoListType;
}

export interface RescheduleAddCommand {
	todo: Todo;
	date: CalendarDate;
	list: TodoListType;
}

export interface RescheduleManyOptions {
	list: TodoListType;
	from: CalendarDate;
	to: CalendarDate;
}

export interface RescheduleBatch {
	add: RescheduleAddCommand[];
	delete: RescheduleDeleteCommand[];
}
