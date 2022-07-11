import { writable } from 'svelte/store';
import { envoy } from './app';
import type {
	Anytime,
	AnytimeTodo,
	AnytimeEditable,
	AnytimeTodoEditable,
	AnytimeTodoNew,
	AnytimeNew,
} from '../../../shared/types/anytime';

export const anytimes = writable<Anytime[]>([]);

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
			envoy.emit('anytime:todo:new', anytimeId, data);
		},
		edit(id: string, data: AnytimeTodoEditable) {
			envoy.emit('anytime:todo:edit', id, data);
		},
		delete(anytimeId: string, id: string) {
			envoy.emit('anytime:todo:delete', anytimeId, id);
		},
		deleteCompleted(anytimeId: string) {
			envoy.emit('anytime:todo:deleteCompleted', anytimeId);
		},
	},
};

envoy.on('anytime:init', (a: Anytime[]) => {
	anytimes.set(a);
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

envoy.on('connect', initAnytime);
function initAnytime() {
	envoy.emit('anytime:init');
}
