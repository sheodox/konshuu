import { CalendarDate, Week } from '../../shared/dates.js';
import { prisma } from '../prisma.js';
import { Todo as PrismaTodo } from '@prisma/client';
import type { TodoListType, DayTodos } from '../../shared/types/todos';

export const todoListTypes = ['work', 'home'];

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
	static async addTodo(userId: string, date: CalendarDate, list: TodoListType, text: string) {
		if (validList(list)) {
			return await prisma.todo.create({
				data: {
					userId,
					list,
					text,
					date: date.asDate(),
				},
			});
		}
	}
	static async updateTodo(userId: string, id: string, data: Partial<PrismaTodo>) {
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
		if (!validList(list)) {
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
		if (!validList(list)) {
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
}
