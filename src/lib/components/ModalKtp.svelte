<script>
    let { isOpen = false, onClose = () => {}, ktpUrl = null, userName = 'Warga' } = $props();

    function handleBackdrop(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
</script>

{#if isOpen && ktpUrl}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={handleBackdrop}
    >
        <div class="bg-white rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <!-- Header -->
            <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-lg">Dokumen KTP Warga</h3>
                    <p class="text-xs text-slate-400">Pemilik: <strong class="text-white">{userName}</strong></p>
                </div>
                <button 
                    onclick={onClose}
                    class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Content -->
            <div class="p-6 bg-slate-100 flex items-center justify-center min-h-[350px] max-h-[70vh] overflow-auto">
                {#if ktpUrl.endsWith('.pdf')}
                    <iframe 
                        src={ktpUrl} 
                        title="Dokumen KTP PDF"
                        class="w-full h-[500px] border-0 rounded-lg shadow-sm bg-white"
                    ></iframe>
                {:else}
                    <img 
                        src={ktpUrl} 
                        alt="KTP {userName}" 
                        class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-slate-300"
                        onerror={(e) => { e.target.alt = 'Gagal memuat KTP. Pastikan sesi login Admin aktif.'; }}
                    />
                {/if}
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3">
                <a 
                    href={ktpUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all"
                >
                    Buka di Tab Baru
                </a>
                <button 
                    onclick={onClose}
                    class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm transition-all"
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
{/if}
