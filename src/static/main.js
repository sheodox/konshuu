import {styles} from "sheodox-ui";
import './scss/style.scss';
import KonshuuApp from './KonshuuApp.svelte';

new KonshuuApp({
	target: document.querySelector('#app-root')
})