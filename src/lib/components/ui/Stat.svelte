<script>
	let { label, value } = $props();
</script>

<div class="card" style="flex: 1; padding: 12px; min-width: 0">
	<div class="label" style="font-size: 9px">{label}</div>
	<div class="h3" style="font-style: italic; overflow-wrap: anywhere">{value}</div>
</div>
