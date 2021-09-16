import { writable } from 'svelte/store';

const breakpoint = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--mobile-collapse').replace('px', ''), 10);

export const socket = io();
export const isBelowMobileBreakpoint = writable(checkIfBelowBreakpoint());

export const socketConnected = writable(true);

socket.on('connect', () => socketConnected.set(true));
socket.on('disconnect', () => socketConnected.set(false));

function checkIfBelowBreakpoint() {
	return window.innerWidth < breakpoint;
}

window.addEventListener('resize', () => {
	isBelowMobileBreakpoint.set(checkIfBelowBreakpoint);
});
