import { getUserIdFromSocket, io } from '../server.js';
import { deserialize, serialize } from '../../shared/serialization.js';
import { isOnajiSerializable, isOnajiSerialized } from 'onaji';
import { anytimeLogger } from '../logger.js';
import { AnytimeInteractor } from '../controllers/anytime.js';
import type { Anytime as PrismaAnytime, AnytimeTodo as PrismaAnytimeTodo } from '@prisma/client';
import type { Anytime, AnytimeTodo } from '../../shared/types/anytime.js';

interface PrismaAnytimeWithTodos extends PrismaAnytime {
	todos: PrismaAnytimeTodo[];
}

const toDTO = {
	anytime: (anytime: PrismaAnytime): Anytime => {
		return {
			id: anytime.id,
			createdAt: anytime.createdAt,
			name: anytime.name,
			type: anytime.type,
			count: anytime.count,
			showCountUp: anytime.showCountUp,
			showCountDown: anytime.showCountDown,
			todos: [],
		};
	},
	anytimeWithTodos: (anytime: PrismaAnytimeWithTodos): Anytime => {
		return {
			...toDTO.anytime(anytime),
			todos: anytime.todos.map(toDTO.anytimeTodo),
		};
	},
	anytimeTodo: (todo: PrismaAnytimeTodo): AnytimeTodo => {
		return {
			id: todo.id,
			createdAt: todo.createdAt,
			text: todo.text,
			href: todo.href,
			completed: todo.completed,
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
					anytimeLogger.error(`Error processing handler for "${eventName}"`, { error });
				});
		});
	};

	on('init', async () => {
		const anytimes = await AnytimeInteractor.list(userId);

		// emit this only to the single socket, not all sockets for this user, or each session
		// can't page individually, as paging in one tab/device will page all of them
		emitToSocket('anytime:init', anytimes.map(toDTO.anytimeWithTodos));
	});

	on('anytime:new', async (data) => {
		const anytime = await AnytimeInteractor.newAnytime(userId, data);
		if (anytime) {
			emitToUser('anytime:new', toDTO.anytime(anytime));
		}
	});

	on('anytime:increment', async (anytimeId) => {
		await AnytimeInteractor.increment(userId, anytimeId);
		emitToUser('anytime:increment', anytimeId);
	});

	on('anytime:decrement', async (anytimeId) => {
		await AnytimeInteractor.decrement(userId, anytimeId);
		emitToUser('anytime:decrement', anytimeId);
	});

	on('anytime:edit', async (id, data) => {
		const anytime = await AnytimeInteractor.editAnytime(userId, id, data);
		if (anytime) {
			emitToUser('anytime:edit', toDTO.anytime(anytime));
		}
	});

	on('anytime:delete', async (id) => {
		await AnytimeInteractor.deleteAnytime(userId, id);
		emitToUser('anytime:delete', id);
	});

	on('anytime:todo:new', async (anytimeId, data) => {
		const todo = await AnytimeInteractor.newAnytimeTodo(userId, anytimeId, data);
		if (todo) {
			emitToUser('anytime:todo:new', anytimeId, toDTO.anytimeTodo(todo));
		}
	});

	on('anytime:todo:edit', async (id, data) => {
		const todo = await AnytimeInteractor.editAnytimeTodo(userId, id, data);
		if (todo) {
			emitToUser('anytime:todo:edit', todo.anytimeId, toDTO.anytimeTodo(todo));
		}
	});

	on('anytime:todo:delete', async (anytimeId, id) => {
		await AnytimeInteractor.deleteAnytimeTodo(userId, id);
		emitToUser('anytime:todo:delete', anytimeId, id);
	});

	on('anytime:todo:deleteCompleted', async (anytimeId) => {
		await AnytimeInteractor.deleteCompletedAnytimeTodo(userId, anytimeId);
		emitToUser('anytime:todo:deleteCompleted', anytimeId);
	});
});
