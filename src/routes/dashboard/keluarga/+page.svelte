<script>
    import { onMount } from 'svelte';
    import { getFamilyMembers, addFamilyMember, deleteFamilyMember, uploadKk, getMyKkUrl } from '$lib/api.js';
    import { userStore, isLoadingAuth } from '$lib/stores/auth.js';
    import ModalDocument from '$lib/components/ModalDocument.svelte';

    let user = $state(null);
    let familyMembers = $state([]);
    let loading = $state(true);
    let isSubmitting = $state(false);
    let authLoading = $state(true);

    // Family Member Form State
    let familyForm = $state({ name: '', nik: '', place_of_birth: '', date_of_birth: '', gender: 'L', relationship: '' });
    let familyValidationErrors = $state({});
    let kkFile = $state(null);
    let kkUploadMsg = $state(null);
    let kkErrorMsg = $state(null);
    let isSuccessModalOpen = $state(false);

    // Modal Document State
    let isDocumentModalOpen = $state(false);
    let documentUrl = $state(null);
    let documentType = $state('kk');

    isLoadingAuth.subscribe((val) => {
        authLoading = val;
    });

    userStore.subscribe((val) => {
        user = val;
    });

    $effect(() => {
        if (!authLoading && user && loading) {
            loadData();
        }
    });

    async function loadData() {
        loading = true;
        try {
            const famRes = await getFamilyMembers();
            if (famRes?.status === 'success') familyMembers = famRes.data;
        } catch (e) {
            console.error('Gagal memuat data keluarga:', e);
        } finally {
            loading = false;
        }
    }

    async function handleUploadKk(e) {
        e.preventDefault();
        if (!kkFile) return;
        isSubmitting = true;
        kkErrorMsg = null;
        kkUploadMsg = null;
        try {
            const fd = new FormData();
            fd.append('kk_file', kkFile);
            const res = await uploadKk(fd);
            if (res.status === 'success') {
                kkUploadMsg = res.message || 'KK berhasil diunggah!';
                isSuccessModalOpen = true;
                if (user) {
                    user.kk_path = res.kk_path;
                    user.is_kk_approved = false;
                    userStore.set(user);
                }
            }
        } catch (e) {
            kkErrorMsg = e.response?.data?.message || 'Gagal upload KK';
        } finally {
            isSubmitting = false;
        }
    }
    
    async function handleAddFamily(e) {
        e.preventDefault();
        isSubmitting = true;
        kkErrorMsg = null;
        kkUploadMsg = null;
        familyValidationErrors = {};
        try {
            const res = await addFamilyMember(familyForm);
            if (res.status === 'success') {
                kkUploadMsg = 'Anggota keluarga berhasil ditambahkan!';
                isSuccessModalOpen = true;
                familyMembers = [...familyMembers, res.data];
                familyForm = { name: '', nik: '', place_of_birth: '', date_of_birth: '', gender: 'L', relationship: '' };
            }
        } catch (e) {
            if (e.response?.status === 422 && e.response?.data?.errors) {
                familyValidationErrors = e.response.data.errors;
            } else {
                kkErrorMsg = e.response?.data?.message || 'Gagal menambah anggota keluarga.';
            }
        } finally {
            isSubmitting = false;
        }
    }
    
    async function handleDeleteFamily(id) {
        if (!confirm('Hapus anggota keluarga ini?')) return;
        try {
            await deleteFamilyMember(id);
            familyMembers = familyMembers.filter(f => f.id !== id);
        } catch (e) {
            alert('Gagal menghapus.');
        }
    }

    function openDocumentModal() {
        documentUrl = getMyKkUrl();
        documentType = 'kk';
        isDocumentModalOpen = true;
    }
</script>

