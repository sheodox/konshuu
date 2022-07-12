<fieldset>
	<legend>Edit Tag</legend>
	<form class="f-column gap-2" on:submit|preventDefault={save}>
		<TextInput bind:value={name}>Tag Name</TextInput>
		<div class="f-row gap-2 f-1">
			<button class="danger f-1" type="button" on:click={remove}>Delete</button>
			<button class="primary f-1" disabled={!name || name === tag.name}>Save</button>
		</div>
	</form>
</fieldset>

<script lang="ts">
	import { AnytimeTag } from '../../../shared/types/anytime';
	import { TextInput } from 'sheodox-ui';
	import { anytimeOps } from '../stores/anytime';

	export let tag: AnytimeTag;
	let name = tag.name;

	function save() {
		anytimeOps.tag.edit(tag.id, name);
	}

	function remove() {
		anytimeOps.tag.delete(tag.id);
	}
</script>
