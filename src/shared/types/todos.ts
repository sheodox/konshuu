import type { CalendarDate } from '../dates';

import type { Todo as RawTodo } from '@prisma/client';

export interface Todo extends Omit<RawTodo, 'date'> {
	date: CalendarDate;
}

export type TodoCreatable = Pick<Todo, 'text' | 'list' | 'date'>;
export type TodoEditable = Partial<Pick<Todo, 'text' | 'list' | 'date' | 'completed'>>;

export interface TodoSerialized extends Omit<RawTodo, 'date'> {
	date: string;
}

export type TodoListType = 'work' | 'home';

export interface DayTodos {
	date: CalendarDate;
	dayName: string;
	work: Todo[];
	home: Todo[];
}

export interface DayTodosSerialized extends Omit<DayTodos, 'date' | 'work' | 'home'> {
	date: string;
	work: TodoSerialized[];
	home: TodoSerialized[];
}

export interface DayTodosData {
	days: DayTodosSerialized[];
}

export interface RescheduleDeleteCommand {
	id: string;
	date: string;
	list: TodoListType;
}

export interface RescheduleAddCommand {
	todo: Todo;
	date: string;
	list: TodoListType;
}

export interface RescheduleBatch {
	add: RescheduleAddCommand[];
	delete: RescheduleDeleteCommand[];
}
