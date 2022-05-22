<style>
	.error-banner {
		text-align: center;
		color: black;
		background: var(--sx-red-400);
	}
</style>

{#if !$socketConnected}
	<div class="error-banner">
		<p>Error connecting to the Konshuu server.</p>
	</div>
{/if}

<Header slim={true} appName="Konshuu" href="/" on:titleclick={() => page('/')} titleClickPreventDefault={true}>
	<svg viewBox="0 0 100 100" slot="logo">
		<image xlink:href="/logo.svg" />
	</svg>

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

<Router />

<script lang="ts">
	import { socketConnected } from './stores/app';
	import page from 'page';
	import { Header, Toasts } from 'sheodox-ui';
	import UserMenu from './UserMenu.svelte';
	import Router from './Router.svelte';
	import HeaderNav from './HeaderNav.svelte';
</script>
