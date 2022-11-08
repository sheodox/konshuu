<div class="p-1 mt-3">
	<h3>{mode === 'new' ? 'New' : 'Edit'} Recurring Todo</h3>
	<form on:submit|preventDefault={submit} class="gap-3 f-column mt-3">
		<TextInput bind:value={name}>Name</TextInput>
		<label
			>Start Date
			<br />
			<input type="date" bind:value={startDate} />
		</label>
		<Fieldset {fieldsetClasses} legend="List" variant="bordered">
			{#each lists as opt}
				<label><input type="radio" bind:group={list} value={opt.value} /> {opt.name}</label>
			{/each}
		</Fieldset>

		<Fieldset {fieldsetClasses} legend="Repeat" variant="bordered">
			{#each repeatsOptions as opt}
				<label
					><input type="radio" bind:group={repeats} value={opt.value} on:change={() => (weeklyDayRepeats = [])} />
					{opt.name}</label
				>
			{/each}
		</Fieldset>

		<TextInput type="number" bind:value={repeatEvery}>Repeat Every ___ {repeatTypeUnit}</TextInput>

		{#if repeats === 'weekly'}
			<Fieldset {fieldsetClasses} legend="Repeats On" variant="bordered">
				{#each days as day}
					<label>
						<input type="checkbox" bind:group={weeklyDayRepeats} value={day.value} />
						{day.name}
					</label>
				{/each}
			</Fieldset>
		{/if}
		<button class="primary" disabled={formInvalid}>{mode === 'new' ? 'Create' : 'Save'}</button>
		{#if mode === 'edit'}
			<button type="button" class="danger" on:click={deleteTodo}>Delete</button>
		{/if}
	</form>
</div>

<script lang="ts">
	import { TextInput, Fieldset } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';
	import { Day, RecurringRepeats, TodoListType } from '../../shared/types/todos';

	const dispatch = createEventDispatcher<{
		save: void;
		delete: void;
	}>();

	export let mode: 'new' | 'edit';

	const fieldsetClasses = 'f-row f-wrap gap-2',
		repeatsOptions = [
			{ value: 'daily', name: 'Daily', unit: 'Days' },
			{ value: 'weekly', name: 'Weekly', unit: 'Weeks' },
			{ value: 'monthly', name: 'Monthly', unit: 'Months' },
			{ value: 'yearly', name: 'Yearly', unit: 'Years' },
		],
		days = [
			{ value: 'sunday', name: 'Sunday' },
			{ value: 'monday', name: 'Monday' },
			{ value: 'tuesday', name: 'Tuesday' },
			{ value: 'wednesday', name: 'Wednesday' },
			{ value: 'thursday', name: 'Thursday' },
			{ value: 'friday', name: 'Friday' },
			{ value: 'saturday', name: 'Saturday' },
		],
		lists = [
			{ value: 'work', name: 'Work' },
			{ value: 'home', name: 'Home' },
		];

	export let repeats: RecurringRepeats = 'weekly';
	export let list: TodoListType;
	export let name: string;
	export let startDate: string;
	export let repeatEvery: number;
	export let weeklyDayRepeats: Day[];

	$: repeatTypeUnit = repeatsOptions.find(({ value }) => value === repeats)?.unit;
	$: formInvalid = !name || !startDate || !list || repeatEvery < 1;

	function submit() {
		dispatch('save');
	}

	function deleteTodo() {
		dispatch('delete');
	}
</script>
