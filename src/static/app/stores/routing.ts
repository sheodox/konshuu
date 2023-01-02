import { writable } from 'svelte/store';
import page, { Context } from 'page';
import { appTitle } from './app';

export const activeRoute = writable('');
export const activeRouteParams = writable<Record<string, string>>({});
export const routeHasSidebar = writable(false);

interface RouteOptions {
	routeHasSidebar?: boolean;
}

function setRoute(routeId: string, options?: RouteOptions) {
	return (context: Context) => {
		// let the new app dictate the title
		appTitle.set('');
		activeRoute.set(routeId);
		activeRouteParams.set(context.params);
		routeHasSidebar.set(options?.routeHasSidebar ?? false);
	};
}

page(`/settings`, setRoute('settings'));
page(`/anytime`, setRoute('anytime', { routeHasSidebar: true }));
page(`/anytime/tag/:tagId`, setRoute('anytime', { routeHasSidebar: true }));
page(`/anytime/:anytimeId`, setRoute('anytime', { routeHasSidebar: true }));
page(`/about`, setRoute('about'));
page(`/`, setRoute('app'));
page();
