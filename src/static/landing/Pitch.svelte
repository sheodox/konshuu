<style>
	.account-form {
		background: var(--sx-gray-600);
		border-radius: 5px;
		box-shadow: var(--sx-shadow-3);
	}
	section {
		padding-top: var(--sx-spacing-10);
		padding-bottom: var(--sx-spacing-10);
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-left: var(--sx-spacing-4);
		padding-right: var(--sx-spacing-4);
	}
	p {
		font-size: var(--sx-font-size-4);
	}
	.hero {
		flex-direction: row;
		justify-content: center;
		min-height: 50rem;
	}
	.hero-title {
		font-size: var(--sx-font-size-11);
	}
	.hero-subtitle {
		font-size: var(--sx-font-size-8);
	}
	.hero > div {
		max-width: 40rem;
		padding: var(--sx-spacing-4);
	}
	h2 {
		font-size: var(--sx-font-size-9);
		margin-bottom: 0;
	}
	@media (max-width: 800px) {
		.hero {
			flex-direction: column;
			min-height: unset;
			padding-top: 0;
		}
	}
	@media (max-width: 600px) {
		.hero-title {
			font-size: var(--sx-font-size-8);
			text-align: center;
		}
		.hero-subtitle {
			font-size: var(--sx-font-size-6);
		}
		p {
			font-size: var(--sx-font-size-3);
		}
		h2 {
			font-size: var(--sx-font-size-7);
			margin-bottom: 0;
		}
	}
	section:nth-of-type(even) {
		background: var(--sx-gray-800);
	}
	img {
		box-shadow: var(--sx-shadow-5), var(--sx-shadow-1);
		border-radius: 15px;
		max-width: 90vw;
	}
</style>

<div id="pitch" class="f-column align-items-center">
	<section class="hero">
		<div>
			<h1 class="hero-title">Start planning with Konshuu.</h1>
			<p class="hero-subtitle">Konshuu helps organize your week's daily tasks for work and home.</p>
		</div>
		<div class="account-form m-5 p-5 f-column align-items-center">
			{#if showLogin}
				<Login />
				<button on:click={() => (showLogin = false)}>Don't have an account yet?</button>
			{:else}
				<SignUp />
				<button on:click={() => (showLogin = true)}>Already have an account?</button>
			{/if}
		</div>
	</section>

	<section>
		<h2>Your Entire Week At A Glance</h2>

		<div>
			<p>With Konshuu you can see all of your week's tasks at once for your work and personal life.</p>
		</div>
		<img src="/example-list.png" alt="example screenshot" />
	</section>
</div>

<script lang="ts">
	import Login from './Login.svelte';
	import SignUp from './SignUp.svelte';

	let showLogin = true;
</script>
