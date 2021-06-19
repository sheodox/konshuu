<style>
</style>

<div id="pitch" class="f-column align-items-center">
    <h1>Start planning with Konshuu.</h1>

    {#if showLogin}
        <Login />
        <button on:click={() => showLogin = false}>Don't have an account yet?</button>
    {:else}
        <SignUp />
        <button on:click={() => showLogin = true}>Already have an account?</button>
    {/if}
</div>

<script>
    import Login from "./Login.svelte";
    import SignUp from "./SignUp.svelte";

    let showLogin = true;
</script>