<div class="space-y-6 animate-fadeIn">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-slate-800">Keluarga Saya</h2>
            <p class="text-slate-500 text-sm mt-1">Kelola data kartu keluarga dan anggota keluarga Anda</p>
        </div>
    </div>

    <!-- Form Upload KK -->
    <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 class="font-bold text-slate-900 text-base">Dokumen Kartu Keluarga (KK)</h2>
            <p class="text-sm text-slate-500">Unggah KK untuk bisa menambahkan anggota keluarga Anda.</p>
        </div>
        <div class="p-6">
            {#if user?.kk_path}
                <div class="mb-4 flex items-center gap-4">
                    <span class={`px-3 py-1 rounded-full text-xs font-bold ${user.is_kk_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {user.is_kk_approved ? 'Disetujui Admin' : 'Menunggu Verifikasi Admin'}
                    </span>
                    <button type="button" onclick={openDocumentModal} class="text-sm text-blue-600 hover:underline font-bold">Lihat Dokumen Terunggah</button>
                </div>
            {/if}
            <form onsubmit={handleUploadKk} class="flex items-center gap-4">
                <input type="file" accept="image/*,.pdf" onchange={(e) => kkFile = e.target.files[0]} class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-full" required />
                <button type="submit" disabled={isSubmitting} class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-colors whitespace-nowrap disabled:opacity-50 shadow-md shadow-blue-500/20">Upload KK</button>
            </form>
            {#if kkErrorMsg}<p class="mt-2 text-rose-600 text-sm font-semibold">{kkErrorMsg}</p>{/if}
        </div>
    </div>

    <!-- Form Tambah Anggota Keluarga -->
    {#if user?.kk_path}
        <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 class="font-bold text-slate-900 text-base">Daftar Anggota Keluarga</h2>
            </div>
            <div class="p-6">
                {#if !user.is_kk_approved}
                    <div class="p-4 mb-6 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-200 shadow-sm flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0 mt-0.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2.25m0 4.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Anggota keluarga yang ditambahkan hanya dapat digunakan untuk pengajuan surat setelah dokumen KK disetujui oleh Admin.</span>
                    </div>
                {/if}
                
                <div class="overflow-x-auto mb-8">
                    <table class="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                        <thead>
                            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                                <th class="p-4">Nama</th>
                                <th class="p-4">NIK</th>
                                <th class="p-4">Hubungan</th>
                                <th class="p-4">Opsi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            {#each familyMembers as fm}
                                <tr class="text-sm hover:bg-slate-50/70 transition-colors">
                                    <td class="p-4 font-bold text-slate-900">{fm.name}</td>
                                    <td class="p-4 font-mono text-slate-600">{fm.nik}</td>
                                    <td class="p-4 text-slate-600">{fm.relationship}</td>
                                    <td class="p-4">
                                        <button onclick={() => handleDeleteFamily(fm.id)} class="text-rose-600 hover:text-rose-800 text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors">Hapus</button>
                                    </td>
                                </tr>
                            {/each}
                            {#if familyMembers.length === 0}
                                <tr><td colspan="4" class="p-8 text-center text-slate-500 text-sm">Belum ada anggota keluarga yang ditambahkan.</td></tr>
                            {/if}
                        </tbody>
                    </table>
                </div>

                <div class="pt-6 border-t border-slate-100">
                    <h3 class="font-bold text-slate-900 mb-5 text-lg">Tambah Anggota Keluarga Baru</h3>
                    <form onsubmit={handleAddFamily} class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap *</label>
                            <input type="text" bind:value={familyForm.name} required class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-shadow" placeholder="Nama sesuai KK" />
                            {#if familyValidationErrors.name}
                                <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.name[0]}</p>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">NIK *</label>
                            <input type="text" bind:value={familyForm.nik} required pattern="[0-9]+" title="Hanya angka yang diperbolehkan" maxlength="16" class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-shadow" placeholder="16 digit angka" />
                            {#if familyValidationErrors.nik}
                                <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.nik[0]}</p>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">Tempat Lahir</label>
                            <input type="text" bind:value={familyForm.place_of_birth} class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-shadow" />
                            {#if familyValidationErrors.place_of_birth}
                                <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.place_of_birth[0]}</p>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Lahir</label>
                            <input type="date" bind:value={familyForm.date_of_birth} class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-shadow" />
                            {#if familyValidationErrors.date_of_birth}
                                <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.date_of_birth[0]}</p>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">Jenis Kelamin</label>
                            <select bind:value={familyForm.gender} class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-shadow">
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                            {#if familyValidationErrors.gender}
                                <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.gender[0]}</p>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1.5">Hubungan Keluarga *</label>
                            <input type="text" bind:value={familyForm.relationship} required class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-shadow" placeholder="mis: Suami, Istri, Anak" />
                            {#if familyValidationErrors.relationship}
                                <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.relationship[0]}</p>
                            {/if}
                        </div>
                        <div class="sm:col-span-2 pt-4">
                            <button type="submit" disabled={isSubmitting} class="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50">
                                {isSubmitting ? 'Menyimpan...' : 'Tambah Anggota Keluarga'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    {/if}
</div>

<!-- Modal Sukses -->
{#if isSuccessModalOpen}
    <div 
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={(e) => { if (e.target === e.currentTarget) isSuccessModalOpen = false; }}
        onkeydown={(e) => e.key === 'Escape' && (isSuccessModalOpen = false)}
        role="button"
        tabindex="0"
    >
        <div class="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 text-center p-8 scale-in-center">
            <div class="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-10 h-10">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
            
            <h3 class="font-extrabold text-2xl text-slate-900 mb-2">Berhasil!</h3>
            <p class="text-slate-600 mb-8 leading-relaxed">
                {kkUploadMsg || 'Tindakan berhasil dilakukan.'}
            </p>
            
            <button 
                type="button"
                onclick={() => isSuccessModalOpen = false}
                class="w-full px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover-lift"
            >
                Tutup
            </button>
        </div>
    </div>
{/if}

<ModalDocument 
    isOpen={isDocumentModalOpen} 
    {documentUrl} 
    {documentType} 
    onClose={() => isDocumentModalOpen = false} 
/>
