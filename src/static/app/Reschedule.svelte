<style>
	.reschedule-modal {
		text-align: center;
		margin: 1rem;
	}
	.reschedule-modal form {
		justify-content: center;
	}
	form,
	form label {
		display: flex;
		flex-shrink: 0;
	}
</style>

<Modal title="Reschedule" bind:visible>
	<div class="reschedule-modal">
		<p>
			When should {todoCount === 1 ? 'this todo' : 'these todos'} be rescheduled to?
		</p>
		{#if !isToday}
			<button on:click={() => reschedule('today')}>Today</button>
		{/if}
		{#if !isTomorrow}
			<button on:click={() => reschedule('tomorrow')}>Tomorrow</button>
		{/if}
		{#if calendarDate.getDay() !== 6 && listType !== 'work'}
			<button on:click={() => reschedule('saturday')}>Saturday</button>
		{/if}
		<button on:click={() => reschedule('next-week')}>Next Week</button>
		<button on:click={() => reschedule('next-monday')}>Next Monday</button>
		<br />
		<p>Or a custom date...</p>
		<form on:submit|preventDefault={() => reschedule(customReschedule)}>
			<label class="input-group">
				<input type="date" bind:value={customReschedule} required />
				<button disabled={!customReschedule}>Reschedule</button>
			</label>
		</form>
	</div>
</Modal>

<script lang="ts">
	import { Modal } from 'sheodox-ui';
	import { createEventDispatcher } from 'svelte';
	import type { CalendarDate } from '../../shared/dates';
	import type { TodoListType } from '../../shared/types/todos';

	export let visible: boolean;
	export let calendarDate: CalendarDate;
	export let listType: TodoListType;
	export let todoCount: number;

	$: isToday = calendarDate.isToday();
	$: isTomorrow = calendarDate.isTomorrow();

	const dispatch = createEventDispatcher<{ reschedule: { to: string; originalDate: CalendarDate } }>();
	let customReschedule: string;

	function reschedule(to: string) {
		dispatch('reschedule', { to, originalDate: calendarDate });
		visible = false;
	}
</script>
