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
		<p>Konshuu is built by <ExternalLink href="https://sheodox.com/">sheodox</ExternalLink>.</p>

		<p>
			Feel free to request features or report issues by <ExternalLink href="mailto:sheodox@gmail.com"
				>emailing me</ExternalLink
			> or submitting an issue on <ExternalLink href="https://github.com/sheodox/konshuu/issues">Github</ExternalLink>!
		</p>

		<h2>Other Project By Me</h2>

		<p>
			<ExternalLink href="https://sheodox.com/">Check out my other projects!</ExternalLink> I have several projects both
			for productivity and learning Japanese, you might find something you like!
		</p>

		<h2>Why "Konshuu"</h2>
		<p>Konshuu is the pronunciation of the Japanese word 今週 which means "this week".</p>

		<h2>Support Development</h2>
		<p>
			If you'd like to donate to support development of Konshuu you can tip me on <ExternalLink
				href="https://www.buymeacoffee.com/sheodox">Buy me a coffee</ExternalLink
			>. Any support is appreciated, either financially or by sharing the site with your friends!
		</p>

		<p><strong>Have a great week!</strong></p>
	</div>
</SecondaryLayout>

<script lang="ts">
	import SecondaryLayout from './SecondaryLayout.svelte';
	import ExternalLink from './ExternalLink.svelte';
</script>
