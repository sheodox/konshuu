<Fieldset legend="Edit Tag">
	<form class="f-column gap-2" on:submit|preventDefault={save}>
		<TextInput bind:value={name}>Tag Name</TextInput>
		<div class="f-row gap-2 f-1">
			<button class="danger f-1" type="button" on:click={remove}>Delete</button>
			<button class="primary f-1" disabled={!name || name === tag.name}>Save</button>
		</div>
	</form>
</Fieldset>

<script lang="ts">
	import { AnytimeTag } from '../../../shared/types/anytime';
	import { TextInput, Fieldset } from 'sheodox-ui';
	import { anytimeOps } from '../stores/anytime';

	export let tag: AnytimeTag;
	let name = tag.name;

	function save() {
		anytimeOps.tag.edit(tag.id, name);
	}

	function remove() {
		if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
			anytimeOps.tag.delete(tag.id);
		}
	}
</script>
