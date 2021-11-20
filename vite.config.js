import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		resolve({
			extensions: ['.js', '.ts'],
		}),
	],
	server: {
		hmr: {
			protocol: 'ws',
			host: 'localhost',
			port: '3000',
		},
	},
	build: {
		manifest: true,
		outDir: './public-dist',
		rollupOptions: {
			input: {
				main: '/src/static/main.ts',
				landing: '/src/static/landing.ts',
			},
		},
	},
});
