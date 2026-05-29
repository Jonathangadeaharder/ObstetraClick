<script>
	let { q } = $props();
</script>

<div class="row" style="gap: 10px; margin: 8px 0 12px">
	<span class="chip">Fig. {q.figure}</span>
	<div style="flex: 1">
		<div class="h3">{q.title}</div>
		<div class="label" style="font-size: 9px">{q.latin}</div>
	</div>
</div>
