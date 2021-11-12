import { Router } from 'express';
import { validateBodySchema } from '../middleware/validate-body-schema.js';
import { safeAsyncRoute } from '../middleware/error-handler.js';
import Joi from 'joi';
import { prisma } from '../prisma.js';
import bcrypt from 'bcrypt';
import { authLogger } from '../logger.js';
import { Prisma } from '@prisma/client';
import { requireAuth } from '../middleware/require-auth.js';

export const router = Router();

export async function findUserNoSensitiveData(where: Prisma.UserWhereUniqueInput) {
	return await prisma.user.findUnique({
		where,
		// only select fields that isn't going to leak a password
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
		},
	});
}

async function hashPassword(password: string) {
	return await bcrypt.hash(password, 12);
}

const userFields = {
		email: Joi.string().email(),
		password: Joi.string().min(8).max(100),
		firstName: Joi.string().max(100),
		lastName: Joi.string().max(100),
	},
	signupSchema = Joi.object({
		email: userFields.email.required(),
		password: userFields.password.required(),
		firstName: userFields.firstName.required(),
		lastName: userFields.lastName.required(),
	}).unknown(false),
	userProfileSchema = Joi.object({
		...userFields,
	}).unknown(false),
	userPasswordSchema = Joi.object({
		password: userFields.password.required(),
		newPassword: userFields.password.required(),
	}).unknown(false);

router.post(
	'/signup',
	validateBodySchema(signupSchema),
	safeAsyncRoute(async (req, res, next) => {
		const userWithSameEmail = await prisma.user.findUnique({
			where: {
				email: req.body.email,
			},
		});

		if (userWithSameEmail) {
			return next({ status: 400 });
		}

		const passwordHash = await hashPassword(req.body.password),
			user = await prisma.user.create({
				data: {
					email: req.body.email,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					passwordHash,
				},
			});
		authLogger.info(`New user signed up ${user.id}`);

		const safeUser = await findUserNoSensitiveData({ id: user.id });

		req.login(safeUser, (error) => {
			if (error) {
				authLogger.error(`Error logging user in ${user.id}`, { error });
				next({ status: 500 });
			} else {
				res.send();
			}
		});
	})
);

router.post(
	'/profile',
	requireAuth,
	validateBodySchema(userProfileSchema),
	safeAsyncRoute(async (req, res, next) => {
		const userWithThatEmail = await prisma.user.findUnique({ where: { email: req.body.email } });

		// ensure the email isn't taken by someone else, this *could* lead to a TOCTOU error,
		// but with the unique constraint in the email column it'd just be a 500 error instead of 400
		// so nothing bad would happen except the wrong status code
		if (userWithThatEmail && userWithThatEmail.id !== req.user.id) {
			return next({ status: 400 });
		}

		await prisma.user.update({
			where: { id: req.user.id },
			data: req.body,
		});
		res.send();
	})
);

router.post(
	'/change-password',
	requireAuth,
	validateBodySchema(userPasswordSchema),
	safeAsyncRoute(async (req, res, next) => {
		const user = await prisma.user.findUnique({ where: { id: req.user.id } }),
			passwordCorrect = user && (await bcrypt.compare(req.body.password, user.passwordHash));

		// ensure they entered the correct old password, or they won't have permission to change it
		if (passwordCorrect) {
			const passwordHash = await hashPassword(req.body.newPassword);
			await prisma.user.update({
				where: { id: req.user.id },
				data: { passwordHash },
			});
			res.send();
		} else {
			next({ status: 400 });
		}
	})
);
