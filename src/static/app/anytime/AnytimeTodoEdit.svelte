<fieldset>
	<legend>{title}</legend>
	<form class="f-column gap-2" on:submit|preventDefault={() => dispatch('submit')}>
		<TextInput id="todo-text-{id}" bind:value={text}>Text</TextInput>
		<TextInput id="todo-href-{id}" bind:value={href} placeholder="https://...">URL (optional)</TextInput>
		<button class="primary" disabled={invalid}>Save</button>
		{#if showCancel}
			<button class="secondary" type="button" on:click={() => dispatch('cancel')}>Cancel</button>
		{/if}
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
