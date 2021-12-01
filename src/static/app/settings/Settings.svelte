<style>
	#settings {
		margin: 0 auto;
	}
	#settings :global(form) {
		width: 30rem;
		max-width: 90vw;
	}
	#settings :global(.save) {
		width: 100%;
	}
</style>

<SecondaryLayout title="Settings">
	<div id="settings">
		<div class="mb-3">
			<TabList bind:selectedTab {tabs} />
		</div>

		<Tab tabId="profile" {selectedTab}>
			<SettingsProfile />
		</Tab>

		<Tab tabId="password" {selectedTab}>
			<SettingsPassword />
		</Tab>
	</div>
</SecondaryLayout>

<script lang="ts">
	import { TabList, Tab } from 'sheodox-ui';
	import SettingsProfile from './SettingsProfile.svelte';
	import SettingsPassword from './SettingsPassword.svelte';
	import SecondaryLayout from '../SecondaryLayout.svelte';

	const tabs = [
		{
			id: 'profile',
			title: 'Profile',
		},
		{
			id: 'password',
			title: 'Change Password',
		},
	];

	let selectedTab: string;
</script>
