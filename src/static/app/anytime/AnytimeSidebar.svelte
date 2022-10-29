<style lang="scss">
	aside {
		background-color: var(--sx-gray-600);
		border-radius: 0 5px 5px 0;
		border: 1px solid var(--sx-gray-400);
		border-left-color: var(--sx-gray-600);
		box-shadow: var(--sx-shadow-1);
		width: 20rem;
		max-width: 95%;
		height: 90vh;
		overflow-y: auto;
	}
	.tag {
		width: 100%;
		display: flex;
		border-radius: 3px;
		border: 2px solid transparent;

		&.viewing-this-tag {
			color: white;
			background: var(--sx-gray-400);
		}
		&:hover {
			background-color: var(--sx-gray-transparent);
		}
	}

	@media (max-width: 600px) {
		aside {
			border: 1px solid var(--sx-gray-400);
			margin: 0 auto;
			border-radius: 5px;
			height: auto;
			width: 100%;
		}
	}
</style>

{#if $showAnytimeSidebar}
	<aside class="p-2">
		<div class="f-row justify-content-between align-items-baseline mb-2">
			<h2>Tags</h2>
			<button on:click={showAdd}><Icon icon="plus" />Add Tag</button>
		</div>
		<div class="f-column gap-2">
			{#if $activeRouteParams.tagId}
				<div class="tag mb-2 text-align-center">
					<Link href="/anytime" classes={anytimeTagLinkClasses} on:followed={() => ($lastAnytimeView = null)}>
						<Icon icon="arrow-left" /> Show All Anytimes</Link
					>
				</div>
			{/if}
			{#each $tagsSorted as tag}
				<div class="tag px-1" class:viewing-this-tag={$activeRouteParams.tagId === tag.id}>
					<Link
						href="/anytime/tag/{tag.id}"
						classes={anytimeTagLinkClasses}
						on:followed={() => ($lastAnytimeView = { tag: tag.id })}>{tag.name}</Link
					>
					<MenuButton>
						<span slot="trigger">
							<span class="sr-only">Menu</span>
							<Icon icon="chevron-down" variant="icon-only" />
						</span>
						<ul slot="menu">
							<button on:click={() => renameTag(tag)}>Rename</button>
							<button on:click={() => deleteTag(tag)}>Delete</button>
						</ul>
					</MenuButton>
				</div>
			{:else}
				<p>You don't have any tags!</p>
			{/each}
		</div>
	</aside>
{/if}

<script lang="ts">
	import { Icon, MenuButton, showConfirmModal, showPromptModal } from 'sheodox-ui';
	import { tagsSorted, showAnytimeSidebar, anytimeOps, lastAnytimeView } from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import Link from '../Link.svelte';
	import page from 'page';
	import type { AnytimeTag } from '../../../shared/types/anytime';

	const anytimeTagLinkClasses = 'sx-font-size-5 f-1 py-2';

	async function showAdd() {
		const newTagName = (await showPromptModal({ title: 'New Tag', label: 'New tag name' }))?.trim();
		if (newTagName) {
			anytimeOps.tag.new(newTagName);
		}
	}

	async function renameTag(tag: AnytimeTag) {
		const newTagName = (await showPromptModal({ title: 'Edit Tag', label: 'New tag name', default: tag.name }))?.trim();
		if (newTagName) {
			anytimeOps.tag.edit(tag.id, newTagName);
		}
	}

	async function deleteTag(tag: AnytimeTag) {
		const confirmed = await showConfirmModal({
			title: 'Delete Tag',
			message: `Are you sure you want to delete "${tag.name}"?`,
		});
		if (confirmed) {
			anytimeOps.tag.delete(tag.id);
			if (tag.id === $activeRouteParams.tagId) {
				page('/anytime');
				$lastAnytimeView = null;
			}
		}
	}
</script>
