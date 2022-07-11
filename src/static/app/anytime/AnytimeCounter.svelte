<style>
	button {
		font-size: var(--sx-font-size-7);
		flex: 1;
		width: 100%;
	}
	button:disabled {
		visibility: hidden;
	}
	.count {
		font-family: monospace;
		width: 100%;
		text-align: center;
	}
</style>

<div class="f-column align-items-center justify-content-center f-1">
	<button on:click={increment} disabled={!data.showCountUp}>
		<Icon icon="plus" variant="icon-only" />
		<span class="sr-only">Increment</span>
	</button>
	<div class="count sx-badge-pink sx-font-size-9">{data.count}</div>
	<button on:click={decrement} disabled={!data.showCountDown}>
		<Icon icon="minus" variant="icon-only" />
		<span class="sr-only">Decrement</span>
	</button>
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import type { Anytime } from '../../../shared/types/anytime';
	import { anytimeOps } from '../stores/anytime';

	export let data: Anytime;

	function increment() {
		anytimeOps.increment(data.id);
	}
	function decrement() {
		anytimeOps.decrement(data.id);
	}
</script>
