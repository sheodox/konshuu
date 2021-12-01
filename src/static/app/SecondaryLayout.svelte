<style>
	.secondary-layout {
		padding: var(--shdx-spacing-5);
		margin: 0 auto;
		width: 40rem;
		max-width: 100%;
	}
	h1 {
		margin-bottom: var(--shdx-spacing-1);
		font-size: var(--shdx-font-size-10);
	}
	@media (max-width: 600px) {
		.secondary-layout {
			padding: var(--shdx-spacing-3);
		}
		h1 {
			font-size: var(--shdx-font-size-8);
		}
	}
</style>

<div class="secondary-layout">
	<h1>{title}</h1>
	<slot />
</div>

<script lang="ts">
	export let title: string;
</script>
