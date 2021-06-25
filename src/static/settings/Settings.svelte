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
<div id="settings">
    <h1>Settings</h1>

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

<script>
    import {TabList, Tab} from 'sheodox-ui';
    import SettingsProfile from "./SettingsProfile.svelte";
    import SettingsPassword from "./SettingsPassword.svelte";

    const tabs = [{
        id: 'profile',
        title: 'Profile',
    }, {
        id: 'password',
        title: 'Change Password'
    }];

    let selectedTab;
</script>