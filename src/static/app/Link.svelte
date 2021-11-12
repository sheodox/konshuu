<style>
	.no-hover-styles {
		text-decoration: none;
	}
</style>

<a class={classes} {href} on:click|preventDefault={follow} class:no-hover-styles={noHoverStyles}>
	<slot />
</a>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import page from 'page';

	export let href: string;
	export let noHoverStyles = false;
	export let classes = '';

	const dispatch = createEventDispatcher();

	function follow() {
		page(href);
		dispatch('followed');
	}
</script>
