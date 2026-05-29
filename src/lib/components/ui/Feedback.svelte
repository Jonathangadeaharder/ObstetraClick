<script lang="ts">
	let {
		sheetOpen,
		lastAnswer,
		rationale,
		buttonLabel,
		onNext
	}: {
		sheetOpen: boolean;
		lastAnswer: { correct: boolean } | null;
		rationale: string;
		buttonLabel: string;
		onNext: () => void;
	} = $props();
</script>

<div class:open={sheetOpen} class="sheet">
	{#if lastAnswer}
		<div class="chip" class:chip-accent={lastAnswer.correct} style="margin-bottom: 10px">
			{lastAnswer.correct ? 'Correcto' : 'Volvé a mirar'}
		</div>
		<h2 class="h2">{lastAnswer.correct ? 'Bien ahí.' : 'Ese hallazgo no cierra.'}</h2>
		<p class="body-sm">{rationale}</p>
		<button class="btn" onclick={onNext}>{buttonLabel}</button>
	{/if}
</div>
