<style>
	.error-banner {
		text-align: center;
        color: black;
        background: var(--shdx-red-400);
    }
</style>

{#if $updateError}
    <div class="error-banner">
        <p>{$updateError}</p>
    </div>
{/if}

<Header
    slim={true}
    appName="Konshuu"
    href="/"
    on:titleclick={() => page('/')}
    titleClickPreventDefault={true}
>
	<svg viewbox="0 0 100 100" slot="logo">
		<image xlink:href="/logo.svg"></image>
	</svg>

    <nav slot="nav">
		<ul>
            <HeaderNav />
            <li>
                <UserMenu />
			</li>
		</ul>
	</nav>
</Header>

<Toasts />

<Router />

<script>
	import {updateError} from './todosStore';
	import page from 'page';
	import {Header, Toasts} from 'sheodox-ui';
	import UserMenu from "./UserMenu.svelte";
	import Router from "./Router.svelte";
	import HeaderNav from "./HeaderNav.svelte";
</script>