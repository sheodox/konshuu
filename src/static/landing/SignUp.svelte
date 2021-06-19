<style>
    form {
        max-width: 90vw;
        width: 20rem;
    }
</style>

<form class="f-column gap-3 m-3" on:submit|preventDefault={submit}>
    <TextInput bind:value={email} id="signup-email">Email</TextInput>
    <TextInput bind:value={firstName} id="signup-first-name">First Name</TextInput>
    <TextInput bind:value={lastName} id="signup-last-name">Last Name</TextInput>
    <TextInput bind:value={password} id="signup-password" type="password">Password</TextInput>
    <small>Password must be 8-100 characters.</small>
    <TextInput bind:value={passwordConfirm} id="signup-password-confirm" type="password">Confirm Password</TextInput>

    <button class="primary" disabled={!allFieldsFilled || registering}>Sign Up</button>
</form>

<script>
    import {TextInput, createAutoExpireToast} from 'sheodox-ui';
    let email, password, firstName, lastName, passwordConfirm,
        registering = false;

    $: allFieldsFilled = email && password && firstName  && lastName && passwordConfirm

    function submit() {
        if (password && password === passwordConfirm) {
            signUp();
        }
        else {
            createAutoExpireToast({
                title: 'Passwords must match!',
                variant: 'error',
            })
        }
    }

    async function signUp() {
        registering = true;
        try {
            const res = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email, password, firstName, lastName
                })
            });

            // if the signup was a success just refresh the page, they should have a
            // valid session now, refreshing will load the app
            if (res.status === 200) {
                location.reload();
            }
            else {
                createAutoExpireToast({
                    title: "Couldn't signup",
                    message: "Either that email is in use or some of the information you provided was incomplete. Ensure you filled everything out completely and try again.",
                    variant: 'error'
                });

                registering = false;
            }
        }
        catch(e) {
            //todo toast error
            registering = false;
        }
    }
</script>
