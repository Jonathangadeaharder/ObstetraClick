<script>
	let { name, size = 16 } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'close'}<path d="M5 5l14 14M19 5L5 19" />{/if}
	{#if name === 'chevron'}<path d="M9 6l6 6-6 6" />{/if}
	{#if name === 'calendar'}<rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9h16M9 3v4M15 3v4" />{/if}
	{#if name === 'contrast'}<circle cx="12" cy="12" r="8" /><path d="M12 4v16" />{/if}
	{#if name === 'user-x'}<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="17" y1="8" x2="22" y2="13" /><line x1="22" y1="8" x2="17" y2="13" />{/if}
</svg>
