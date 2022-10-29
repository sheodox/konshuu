import { writable, get, derived } from 'svelte/store';
import { envoy } from './app';
import type { Weekly, WeeklyEditable, WeeklyProgress, WeeklyProgressEditable } from '../../../shared/types/todos';
import { CalendarDate } from '../../../shared/dates';
import { startOfViewedWeek } from './todo';

export const weeklies = writable<Weekly[]>([]);
export const weekliesOrdered = derived(weeklies, (weeklies) => {
	const sorted = [...weeklies];

	sorted.sort((a, b) => {
		const aName = a.name.toLowerCase(),
			bName = b.name.toLowerCase();
		if (aName === bName) {
			return 0;
		}
		return aName > bName ? 1 : -1;
	});

	return sorted;
});

export const weeklyProgress = writable<WeeklyProgress[]>([]);
export const weeklyProgressOrdered = derived(weeklyProgress, (progresses) => {
	const weekliesMap = get(weeklies).reduce((done, weekly) => {
			done[weekly.id] = weekly;
			return done;
		}, {} as Record<string, Weekly>),
		sortByName = (a: WeeklyProgress, b: WeeklyProgress) => {
			const aName = weekliesMap[a.weeklyId].name.toLowerCase(),
				bName = weekliesMap[b.weeklyId].name.toLowerCase();

			if (aName === bName) {
				return 0;
			}
			return aName > bName ? 1 : -1;
		};

	const unfinished = progresses.filter((p) => p.progress < p.goal),
		finished = progresses.filter((p) => p.progress >= p.goal);

	unfinished.sort(sortByName);
	finished.sort(sortByName);

	return [...unfinished, ...finished];
});

export const weeklyOps = {
	new(name: string, goal: number) {
		envoy.emit('weekly:new', name, goal);
	},
	edit(weeklyId: string, update: WeeklyEditable) {
		envoy.emit('weekly:edit', weeklyId, update);
	},
	delete(weeklyId: string, hardDelete: boolean) {
		envoy.emit('weekly:delete', weeklyId, hardDelete);
	},
	// increment number of times this has been completed
	progress(weeklyId: string, weeklyProgressId: string, week: CalendarDate) {
		envoy.emit('weekly:progress', weeklyId, weeklyProgressId, week);
	},
	// set the progress or goal for this weekly progress (setting goal only affects
	// the week in question, not the original weekly)
	progressEdit(weeklyId: string, weeklyProgressId: string, week: CalendarDate, update: WeeklyProgressEditable) {
		envoy.emit('weekly:progressEdit', weeklyId, weeklyProgressId, week, update);
	},
	progressDelete(weeklyProgressId: string) {
		envoy.emit('weekly:progressDelete', weeklyProgressId);
	},
};

envoy.on('weekly:new', ({ weekly }) => {
	weeklies.update((w) => [...w, weekly]);

	weeklyProgress.update((progresses) => {
		return [
			...progresses,
			{
				id: null,
				goal: weekly.goal,
				progress: 0,
				weeklyId: weekly.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				week: get(startOfViewedWeek),
			},
		];
	});
});

envoy.on('weekly:edit', ({ weekly }) => {
	weeklies.update((weeklies) => weeklies.map((w) => (w.id === weekly.id ? weekly : w)));
	weeklyProgress.update((progresses) => {
		return progresses.map((prog) => {
			// weeklies that haven't been completed yet are using fake placeholder progress
			// until the first time they're interacted with for a given week. if the goal
			// changed we need to update the virtual progress goal to match
			if (prog.id === null && prog.weeklyId === weekly.id) {
				prog.goal = weekly.goal;
			}
			return prog;
		});
	});
});

envoy.on('weekly:delete', ({ weeklyId, hardDelete }) => {
	if (hardDelete) {
		weeklyProgress.update((progresses) => progresses.filter((p) => p.weeklyId !== weeklyId));
		weeklies.update((weeklies) => weeklies.filter((w) => w.id !== weeklyId));
	} else {
		weeklies.update((weeklies) =>
			weeklies.map((w) => {
				if (w.id === weeklyId) {
					w.deleted = true;
				}
				return w;
			})
		);
	}
});

envoy.on('weekly:progress:update', ({ progress }) => {
	// there won't be any weekly progress for a week until the first time they record progress.
	// so id will be null, we have to go off of the matching weeklyId instead as the id will be
	// upserted to something else
	weeklyProgress.update((progresses) =>
		progresses.map((p) => (p.weeklyId === progress.weeklyId && p.week === progress.week ? progress : p))
	);
});

envoy.on('weekly:progress:delete', ({ weeklyProgressId }) => {
	// there won't be any weekly progress for a week until the first time they record progress.
	// so id will be null, we have to go off of the matching weeklyId instead as the id will be
	// upserted to something else
	weeklyProgress.update((progresses) =>
		progresses.reduce((done, p) => {
			if (p.id !== weeklyProgressId) {
				return [...done, p];
			}
			const weekly = get(weeklies).find((w) => w.id === p.weeklyId);
			// if we aren't tracking a weekly for this anymore
			if (!weekly || weekly.deleted) {
				return done;
			}

			return [
				...done,
				{
					...p,
					// need to keep the progress here if the weekly isn't deleted, otherwise
					// the user would have to swap weeks to get it back
					progress: 0,
					goal: weekly.goal,
					id: null,
				},
			];
		}, [])
	);
});
