<style lang="scss">
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
	.hidden-icon {
		color: var(--sx-gray-200);
	}
</style>

<div class="tag px-1" class:viewing-this-tag={$activeRouteParams.tagId === tag.id}>
	<Link
		href="/anytime/tag/{tag.id}"
		classes={anytimeTagLinkClasses}
		on:followed={() => ($lastAnytimeView = { tag: tag.id })}
	>
		<span class="f-1">
			{tag.name}
		</span>
		{#if !tag.showOnAllAnytimes}
			<span title="Hidden from All Anytimes list" class="hidden-icon">
				<Icon icon="eye-slash" variant="icon-only" />
				<span class="sr-only">Hidden from All Anytimes list</span>
			</span>
		{/if}
		<span class="sx-badge-gray my-0 sx-font-size-2" title="Anytimes with this tag"
			>{countTagUsage(tag.id, $anytimes)}</span
		>
	</Link>
	<MenuButton triggerClasses="small">
		<span slot="trigger">
			<span class="sr-only">Menu</span>
			<Icon icon="chevron-down" variant="icon-only" />
		</span>
		<ul slot="menu">
			<li>
				<button on:click={startShowSettings}>Settings</button>
			</li>
			<li>
				<button on:click={() => deleteTag(tag)}>Delete</button>
			</li>
		</ul>
	</MenuButton>
</div>

{#if showSettings}
	<Modal bind:visible={showSettings} title="Edit Tag '{tag.name}'">
		<form on:submit|preventDefault={saveSettings}>
			<div class="modal-body f-column gap-3">
				<TextInput bind:value={newTagName}>Name</TextInput>
				<Checkbox bind:checked={showOnAllAnytimes}>Show tagged anytimes in all anytimes list</Checkbox>
			</div>
			<div class="modal-footer">
				<button on:click={() => (showSettings = false)} class="secondary" type="button">Cancel</button>
				<button class="primary">Save</button>
			</div>
		</form>
	</Modal>
{/if}

<script lang="ts">
	import { TextInput, MenuButton, Icon, showConfirmModal, Modal, Checkbox } from 'sheodox-ui';
	import Link from '../Link.svelte';
	import { anytimes, anytimeOps, lastAnytimeView } from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import page from 'page';
	import type { Anytime, AnytimeTag } from '../../../shared/types/anytime';

	export let tag: AnytimeTag;

	let showSettings = false,
		newTagName: string,
		showOnAllAnytimes: boolean;

	const anytimeTagLinkClasses = 'sx-font-size-4 f-1 py-2 f-row align-items-center';

	async function saveSettings() {
		const name = newTagName.trim();
		if (name) {
			anytimeOps.tag.edit(tag.id, name, showOnAllAnytimes);
			showSettings = false;
		}
	}

	function startShowSettings() {
		newTagName = tag.name;
		showOnAllAnytimes = tag.showOnAllAnytimes;
		showSettings = true;
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

	function countTagUsage(tagId: string, anytimes: Anytime[]) {
		return anytimes.reduce((total, anytime) => {
			return total + (anytime.tags.some((t) => t.anytimeTagId === tagId) ? 1 : 0);
		}, 0);
	}
</script>
