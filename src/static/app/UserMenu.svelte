<NavDropdown showOpenIcon={false}>
	<span slot="button">
		<Icon icon="user-circle" variant="icon-only" />
		<span class="sr-only">User Options</span>
	</span>
	<div slot="menu">
		<ul>
			<li>
				<Link href="/settings" classes="button">
					<Icon icon="cog" />
					Settings
				</Link>
			</li>
			<li>
				<Link href="/about" classes="button">
					<Icon icon="address-card" />
					About
				</Link>
			</li>
			<li>
				<a href="/logout" class="button">
					<Icon icon="sign-out-alt" />
					Logout
				</a>
			</li>
		</ul>
	</div>
</NavDropdown>

<script lang="ts">
	import { NavDropdown, Icon } from 'sheodox-ui';
	import Link from './Link.svelte';
</script>
