<style>
    form {
        max-width: 90vw;
        width: 20rem;
    }
</style>

<form class="f-column gap-3 m-3" on:submit|preventDefault={submit}>
    <TextInput bind:value={email} id="login-email" type="email">Email</TextInput>
    <TextInput bind:value={password} id="login-password" type="password">Password</TextInput>
    <button class="primary">Login</button>
</form>

<script>
    import {createAutoExpireToast, TextInput} from 'sheodox-ui';
    let email, password;

    async function submit() {
        const res = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password})
        });

        if (res.status === 200) {
            location.reload();
        }
        else {
            createAutoExpireToast({
                title: 'Email or password incorrect.',
                variant: 'error'
            })
        }
    }
</script>
