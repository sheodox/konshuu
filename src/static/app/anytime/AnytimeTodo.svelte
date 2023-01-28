<style>
	li {
		position: relative;
		align-items: center;
	}
	li:hover {
		background: var(--sx-gray-400);
		border-radius: 0.2rem;
	}
	li :global(div) {
		flex: 1;
		display: flex;
	}
	li :global(label) {
		font-size: 0.8rem;
		flex: 1;
		padding-left: 0.2rem;
	}
	button {
		padding: 0.3rem;
		text-align: left;
	}
	ul {
		list-style: none;
	}
	@media (max-width: 600px) {
		li :global(label) {
			font-size: var(--sx-font-size-3);
		}
	}
</style>

{#if showEdit}
	<AnytimeTodoEdit
		id={todo.id}
		bind:text={newText}
		bind:href={newHref}
		on:submit={saveTodo}
		on:cancel={() => (showEdit = false)}
	/>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<li
		class="todo-item f-row align-items-start px-1"
		on:click={() => toggleCompletion(!todo.completed)}
		class:muted={todo.completed}
		bind:this={li}
	>
		<div on:click|stopPropagation>
			<TodoCheckbox bind:checked={todo.completed} on:change={() => toggleCompletion(todo.completed)} id={todo.id}>
				{#if todo.href && /^https?:/.test(todo.href)}
					<a href={todo.href} class="inline-link" target="_blank" rel="noopener noreferrer">{todo.text}</a>
				{:else}
					{todo.text}
				{/if}
			</TodoCheckbox>
		</div>
		<MenuButton triggerClasses="small" contextTriggerElement={li}>
			<span slot="trigger">
				<span class="sr-only">Menu</span>
				<Icon icon="chevron-down" variant="icon-only" />
			</span>
			<ul slot="menu">
				<li>
					<button class="a" on:click={() => deleteTodo()}>
						<Icon icon="times" />
						Delete
					</button>
				</li>
				<li>
					<button class="a" on:click={toggleEdit}>
						<Icon icon="edit" />
						Edit
					</button>
				</li>
				<li>
					<button class="a" on:click={() => copyToClipboard(todo.text)}>
						<Icon icon="copy" />
						Copy
					</button>
				</li>
				<li>
					<button class="a" on:click={() => copyToClipboard(todo.href)}>
						<Icon icon="copy" />
						Copy URL
					</button>
				</li>
			</ul>
		</MenuButton>
	</li>
{/if}

<script lang="ts">
	import { copyToClipboard } from '../stores/app';
	import { anytimeOps } from '../stores/anytime';
	import { Icon, MenuButton } from 'sheodox-ui';
	import { AnytimeTodo } from '../../../shared/types/anytime';
	import TodoCheckbox from '../TodoCheckbox.svelte';
	import AnytimeTodoEdit from './AnytimeTodoEdit.svelte';

	export let anytimeId: string;
	export let todo: AnytimeTodo;

	let li: HTMLLIElement,
		showEdit = false,
		newText = '',
		newHref = '';

	function toggleCompletion(completed: boolean) {
		anytimeOps.todo.edit(todo.id, {
			text: todo.text,
			href: todo.href,
			completed,
		});
	}

	function deleteTodo() {
		anytimeOps.todo.delete(anytimeId, todo.id);
	}

	function saveTodo() {
		anytimeOps.todo.edit(todo.id, {
			text: newText,
			href: newHref,
			completed: todo.completed,
		});
		toggleEdit();
	}

	function toggleEdit() {
		showEdit = !showEdit;
		if (showEdit) {
			newText = todo.text;
			newHref = todo.href;
		}
	}
</script>
