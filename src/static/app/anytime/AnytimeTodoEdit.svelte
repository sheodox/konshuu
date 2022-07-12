<style>
	button {
		margin: 0;
	}
</style>

<fieldset>
	<legend>{title}</legend>
	<form class="f-column gap-2" on:submit|preventDefault={() => dispatch('submit')}>
		<TextInput id="todo-text-{id}" bind:value={text}>Text</TextInput>
		<TextInput id="todo-href-{id}" bind:value={href} placeholder="https://...">URL (optional)</TextInput>
		<div class="f-row gap-2">
			{#if showCancel}
				<button class="secondary f-1" type="button" on:click={() => dispatch('cancel')}>Cancel</button>
			{/if}
			<button class="primary f-1" disabled={invalid}>Save</button>
		</div>
	</form>
</fieldset>

<script lang="ts">
	import { TextInput } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ submit: void; cancel: void }>();

	export let title = 'Edit Todo';
	export let id: string;
	export let text: string;
	export let href: string;
	export let showCancel = true;

	$: invalid = !text || (href && !/https?:/.test(href));
</script>
