<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { getTemplates, getMyRequests, submitLetterRequest, getFamilyMembers, addFamilyMember, deleteFamilyMember, uploadKk } from '$lib/api.js';
    import { userStore } from '$lib/stores/auth.js';
    import StatusBadge from '$lib/components/StatusBadge.svelte';

    let user = $state(null);
    let templates = $state([]);
    let myRequests = $state([]);
    let familyMembers = $state([]);
    let loading = $state(true);
    let loadingFamily = $state(false);
    let isSubmitting = $state(false);
    let activeTab = $state('ajukan'); // 'ajukan' | 'riwayat' | 'keluarga'

    // Sinkronisasi dengan sidebar URL ?tab=
    $effect(() => {
        const urlTab = $page.url.searchParams.get('tab');
        if (urlTab === 'ajukan' || urlTab === 'riwayat' || urlTab === 'keluarga') {
            activeTab = urlTab;
        }
    });
    
    // Modal & Form State
    let isModalOpen = $state(false);
    let selectedTemplate = $state(null);
    let formData = $state({});
    let errorMsg = $state(null);
    let successMsg = $state(null);
    
    // Family Member Form State
    let familyForm = $state({ name: '', nik: '', place_of_birth: '', date_of_birth: '', gender: 'L', relationship: '' });
    let familyValidationErrors = $state({});
    let kkFile = $state(null);
    let kkUploadMsg = $state(null);
    let kkErrorMsg = $state(null);
    let isSuccessModalOpen = $state(false);

    userStore.subscribe((val) => {
        user = val;
    });

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        loading = true;
        try {
            const [tempRes, reqRes, famRes] = await Promise.all([
                getTemplates(),
                getMyRequests(),
                getFamilyMembers().catch(() => ({ status: 'error', data: [] }))
            ]);
            if (tempRes?.status === 'success') templates = tempRes.data;
            if (reqRes?.status === 'success') myRequests = reqRes.data;
            if (famRes?.status === 'success') familyMembers = famRes.data;
        } catch (e) {
            console.error('Gagal memuat data dasbor:', e);
        } finally {
            loading = false;
        }
    }

    function openNewRequestModal(template) {
        selectedTemplate = template;
        formData = { request_for: 'self' };
        errorMsg = null;
        successMsg = null;
        isModalOpen = true;
    }

    async function handleSubmitRequest(e) {
        e.preventDefault();
        if (!selectedTemplate) return;

        isSubmitting = true;
        errorMsg = null;
        successMsg = null;

        try {
            // Jika untuk keluarga, masukkan data keluarga ke form_data sebagai pengaju
            let finalFormData = { ...formData };
            if (formData.request_for !== 'self') {
                const fam = familyMembers.find(f => f.id == formData.request_for);
                if (fam) {
                    finalFormData.family_member_id = fam.id;
                    finalFormData.family_member_name = fam.name;
                    finalFormData.family_member_nik = fam.nik;
                }
            }
            
            const res = await submitLetterRequest(selectedTemplate.id, finalFormData);
            if (res.status === 'success') {
                successMsg = 'Permohonan surat berhasil diajukan!';
                await loadData();
                setTimeout(() => {
                    isModalOpen = false;
                    activeTab = 'riwayat';
                }, 1500);
            }
        } catch (e) {
            errorMsg = e.response?.data?.message || 'Gagal mengajukan surat.';
        } finally {
            isSubmitting = false;
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
                // Update user state partially
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

    let approvedCount = $derived(myRequests.filter(r => r.status === 'approved').length);
    let pendingCount = $derived(myRequests.filter(r => r.status === 'pending').length);
</script>

<div class="space-y-8">
    <!-- Banner Verifikasi Akun -->
    {#if user && !user.is_approved}
        <div class="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4 shadow-xs animate-fadeIn">
            <div class="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
            <div>
                <h3 class="font-bold text-base mb-1">Akun Dalam Proses Verifikasi Admin</h3>
                <p class="text-sm text-amber-800/90 leading-relaxed">
                    Pendaftaran akun E-Surat Anda sedang ditinjau dan dicocokkan dengan dokumen KTP yang Anda unggah. Anda baru dapat mengajukan permohonan surat setelah akun disetujui.
                </p>
            </div>
        </div>
    {/if}

    <!-- Stat Cards Warga -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1: Total Permohonan -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengajuan</p>
                <p class="text-3xl font-extrabold text-slate-900 mt-2">{myRequests.length}</p>
                <p class="text-xs text-slate-400 mt-1">Seluruh surat saya</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            </div>
        </div>

        <!-- Card 2: Surat Disetujui -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Terbit</p>
                <p class="text-3xl font-extrabold text-emerald-600 mt-2">{approvedCount}</p>
                <p class="text-xs text-slate-400 mt-1">Siap diunduh PDF</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <!-- Card 3: Sedang Ditinjau -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang Diproses</p>
                <p class="text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</p>
                <p class="text-xs text-slate-400 mt-1">Verifikasi Admin</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <!-- Card 4: Status Akun -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Identitas</p>
                <p class="text-lg font-extrabold text-slate-900 mt-2">
                    {user?.is_approved ? 'Terverifikasi' : 'Menunggu'}
                </p>
                <p class="text-xs text-slate-400 mt-1">Dokumen KTP</p>
            </div>
            <div class={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-inner ${user?.is_approved ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
            </div>
        </div>
    </div>

    <!-- Secondary Tab Pill -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <div class="flex items-center gap-2">
            <button 
                type="button"
                onclick={() => activeTab = 'ajukan'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'ajukan' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Ajukan Surat & Layanan</span>
            </button>
            <button 
                type="button"
                onclick={() => activeTab = 'riwayat'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'riwayat' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Riwayat Surat Saya</span>
                <span class="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 font-semibold">{myRequests.length}</span>
            </button>
            <button 
                type="button"
                onclick={() => activeTab = 'keluarga'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'keluarga' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Keluarga Saya</span>
                <span class="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 font-semibold">{familyMembers.length}</span>
            </button>
        </div>
    </div>

    {#if activeTab === 'keluarga'}
        <div class="animate-fadeIn space-y-6">
            <!-- Form Upload KK -->
            <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 class="font-bold text-slate-900 text-base">Dokumen Kartu Keluarga (KK)</h2>
                    <p class="text-sm text-slate-500">Unggah KK untuk menambahkan anggota keluarga Anda.</p>
                </div>
                <div class="p-6">
                    {#if user?.kk_path}
                        <div class="mb-4 flex items-center gap-4">
                            <span class={`px-3 py-1 rounded-full text-xs font-bold ${user.is_kk_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {user.is_kk_approved ? 'Disetujui Admin' : 'Menunggu Verifikasi Admin'}
                            </span>
                            <a href={user.kk_path.startsWith('http') ? user.kk_path : `http://localhost:8002/storage/${user.kk_path}`} target="_blank" class="text-sm text-blue-600 hover:underline">Lihat Dokumen</a>
                        </div>
                    {/if}
                    <form onsubmit={handleUploadKk} class="flex items-center gap-4">
                        <input type="file" accept="image/*,.pdf" onchange={(e) => kkFile = e.target.files[0]} class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-full" required />
                        <button type="submit" disabled={isSubmitting} class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-colors whitespace-nowrap">Upload KK</button>
                    </form>
                    {#if kkErrorMsg}<p class="mt-2 text-red-600 text-sm">{kkErrorMsg}</p>{/if}
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
                            <div class="p-4 mb-6 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-200">
                                Anggota keluarga yang ditambahkan hanya dapat digunakan untuk pengajuan surat setelah dokumen KK disetujui oleh Admin.
                            </div>
                        {/if}
                        
                        <div class="overflow-x-auto mb-8">
                            <table class="w-full text-left border-collapse border border-slate-200 rounded-lg">
                                <thead>
                                    <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                        <th class="p-3 border-b border-slate-200">Nama</th>
                                        <th class="p-3 border-b border-slate-200">NIK</th>
                                        <th class="p-3 border-b border-slate-200">Hubungan</th>
                                        <th class="p-3 border-b border-slate-200">Opsi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each familyMembers as fm}
                                        <tr class="text-sm border-b border-slate-100 hover:bg-slate-50">
                                            <td class="p-3 font-semibold text-slate-900">{fm.name}</td>
                                            <td class="p-3 font-mono text-slate-600">{fm.nik}</td>
                                            <td class="p-3 text-slate-600">{fm.relationship}</td>
                                            <td class="p-3">
                                                <button onclick={() => handleDeleteFamily(fm.id)} class="text-red-500 hover:text-red-700 text-xs font-bold">Hapus</button>
                                            </td>
                                        </tr>
                                    {/each}
                                    {#if familyMembers.length === 0}
                                        <tr><td colspan="4" class="p-4 text-center text-slate-500 text-sm">Belum ada anggota keluarga.</td></tr>
                                    {/if}
                                </tbody>
                            </table>
                        </div>

                        <h3 class="font-bold text-slate-900 mb-4">Tambah Anggota Keluarga Baru</h3>
                        <form onsubmit={handleAddFamily} class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                                <input type="text" bind:value={familyForm.name} required class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a]" />
                                {#if familyValidationErrors.name}
                                    <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.name[0]}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">NIK</label>
                                <input type="text" bind:value={familyForm.nik} required pattern="[0-9]+" title="Hanya angka yang diperbolehkan" maxlength="16" class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a]" />
                                {#if familyValidationErrors.nik}
                                    <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.nik[0]}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                                <input type="text" bind:value={familyForm.place_of_birth} class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a]" />
                                {#if familyValidationErrors.place_of_birth}
                                    <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.place_of_birth[0]}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                                <input type="date" bind:value={familyForm.date_of_birth} class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a]" />
                                {#if familyValidationErrors.date_of_birth}
                                    <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.date_of_birth[0]}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                                <select bind:value={familyForm.gender} class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a]">
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                                {#if familyValidationErrors.gender}
                                    <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.gender[0]}</p>
                                {/if}
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Hubungan (mis: Anak, Istri)</label>
                                <input type="text" bind:value={familyForm.relationship} required class="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a]" />
                                {#if familyValidationErrors.relationship}
                                    <p class="mt-1 text-xs text-rose-500 font-semibold">{familyValidationErrors.relationship[0]}</p>
                                {/if}
                            </div>
                            <div class="sm:col-span-2 pt-2">
                                <button type="submit" disabled={isSubmitting} class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-sm transition-colors">
                                    Tambah Anggota
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            {/if}
        </div>
    {:else if activeTab === 'ajukan'}
        <!-- Pilihan Template Cepat -->
        <div class="animate-fadeIn">
            <h2 class="text-base font-bold text-slate-900 mb-4">Pilih Jenis Layanan Surat Resmi</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {#each templates as t}
                    <div 
                        onclick={() => { if (user?.is_approved) openNewRequestModal(t); }}
                        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && user?.is_approved && openNewRequestModal(t)}
                        role="button"
                        tabindex="0"
                        class={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 flex flex-col justify-between ${
                            user?.is_approved 
                                ? 'cursor-pointer hover:border-[#1e3a8a] hover:shadow-lg hover:-translate-y-1' 
                                : 'opacity-60 cursor-not-allowed'
                        }`}
                    >
                        <div>
                            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">Surat Resmi</span>
                            <h3 class="font-extrabold text-slate-900 text-lg mb-2">{t.name}</h3>
                            <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">{t.description}</p>
                        </div>

                        <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1e3a8a]">
                            <span>Ajukan Sekarang</span>
                            <span class="text-sm">&rarr;</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <!-- Daftar Riwayat Pengajuan Saya -->
        <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden animate-fadeIn">
            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 class="font-bold text-slate-900 text-base">Riwayat Permohonan Surat Saya</h2>
                <span class="text-xs text-slate-500 font-semibold">{myRequests.length} permohonan</span>
            </div>

            {#if loading}
                <div class="p-12 text-center text-slate-500">Memuat riwayat surat...</div>
            {:else if myRequests.length === 0}
                <div class="p-12 text-center">
                    <p class="text-slate-500 text-sm mb-4">Belum ada riwayat pengajuan surat.</p>
                </div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                                <th class="py-3.5 px-6">Tanggal</th>
                                <th class="py-3.5 px-6">Jenis Surat</th>
                                <th class="py-3.5 px-6">Status</th>
                                <th class="py-3.5 px-6">Keterangan</th>
                                <th class="py-3.5 px-6 text-right">Aksi / Unduh</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            {#each myRequests as req}
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                    <td class="py-4 px-6 text-slate-600">
                                        {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td class="py-4 px-6 font-bold text-slate-900">
                                        {req.template?.name || 'Surat'}
                                    </td>
                                    <td class="py-4 px-6">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td class="py-4 px-6 text-slate-500 text-xs max-w-xs truncate">
                                        {req.rejection_reason || (req.status === 'approved' ? 'Telah diterbitkan dengan QR Code' : 'Dalam peninjauan')}
                                    </td>
                                    <td class="py-4 px-6 text-right">
                                        {#if req.status === 'approved'}
                                            <a 
                                                href={getPdfDownloadUrl(req.id)}
                                                target="_blank"
                                                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition-all hover-lift"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                </svg>
                                                <span>Unduh PDF</span>
                                            </a>
                                        {:else}
                                            <span class="text-xs text-slate-400 italic">-</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    {/if}
</div>

<!-- Modal Ajukan Surat Baru -->
{#if isModalOpen && selectedTemplate}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={(e) => { if (e.target === e.currentTarget) isModalOpen = false; }}
        onkeydown={(e) => e.key === 'Escape' && (isModalOpen = false)}
        role="button"
        tabindex="0"
        aria-label="Tutup modal permohonan baru"
    >
        <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div class="bg-[#1e3a8a] px-6 py-4 text-white flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-lg">Formulir {selectedTemplate.name}</h3>
                    <p class="text-xs text-blue-200">Isi data yang diperlukan di bawah ini</p>
                </div>
                <button 
                    type="button"
                    onclick={() => isModalOpen = false}
                    class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onsubmit={handleSubmitRequest} class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {#if errorMsg}
                    <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                        {errorMsg}
                    </div>
                {/if}
                {#if successMsg}
                    <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold">
                        {successMsg}
                    </div>
                {/if}

                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Surat Ini Ditujukan Untuk Siapa? *
                    </label>
                    <select bind:value={formData.request_for} class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm">
                        <option value="self">Diri Sendiri ({user?.name})</option>
                        {#each familyMembers as fam}
                            <option value={fam.id}>Anggota Keluarga: {fam.name} ({fam.relationship})</option>
                        {/each}
                    </select>
                    {#if familyMembers.length === 0}
                        <p class="text-[10px] text-slate-500 mt-1">Anda bisa menambahkan anggota keluarga di tab "Keluarga Saya".</p>
                    {/if}
                </div>

                {#if selectedTemplate.required_fields && selectedTemplate.required_fields.length > 0}
                    {#each selectedTemplate.required_fields as field}
                        <div>
                            <label for={field.name} class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                {field.label} {field.required ? '*' : ''}
                            </label>
                            <input 
                                id={field.name}
                                type={field.type || 'text'}
                                bind:value={formData[field.name]}
                                placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm"
                                required={field.required}
                            />
                        </div>
                    {/each}
                {:else}
                    <p class="text-sm text-slate-600">Tidak ada isian tambahan yang diperlukan. Klik Kirim untuk mengajukan permohonan.</p>
                {/if}

                <div class="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button 
                        type="button"
                        onclick={() => isModalOpen = false}
                        class="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition-all"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        disabled={isSubmitting || !!successMsg}
                        class="px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Permohonan'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal Sukses (Informasi Keluarga) -->
{#if isSuccessModalOpen}
    <div 
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={(e) => { if (e.target === e.currentTarget) isSuccessModalOpen = false; }}
        onkeydown={(e) => e.key === 'Escape' && (isSuccessModalOpen = false)}
        role="button"
        tabindex="0"
        aria-label="Tutup modal sukses"
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
                class="w-full px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all hover-lift"
            >
                Tutup
            </button>
        </div>
    </div>
{/if}
