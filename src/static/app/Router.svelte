<style>
	.not-found {
		margin: 0 auto;
	}
</style>

{#if $activeRoute === 'settings'}
	<Settings />
{:else if $activeRoute === 'about'}
	<About />
{:else if $activeRoute === 'app'}
	<Todos />
{:else if $activeRoute === 'anytime'}
	{#if $anytimesInitialized}
		<Anytime />
	{:else}
		<PageLoading />
	{/if}
{:else}
	<div class="not-found has-inline-links">
		<h1>Not Found</h1>
		<p>The page you were trying to view doesn't exist.</p>
		<p>Try going back to the <Link href="/">home page</Link></p>
	</div>
{/if}

<script lang="ts">
	import { activeRoute } from './stores/routing';
	import PageLoading from './PageLoading.svelte';
	import Todos from './Todos.svelte';
	import Settings from './settings/Settings.svelte';
	import About from './About.svelte';
	import Link from './Link.svelte';
	import Anytime from './anytime/Anytime.svelte';
	import { anytimesInitialized } from './stores/anytime';
</script>
