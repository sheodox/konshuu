<style lang="scss">
	textarea {
		resize: none;
		transition: background 0.1s;
		min-height: 20rem;

		&:not(:hover):not(:focus):not(.dirty) {
			background: transparent;
		}
	}
</style>

<div class="f-column f-1 gap-2">
	<textarea bind:value={notes} aria-label="notes" class="f-1" class:dirty />

	{#if dirty}
		<p class="m-0 text-align-right sx-font-size-2" class:sx-badge-red={tooLong}>{notes.length}/{maxLength}</p>
		<div class="f-row gap-2">
			<button class="secondary f-1" on:click={cancel}>Cancel</button>
			<button class="primary f-1" on:click={save} disabled={tooLong}>Save</button>
		</div>
	{/if}
</div>

<script lang="ts">
	import { Anytime } from '../../../shared/types/anytime';
	import { anytimeOps } from '../stores/anytime';

	export let data: Anytime;
	export let allowSettings: boolean;

	let notes = data.notes;
	const maxLength = 20000;

	$: dirty = notes !== data.notes;
	$: allowSettings = !dirty;
	$: tooLong = notes.length > maxLength;

	function save() {
		anytimeOps.edit(data.id, {
			...anytimeOps.anytimeToEditable(data),
			notes,
		});
	}

	function cancel() {
		if (confirm('Are you sure you want to discard your changes?')) {
			notes = data.notes;
		}
	}
</script>
