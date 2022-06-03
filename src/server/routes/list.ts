import { CalendarDate } from '../../shared/dates.js';
import { todoListTypes, TodoTracker } from '../controllers/todo.js';
import Joi from 'joi';
import { getUserIdFromSocket, io } from '../server.js';
import {
	RescheduleManyOptions,
	TodoCreatable,
	TodoListType,
	Weekly,
	WeeklyProgress,
	WeeklyEditable,
	WeeklyProgressEditable,
} from '../../shared/types/todos.js';
import { deserialize, serialize } from '../../shared/serialization.js';
import { isOnajiSerializable, isOnajiSerialized } from 'onaji';
import metrics from '../metrics.js';
import { WeeklyInteractor } from '../controllers/weekly.js';
import type { Weekly as PrismaWeekly, WeeklyProgress as PrismaWeeklyProgress } from '@prisma/client';
import { todoLogger } from '../logger.js';

const calendarDateSchema = Joi.object().instance(CalendarDate);

const todoProperties = {
		list: Joi.string().valid(...todoListTypes),
		text: Joi.string().max(300),
		date: calendarDateSchema,
		completed: Joi.boolean(),
	},
	todoUpdateSchema = Joi.object({
		...todoProperties,
	}).unknown(false),
	todoNewSchema = Joi.object({
		list: todoProperties.list.required(),
		text: todoProperties.text.required(),
		date: todoProperties.date.required(),
	}).unknown(false),
	rescheduleManySchema = Joi.object({
		list: todoProperties.list.required(),
		from: calendarDateSchema.required(),
		to: calendarDateSchema.required(),
	});

const toDTO = {
	weekly: (weeklyEntity: PrismaWeekly): Weekly => {
		return {
			id: weeklyEntity.id,
			name: weeklyEntity.name,
			createdAt: weeklyEntity.createdAt,
			goal: weeklyEntity.goal,
			deleted: weeklyEntity.deleted,
		};
	},
	progress: (progressEntity: PrismaWeeklyProgress): WeeklyProgress => {
		return {
			id: progressEntity.id,
			weeklyId: progressEntity.weeklyId,
			createdAt: progressEntity.createdAt,
			goal: progressEntity.goal,
			progress: progressEntity.progress,
		};
	},
};

