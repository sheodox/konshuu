<style>
	.error-banner {
		text-align: center;
		color: black;
		background: var(--sx-red-400);
	}
	:root {
		--sx-hue-gray: 260 !important;
	}
</style>

{#if !$socketConnected}
	<div class="error-banner">
		<p>Error connecting to the Konshuu server.</p>
	</div>
{/if}

<Header
	slim={true}
	appName="Konshuu"
	href="/"
	on:titleclick={() => page('/')}
	titleClickPreventDefault={true}
	bind:showMenuTrigger={$routeHasSidebar}
	bind:menuOpen={$isSidebarOpen}
>
	<Logo slot="logo" />

	<nav slot="headerCenter">
		<ul>
			<HeaderNav />
		</ul>
	</nav>
	<nav slot="headerEnd">
		<ul>
			<li>
				<UserMenu />
			</li>
		</ul>
	</nav>
</Header>

<Toasts />
<Modals />

<Router />

<script lang="ts">
	import { isSidebarOpen, socketConnected } from './stores/app';
	import page from 'page';
	import { Header, Toasts, Modals } from 'sheodox-ui';
	import { routeHasSidebar } from './stores/routing';
	import UserMenu from './UserMenu.svelte';
	import Router from './Router.svelte';
	import HeaderNav from './HeaderNav.svelte';
	import Logo from './Logo.svelte';
</script>
