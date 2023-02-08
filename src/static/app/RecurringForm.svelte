<div class="p-1 mt-3">
	<h3>{mode === 'new' ? 'New' : 'Edit'} Recurring Todo</h3>
	<form on:submit|preventDefault={submit} class="gap-3 f-column mt-3">
		<TextInput bind:value={name}>Name</TextInput>
		<label
			>Start Date
			<br />
			<input type="date" bind:value={startDate} />
		</label>
		<Fieldset {fieldsetClasses} legend="List" variant="box">
			<div class="sx-toggles f-row f-wrap">
				{#each lists as opt}
					{@const checkboxId = 'recurring-form-list-' + opt.value}
					<input id={checkboxId} value={opt.value} type="radio" bind:group={list} />
					<label for={checkboxId}>
						<span>{opt.name}</span>
					</label>
				{/each}
			</div>
		</Fieldset>

		<Fieldset {fieldsetClasses} legend="Repeat" variant="box">
			<div class="sx-toggles f-row">
				{#each repeatsOptions as opt}
					{@const radioId = 'recurring-form-repeats-' + opt.value}
					<input
						id={radioId}
						value={opt.value}
						type="radio"
						bind:group={repeats}
						on:change={() => (weeklyDayRepeats = [])}
					/>
					<label for={radioId}>
						<span>{opt.name}</span>
					</label>
				{/each}
			</div>
		</Fieldset>

		<TextInput type="number" bind:value={repeatEvery}>Repeat Every ___ {repeatTypeUnit}</TextInput>

		{#if repeats === 'weekly'}
			<Fieldset {fieldsetClasses} legend="Repeats On" variant="box">
				<div class="sx-toggles f-row f-wrap">
					{#each days as day}
						{@const checkboxId = 'recurring-form-day-' + day.value}
						<input id={checkboxId} value={day.value} type="checkbox" bind:group={weeklyDayRepeats} />
						<label for={checkboxId}>
							<span>{day.name}</span>
						</label>
					{/each}
				</div>
				{#if !weeklyDayRepeats.length}
					<small class="sx-badge-red">You must specify the day(s) of the week to repeat on.</small>
				{/if}
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
			{ value: 'sunday', name: 'Sun' },
			{ value: 'monday', name: 'Mon' },
			{ value: 'tuesday', name: 'Tue' },
			{ value: 'wednesday', name: 'Wed' },
			{ value: 'thursday', name: 'Thu' },
			{ value: 'friday', name: 'Fri' },
			{ value: 'saturday', name: 'Sat' },
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
	$: formInvalid =
		!name || !startDate || !list || repeatEvery < 1 || (repeats === 'weekly' && !weeklyDayRepeats.length);

	function submit() {
		dispatch('save');
	}

	function deleteTodo() {
		dispatch('delete');
	}
</script>
