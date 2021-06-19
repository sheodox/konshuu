import {CalendarDate, Week} from "../shared/dates";
import {Todo} from "@prisma/client";
import {prisma} from "../prisma";

export const todoListTypes = ['work', 'home'] as const;
export type TodoListType = typeof todoListTypes[number];
interface DayTodos {
    date: string,
    dayName: string,
    work: Todo[]
    home: Todo[]
}

function validList(list: string) {
    return ['work', 'home'].includes(list)
}

function weekSkeleton(weekStart: Date): DayTodos[] {
    const week = new Week(weekStart);

    return ([
        [0, 'Sunday'],
        [1, 'Monday'],
        [2, 'Tuesday'],
        [3, 'Wednesday'],
        [4, 'Thursday'],
        [5, 'Friday'],
        [6, 'Saturday'],
    ] as const).map(([dayNum, dayName]) => {
        return {date: week.getDayDate(dayNum).serialize(), dayName: dayName, work: [], home: []}
    })
}

export class TodoTracker {
    static async getWeek(userId: string, dayInTheWeek: CalendarDate) {
        const week = dayInTheWeek.getWeek();

        const {weekStart, weekEnd} = week.getWeekBounds(),
            todosInWeek = await prisma.todo.findMany({
                where: {
                    userId,
                    date: {
                        gte: weekStart,
                        lte: weekEnd
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            })

        // organize all the todos into lists associated with the days
        const days = todosInWeek.reduce((week: DayTodos[], todoItem: Todo) => {
            week[todoItem.date.getDay()][todoItem.list as TodoListType].push(todoItem);
            return week;
        }, weekSkeleton(weekStart))

        return {
            days
        }
    }
    static async addTodo(userId: string, date: CalendarDate, list: TodoListType, text: string) {
        if (validList(list)) {
            await prisma.todo.create({
                data: {
                    userId,
                    list,
                    text,
                    date: date.asDate()
                }
            })

        }
    }
    static async updateTodo(userId: string, id: string, data: Partial<Todo>) {
        await prisma.todo.updateMany({
            where: {id, userId},
            data
        })
    }
    static async removeTodo(userId: string, id: string) {
        await prisma.todo.deleteMany({
            where: {id, userId}
        },)
    }
    static async reschedule(userId: string, list: TodoListType, fromDate: CalendarDate, toDate: CalendarDate) {
        if (!validList(list)) { return }

        //don't let work items reschedule for the weekend, they'll disappear forever as no list renders
        if (list === 'work' && toDate.isWeekend()) {
            return;
        }

        await prisma.todo.updateMany({
            where: {userId, list, date: fromDate.asDate()},
            data: {
                date: toDate.asDate()
            }
        })
    }
    static async rescheduleOne(userId: string, id: string, toDate: CalendarDate) {
        const todo = await prisma.todo.findUnique({where: {id}});

        //don't allow scheduling work items for the weekend, they'll disappear forever!
        if (todo.userId !== userId || (todo.list === 'work' && toDate.isWeekend())) {
            return;
        }
        await prisma.todo.update({
            where: {id},
            data: {date: toDate.asDate()}
        })
    }
}

