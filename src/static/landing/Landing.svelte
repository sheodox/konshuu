<style>
	div {
		flex: 1;
	}
</style>

<Header appName="Konshuu" slim={false}>
	<svg viewBox="0 0 100 100" slot="logo">
		<image xlink:href="/logo.svg" />
	</svg>
</Header>

<div>
	<Pitch />
</div>

<Toasts />

<Footer>
	<div class="page-content">
		<nav class="simple-footer-links">
			<ul>
				<li><ExternalLink href="https://github.com/sheodox">&copy;2021 sheodox</ExternalLink></li>
			</ul>
		</nav>
	</div>
</Footer>

<script lang="ts">
	import { Header, Footer, Toasts } from 'sheodox-ui';
	import ExternalLink from '../app/ExternalLink.svelte';
	import Pitch from './Pitch.svelte';
</script>
