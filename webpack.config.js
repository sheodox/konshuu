const path = require('path'),
	isProd = process.argv.includes('production');

module.exports = {
	watch: !isProd,
	mode: isProd ? 'production' : 'development',
	entry: {
		main: './static-src/main.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, './static')
	},
	resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte')
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
	},
	module: {
		rules: [
			{
				test: /\.(html|svelte)$/,
				exclude: /node_modules/,
				use: 'svelte-loader'
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			}
		]
	}
};
