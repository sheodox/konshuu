<style>
	.new-padding {
		padding: 2px;
		border-radius: 0.2rem;
		background: var(--sx-accent-gradient);
	}
</style>

<div class="new-padding">
	<div class="anytime-item f-column gap-1">
		<h2>New Anytime</h2>
		<TextInput id="new-anytime-name" bind:value={name}>Name</TextInput>

		<p class="text-align-center" class:muted={!name}>Choose a type</p>
		<div class="f-column gap-1 f-1">
			{#each types as type}
				<button on:click={() => makeType(type.kind)} class="secondary" disabled={!name}>
					<Icon icon={type.icon} />
					{type.name}
				</button>
			{/each}
		</div>
		<button on:click={close} class="secondary">Cancel</button>
	</div>
</div>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon, TextInput } from 'sheodox-ui';
	import { anytimeOps } from '../stores/anytime';
	const dispatch = createEventDispatcher<{ close: void }>();

	let name = '';

	const types = [
		{
			icon: 'list',
			name: 'Todo List',
			kind: 'todos',
		},
		{
			icon: 'calculator',
			name: 'Counter',
			kind: 'counter',
		},
	];

	function makeType(type: string) {
		anytimeOps.new({ name, type });
		name = '';
		close();
	}
	function close() {
		dispatch('close');
	}
</script>
