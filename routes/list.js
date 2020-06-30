const {query} = require('../util/db'),
	router = require('express').Router(),
	DAY_MS = 24 * 60 * 60 * 1000;

function weekSkeleton(weekStart) {
	const getDay = dayNum => {
		const d = new Date(weekStart.getTime());
		d.setHours(12); //noon, because why not? don't think leap years should mess with these calculations- but just in case
		d.setTime(d.getTime() + (dayNum * DAY_MS));
		return d;
	}

	return [
		[0, 'Sunday'],
		[1, 'Monday'],
		[2, 'Tuesday'],
		[3, 'Wednesday'],
		[4, 'Thursday'],
		[5, 'Friday'],
		[6, 'Saturday'],
	].map(([dayNum, dayName]) => {
		return {date: getDay(dayNum), dayName: dayName, work: [], home: []}
	})
}

class List {
	static async getWeek(dayInTheWeek = new Date()) {
		dayInTheWeek.setHours(12);

		//since date doesn't have a setDay() we're just gonna do some math to get dates at the beginning and end of week
		const weekStart = new Date(dayInTheWeek.getTime() - dayInTheWeek.getDay() * DAY_MS), //sunday at the beginning of the week
			weekEnd = new Date(dayInTheWeek.getTime() + (6 - dayInTheWeek.getDay()) * DAY_MS), //saturday at the end of this week
			todosInWeek = (
				 await query(`SELECT * FROM todo_lists
							  WHERE date BETWEEN $1 AND $2
							  ORDER BY created_at ASC`, [weekStart, weekEnd])
			).rows

		// organize all the todos into lists associated with the days
		const days = todosInWeek.reduce((week, todoItem) => {
			week[todoItem.date.getDay()][todoItem.list].push(todoItem);
			return week;
		}, weekSkeleton(weekStart))

		return {
			weekStart,
			weekEnd,
			days
		}
	}
	static async addTodo(date, list, text) {
		list = list.toLowerCase();
		if (['work', 'home'].includes(list)) {
			await query(
					`INSERT INTO todo_lists(text, date, completed, list)
                     VALUES ($1, $2, $3, $4)`, [text, date, false, list]
			);
		}
	}
	static async toggleTodo(id) {
		await query(
			`UPDATE todo_lists SET completed = NOT completed WHERE todo_id=$1`, [id]
		)
	}
	static async removeTodo(id) {
		await query(
			`DELETE FROM todo_lists WHERE todo_id in (SELECT todo_id FROM todo_lists WHERE todo_id=$1 LIMIT 1)`, [id]
		)
	}
	static async reschedule(list, fromDate, toDate) {
		await query(
			`UPDATE todo_lists SET date=$1 WHERE completed=false AND list=$2 AND date=$3`,
			[toDate, list, fromDate]
		);
	}
}

router.get('/week/:timeStamp', async (req, res) => {
	await res.json(
		await List.getWeek(new Date(parseInt(req.params.timeStamp)))
	);
})

router.get('/add/:date/:list/:todoText', async (req, res) => {
	//these are dates in the database which don't have a time component, so we don't need
	// to care too much about when this date is exactly
	const date = new Date(parseInt(req.params.date));

	await List.addTodo(date, req.params.list, req.params.todoText);
	await res.send();
})

router.get('/toggle/:todoId', async (req, res) => {
	await List.toggleTodo(req.params.todoId);
	await res.send();
})

router.get('/remove/:todoId', async (req, res) => {
	await List.removeTodo(req.params.todoId);
	await res.send();
})

//from/to are unix timestamps
router.get('/reschedule/:listType/:from/:to', async (req, res) => {
	//a date string is like 1922-01-26 for January 26th, 1922. this is the same format a date field will give
	const toDate = str => {
		const [year, month, day] = str.split('-');
		return new Date(+year, +month - 1, +day);
	}
	await List.reschedule(req.params.listType, toDate(req.params.from), toDate(req.params.to))
	await res.send();
});

module.exports = router;