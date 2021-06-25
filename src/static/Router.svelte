{#if $activeRoute === 'settings'}
    <Settings />
{:else if $activeRoute === 'app'}
    <Todos />
{:else}
    <p>Not Found</p>
{/if}

<script>
    import {activeRoute} from "./routing-store";
    import Todos from "./Todos.svelte";
    import Settings from "./settings/Settings.svelte";
</script>