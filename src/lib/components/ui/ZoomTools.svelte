<script>
	let { onZoom } = $props();

	function handleClick(event, delta) {
		const shell = event.currentTarget.closest('.figure-shell');
		if (!shell) return;
		const currentScale = Number(shell.style.getPropertyValue('--scale') || 1);
		const nextScale = Math.min(1.7, Math.max(1, currentScale + delta));
		shell.style.setProperty('--scale', String(nextScale));
		onZoom?.(nextScale);
	}
</script>

<div class="zoom-tools" role="toolbar" tabindex="-1" aria-label="Controles de zoom" onpointerup={(e) => e.stopPropagation()}>
	<button aria-label="Acercar" onclick={(e) => handleClick(e, 0.18)}>+</button>
	<button aria-label="Alejar" onclick={(e) => handleClick(e, -0.18)}>−</button>
</div>
