import { Router } from "express";
import { CalendarDate, serializedCalendarDateSchema } from "../shared/dates";
import { TodoListType, todoListTypes, TodoTracker } from "../controllers/todo";
import Joi from "joi";
import { validateBodySchema } from "../middleware/validate-body-schema";
import { safeAsyncRoute } from "../middleware/error-handler";
import { requireAuth } from "../middleware/require-auth";
import { getUserIdFromSocket, io } from "../server";

const router = Router();
router.use(requireAuth);

const todoProperties = {
	list: Joi.string()
		.valid(...todoListTypes),
	text: Joi.string()
		.max(300),
	date: serializedCalendarDateSchema,
	completed: Joi.boolean()
},
	todoUpdateSchema = Joi.object({
		...todoProperties
	}).unknown(false),
	todoNewSchema = Joi.object({
		list: todoProperties.list.required(),
		text: todoProperties.text.required(),
		date: todoProperties.date.required(),
	}).unknown(false),
	rescheduleManySchema = Joi.object({
		list: todoProperties.list.required(),
		from: serializedCalendarDateSchema.required(),
		to: serializedCalendarDateSchema.required(),
	});

const toDate = (str: string) => {
	return CalendarDate.deserialize(str);
}
const serializeDate = (date: Date) => {
	return CalendarDate.fromDate(date).serialize()
}

io.on('connection', socket => {
	const userId = getUserIdFromSocket(socket);
	if (!userId) {
		return;
	}

	const emitToUser = (eventName: string, ...args: any[]) => {
		io.to(userId).emit(eventName, ...args);
	}

	function validateSchema(data: any, schema: Joi.Schema) {
		const { value, error } = schema.validate(data);
		if (error) {
			socket.emit('notification:error');

			if (process.env.NODE_ENV === 'development') {
				console.log('Validation error', error);
			}
			return { valid: false };
		}
		else {
			return { valid: true, value };
		}
	}

	socket.on('init', async (startOfWeek: string, done) => {
		done(
			await TodoTracker.getWeek(userId, CalendarDate.deserialize(startOfWeek))
		);
	});

	socket.on('todo:new', async (todo) => {
		const { valid, value } = validateSchema(todo, todoNewSchema);
		if (!valid) { return; }

		const newTodo = await TodoTracker.addTodo(
			userId,
			CalendarDate.deserialize(value.date),
			value.list,
			value.text
		);

		emitToUser('todo:new', todo.date, newTodo);
	});

	socket.on('todo:update', async (id, todo) => {
		const { valid, value } = validateSchema(todo, todoUpdateSchema);
		if (!valid) { return; }

		const updatedTodo = await TodoTracker.updateTodo(userId, id, value);
		emitToUser('todo:update', serializeDate(updatedTodo.date), updatedTodo);
	});

	socket.on('todo:delete', async (id) => {
		const deletedTodo = await TodoTracker.removeTodo(userId, id);
		emitToUser('todo:delete', serializeDate(deletedTodo.date), deletedTodo.list, deletedTodo.id);
	});

	socket.on('todo:rescheduleMany', async (options) => {
		const { valid, value } = validateSchema(options, rescheduleManySchema);
		if (!valid) { return; }

		const todos = await TodoTracker.reschedule(
			userId,
			value.list as TodoListType,
			toDate(value.from),
			toDate(value.to)
		)

		emitToUser('todo:reschedule', {
			delete: todos.map(todo => {
				return {date: value.from, list: todo.list, id: todo.id};
			}),
			add: todos.map(todo => {
				return {date: value.to, list: todo.list, todo}
			})
		});
	});

	socket.on('todo:reschedule', async (todoId: string, to: string) => {
		const {todo, fromDate} = await TodoTracker.rescheduleOne(userId, todoId, toDate(to));

		emitToUser('todo:reschedule', {
			delete: [{date: fromDate, list: todo.list, id: todo.id}],
			add: [{date: CalendarDate.fromDate(todo.date).serialize(), list: todo.list, todo}]
		});
	});
})

router.get(`/:todoId/reschedule/:to`, safeAsyncRoute(async (req, res) => {
	await TodoTracker.rescheduleOne(req.user.id, req.params.todoId, toDate(req.params.to));
	res.send();
}));

module.exports = router;
