import { CalendarDate } from '../../shared/dates.js';
import { prisma } from '../prisma.js';
import Joi from 'joi';
import type { WeeklyEditable, WeeklyProgressEditable } from '../../shared/types/todos';

const weeklyFields = {
		name: Joi.string(),
		progress: Joi.number().min(0),
		goal: Joi.number().min(1),
	},
	weeklySchemas = {
		new: Joi.object({
			name: weeklyFields.name.required(),
			goal: weeklyFields.goal.required(),
		}).unknown(false),
		update: Joi.object({
			name: weeklyFields.name,
			goal: weeklyFields.goal,
		}).unknown(false),
	},
	weeklyProgressSchema = Joi.object({
		goal: weeklyFields.goal,
		progress: weeklyFields.progress,
	}).unknown(false);

export class WeeklyInteractor {
	static async getWeeklies(userId: string) {
		if (!userId) {
			return [];
		}

		return await prisma.weekly.findMany({
			where: { userId, deleted: false },
		});
	}
	static async getWeeklyProgress(userId: string, startOfWeek: CalendarDate) {
		if (startOfWeek.getDay() !== 0) {
			return;
		}

		return await prisma.weeklyProgress.findMany({
			where: {
				userId,
				week: startOfWeek.serialize(),
			},
			include: {
				weekly: true,
			},
		});
	}
	static async new(userId: string, name: string, goal: number) {
		const { error, value } = weeklySchemas.new.validate({ name, goal });

		if (!error) {
			return await prisma.weekly.create({
				data: {
					userId,
					name: value.name,
					goal: value.goal,
				},
			});
		}
	}
	static async update(userId: string, id: string, update: WeeklyEditable) {
		const { error, value } = weeklySchemas.update.validate(update);

		if (!error) {
			await prisma.weekly.updateMany({
				where: { userId, id },
				data: value,
			});

			return await prisma.weekly.findFirst({
				where: { userId, id },
			});
		}
	}
	static async delete(userId: string, id: string, hardDelete = false) {
		if (!id || !userId) {
			return;
		}

		if (hardDelete) {
			return await prisma.weekly.deleteMany({
				where: { userId, id },
			});
		} else {
			return await prisma.weekly.updateMany({
				where: {
					userId,
					id,
				},
				data: {
					deleted: true,
				},
			});
		}
	}

	static async _upsertProgress(userId: string, weeklyId: string, weeklyProgressId: string, startOfWeek: CalendarDate) {
		if (startOfWeek.getDay() !== 0) {
			return;
		}

		const week = startOfWeek.serialize();

		if (weeklyProgressId) {
			return await prisma.weeklyProgress.findFirst({
				where: {
					userId,
					id: weeklyProgressId,
				},
			});
		} else {
			const weekly = await prisma.weekly.findFirst({
				where: {
					userId,
					id: weeklyId,
				},
			});

			if (!weekly) {
				return;
			}

			return await prisma.weeklyProgress.create({
				data: {
					userId,
					weeklyId,
					goal: weekly.goal,
					progress: 0,
					week,
				},
			});
		}
	}

	static async progress(userId: string, weeklyId: string, weeklyProgressId: string, startOfWeek: CalendarDate) {
		const prog = await this._upsertProgress(userId, weeklyId, weeklyProgressId, startOfWeek);

		if (!prog) {
			return;
		}

		return await prisma.weeklyProgress.update({
			where: { id: prog.id },
			data: { progress: { increment: 1 } },
		});
	}

	static async progressEdit(
		userId: string,
		weeklyId: string,
		weeklyProgressId: string,
		startOfWeek: CalendarDate,
		update: WeeklyProgressEditable
	) {
		const { value, error } = weeklyProgressSchema.validate(update);

		if (error) {
			return;
		}

		const prog = await this._upsertProgress(userId, weeklyId, weeklyProgressId, startOfWeek);

		if (!prog) {
			return;
		}

		return await prisma.weeklyProgress.update({
			where: { id: prog.id },
			data: value,
		});
	}

	static async progressDelete(userId: string, weeklyProgressId: string) {
		if (!userId || !weeklyProgressId) {
			return;
		}

		await prisma.weeklyProgress.deleteMany({
			where: {
				userId,
				id: weeklyProgressId,
			},
		});
	}
}
