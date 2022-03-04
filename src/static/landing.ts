/// <reference types="vite/client" />
/// <reference types="svelte" />
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { styles } from 'sheodox-ui';
import './scss/style.scss';
import Landing from './landing/Landing.svelte';

new Landing({
	target: document.querySelector('#app-root'),
});
