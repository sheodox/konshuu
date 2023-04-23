import './env.js';
import { appLogger } from './logger.js';
import serializeJavascript from 'serialize-javascript';
import { errorHandler, safeAsyncRoute } from './middleware/error-handler.js';
import { requestId } from './middleware/request-id.js';
import { app, io, server } from './server.js';
import { AppRequest } from './routes/auth.js';
import passport from 'passport';
import expressSession from 'express-session';
import connectRedis, { type Client } from 'connect-redis';
import { createClient as createRedisClient } from 'redis';
import express, { Response, Request, NextFunction } from 'express';
import path from 'path';
import { router as authRouter } from './routes/auth.js';
import { router as userRouter } from './routes/user.js';
import './routes/list.js';
import './routes/anytime.js';
import './internal-server.js';
import { getManifest } from './middleware/manifest.js';

const redisClient = createRedisClient({
	url: 'redis://redis',
	legacyMode: true,
});
redisClient.connect().catch(console.error);

app.use(requestId);
app.use('/fontawesome', express.static('./node_modules/@fortawesome/fontawesome-free'));
app.disable('x-powered-by');
app.set('views', path.resolve('src/server/views'));
app.set('view engine', 'pug');

app.use('/health', (req, res) => {
	res.send();
});

const RedisStore = connectRedis(expressSession),
	sessionStore = new RedisStore({ client: redisClient as unknown as Client }),
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

async function getRouteLocals(req: AppRequest, scriptEntryFilePath: string) {
	const { scriptEntryFile, cssImports } = await getManifest(scriptEntryFilePath),
		isDev = process.env.NODE_ENV === 'development';
	return {
		scriptEntryFile,
		cssImports,
		development: isDev,
		devHost: isDev ? req.hostname : '',
	};
}

async function renderApp(req: AppRequest, res: Response) {
	res.render('index', {
		title: 'Konshuu',
		appBootstrap: serializeJavascript({ user: req.user }),
		...(await getRouteLocals(req, 'src/static/main.ts')),
	});
}

app.get(
	'/',
	safeAsyncRoute(async (req, res) => {
		if (req.user) {
			await renderApp(req, res);
		} else {
			res.render('landing', {
				title: 'Konshuu - Weekly planning at a glance',
				...(await getRouteLocals(req, 'src/static/landing.ts')),
			});
		}
	})
);

//for each allowed front end route, render the home page if logged in, otherwise redirect
//to the login page at the proper `/` route so they don't get some content that doesn't
//match the url
['/settings', '/about', '/anytime*'].forEach((route) => {
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
