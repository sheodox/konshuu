import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Request, Router } from 'express';
import { prisma } from '../prisma.js';
import { authLogger } from '../logger.js';
import { findUserNoSensitiveData } from './user.js';

export const router = Router();

export interface AppRequest extends Request {
	user: User;
	requestId: string;
}

passport.use(
	new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
		try {
			const user = await prisma.user.findUnique({ where: { email } }),
				passwordCorrect = user && (await bcrypt.compare(password, user.passwordHash));

			if (passwordCorrect) {
				authLogger.info(`User logged in ${user.id}`);
				const safeUser = await findUserNoSensitiveData({ id: user.id });
				done(null, safeUser);
			} else {
				done(null, false, { message: 'Incorrect email or password.' });
			}
		} catch (e) {
			done(e, false);
		}
	})
);

passport.serializeUser((user: User, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
	try {
		const user = await findUserNoSensitiveData({ id });

		user ? done(null, user) : done(new Error('No User Found'), false);
	} catch (e) {
		done(e, false);
	}
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
	res.redirect('/');
});

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});
