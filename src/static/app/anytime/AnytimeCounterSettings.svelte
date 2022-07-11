<TextInput type="number" id="count-set-{id}" bind:value={data.count}>Count</TextInput>
<Checkbox id="up-option-{id}" bind:checked={data.showCountUp}>Show Increment</Checkbox>
<Checkbox id="down-option-{id}" bind:checked={data.showCountDown}>Show Decrement</Checkbox>

<script lang="ts">
	import { TextInput, Checkbox } from 'sheodox-ui';
	import { AnytimeEditable } from '../../../shared/types/anytime';

	export let id: string;
	export let data: AnytimeEditable;
</script>
