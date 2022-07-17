<style>
	.reschedule-modal {
		text-align: center;
		margin: 1rem;
	}
	.reschedule-modal form {
		justify-content: center;
	}
	.date-hint {
		color: var(--sx-gray-100);
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
		{#each quickReschedules as { dest, text, show }}
			{#if show}
				<button on:click={() => reschedule(dest)} class="secondary">
					{text}
					<br />
					<span class="date-hint">{getRescheduleDestinationDate(dest)}</span>
				</button>
			{/if}
		{/each}
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
	import { getRescheduleDestination } from './reschedule-utils';

	export let visible: boolean;
	export let calendarDate: CalendarDate;
	export let listType: TodoListType;
	export let todoCount: number;

	$: quickReschedules = [
		{
			dest: 'today',
			text: 'Today',
			show: !calendarDate.isToday(),
		},
		{
			dest: 'tomorrow',
			text: 'Tomorrow',
			show: !calendarDate.isTomorrow(),
		},
		{
			dest: 'saturday',
			text: 'Saturday',
			show: calendarDate.getDay() !== 6 && listType !== 'work',
		},
		{
			dest: 'next-week',
			text: 'Next Week',
			show: true,
		},
		{
			dest: 'next-monday',
			text: 'Next Monday',
			show: true,
		},
	];

	const dispatch = createEventDispatcher<{ reschedule: { to: string; originalDate: CalendarDate } }>();
	let customReschedule: string;

	function reschedule(to: string) {
		dispatch('reschedule', { to, originalDate: calendarDate });
		visible = false;
	}

	function getRescheduleDestinationDate(dest: string) {
		return getRescheduleDestination(dest, calendarDate).asDate().toLocaleDateString();
	}
</script>
