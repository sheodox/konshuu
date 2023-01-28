<style lang="scss">
	aside {
		background-color: var(--sx-gray-600);
		border-radius: 5px 0 0 5px;
		border: 1px solid var(--sx-gray-400);
		box-shadow: var(--sx-shadow-1);
	}
	.sidebar {
		width: 30rem;
		max-width: 95vw;
		overflow-y: auto;
	}
	small {
		font-weight: normal;
	}
	@media (max-width: 600px) {
		aside {
			scroll-snap-align: start;
		}
	}
</style>

<aside class="f-row p-1">
	<div class="sidebar f-column f-1">
		<div class="f-row align-items-baseline gap-2">
			<button on:click={menuButtonClick} aria-pressed={!selectedApp}>
				<Icon icon={selectedApp ? 'bars' : 'times'} variant="icon-only" />
				<span class="sr-only">Back to sidebar apps</span>
			</button>
			<h2>{selectedAppName ?? 'Apps'}</h2>
		</div>
		{#if selectedApp}
			{#if selectedApp === 'weeklies'}
				<Weekly />
			{:else if selectedApp === 'recurring'}
				<Recurring />
			{/if}
		{:else}
			{#each sidebarApps as app}
				<button on:click={() => (selectedApp = app.id)} class="card clickable f-row align-items-center gap-4">
					<span class="sx-font-size-10">
						<Icon icon={app.icon} />
					</span>
					<div class="text-align-left">
						<p class="sx-font-size-4 my-1">
							{app.title}
						</p>
						<small>{app.description}</small>
					</div>
				</button>
			{/each}
		{/if}
	</div>
</aside>

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import Weekly from './Weekly.svelte';
	import Recurring from './Recurring.svelte';

	const sidebarApps = [
			{
				id: 'weeklies',
				title: 'Weeklies',
				description: 'Flexible todos that need to be done one or more times every week.',
				icon: 'calendar-week',
			},
			{
				id: 'recurring',
				title: 'Setup Recurring Todos',
				description: 'Create todos that need to be done on a schedule.',
				icon: 'redo-alt',
			},
		] as const,
		defaultApp: SidebarApp = 'weeklies';

	type SidebarApp = null | (typeof sidebarApps)[number]['id'];

	let selectedApp: SidebarApp = defaultApp;
	let lastSelectedApp: SidebarApp = defaultApp;
	$: selectedAppName = sidebarApps.find(({ id }) => id === selectedApp)?.title;

	function menuButtonClick() {
		if (selectedApp) {
			lastSelectedApp = selectedApp;
			selectedApp = null;
		} else {
			selectedApp = lastSelectedApp ?? defaultApp;
		}
	}
</script>
