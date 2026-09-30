<script>
    import { onMount } from 'svelte';
    import { getSettings, updateSettings } from '$lib/api.js';
    import RichTextEditor from '$lib/components/RichTextEditor.svelte';

    let loadingSettings = $state(true);
    let savingSettings = $state(false);
    let formSettings = $state({
        kop_pemda: '',
        kop_desa: '',
        kop_alamat: '',
        kop_logo: '',
        kepala_desa_name: '',
        format_nomor_surat: ''
    });

    let selectedLogoFile = null;

    onMount(async () => {
        try {
            const setRes = await getSettings();
            if (setRes.status === 'success') {
                formSettings = {
                    kop_pemda: setRes.data.kop_pemda || '',
                    kop_desa: setRes.data.kop_desa || '',
                    kop_alamat: setRes.data.kop_alamat || '',
                    kop_logo: setRes.data.kop_logo || '',
                    kepala_desa_name: setRes.data.kepala_desa_name || '',
                    format_nomor_surat: setRes.data.format_nomor_surat || '140/Pem-Mgr/09/[NOMOR_URUT]/[BULAN_ROMAWI]/[TAHUN]'
                };
            }
        } catch (e) {
            console.error('Gagal memuat pengaturan:', e);
        } finally {
            loadingSettings = false;
        }
    });

    async function handleSaveSettings(e) {
        e.preventDefault();
        savingSettings = true;
        try {
            const res = await updateSettings(formSettings, selectedLogoFile);
            if (res.status === 'success') {
                if (res.logo_url) {
                    formSettings.kop_logo = res.logo_url;
                    selectedLogoFile = null;
                }
                alert('Pengaturan KOP Surat berhasil disimpan!');
            }
        } catch (e) {
            alert('Gagal menyimpan pengaturan: ' + (e.response?.data?.message || e.message));
        } finally {
            savingSettings = false;
        }
    }
</script>

<div class="space-y-6 animate-fadeIn">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-slate-800">Pengaturan Surat & E-Sign</h2>
            <p class="text-slate-500 text-sm mt-1">Sesuaikan KOP Surat dan pengaturan E-Sign (Nama Kepala Desa)</p>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 class="font-bold text-slate-900 text-base">Formulir Pengaturan KOP</h2>
            <p class="text-sm text-slate-500 mt-1">Konfigurasi ini akan digunakan secara global (untuk semua jenis template surat) saat surat diekspor ke format PDF.</p>
        </div>
        
        <div class="p-6">
            {#if loadingSettings}
                <div class="flex justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a]"></div>
                </div>
            {:else}
                <form class="space-y-6 max-w-3xl" onsubmit={handleSaveSettings}>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Pemerintah Daerah (Baris 1)</label>
                            <RichTextEditor bind:value={formSettings.kop_pemda} placeholder="Contoh: PEMERINTAH KABUPATEN NAGEKEO" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Nama Desa (Baris 2)</label>
                            <RichTextEditor bind:value={formSettings.kop_desa} placeholder="Contoh: DESA MENGERUDA" />
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Alamat (Baris 3)</label>
                            <RichTextEditor bind:value={formSettings.kop_alamat} placeholder="Contoh: Alamat: Jl. Raya Mengeruda, Soa..." />
                        </div>
                        <div class="pt-4">
                            <label class="block text-sm font-bold text-slate-700 mb-1">Logo Desa (KOP Surat)</label>
                            {#if formSettings.kop_logo}
                                <div class="mb-3">
                                    <p class="text-xs text-slate-500 mb-1">Logo Saat Ini:</p>
                                    <img src={formSettings.kop_logo} alt="Logo KOP" class="h-20 w-auto object-contain bg-slate-50 p-2 border border-slate-200 rounded" />
                                </div>
                            {/if}
                            <input 
                                type="file" 
                                accept="image/*"
                                onchange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        selectedLogoFile = e.target.files[0];
                                    } else {
                                        selectedLogoFile = null;
                                    }
                                }} 
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                            />
                            <p class="text-xs text-slate-500 mt-1">Pilih gambar logo dari perangkat Anda (PNG/JPG direkomendasikan).</p>
                        </div>
                    </div>
                    
                    <!-- Pengaturan E-Sign -->
                    <div class="pt-6 mt-6 border-t border-slate-200 space-y-4">
                        <h3 class="font-bold text-slate-800 text-base">Pengaturan E-Sign</h3>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Nama Kepala Desa</label>
                            <RichTextEditor bind:value={formSettings.kepala_desa_name} placeholder="Contoh: Budi Santoso, S.Sos" />
                            <p class="text-xs text-slate-500 mt-1">Gunakan editor di atas untuk mengatur ketebalan teks (Bold) atau garis bawah (Underline) untuk Nama Kepala Desa.</p>
                        </div>
                    </div>
                    
                    <!-- Pengaturan Penomoran Surat -->
                    <div class="pt-6 mt-6 border-t border-slate-200 space-y-4">
                        <h3 class="font-bold text-slate-800 text-base">Pengaturan Penomoran Surat</h3>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Format Nomor Surat</label>
                            <input type="text" bind:value={formSettings.format_nomor_surat} class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Contoh: 140/Pem-Mgr/09/[NOMOR_URUT]/[BULAN_ROMAWI]/[TAHUN]" />
                            <div class="mt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                                <p class="font-bold mb-1">Gunakan kode otomatis (parameter) berikut untuk membuatnya dinamis:</p>
                                <ul class="list-disc pl-4 space-y-1">
                                    <li><code class="bg-slate-200 px-1 rounded text-[#1e3a8a]">[NOMOR_URUT]</code> : Menampilkan urutan angka surat (contoh: 001, 002)</li>
                                    <li><code class="bg-slate-200 px-1 rounded text-[#1e3a8a]">[BULAN_ROMAWI]</code> : Menampilkan bulan saat ini dalam angka romawi (contoh: I, XII)</li>
                                    <li><code class="bg-slate-200 px-1 rounded text-[#1e3a8a]">[TAHUN]</code> : Menampilkan tahun saat ini (contoh: 2026)</li>
                                </ul>
                                <p class="mt-2">Contoh isian: <span class="text-slate-700 font-medium">140/Pem-Mgr/09/[NOMOR_URUT]/[BULAN_ROMAWI]/[TAHUN]</span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="pt-4 border-t border-slate-200">
                        <button type="submit" class="px-6 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50" disabled={savingSettings}>
                            {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            {/if}
        </div>
    </div>
</div>
