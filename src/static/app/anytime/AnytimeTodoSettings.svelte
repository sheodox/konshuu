<button on:click={confirmDeleteAll} class="secondary m-0" type="button">Delete Completed Todos</button>

<script lang="ts">
	import { anytimeOps } from '../stores/anytime';
	import type { Anytime } from '../../../shared/types/anytime';

	export let data: Anytime;

	function confirmDeleteAll() {
		if (confirm(`Are you sure you want to delete the completed todos in "${data.name}"?`)) {
			anytimeOps.todo.deleteCompleted(data.id);
		}
	}
</script>
