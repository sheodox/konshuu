/// <reference types="vite/client" />
/// <reference types="svelte" />
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import './scss/style.scss';
import 'sheodox-ui/style.scss';
import Landing from './landing/Landing.svelte';

new Landing({
	target: document.querySelector('#app-root'),
});
