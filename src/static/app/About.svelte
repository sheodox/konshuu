<style lang="scss">
	h2 {
		margin-bottom: var(--shdx-spacing-1);
		margin-top: var(--shdx-spacing-6);
	}

	p:first-of-type,
	h2 + p {
		margin-top: 0;
	}
</style>

<SecondaryLayout title="About Konshuu">
	<div class="has-inline-links">
		<p>Konshuu is built by <a href="https://github.com/sheodox">sheodox</a>.</p>

		<p>
			Feel free to request features or report issues by <a href="mailto:sheodox@gmail.com">emailing me</a> or submitting
			an issue on <a href="https://github.com/sheodox/konshuu/issues">Github</a>!
		</p>

		<h2>Why "Konshuu"</h2>

		<p>Konshuu is the pronunciation of the Japanese word 今週 which means "this week".</p>
	</div>
</SecondaryLayout>

<script lang="ts">
	import SecondaryLayout from './SecondaryLayout.svelte';
</script>
