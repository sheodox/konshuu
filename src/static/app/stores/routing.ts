import { writable } from 'svelte/store';
import page, { Context } from 'page';
import { appTitle } from './app';

export const activeRoute = writable('');
export const activeRouteParams = writable<Record<string, string>>({});

function setRoute(routeId: string) {
	return (context: Context) => {
		// let the new app dictate the title
		appTitle.set('');
		activeRoute.set(routeId);
		activeRouteParams.set(context.params);
	};
}

page(`/settings`, setRoute('settings'));
page(`/anytime`, setRoute('anytime'));
page(`/anytime/tag/:tagId`, setRoute('anytime'));
page(`/anytime/:anytimeId`, setRoute('anytime'));
page(`/about`, setRoute('about'));
page(`/`, setRoute('app'));
page();
