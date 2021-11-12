{#if $activeRoute === 'settings'}
	<Settings />
{:else if $activeRoute === 'app'}
	<Todos />
{:else}
	<p>Not Found</p>
{/if}

<script lang="ts">
	import { activeRoute } from './stores/routing';
	import Todos from './Todos.svelte';
	import Settings from './settings/Settings.svelte';
</script>
