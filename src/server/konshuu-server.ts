require('dotenv').config();
import {appLogger} from "./logger";
import {errorHandler, safeAsyncRoute} from "./middleware/error-handler";
import {requestId} from "./middleware/request-id";
import {app} from "./server";
import {AppRequest} from "./routes/auth";
import passport from "passport";
import expressSession from 'express-session';
import connectRedis from 'connect-redis';
import {createClient as createRedisClient} from 'redis';
import express from 'express';
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

export async function getManifest() {
	const manifestPath = path.join(process.cwd(), 'static/manifest.json');

	if (process.env.NODE_ENV === 'production') {
		return require(manifestPath);
	}
	//reload every time for development
	return JSON.parse((await fs.readFile(manifestPath)).toString());
}

app.get('/', safeAsyncRoute(async (req, res) => {
	const manifest = await getManifest();
	if (req.user) {
		res.render('index', {
			title: 'Konshuu',
			manifest
		});
	}
	else {
		res.render('landing', {
			title: 'Konshuu',
			manifest
		})
	}
}));

app.use(errorHandler(false));
app.listen(4000, () => {
	appLogger.info('Konshuu server started!');
});
