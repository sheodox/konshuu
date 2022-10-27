import { writable } from 'svelte/store';
import page, { Context } from 'page';

export const activeRoute = writable('');
export const activeRouteParams = writable<Record<string, string>>({});

function setRoute(routeId: string) {
	return (context: Context) => {
		activeRoute.set(routeId);
		activeRouteParams.set(context.params);
	};
}

page(`/settings`, setRoute('settings'));
page(`/anytime`, setRoute('anytime'));
page(`/anytime/:anytimeId`, setRoute('anytime'));
page(`/about`, setRoute('about'));
page(`/`, setRoute('app'));
page();
