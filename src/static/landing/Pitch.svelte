<style>
	.account-form {
		background: var(--shdx-gray-600);
		border-radius: 5px;
		box-shadow: var(--shdx-shadow-3);
	}
	section {
		padding-top: var(--shdx-spacing-10);
		padding-bottom: var(--shdx-spacing-10);
		width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.hero {
		flex-direction: row;
		justify-content: center;
		min-height: 50rem;
	}
	.hero-title {
		font-size: var(--shdx-font-size-11);
	}
	.hero-subtitle {
		font-size: var(--shdx-font-size-8);
	}
	.hero > div {
		max-width: 40rem;
		padding: var(--shdx-spacing-4);
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
			font-size: var(--shdx-font-size-8);
			text-align: center;
		}
		.hero-subtitle {
			font-size: var(--shdx-font-size-6);
		}
	}
	section:nth-of-type(even) {
		background: var(--shdx-gray-800);
	}
	img {
		box-shadow: var(--shdx-shadow-5), var(--shdx-shadow-1);
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
