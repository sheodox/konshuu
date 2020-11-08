require('dotenv').config();
const express = require('express'),
	path = require('path'),
	app = express();

app.use(express.static('./static'));
app.use('/fontawesome', express.static('./node_modules/@fortawesome/fontawesome-free'));
app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
	res.render('index', {title: 'Konshuu'});
})
app.use('/list', require('./routes/list'));

app.listen(3000, () => {
	console.log('Konshuu server started!');
});