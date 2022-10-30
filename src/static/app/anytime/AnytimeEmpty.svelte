<style>
	.anytime-item {
		background: transparent;
	}
</style>

{#if $anytimes.length}
	<div class="anytime-item f-column justify-content-center align-items-center">
		<span class="sx-font-size-9">
			<Icon icon="scroll" />
		</span>
		{#if isViewing.unknownTag}
			<p>Looks like this tag got deleted.</p>
			<button class="primary" on:click={() => dispatch('new-tag')}>
				<Icon icon="plus" />
				New Tag
			</button>
		{:else if $activeRouteParams.tagId}
			<p>No anytimes have this tag.</p>
			<button class="primary" on:click={() => dispatch('new-anytime')}><Icon icon="plus" />New Anytime</button>
		{:else if $activeRouteParams.anytimeId}
			<p>Looks like this anytime got deleted.</p>
		{:else}
			<p>No anytimes!</p>
		{/if}
		<Link classes="button {emphasizeGoBack ? 'primary' : ''}" href="/anytime">Go back</Link>
	</div>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { anytimes, tags } from '../stores/anytime';
	import { activeRouteParams } from '../stores/routing';
	import Link from '../Link.svelte';
	import { createEventDispatcher } from 'svelte';

	// various assertions on what is causing the user to not see any anytimes
	$: isViewing = {
		tag: !!$activeRouteParams.tagId,
		anytime: !!$activeRouteParams.anytime,
		unknownTag: $activeRouteParams.tagId && !$tags.some((tag) => tag.id === $activeRouteParams.tagId),
	};
	$: emphasizeGoBack = !(isViewing.tag || isViewing.anytime);

	const dispatch = createEventDispatcher<{
		'new-anytime': void;
		'new-tag': void;
	}>();
</script>
