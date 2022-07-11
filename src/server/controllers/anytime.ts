import { prisma } from '../prisma.js';
import Joi from 'joi';
import type { AnytimeEditable, AnytimeTodoEditable, AnytimeNew, AnytimeTodoNew } from '../../shared/types/anytime.js';

function validateSchema(data: any, schema: Joi.Schema) {
	const { value, error } = schema.validate(data);
	if (error) {
		if (process.env.NODE_ENV === 'development') {
			console.log('Validation error', error);
		}
		return { valid: false };
	} else {
		return { valid: true, value };
	}
}

const anytimeTypes = ['counter', 'todos'],
	anytimeProperties = {
		name: Joi.string().max(300),
		type: Joi.string().valid(...anytimeTypes),
		count: Joi.number().integer(),
		showCountUp: Joi.boolean(),
		showCountDown: Joi.boolean(),
	},
	anytimeTodoProperties = {
		text: Joi.string().max(300),
		completed: Joi.boolean(),
		href: Joi.string()
			.uri({
				scheme: ['http', 'https'],
			})
			.allow(''),
	},
	schemas = {
		anytime: {
			new: Joi.object({
				name: anytimeProperties.name.required(),
				type: anytimeProperties.type.required(),
			}),
			edit: Joi.object({
				name: anytimeProperties.name,
				count: anytimeProperties.count,
				showCountUp: anytimeProperties.showCountUp,
				showCountDown: anytimeProperties.showCountDown,
			}),
		},
		anytimeTodo: {
			new: Joi.object({
				text: anytimeTodoProperties.text.required(),
				href: anytimeTodoProperties.href,
			}),
			edit: Joi.object({
				text: anytimeTodoProperties.text,
				href: anytimeTodoProperties.href,
				completed: anytimeTodoProperties.completed,
			}),
		},
	};

export class AnytimeInteractor {
	static async list(userId: string) {
		if (!userId) {
			return;
		}

		return await prisma.anytime.findMany({
			where: { userId },
			include: {
				todos: {
					orderBy: {
						createdAt: 'asc',
					},
				},
			},
			orderBy: {
				createdAt: 'asc',
			},
		});
	}
	static async newAnytime(userId: string, data: AnytimeNew) {
		const { value, valid } = validateSchema(data, schemas.anytime.new);
		if (!valid || !userId) {
			return;
		}

		return await prisma.anytime.create({
			data: {
				userId,
				...value,
			},
		});
	}
	static async editAnytime(userId: string, anytimeId: string, data: AnytimeEditable) {
		const { value, valid } = validateSchema(data, schemas.anytime.edit);
		if (!valid || !userId || !anytimeId) {
			return;
		}

		await prisma.anytime.updateMany({
			where: {
				userId,
				id: anytimeId,
			},
			data: {
				...value,
			},
		});

		return prisma.anytime.findFirst({
			where: {
				userId,
				id: anytimeId,
			},
		});
	}
	static async deleteAnytime(userId: string, anytimeId: string) {
		if (!userId || !anytimeId) {
			return;
		}

		await prisma.anytime.deleteMany({
			where: {
				userId,
				id: anytimeId,
			},
		});
	}
	private static async updateCount(userId: string, anytimeId: string, by: number) {
		if (!userId || !anytimeId) {
			return;
		}

		return await prisma.anytime.updateMany({
			where: {
				userId,
				id: anytimeId,
				type: 'counter',
			},
			data: {
				count: {
					increment: by,
				},
			},
		});
	}
	static async increment(userId: string, anytimeId: string) {
		return this.updateCount(userId, anytimeId, 1);
	}
	static async decrement(userId: string, anytimeId: string) {
		return this.updateCount(userId, anytimeId, -1);
	}

	static async newAnytimeTodo(userId: string, anytimeId: string, data: AnytimeTodoNew) {
		const { value, valid } = validateSchema(data, schemas.anytimeTodo.new);
		if (!valid) {
			return;
		}

		return await prisma.anytimeTodo.create({
			data: {
				userId,
				anytimeId,
				...value,
			},
		});
	}
	static async editAnytimeTodo(userId: string, id: string, data: AnytimeTodoEditable) {
		const { value, valid } = validateSchema(data, schemas.anytimeTodo.edit);
		if (!valid || !userId || !id) {
			return;
		}

		await prisma.anytimeTodo.updateMany({
			where: {
				userId,
				id,
			},
			data: {
				...value,
			},
		});

		return await prisma.anytimeTodo.findFirst({
			where: {
				userId,
				id,
			},
		});
	}
	static async deleteAnytimeTodo(userId: string, id: string) {
		if (!userId || !id) {
			return;
		}

		return await prisma.anytimeTodo.deleteMany({
			where: {
				userId,
				id,
			},
		});
	}
	static async deleteCompletedAnytimeTodo(userId: string, anytimeId: string) {
		if (!userId || !anytimeId) {
			return;
		}

		return await prisma.anytimeTodo.deleteMany({
			where: {
				userId,
				anytimeId,
				completed: true,
			},
		});
	}
}
