<style>
	.units {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
	div {
		width: 100%;
	}

	label {
		text-align: center;
		text-transform: capitalize;
	}
</style>

<div class="f-column gap-2" in:fly={{ y: 10 }}>
	<fieldset class="units gap-2">
		<legend>Units</legend>
		{#each possibleUnits as unit}
			<label class="button m-0" aria-pressed={units.includes(unit)}>
				<input type="radio" bind:group={units} value={unit} class="sr-only" />
				<span>{unit}</span>
			</label>
		{/each}
	</fieldset>
</div>

<script lang="ts">
	import { fly } from 'svelte/transition';
	export let units: string;

	const possibleUnits = ['natural', 'days', 'hours', 'minutes', 'seconds'];
</script>
