<button on:click={confirmDeleteAll} class="secondary m-0" type="button" disabled={!completed}
	>Delete {completed} Completed Todo{completed === 1 ? '' : 's'}</button
>

<script lang="ts">
	import { anytimeOps } from '../stores/anytime';
	import type { Anytime } from '../../../shared/types/anytime';

	export let data: Anytime;

	$: completed = data.todos.reduce((total, todo) => total + (todo.completed ? 1 : 0), 0);

	function confirmDeleteAll() {
		if (confirm(`Are you sure you want to delete the completed todos in "${data.name}"?`)) {
			anytimeOps.todo.deleteCompleted(data.id);
		}
	}
</script>
