<style>
	button {
		margin: 0;
	}

	/* without this the new todo list will slowly make the new fieldset disappear */
	:global(.new-todo-fieldset) {
		overflow: visible !important;
	}
</style>

<Fieldset legend={title} fieldsetClasses="new-todo-fieldset">
	<form class="f-column gap-2" on:submit|preventDefault={() => dispatch('submit')}>
		<TextInput id="todo-text-{id}" bind:value={text} on:keydown={keydown}>Text</TextInput>
		<TextInput id="todo-href-{id}" bind:value={href} placeholder="https://..." on:keydown={keydown}
			>URL (optional)</TextInput
		>
		<div class="f-row gap-2">
			<button class="primary f-1" disabled={invalid}>Save</button>
			{#if showCancel}
				<button class="secondary f-1" type="button" on:click={() => dispatch('cancel')}>Cancel</button>
			{/if}
		</div>
	</form>
</Fieldset>

<script lang="ts">
	import { TextInput, Fieldset } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ submit: void; cancel: void }>();

	export let title = 'Edit Todo';
	export let id: string;
	export let text: string;
	export let href: string;
	export let showCancel = true;

	$: invalid = !text || (href && !/https?:/.test(href));

	function keydown(e: KeyboardEvent) {
		if (showCancel && e.key === 'Escape' && !text && !href) {
			dispatch('cancel');
		}
	}
</script>
