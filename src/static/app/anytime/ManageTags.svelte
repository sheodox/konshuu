<style>
	.tag-header button {
		padding: 0.25rem 0.5rem;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.manage-contents {
		overflow-y: auto;
	}
	.manage-padding {
		padding: 2px;
		border-radius: 0.2rem;
		background: var(--sx-accent-gradient);
	}
</style>

<div class="manage-padding">
	<div class="anytime-item f-column">
		<div class="tag-header f-row justify-content-between align-items-baseline">
			<h2>Tags</h2>
			<button aria-pressed={showAdd} on:click={() => (showAdd = !showAdd)}>
				<Icon icon="plus" variant="icon-only" />
				<span class="sr-only">Add Tag</span>
			</button>
		</div>

		<div class="manage-contents f-1">
			{#if showAdd}
				<fieldset>
					<legend>Add Tag</legend>
					<form class="f-column gap-2" on:submit|preventDefault={addTag}>
						<TextInput bind:value={newName}>Tag Name</TextInput>
						<button class="primary">Add</button>
					</form>
				</fieldset>
			{:else}
				<ul>
					{#each $tags as tag (tag.id)}
						<li>
							<EditTag {tag} />
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>

<script lang="ts">
	import { Icon, TextInput } from 'sheodox-ui';
	import { anytimeOps, tags } from '../stores/anytime';
	import EditTag from './EditTag.svelte';

	let showAdd = !$tags.length,
		newName = '';

	function addTag() {
		anytimeOps.tag.new(newName);
		newName = '';
	}
</script>
