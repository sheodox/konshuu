<div class="anytime-item">
	<h2>{data.name}</h2>

	{#each $tags as tag (tag.id)}
		<button
			on:click={() => toggleTag(tag)}
			aria-pressed={hasTag(data.tags, tag)}
			class:primary={hasTag(data.tags, tag)}
		>
			<Icon icon="tag" />
			<span>{tag.name}</span>
		</button>
	{/each}
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { tags, anytimeOps } from '../stores/anytime';
	import type { Anytime, AnytimeTag, AnytimeTagAssignment } from '../../../shared/types/anytime';

	export let data: Anytime;

	function hasTag(assignments: AnytimeTagAssignment[], tag: AnytimeTag) {
		return assignments.some(({ anytimeTagId }) => anytimeTagId === tag.id);
	}
	function toggleTag(tag: AnytimeTag) {
		const assignment = data.tags.find(({ anytimeTagId }) => anytimeTagId === tag.id);
		if (assignment) {
			anytimeOps.tag.unassign(data.id, assignment.id);
		} else {
			anytimeOps.tag.assign(data.id, tag.id);
		}
	}
</script>
