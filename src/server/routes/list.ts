import { CalendarDate } from '../../shared/dates.js';
import { todoListTypes, TodoTracker } from '../controllers/todo.js';
import Joi from 'joi';
import { getUserIdFromSocket, io } from '../server.js';
import { RescheduleManyOptions, TodoCreatable, TodoListType } from '../../shared/types/todos.js';
import { deserialize, serialize } from '../../shared/serialization.js';
import { isOnajiSerializable, isOnajiSerialized } from 'onaji';
import metrics from '../metrics.js';

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
			listener(...args);
		});
	};

	on('init', async (startOfWeek: string) => {
		// emit this only to the single socket, not all sockets for this user, or each session
		// can't page individually, as paging in one tab/device will page all of them
		emitToSocket('todo:init', await TodoTracker.getWeek(userId, CalendarDate.deserialize(startOfWeek)));
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
		const update = await TodoTracker.rescheduleOne(userId, todoId, to, list);

		if (update) {
			const { todo, fromDate } = update;
			emitToUser('todo:reschedule', {
				delete: [{ date: fromDate, list: update.originalTodo.list, id: todo.id }],
				add: [{ date: CalendarDate.fromDate(todo.date), list: todo.list, todo }],
			});
		}
	});
});
