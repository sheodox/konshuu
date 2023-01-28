<style lang="scss">
	input {
		opacity: 0;
	}
	input:focus + label > .checkbox-icon > :global(i) {
		outline: 2px solid var(--sx-input-focus-color);
		outline-offset: 1px;
		border-radius: 3px;
	}
	.checkbox-icon {
		margin-left: -1.2rem;
		color: var(--sx-text-color);
	}
	.checkbox-icon :global(i) {
		padding: 1px;
	}
	.checked {
		.checkbox-icon,
		label {
			color: var(--sx-gray-200);
		}
	}
	.disabled {
		color: var(--sx-gray-100);
	}
	.todo-checkbox-container {
		display: flex;
		flex: 1;
		&:hover {
			background: var(--sx-gray-400);
			border-radius: 3px;
		}
	}
	label {
		font-size: 0.8rem;
		flex: 1;
		padding-left: 0.2rem;
	}
	.add-padding label {
		padding-top: var(--sx-spacing-1);
		padding-bottom: var(--sx-spacing-1);
	}
	@media (max-width: 600px) {
		label {
			font-size: var(--sx-font-size-3);
		}
	}
</style>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="todo-checkbox-container px-1" on:click|stopPropagation class:checked class:add-padding={addPadding}>
	<input type="checkbox" id="checkbox-{id}" bind:checked {disabled} on:change />
	<label for="checkbox-{id}" class:disabled>
		<span class="checkbox-icon">
			<Icon
				icon={checked ? 'check-square' : 'square'}
				iconVariant={checked ? 'solid' : 'regular'}
				variant="icon-only"
			/>
		</span>
		<slot />
	</label>
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';

	export let id: string;
	export let checked = false;
	export let disabled = false;
	export let addPadding = false;

	if (!id) {
		throw new Error(`'id' not provided for checkbox.`);
	}
</script>
