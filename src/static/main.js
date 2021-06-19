import '../../node_modules/sheodox-ui/style.scss';
import './scss/style.scss';
import KonshuuApp from './KonshuuApp.svelte';

new KonshuuApp({
	target: document.querySelector('#app-root')
})