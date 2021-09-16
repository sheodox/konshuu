const path = require('path'),
	CopyPlugin = require('copy-webpack-plugin'),
	{WebpackManifestPlugin} = require('webpack-manifest-plugin'),
	isProd = process.argv.includes('production');

module.exports = {
	watch: !isProd,
	mode: isProd ? 'production' : 'development',
	entry: {
		main: './src/static/main.js',
		landing: './src/static/landing/landing.js'
	},
	output: {
		filename: '[name].[contenthash].js',
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
				use: 'svelte-loader'
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			}
		]
	},
	plugins: [
		new CopyPlugin({
			patterns:[{
				from: '**/*.svg',
				context: './src/static',
			}, {
				from: '**/*.png',
				context: './src/static',
			},
				//move fontawesome assets to where they can be served
				{from: 'fontawesome-free/**/*.{woff,ttf,css,txt,woff2}', context: './node_modules/@fortawesome/'},
				{from: 'client-dist/socket.io.min.js', context: './node_modules/socket.io/'}
			]
		}),
		new WebpackManifestPlugin(),
	]
};
