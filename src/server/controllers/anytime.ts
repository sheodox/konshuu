import { prisma } from '../prisma.js';
import Joi from 'joi';
import { addDays } from 'date-fns';
import type {
	AnytimeEditable,
	AnytimeTodoEditable,
	AnytimeNew,
	AnytimeTodoNew,
	AnytimeCountHistory,
} from '../../shared/types/anytime.js';

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

// number of days from now in either direction is considered 'reasonable', though a clock being two days off is
// pretty hard to believe if they're connected to the internet, i figure this should keep us from accepting clearly
// incorrect values, like the year 1970, something negative, or 2100
const REASONABLE_DAY_TIME_DRIFT = 2;

function isReasonableTimeNumber(num: number) {
	const aWhileAgo = addDays(new Date(), -1 * REASONABLE_DAY_TIME_DRIFT).getTime(),
		aWhileFromNow = addDays(new Date(), REASONABLE_DAY_TIME_DRIFT).getTime();
	return num > aWhileAgo && num < aWhileFromNow;
}

const anytimeTypes = ['counter', 'todos', 'countdown', 'countup', 'notes'],
	anytimeProperties = {
		name: Joi.string().max(300),
		type: Joi.string().valid(...anytimeTypes),
		pinned: Joi.boolean(),
		count: Joi.number().integer(),
		showCountUp: Joi.boolean(),
		showCountDown: Joi.boolean(),
		countdownEnd: Joi.date(),
		resetsDaily: Joi.boolean(),
		notes: Joi.string().allow('').max(20000),
	},
	anytimeTodoProperties = {
		text: Joi.string().max(300),
		completed: Joi.boolean(),
		href: Joi.string()
			.max(2000)
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
				tags: Joi.array().items(Joi.string()),
				countdownEnd: anytimeProperties.countdownEnd.optional(),
			}),
			edit: Joi.object({
				name: anytimeProperties.name,
				count: anytimeProperties.count,
				pinned: anytimeProperties.pinned,
				showCountUp: anytimeProperties.showCountUp,
				showCountDown: anytimeProperties.showCountDown,
				countdownEnd: anytimeProperties.countdownEnd.optional(),
				resetsDaily: anytimeProperties.resetsDaily,
				notes: anytimeProperties.notes.optional(),
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

		return {
			anytimes: await prisma.anytime.findMany({
				where: { userId },
				include: {
					todos: {
						orderBy: {
							createdAt: 'asc',
						},
					},
					tags: true,
				},
				orderBy: {
					createdAt: 'asc',
				},
			}),
			tags: await prisma.anytimeTag.findMany({
				where: { userId },
			}),
		};
	}
	static async newAnytime(userId: string, data: AnytimeNew) {
		const { value, valid } = validateSchema(data, schemas.anytime.new);
		if (!valid || !userId) {
			return;
		}

		const anytime = await prisma.anytime.create({
			data: {
				userId,
				name: value.name,
				type: value.type,
				countdownEnd: value.countdownEnd || null,
				countHistory: [],
				resetsDaily: value.resetsDaily,
				currentDayTime: 0,
			},
		});

		if (data.tags) {
			for (const tagId of data.tags) {
				await AnytimeInteractor.assignTag(userId, anytime.id, tagId);
			}
		}

		return await prisma.anytime.findUnique({
			where: { id: anytime.id },
			include: {
				tags: true,
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
				updatedAt: new Date(),
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
	// reset the counter and stash the current count and time in the history
	static async counterNewDay(userId: string, id: string, newTime: number) {
		const validNumber = typeof newTime === 'number' && isReasonableTimeNumber(newTime);

		if (!userId || !id || !validNumber) {
			return;
		}

		const anytime = await prisma.anytime.findUnique({ where: { id } });

		if (anytime.userId !== userId) {
			return;
		}

		const previousHistory = anytime.countHistory as unknown as AnytimeCountHistory[] | null;

		const newCountHistory = anytime.currentDayTime
			? [
					{
						count: anytime.count,
						time: Number(anytime.currentDayTime),
					},
					...(previousHistory || []),
			  ]
			: [];

		return await prisma.anytime.update({
			where: { id },
			data: {
				// only allow saving up to 10 updates
				countHistory: newCountHistory.slice(0, 10) as any, //ts doesn't like that this is a specific type, and not a string
				currentDayTime: newTime,
				count: 0,
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
				updatedAt: new Date(),
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
	static async newTag(userId: string, name: string) {
		name = name?.trim();
		if (!name || !userId) {
			return;
		}

		return await prisma.anytimeTag.create({
			data: {
				userId,
				name,
			},
		});
	}
	static async editTag(userId: string, id: string, name: string, showOnAllAnytimes: boolean) {
		name = name?.trim();
		if (!name || !userId || !id || typeof showOnAllAnytimes !== 'boolean') {
			return;
		}

		await prisma.anytimeTag.updateMany({
			where: {
				userId,
				id,
			},
			data: {
				userId,
				name,
				showOnAllAnytimes,
			},
		});

		return prisma.anytimeTag.findFirst({
			where: {
				userId,
				id,
			},
		});
	}
	static async deleteTag(userId: string, id: string) {
		if (!userId || !id) {
			return;
		}

		return await prisma.anytimeTag.deleteMany({
			where: {
				userId,
				id,
			},
		});
	}
	static async assignTag(userId: string, anytimeId: string, anytimeTagId: string) {
		if (!userId || !anytimeId || !anytimeTagId) {
			return;
		}

		return await prisma.anytimeTagAssignment.create({
			data: {
				userId,
				anytimeId,
				anytimeTagId,
			},
		});
	}
	static async unassignTag(userId: string, assignmentId: string) {
		if (!userId || !assignmentId) {
			return;
		}

		return await prisma.anytimeTagAssignment.deleteMany({
			where: {
				userId,
				id: assignmentId,
			},
		});
	}
}
