<style>
    .reschedule-modal {
        text-align: center;
        margin: 1rem;
    }
    .reschedule-modal form {
        justify-content: center;
    }
    form, form label {
        display: flex;
        flex-shrink: 0;
    }
</style>

<Modal title="Reschedule" bind:visible={visible}>
	<div class="reschedule-modal">
		<p>
			When should these todos be rescheduled to?
		</p>
		{#if !isToday}
			<button on:click={() => reschedule('today')}>
				Today
			</button>
		{/if}
		{#if !isTomorrow}
			<button on:click={() => reschedule('tomorrow')}>
				Tomorrow
			</button>
		{/if}
		{#if todoDate.getDay() !== 6 && listType !== 'work'}
			<button on:click={() => reschedule('saturday')}>
				Saturday
			</button>
		{/if}
		<button on:click={() => reschedule('next-monday')}>
			Next Monday
		</button>
		<br>
		<p>Or a custom date...</p>
		<form on:submit|preventDefault={() => reschedule(customReschedule)}>
			<label class="input-group">
				<input type="date" bind:value={customReschedule} required>
				<button disabled={!customReschedule}>
					Reschedule
				</button>
			</label>
		</form>
	</div>
</Modal>

<script>
	import {Modal} from 'sheodox-ui';
	import {createEventDispatcher} from 'svelte';

	export let visible;
	export let todoDate;
	export let listType;

	const DAY_MS = 24 * 60 * 60 * 1000;
	$: isToday = todoDate.toLocaleDateString() === new Date().toLocaleDateString()
	$: isTomorrow = todoDate.toLocaleDateString() === new Date(Date.now() + DAY_MS).toLocaleDateString()

	const dispatch = createEventDispatcher();
	let customReschedule;

	function reschedule(to) {
		dispatch('reschedule', to);
		visible = false;
	}
</script>