import {User, Prisma} from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {Router, Response, NextFunction, Request} from "express";
import {prisma} from "../prisma";
import {validateBodySchema} from "../middleware/validate-body-schema";
import Joi from "joi";
import {safeAsyncRoute} from "../middleware/error-handler";
import {authLogger} from "../logger";

export const router = Router();

export interface AppRequest extends Request {
    user: User;
    requestId: string;
}

export const requireAuth = (req: AppRequest, res: Response, next: NextFunction) => {
    !req.user ? next({status: 401}) : next();
}

async function findUserNoSensitiveData(where: Prisma.UserWhereUniqueInput) {
    return await prisma.user.findUnique({
        where,
        // only select fields that isn't going to leak a password
        select: {
            id: true,
            firstName: true,
            lastName: true
        }
    });
}

passport.use(new LocalStrategy(
    {usernameField: 'email', passwordField: 'password'},
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({where: {email}}),
                passwordCorrect = await bcrypt.compare(password, user?.passwordHash);

            if (passwordCorrect) {
                authLogger.info(`User logged in ${user.id}`);
                const safeUser = await findUserNoSensitiveData({id: user.id});
                done(null, safeUser);
            } else {
                done(null, false, {message: 'Incorrect email or password.'});
            }
        }
        catch(e) {
            done(e, false);
        }
    }
));

passport.serializeUser((user: User, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await findUserNoSensitiveData({id})

        user ? done(null, user) : done(new Error('No User Found'), false);
    }
    catch(e) {
        done(e, false);
    }
});

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    });

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
    firstName: Joi.string().max(100).required(),
    lastName: Joi.string().max(100).required()
}).unknown(false)

router.post('/signup', validateBodySchema(signupSchema), safeAsyncRoute(async (req, res, next) => {
    const userWithSameEmail = await prisma.user.findUnique({
        where: {
            email: req.body.email
        }
    });

    if (userWithSameEmail) {
        return next({status: 400});
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
        data: {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            passwordHash
        }
    });
    authLogger.info(`New user signed up ${user.id}`);

    const safeUser = findUserNoSensitiveData({id: user.id})

    req.login(safeUser, error => {
        if (error) {
            authLogger.error(`Error logging user in ${user.id}`, {error});
            next({status: 500})
        }
        else {
            res.send();
        }
    })
}));