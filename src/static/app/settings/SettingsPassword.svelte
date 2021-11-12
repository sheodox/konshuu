<form on:submit|preventDefault={savePassword} class="f-column gap-3">
	<TextInput id="old-password" bind:value={password} type="password">Old password</TextInput>
	<TextInput id="new-password" bind:value={newPassword} type="password">New password</TextInput>
	<TextInput id="new-password-confirm" bind:value={newPasswordConfirm} type="password">Confirm new password</TextInput>
	<button class="save" disabled={!passwordsMatch || saving}>Change Password</button>
</form>

<script lang="ts">
	import { createAutoExpireToast, TextInput } from 'sheodox-ui';
	let password: string,
		newPassword: string,
		newPasswordConfirm: string,
		saving = false;

	$: passwordsMatch = password && newPassword && newPassword === newPasswordConfirm;

	async function savePassword() {
		saving = true;
		const res = await fetch('/user/change-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				password,
				newPassword,
			}),
		});

		if (res.status === 200) {
			createAutoExpireToast({
				title: 'Password Changed!',
				message: 'Your password has been changed.',
			});
		} else {
			createAutoExpireToast({
				variant: 'error',
				title: 'Error',
				message: 'Something went wrong, check your password and try again.',
			});
		}

		saving = false;
	}
</script>
