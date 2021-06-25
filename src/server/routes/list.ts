import {Router} from "express";
import {CalendarDate, serializedCalendarDateSchema} from "../shared/dates";
import {TodoListType, todoListTypes, TodoTracker} from "../controllers/todo";
import Joi from "joi";
import {validateBodySchema} from "../middleware/validate-body-schema";
import {safeAsyncRoute} from "../middleware/error-handler";
import {requireAuth} from "../middleware/require-auth";

const router = Router();
router.use(requireAuth);

const todoProperties = {
		list: Joi.string()
			.allow(...todoListTypes),
		text: Joi.string()
			.max(100),
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

router.get('/week/:calendarDate', safeAsyncRoute(async (req, res) => {
	await res.json(
		await TodoTracker.getWeek(req.user.id, CalendarDate.deserialize(req.params.calendarDate))
	);
}));

router.post('/', validateBodySchema(todoNewSchema), safeAsyncRoute(async (req, res) => {
	await TodoTracker.addTodo(
		req.user.id,
		CalendarDate.deserialize(req.body.date),
		req.body.list,
		req.body.text,
	);
	await res.send();
}));

router.post('/:todoId', validateBodySchema(todoUpdateSchema), safeAsyncRoute(async (req, res) => {
	await TodoTracker.updateTodo(req.user.id, req.params.todoId, req.body);
	await res.send();
}));

router.delete('/:todoId', safeAsyncRoute(async (req, res) => {
	await TodoTracker.removeTodo(req.user.id, req.params.todoId);
	await res.send();
}));

//using 'patch' so it doesn't conflict with the 'new' post on /
router.patch('/reschedule', validateBodySchema(rescheduleManySchema), safeAsyncRoute(async (req, res) => {
	await TodoTracker.reschedule(
		req.user.id,
		req.body.list as TodoListType,
		toDate(req.body.from),
		toDate(req.body.to)
	)
	await res.send();
}));

router.get(`/:todoId/reschedule/:to`, safeAsyncRoute(async (req, res) => {
	await TodoTracker.rescheduleOne(req.user.id, req.params.todoId, toDate(req.params.to));
	await res.send();
}));

module.exports = router;