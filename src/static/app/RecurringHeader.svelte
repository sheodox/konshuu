{#if mode === 'view'}
	<button on:click={() => (mode = 'new')} class="primary"><Icon icon="plus" />New Recurring Todo</button>
{:else if mode === 'edit' || mode === 'new'}
	<button on:click={() => (mode = 'view')}>
		<Icon icon="chevron-left" /> Back
	</button>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	export let mode: 'view' | 'edit' | 'new';
</script>
