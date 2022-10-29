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

export interface Weekly {
	id: string;
	createdAt: Date;
	goal: number;
	name: string;
	deleted: boolean;
}

export interface WeeklyEditable {
	goal?: number;
	name?: string;
}

export interface WeeklyProgress {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	weeklyId: string;
	progress: number;
	goal: number;
	week: string;
}

export interface WeeklyProgressEditable {
	progress?: number;
	goal?: number;
}

export type RecurringRepeats = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Day = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface RecurringTodo {
	id: string;
	text: string;
	list: TodoListType;
	startDate: CalendarDate;
	repeats: RecurringRepeats;
	repeatEvery: number;
	weeklyDayRepeats: Day[];
}

export type RecurringTodoCreatable = Omit<RecurringTodo, 'id'>;

export interface RecurringTodoCompletion {
	id: string;
	date: CalendarDate;
	recurringTodoId: string;
}

export type RecurringTodoCompletionCreatable = Omit<RecurringTodoCompletion, 'id'>;
