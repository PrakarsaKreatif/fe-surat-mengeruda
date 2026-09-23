<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { API_BASE } from '$lib/api.js';
    import axios from 'axios';

    let tokenInput = $state('');
    let isChecking = $state(false);
    let result = $state(null);
    let errorMsg = $state(null);

    onMount(() => {
        const urlToken = $page.url.searchParams.get('token');
        if (urlToken) {
            tokenInput = urlToken;
            verifyToken(urlToken);
        }
    });

    async function verifyToken(tokenToVerify = null) {
        const token = tokenToVerify || tokenInput;
        if (!token || !token.trim()) {
            errorMsg = 'Silakan masukkan kode token surat yang tercantum pada QR Code.';
            result = null;
            return;
        }

        isChecking = true;
        errorMsg = null;
        result = null;

        try {
            const res = await axios.get(`${API_BASE}/validasi?token=${encodeURIComponent(token.trim())}`);
            if (res.data?.status === 'success' && res.data?.valid) {
                result = res.data.data;
            } else {
                errorMsg = res.data?.message || 'Dokumen tidak ditemukan atau belum disetujui.';
            }
        } catch (e) {
            errorMsg = e.response?.data?.message || 'Token tidak valid atau surat tidak ditemukan di dalam sistem.';
        } finally {
            isChecking = false;
        }
    }
</script>

<div class="py-12 bg-slate-100 flex-1 flex flex-col justify-center">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 w-full">
        <!-- Card Validasi -->
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div class="bg-[#1e3a8a] px-8 py-6 text-white text-center">
                <h1 class="text-2xl font-extrabold tracking-tight">Cek Keaslian & Validasi Surat</h1>
                <p class="text-xs text-blue-200 mt-1">Sistem Verifikasi Tanda Tangan Elektronik Desa Mengeruda</p>
            </div>

            <div class="p-8">
                <form 
                    onsubmit={(e) => { e.preventDefault(); verifyToken(); }} 
                    class="flex flex-col sm:flex-row gap-3 mb-8"
                >
                    <input 
                        type="text"
                        bind:value={tokenInput}
                        placeholder="Masukkan token UUID dari QR Code surat..."
                        class="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                        required
                    />
                    <button 
                        type="submit"
                        disabled={isChecking}
                        class="px-6 py-3 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                        {isChecking ? 'Memverifikasi...' : 'Verifikasi'}
                    </button>
                </form>

                {#if errorMsg}
                    <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div>
                            <strong class="font-bold block">Dokumen Tidak Valid</strong>
                            <span>{errorMsg}</span>
                        </div>
                    </div>
                {/if}

                {#if result}
                    <div class="p-6 rounded-2xl bg-emerald-50/70 border-2 border-emerald-500/30 text-slate-800 animate-fadeIn">
                        <div class="flex items-center justify-between border-b border-emerald-200 pb-4 mb-4">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <span class="font-bold text-emerald-800 text-base">DOKUMEN RESMI & SAH</span>
                            </div>
                            <span class="text-xs font-mono bg-emerald-600 text-white px-3 py-1 rounded-full font-bold">
                                {result.status}
                            </span>
                        </div>

                        <dl class="space-y-3 text-sm">
                            <div class="flex justify-between py-1 border-b border-emerald-100">
                                <dt class="text-slate-500 font-medium">Nomor Surat:</dt>
                                <dd class="font-bold text-slate-900">{result.nomor_surat}</dd>
                            </div>
                            <div class="flex justify-between py-1 border-b border-emerald-100">
                                <dt class="text-slate-500 font-medium">Jenis Surat:</dt>
                                <dd class="font-bold text-slate-900">{result.jenis_surat}</dd>
                            </div>
                            <div class="flex justify-between py-1 border-b border-emerald-100">
                                <dt class="text-slate-500 font-medium">Nama Pemohon:</dt>
                                <dd class="font-bold text-slate-900">{result.nama_pemohon}</dd>
                            </div>
                            <div class="flex justify-between py-1 border-b border-emerald-100">
                                <dt class="text-slate-500 font-medium">NIK Pemohon:</dt>
                                <dd class="font-mono text-slate-700">{result.nik_pemohon}</dd>
                            </div>
                            <div class="flex justify-between py-1">
                                <dt class="text-slate-500 font-medium">Tanggal Terbit:</dt>
                                <dd class="text-slate-800">{result.tanggal_terbit}</dd>
                            </div>
                        </dl>

                        <div class="mt-6 pt-4 border-t border-emerald-200 text-center">
                            <p class="text-xs text-emerald-800/80">
                                Surat keterangan ini diterbitkan secara sah oleh Pemerintah Desa Mengeruda, Kecamatan Soa, Kabupaten Nagekeo.
                            </p>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
