<script lang="ts">
	import type { Option } from '$lib/data/questions';

	let {
		options,
		lastAnswer,
		correctId,
		selected,
		onChoose
	}: {
		options: Option[];
		lastAnswer: { correct: boolean } | null;
		correctId: string;
		selected: string | null;
		onChoose: (option: Option) => void;
	} = $props();
</script>

<div class="col" style="gap: 10px; margin-top: 18px">
	{#each options as option, index}
		<button
			class:correct={lastAnswer && option.id === correctId}
			class:wrong={lastAnswer && selected === option.id && option.id !== correctId}
			class="choice"
			disabled={!!lastAnswer}
			onclick={() => onChoose(option)}
		>
			<span class="marker">{String.fromCharCode(65 + index)}</span>
			<span>
				<span style="display: block; font-family: var(--f-display); font-size: 17px; font-style: italic">{option.label}</span>
				<span class="body-sm">{option.sub}</span>
			</span>
		</button>
	{/each}
</div>
