<NavDropdown showOpenIcon={false}>
    <span slot="button">
        <Icon icon="user-circle" />
        <span class="sr-only">User Options</span>
    </span>
    <div slot="menu">
        <ul>
<!--            <li>-->
<!--                <button>-->
<!--                    <Icon icon="cog" />-->
<!--                    Settings-->
<!--                </button>-->
<!--            </li>-->
            <li>
                <a href="/logout" class="button">
                    <Icon icon="sign-out-alt"/>
                    Logout
                </a>
            </li>
        </ul>
    </div>
</NavDropdown>

<script>
    import {NavDropdown, Icon} from 'sheodox-ui';
</script>