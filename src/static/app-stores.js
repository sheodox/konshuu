import { writable } from 'svelte/store';

const breakpoint = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--mobile-collapse').replace('px', ''), 10);

export const isBelowMobileBreakpoint = writable(checkIfBelowBreakpoint());

function checkIfBelowBreakpoint() {
	return window.innerWidth < breakpoint;
}

window.addEventListener('resize', () => {
	isBelowMobileBreakpoint.set(checkIfBelowBreakpoint);
});
