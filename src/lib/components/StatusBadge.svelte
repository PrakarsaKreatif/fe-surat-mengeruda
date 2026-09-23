<script>
    let { status = 'pending', label = null } = $props();

    const config = {
        pending: {
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            border: 'border-amber-200',
            defaultLabel: 'Menunggu Verifikasi',
            dot: 'bg-amber-500'
        },
        approved: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-800',
            border: 'border-emerald-200',
            defaultLabel: 'Disetujui & Terbit',
            dot: 'bg-emerald-500'
        },
        rejected: {
            bg: 'bg-rose-100',
            text: 'text-rose-800',
            border: 'border-rose-200',
            defaultLabel: 'Ditolak',
            dot: 'bg-rose-500'
        }
    };

    let current = $derived(config[status] || config.pending);
</script>

<span class={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border}`}>
    <span class={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
    {label || current.defaultLabel}
</span>
