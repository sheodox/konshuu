<div class="anytime-item f-column gap-1">
	<h2>New</h2>
	<TextInput id="new-anytime-name" bind:value={name}>Name</TextInput>

	<p class="text-align-center" class:muted={!name}>Choose a type</p>
	{#each types as type}
		<button on:click={() => makeType(type.kind)} class="secondary" disabled={!name}>
			<Icon icon={type.icon} />
			{type.name}
		</button>
	{/each}
</div>

<script lang="ts">
	import { Icon, TextInput } from 'sheodox-ui';
	import { anytimeOps } from '../stores/anytime';

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
	}
</script>
