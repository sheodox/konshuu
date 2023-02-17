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
		<TextInput id="todo-text-{id}" bind:value={text} on:keydown={keydown} autofocus>Text</TextInput>
		{#if showURLEdit}
			<TextInput
				id="todo-href-{id}"
				bind:value={href}
				placeholder="https://..."
				on:keydown={keydown}
				bind:inputElement={urlInput}>URL (optional)</TextInput
			>
		{/if}
		<div class="f-row gap-2">
			<button on:click={toggleUrl} type="button"><Icon icon={showURLEdit ? 'minus' : 'plus'} />URL</button>
			<button class="secondary f-1" type="button" on:click={() => dispatch('cancel')}>Cancel</button>
			<button class="primary f-1" disabled={invalid}>Save</button>
		</div>
	</form>
</Fieldset>

<script lang="ts">
	import { tick } from 'svelte';
	import { TextInput, Fieldset, Icon } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ submit: void; cancel: void }>();

	export let title = 'Edit Todo';
	export let id: string;
	export let text: string;
	export let href: string;

	let showURLEdit = !!href,
		urlInput: HTMLInputElement | undefined;

	$: invalid = !text || (href && !/https?:/.test(href));

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && !text && !href) {
			dispatch('cancel');
		}
	}

	async function toggleUrl() {
		showURLEdit = !showURLEdit;

		// if they're not expecting to see a URL we should clear the URL or they'll get confused
		if (!showURLEdit) {
			href = '';
		} else {
			await tick();
			urlInput?.focus();
		}
	}
</script>
