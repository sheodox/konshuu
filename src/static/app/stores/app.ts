import { writable, readable } from 'svelte/store';
import { io } from 'socket.io-client';
import { User } from '../../../shared/types/app';
import { isOnajiSerialized } from 'onaji';
import { serialize, deserialize } from '../../../shared/serialization';

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
export const appTitle = writable('');
export const isSidebarOpen = writable(false);
export const isBelowMobileBreakpoint = writable(checkIfBelowBreakpoint());
export const now = readable<Date>(new Date(), (set) => {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => clearInterval(interval);
});

appTitle.subscribe((subtitle) => {
	let title = 'Konshuu';
	if (subtitle) {
		title = `${subtitle} - ${title}`;
	}

	document.title = title;
});

export const socketConnected = writable(true);

export const envoy = {
	on: (eventName: string, listener: (...args: any[]) => any) => {
		socket.on(eventName, (...args) => {
			args = args.map((arg) => {
				if (isOnajiSerialized(arg)) {
					return deserialize(arg);
				}
				return arg;
			});
			listener(...args);
		});
	},
	emit: (eventName: string, ...args: any[]) => {
		args = args.map((arg: any) => {
			// prevent serializing of null, in JS it has a typeof 'object'
			if (arg && typeof arg === 'object') {
				return serialize(arg);
			}
			return arg;
		});

		socket.emit(eventName, ...args);
	},
};

socket.on('connect', () => socketConnected.set(true));
socket.on('disconnect', () => socketConnected.set(false));

function checkIfBelowBreakpoint() {
	return window.innerWidth < breakpoint;
}

window.addEventListener('resize', () => {
	isBelowMobileBreakpoint.set(checkIfBelowBreakpoint());
});

export function copyToClipboard(text: string) {
	const el = document.createElement('textarea');
	document.body.appendChild(el);
	el.textContent = text;
	el.select();
	document.execCommand('copy');
	el.remove();
}
