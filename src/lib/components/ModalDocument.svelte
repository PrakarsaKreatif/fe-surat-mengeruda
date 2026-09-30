<script>
    import { onMount } from 'svelte';
    let { isOpen = false, onClose = () => {}, documentUrl = null, userName = 'Warga', documentName = 'Dokumen', children } = $props();

    let authorizedUrl = $state(null);

    $effect(() => {
        if (isOpen && documentUrl) {
            if (typeof localStorage !== 'undefined') {
                const token = localStorage.getItem('sso_token');
                if (token && !documentUrl.includes('token=')) {
                    const separator = documentUrl.includes('?') ? '&' : '?';
                    authorizedUrl = `${documentUrl}${separator}token=${token}`;
                } else {
                    authorizedUrl = documentUrl;
                }
            } else {
                authorizedUrl = documentUrl;
            }
        }
    });

    function handleBackdrop(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
</script>

{#if isOpen && authorizedUrl}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={handleBackdrop}
    >
        <div class="bg-white rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <!-- Header -->
            <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-lg">{documentName} Warga</h3>
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
            <div class="p-6 bg-slate-100 flex flex-col min-h-[350px] max-h-[70vh] overflow-auto">
                {#if authorizedUrl.endsWith('.pdf') || authorizedUrl.includes('.pdf?') || authorizedUrl.includes('/pdf/')}
                    <iframe 
                        src="{authorizedUrl}{authorizedUrl.includes('?') ? '&' : '?'}preview=true" 
                        title="{documentName} PDF"
                        class="w-full h-[500px] border-0 rounded-lg shadow-sm bg-white"
                    ></iframe>
                {:else}
                    <img 
                        src={authorizedUrl} 
                        alt="{documentName} {userName}" 
                        class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-slate-300 mx-auto"
                        onerror={(e) => { e.target.alt = `Gagal memuat ${documentName}. Pastikan sesi login Admin aktif.`; }}
                    />
                {/if}

                {#if children}
                    <div class="w-full mt-6 text-left">
                        {@render children()}
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3">
                <a 
                    href={authorizedUrl} 
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
