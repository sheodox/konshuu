require('dotenv').config();
import {appLogger} from "./logger";
import serializeJavascript from "serialize-javascript";
import {errorHandler, safeAsyncRoute} from "./middleware/error-handler";
import {requestId} from "./middleware/request-id";
import {app} from "./server";
import {AppRequest} from "./routes/auth";
import passport from "passport";
import expressSession from 'express-session';
import connectRedis from 'connect-redis';
import {createClient as createRedisClient} from 'redis';
import express, {Response} from 'express';
import './internal-server';
const fs = require('fs').promises;
const path = require('path'),
	redisClient = createRedisClient({
		host: 'redis'
	});

app.use(requestId)
app.use('/fontawesome', express.static('./node_modules/@fortawesome/fontawesome-free'));
app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const RedisStore = connectRedis(expressSession),
	sessionStore = new RedisStore({client: redisClient}),
	session = expressSession({
		store: sessionStore,
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false,
			expires: new Date(253402300000000)
		}
	});
app.use(session);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
import {router as authRouter} from './routes/auth';
app.use(authRouter);

app.use('/todo', require('./routes/list'));
import {router as userRouter} from './routes/user';
app.use('/user', userRouter);

export async function getManifest() {
	const manifestPath = path.join(process.cwd(), 'static/manifest.json');

	if (process.env.NODE_ENV === 'production') {
		return require(manifestPath);
	}
	//reload every time for development
	return JSON.parse((await fs.readFile(manifestPath)).toString());
}

async function renderApp(req: AppRequest, res: Response) {
	const manifest = await getManifest();
	res.render('index', {
		title: 'Konshuu',
		user: serializeJavascript(req.user),
		manifest
	});
}

app.get('/', safeAsyncRoute(async (req, res) => {
	if (req.user) {
		await renderApp(req, res);
	}
	else {
		const manifest = await getManifest();
		res.render('landing', {
			title: 'Konshuu',
			manifest
		});
	}
}));

//for each allowed front end route, render the home page if logged in, otherwise redirect
//to the login page at the proper `/` route so they don't get some content that doesn't
//match the url
['/settings'].forEach(route => {
	app.get(route, safeAsyncRoute( async(req, res) => {
		if (req.user) {
			await renderApp(req, res);
		}
		else {
			res.redirect('/');
		}
	}))
})

app.use(errorHandler(false));
app.listen(4000, () => {
	appLogger.info('Konshuu server started!');
});
