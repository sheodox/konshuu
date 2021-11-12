import './env.js';
import { appLogger } from './logger.js';
import serializeJavascript from 'serialize-javascript';
import { errorHandler, safeAsyncRoute } from './middleware/error-handler.js';
import { requestId } from './middleware/request-id.js';
import { app, io, server } from './server.js';
import { AppRequest } from './routes/auth.js';
import passport from 'passport';
import expressSession from 'express-session';
import connectRedis from 'connect-redis';
import { createClient as createRedisClient } from 'redis';
import express, { Response, Request, NextFunction } from 'express';
import path from 'path';
import { router as authRouter } from './routes/auth.js';
import { router as userRouter } from './routes/user.js';
import './routes/list.js';
import './internal-server.js';
import { getManifest } from './middleware/manifest.js';

const redisClient = createRedisClient({
	host: 'redis',
});

app.use(requestId);
app.use('/fontawesome', express.static('./node_modules/@fortawesome/fontawesome-free'));
app.disable('x-powered-by');
app.set('views', path.resolve('src/server/views'));
app.set('view engine', 'pug');

const RedisStore = connectRedis(expressSession),
	sessionStore = new RedisStore({ client: redisClient }),
	session = expressSession({
		store: sessionStore,
		name: 'konshuu.sid',
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false,
			expires: new Date(253402300000000),
		},
	});
app.use(session);
io.use((socket, next) => {
	session(socket.request as Request, {} as Response, next as NextFunction);
});

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(authRouter);

app.use('/user', userRouter);

async function renderApp(req: AppRequest, res: Response) {
	const { scriptEntryFile, cssImports } = await getManifest('src/static/main.ts');
	res.render('index', {
		title: 'Konshuu',
		appBootstrap: serializeJavascript({ user: req.user }),
		scriptEntryFile,
		cssImports,
		development: process.env.NODE_ENV === 'development',
	});
}

app.get(
	'/',
	safeAsyncRoute(async (req, res) => {
		if (req.user) {
			await renderApp(req, res);
		} else {
			const { scriptEntryFile, cssImports } = await getManifest('src/static/landing.ts');
			res.render('landing', {
				title: 'Konshuu',
				scriptEntryFile,
				cssImports,
				development: process.env.NODE_ENV === 'development',
			});
		}
	})
);

//for each allowed front end route, render the home page if logged in, otherwise redirect
//to the login page at the proper `/` route so they don't get some content that doesn't
//match the url
['/settings'].forEach((route) => {
	app.get(
		route,
		safeAsyncRoute(async (req, res) => {
			if (req.user) {
				await renderApp(req, res);
			} else {
				res.redirect('/');
			}
		})
	);
});

app.use(errorHandler(false));
server.listen(4000, () => {
	appLogger.info('Konshuu server started!');
});
