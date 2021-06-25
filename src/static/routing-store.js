import {writable} from 'svelte/store';
import page from 'page';

export const activeRoute = writable('');

function setRoute(routeId) {
    return (pageData) => {
        activeRoute.set(routeId);
    }
}

page(`/settings`, setRoute('settings'));
page(`/`, setRoute('app'));
page();
