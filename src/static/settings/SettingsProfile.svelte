<form on:submit|preventDefault={saveProfile} class="f-column gap-3">
    <TextInput bind:value={email} id="settings-email">
        Email
    </TextInput>
    <TextInput bind:value={firstName} id="settings-first-name">
        First Name
    </TextInput>
    <TextInput bind:value={lastName} id="settings-last-name">
        Last Name
    </TextInput>
    <button class="save" disabled={!profileSaveable || saving}>Save</button>
</form>

<script>
    import {createAutoExpireToast, TextInput} from 'sheodox-ui';

    let user = window.user,
        email = user.email,
        firstName = user.firstName,
        lastName = user.lastName,
        saving = false;

    $: profileFieldsExist = email && firstName && lastName;
    $: profileFieldsDifferent = email !== user.email || firstName !== user.firstName || lastName !== user.lastName;
    $: profileSaveable = profileFieldsExist && profileFieldsDifferent;

    async function saveProfile() {
        saving = true;
        const res = await fetch('/user/profile', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email, firstName, lastName
            })
        });

        if (res.status === 200) {
            createAutoExpireToast({
                title: 'Profile Updated!',
                message: 'Your changes have been saved.'
            });
            user.email = email;
            user.firstName = firstName;
            user.lastName = lastName;
        }
        else {
            createAutoExpireToast({
                variant: 'error',
                title: 'Error',
                message: "Either that email has been taken or something was wrong with your input, check and try again."
            })
        }
        saving = false;
    }
</script>
