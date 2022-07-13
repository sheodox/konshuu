import { writable, derived } from 'svelte/store';
import { envoy } from './app';
import {
	Anytime,
	AnytimeTodo,
	AnytimeEditable,
	AnytimeTodoEditable,
	AnytimeTodoNew,
	AnytimeNew,
	AnytimeTag,
} from '../../../shared/types/anytime';

export const anytimes = writable<Anytime[]>([]);
export const filterTags = writable<string[]>([]);
export const tags = writable<AnytimeTag[]>([]);
export const anytimesInitialized = writable(false);
export const tagsSorted = derived([tags, anytimes], ([tags, anytimes]) => {
	const withCounts = new Map<string, number>();
	for (const anytime of anytimes) {
		for (const assignment of anytime.tags) {
			const countForTag = withCounts.get(assignment.anytimeTagId);
			if (countForTag) {
				withCounts.set(assignment.anytimeTagId, countForTag + 1);
			} else {
				withCounts.set(assignment.anytimeTagId, 1);
			}
		}
	}

	const asArray = Array.from(withCounts.entries());
	asArray.sort((a, b) => b[1] - a[1]);

	const sortedTags = [];
	for (const [id] of asArray) {
		sortedTags.push(tags.find((tag) => tag.id === id));
	}

	return sortedTags;
});

export const anytimeOps = {
	new(data: AnytimeNew) {
		envoy.emit('anytime:new', data);
	},
	edit(id: string, data: AnytimeEditable) {
		envoy.emit('anytime:edit', id, data);
	},
	increment(id: string) {
		envoy.emit('anytime:increment', id);
	},
	decrement(id: string) {
		envoy.emit('anytime:decrement', id);
	},
	delete(id: string) {
		envoy.emit('anytime:delete', id);
	},
	todo: {
		new(anytimeId: string, data: AnytimeTodoNew) {
			data.href = data.href.trim();
			data.text = data.text.trim();
			envoy.emit('anytime:todo:new', anytimeId, data);
		},
		edit(id: string, data: AnytimeTodoEditable) {
			data.href = data.href.trim();
			data.text = data.text.trim();
			envoy.emit('anytime:todo:edit', id, data);
		},
		delete(anytimeId: string, id: string) {
			envoy.emit('anytime:todo:delete', anytimeId, id);
		},
		deleteCompleted(anytimeId: string) {
			envoy.emit('anytime:todo:deleteCompleted', anytimeId);
		},
	},
	tag: {
		new(name: string) {
			envoy.emit('anytime:tag:new', name);
		},
		edit(id: string, name: string) {
			envoy.emit('anytime:tag:edit', id, name);
		},
		delete(id: string) {
			envoy.emit('anytime:tag:delete', id);
		},
		assign(anytimeId: string, anytimeTagId: string) {
			envoy.emit('anytime:tag:assign', anytimeId, anytimeTagId);
		},
		unassign(anytimeId: string, assignmentId: string) {
			envoy.emit('anytime:tag:unassign', anytimeId, assignmentId);
		},
	},
};

envoy.on('anytime:init', (data: { anytimes: Anytime[]; tags: AnytimeTag[] }) => {
	anytimes.set(data.anytimes);
	tags.set(data.tags);
	anytimesInitialized.set(true);
});
envoy.on('anytime:new', (anytime: Anytime) => {
	anytimes.update((a) => [...a, anytime]);
});

function updateAnytime(id: string, updateFn: (anytime: Anytime) => Anytime) {
	anytimes.update((anytimes) => {
		return anytimes.map((anytime) => {
			if (anytime.id === id) {
				return updateFn(anytime);
			}
			return anytime;
		});
	});
}

envoy.on('anytime:edit', (anytime: Anytime) => {
	updateAnytime(anytime.id, (old: Anytime) => {
		// keep the original todos, they won't come along with edits
		return {
			...anytime,
			todos: old.todos,
			tags: old.tags,
		};
	});
});

envoy.on('anytime:increment', (anytimeId: string) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			count: anytime.count + 1,
		};
	});
});

envoy.on('anytime:decrement', (anytimeId: string) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			count: anytime.count - 1,
		};
	});
});

envoy.on('anytime:delete', (id: string) => {
	anytimes.update((anytimes) => {
		return anytimes.filter((a) => a.id !== id);
	});
});

envoy.on('anytime:todo:new', (anytimeId: string, anytimeTodo: AnytimeTodo) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			todos: [...anytime.todos, anytimeTodo],
		};
	});
});

envoy.on('anytime:todo:edit', (anytimeId: string, anytimeTodo: AnytimeTodo) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			todos: anytime.todos.map((todo) => (todo.id === anytimeTodo.id ? anytimeTodo : todo)),
		};
	});
});

envoy.on('anytime:todo:delete', (anytimeId: string, anytimeTodoId: string) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			todos: anytime.todos.filter((todo) => todo.id !== anytimeTodoId),
		};
	});
});

envoy.on('anytime:todo:deleteCompleted', (anytimeId: string) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			// filter down to only those uncompleted
			todos: anytime.todos.filter((todo) => !todo.completed),
		};
	});
});

envoy.on('anytime:tag:new', (tag: AnytimeTag) => {
	tags.update((tags) => [...tags, tag]);
});

envoy.on('anytime:tag:edit', (tag: AnytimeTag) => {
	tags.update((tags) => tags.map((t) => (t.id === tag.id ? tag : t)));
});

envoy.on('anytime:tag:delete', (id: string) => {
	tags.update((tags) => tags.filter((t) => t.id !== id));
	filterTags.update((tags) => tags.filter((filteredId) => filteredId !== id));
	anytimes.update((anytimes) => {
		return anytimes.map((anytime) => {
			return {
				...anytime,
				tags: anytime.tags.filter((tag) => tag.anytimeTagId !== id),
			};
		});
	});
});

envoy.on('anytime:tag:assign', (anytimeId: string, assignment) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			tags: [...anytime.tags, assignment],
		};
	});
});

envoy.on('anytime:tag:unassign', (anytimeId: string, assignmentId) => {
	updateAnytime(anytimeId, (anytime: Anytime) => {
		return {
			...anytime,
			tags: anytime.tags.filter((tag) => tag.id !== assignmentId),
		};
	});
});

envoy.on('connect', initAnytime);
function initAnytime() {
	envoy.emit('anytime:init');
}
