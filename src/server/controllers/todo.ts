import { CalendarDate, Week } from '../../shared/dates.js';
import { prisma } from '../prisma.js';
import { Todo as PrismaTodo } from '@prisma/client';
import type {
	TodoListType,
	DayTodos,
	RecurringTodoCreatable,
	RecurringTodoCompletionCreatable,
} from '../../shared/types/todos';

export const todoListTypes = ['work', 'home'];
export const recurringRepeatTypes = ['daily', 'weekly', 'monthly', 'yearly'];
export const daysOfTheWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function validList(list: string) {
	return todoListTypes.includes(list);
}

function weekSkeleton(weekStart: Date): DayTodos[] {
	const week = new Week(weekStart);

	return (
		[
			[0, 'Sunday'],
			[1, 'Monday'],
			[2, 'Tuesday'],
			[3, 'Wednesday'],
			[4, 'Thursday'],
			[5, 'Friday'],
			[6, 'Saturday'],
		] as const
	).map(([dayNum, dayName]) => {
		return { date: week.getDayDate(dayNum), dayName: dayName, work: [], home: [] };
	});
}

export class TodoTracker {
	static async getWeek(userId: string, dayInTheWeek: CalendarDate) {
		if (!userId) {
			return;
		}

		const week = dayInTheWeek.getWeek();

		const { weekStart, weekEnd } = week.getWeekBounds(),
			todosInWeek = await prisma.todo.findMany({
				where: {
					userId,
					date: {
						gte: weekStart,
						lte: weekEnd,
					},
				},
				orderBy: {
					createdAt: 'asc',
				},
			});

		// organize all the todos into lists associated with the days
		const days = todosInWeek.reduce((week: DayTodos[], todoItem: PrismaTodo) => {
			week[todoItem.date.getDay()][todoItem.list as TodoListType].push({
				...todoItem,
				date: CalendarDate.fromDate(todoItem.date),
			});
			return week;
		}, weekSkeleton(weekStart));

		return {
			days,
		};
	}

	static async getRecurring(userId: string) {
		if (!userId) {
			return [];
		}
		return await prisma.recurringTodo.findMany({ where: { userId } });
	}

	static async getRecurringCompletion(userId: string, dayInTheWeek: CalendarDate) {
		if (!userId) {
			return [];
		}
		const week = dayInTheWeek.getWeek();

		const { weekStart, weekEnd } = week.getWeekBounds(),
			todosInWeek = await prisma.recurringTodoCompletion.findMany({
				where: {
					userId,
					date: {
						gte: weekStart,
						lte: weekEnd,
					},
				},
				orderBy: {
					createdAt: 'asc',
				},
			});

		return todosInWeek;
	}
	static async addTodo(userId: string, date: CalendarDate, list: TodoListType, text: string, href: string) {
		if (validList(list) && !!userId) {
			return await prisma.todo.create({
				data: {
					userId,
					list,
					text,
					href,
					date: date.asDate(),
				},
			});
		}
	}
	static async updateTodo(userId: string, id: string, data: Partial<PrismaTodo>) {
		if (!userId) {
			return;
		}

		const thisTodo = await prisma.todo.findUnique({ where: { id } });
		if (thisTodo.userId !== userId) {
			return;
		}

		return await prisma.todo.update({
			where: { id },
			data,
		});
	}
	static async removeTodo(userId: string, id: string) {
		const thisTodo = await prisma.todo.findUnique({ where: { id } });
		if (thisTodo && thisTodo.userId !== userId) {
			return;
		}

		return await prisma.todo.delete({
			where: { id },
		});
	}
	static async reschedule(userId: string, list: TodoListType, fromDate: CalendarDate, toDate: CalendarDate) {
		if (!validList(list) || !userId) {
			return;
		}

		//don't let work items reschedule for the weekend, they'll disappear forever as no list renders
		if (list === 'work' && toDate.isWeekend()) {
			return;
		}

		const rescheduleFilter = {
			userId,
			list,
			date: fromDate.asDate(),
			// if they've already been completed, there is no point in moving them
			completed: false,
		};

		// we need to return the todos that have changed so batch deletes/adds can be
		// emitted to the client and the UI can move the todos it needs. to do this we
		// need to know what todos will be changed by the update (updateMany just
		// returns a count of updated rows, not the rows themselves)
		const updatingIds = (
			await prisma.todo.findMany({
				where: rescheduleFilter,
				select: { id: true },
			})
		).map(({ id }) => id);

		await prisma.todo.updateMany({
			where: rescheduleFilter,
			data: {
				date: toDate.asDate(),
			},
		});

		return await prisma.todo.findMany({
			where: { id: { in: updatingIds } },
		});
	}
	static async rescheduleOne(userId: string, id: string, toDate: CalendarDate, list: string) {
		if (!validList(list) || !userId) {
			return;
		}

		const originalTodo = await prisma.todo.findUnique({ where: { id } });

		//don't allow scheduling work items for the weekend, they'll disappear forever!
		if (!originalTodo || originalTodo.userId !== userId || (list === 'work' && toDate.isWeekend())) {
			return;
		}
		const updatedTodo = await prisma.todo.update({
			where: { id },
			data: { date: toDate.asDate(), list },
		});

		return {
			todo: updatedTodo,
			originalTodo,
			fromDate: CalendarDate.fromDate(originalTodo.date),
		};
	}

	static async addRecurring(userId: string, data: RecurringTodoCreatable) {
		if (!validList(data.list) || !userId) {
			return;
		}

		return await prisma.recurringTodo.create({
			data: {
				...data,
				startDate: data.startDate.asDate(),
				userId,
			},
		});
	}

	static async editRecurring(userId: string, id: string, data: RecurringTodoCreatable) {
		if (!validList(data.list) || !userId || !id) {
			return;
		}

		const existingRec = await prisma.recurringTodo.findUnique({ where: { id } });

		if (!existingRec || existingRec.userId !== userId) {
			return;
		}

		return await prisma.recurringTodo.update({
			where: { id },
			data: {
				...data,
				startDate: data.startDate.asDate(),
			},
		});
	}

	static async deleteRecurring(userId: string, id: string) {
		if (!userId || !id) {
			return;
		}

		await prisma.recurringTodo.deleteMany({
			where: {
				id,
				userId,
			},
		});
	}

	static async completeRecurring(userId: string, data: RecurringTodoCompletionCreatable) {
		if (!userId || !data.recurringTodoId || !data.date) {
			return;
		}

		const existingCompletion = await prisma.recurringTodoCompletion.findMany({
			where: {
				userId,
				date: data.date.asDate(),
				recurringTodoId: data.recurringTodoId,
			},
		});

		// already exists, don't make another
		if (existingCompletion.length) {
			return;
		}

		return await prisma.recurringTodoCompletion.create({
			data: {
				userId,
				recurringTodoId: data.recurringTodoId,
				date: data.date.asDate(),
			},
		});
	}

	static async deleteRecurringCompletion(userId: string, id: string) {
		if (!userId || !id) {
			return;
		}

		await prisma.recurringTodoCompletion.deleteMany({
			where: { userId, id },
		});
	}
}