io.on('connection', (socket) => {
	const userId = getUserIdFromSocket(socket);
	if (!userId) {
		return;
	}

	function serializeArgs(args: any[]) {
		return args.map((arg: any) => {
			// prevent serializing of null, in JS it has a typeof 'object'
			if (isOnajiSerializable(arg)) {
				return serialize(arg);
			}
			return arg;
		});
	}

	const emitToSocket = (eventName: string, ...args: any[]) => {
		socket.emit(eventName, ...serializeArgs(args));
	};
	const emitToUser = (eventName: string, ...args: any[]) => {
		io.to(userId).emit(eventName, ...serializeArgs(args));
	};

	function validateSchema(data: any, schema: Joi.Schema) {
		const { value, error } = schema.validate(data);
		if (error) {
			socket.emit('notification:error');

			if (process.env.NODE_ENV === 'development') {
				console.log('Validation error', error);
			}
			return { valid: false };
		} else {
			return { valid: true, value };
		}
	}

	const on = (eventName: string, listener: (...args: any[]) => any) => {
		socket.on(eventName, (...args) => {
			args = args.map((arg) => {
				if (arg && isOnajiSerialized(arg)) {
					return deserialize(arg);
				}
				return arg;
			});

			Promise.resolve()
				.then(() => listener(...args))
				.catch((error) => {
					todoLogger.error(`Error processing handler for "${eventName}"`, { error });
				});
		});
	};

	on('init', async (startOfWeek: string) => {
		const week = CalendarDate.deserialize(startOfWeek),
			weeklies = await WeeklyInteractor.getWeeklies(userId),
			weeklyProgress = await WeeklyInteractor.getWeeklyProgress(userId, week),
			// if the user hasn't yet
			temporaryUpsertProgress = weeklies.map((weekly) => {
				const existing = weeklyProgress.find((p) => p.weeklyId === weekly.id);

				return (
					existing ?? {
						id: null,
						weeklyId: weekly.id,
						goal: weekly.goal,
						progress: 0,
					}
				);
			});

		// emit this only to the single socket, not all sockets for this user, or each session
		// can't page individually, as paging in one tab/device will page all of them
		emitToSocket('todo:init', {
			todos: await TodoTracker.getWeek(userId, week),
			weeklies: weeklies.map(toDTO.weekly),
			weeklyProgress: temporaryUpsertProgress.map(toDTO.progress),
		});
	});

	on('todo:new', async (todo: TodoCreatable) => {
		const { valid, value } = validateSchema(todo, todoNewSchema);
		if (!valid) {
			return;
		}

		const newTodo = await TodoTracker.addTodo(userId, value.date, value.list, value.text);
		metrics.todos.inc();

		emitToUser('todo:new', todo.date, newTodo);
	});

	on('todo:update', async (id, todo) => {
		const { valid, value } = validateSchema(todo, todoUpdateSchema);
		if (!valid) {
			return;
		}

		const updatedTodo = await TodoTracker.updateTodo(userId, id, value);
		emitToUser('todo:update', CalendarDate.fromDate(updatedTodo.date), updatedTodo);
	});

	on('todo:delete', async (id) => {
		const deletedTodo = await TodoTracker.removeTodo(userId, id);
		metrics.todos.dec();
		emitToUser('todo:delete', CalendarDate.fromDate(deletedTodo.date), deletedTodo.list, deletedTodo.id);
	});

	on('todo:rescheduleMany', async (options: RescheduleManyOptions) => {
		const { valid, value } = validateSchema(options, rescheduleManySchema);
		if (!valid) {
			return;
		}

		const todos = await TodoTracker.reschedule(userId, value.list as TodoListType, value.from, value.to);

		if (todos) {
			emitToUser('todo:reschedule', {
				delete: todos.map((todo) => {
					return { date: value.from, list: todo.list, id: todo.id };
				}),
				add: todos.map((todo) => {
					return {
						date: value.to,
						list: todo.list,
						todo: {
							...todo,
							date: CalendarDate.fromDate(todo.date),
						},
					};
				}),
			});
		}
	});

	on('todo:reschedule', async (todoId: string, to: CalendarDate, list: string) => {
		if (!todoId) {
			return;
		}

		const update = await TodoTracker.rescheduleOne(userId, todoId, to, list);

		if (update) {
			const { todo, fromDate } = update;
			emitToUser('todo:reschedule', {
				delete: [{ date: fromDate, list: update.originalTodo.list, id: todo.id }],
				add: [{ date: CalendarDate.fromDate(todo.date), list: todo.list, todo }],
			});
		}
	});

	on('weekly:new', async (name: string, goal: number) => {
		const weekly = await WeeklyInteractor.new(userId, name, goal);

		if (!weekly) {
			return;
		}

		emitToUser('weekly:new', {
			weekly: toDTO.weekly(weekly),
		});
	});

	on('weekly:edit', async (weeklyId: string, update: WeeklyEditable) => {
		const weekly = await WeeklyInteractor.update(userId, weeklyId, update);

		if (!weekly) {
			return;
		}

		emitToUser('weekly:edit', {
			weekly: toDTO.weekly(weekly),
		});
	});

	on('weekly:delete', async (weeklyId: string, hardDelete: boolean) => {
		await WeeklyInteractor.delete(userId, weeklyId, hardDelete);

		emitToUser('weekly:delete', {
			weeklyId,
			hardDelete,
		});
	});

	on('weekly:progress', async (weeklyId: string, weeklyProgressId: string, week: CalendarDate) => {
		const progress = await WeeklyInteractor.progress(userId, weeklyId, weeklyProgressId, week);

		if (!progress) {
			return;
		}
		emitToUser('weekly:progress:update', {
			progress: toDTO.progress(progress),
		});
	});

	on(
		'weekly:progressEdit',
		async (weeklyId: string, weeklyProgressId: string, week: CalendarDate, update: WeeklyProgressEditable) => {
			const progress = await WeeklyInteractor.progressEdit(userId, weeklyId, weeklyProgressId, week, update);
			if (!progress) {
				return;
			}

			emitToUser('weekly:progress:update', {
				progress: toDTO.progress(progress),
			});
		}
	);

	on('weekly:progressDelete', async (weeklyProgressId: string) => {
		await WeeklyInteractor.progressDelete(userId, weeklyProgressId);

		emitToUser('weekly:progress:delete', {
			weeklyProgressId,
		});
	});
});
