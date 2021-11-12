import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { User } from '../../../shared/types/app';

interface AppBootstrap {
	__APP_BOOTSTRAP__: {
		user: User;
	};
}

export const appBootstrap = (window as unknown as AppBootstrap).__APP_BOOTSTRAP__;

const breakpoint = parseInt(
	getComputedStyle(document.documentElement).getPropertyValue('--mobile-collapse').replace('px', ''),
	10
);

export const socket = io();
export const isBelowMobileBreakpoint = writable(checkIfBelowBreakpoint());

export const socketConnected = writable(true);

socket.on('connect', () => socketConnected.set(true));
socket.on('disconnect', () => socketConnected.set(false));

function checkIfBelowBreakpoint() {
	return window.innerWidth < breakpoint;
}

window.addEventListener('resize', () => {
	isBelowMobileBreakpoint.set(checkIfBelowBreakpoint());
});
