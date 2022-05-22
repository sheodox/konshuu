<style>
	.secondary-layout {
		padding: var(--sx-spacing-5);
		margin: 0 auto;
		width: 40rem;
		max-width: 100%;
		font-size: var(--sx-font-size-4);
	}
	h1 {
		margin-bottom: var(--sx-spacing-1);
		margin-top: var(--sx-spacing-3);
		font-size: var(--sx-font-size-10);
	}
	@media (max-width: 600px) {
		.secondary-layout {
			padding: var(--sx-spacing-3);
		}
		h1 {
			font-size: var(--sx-font-size-8);
		}
	}
</style>

<div class="secondary-layout">
	<div class="text-align-right">
		<Link href="/" classes="inline-link">
			<Icon icon="chevron-left" />
			Back to the Todo Planner
		</Link>
	</div>
	<h1>{title}</h1>
	<slot />
</div>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import Link from './Link.svelte';

	export let title: string;
</script>
