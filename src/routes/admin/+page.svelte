<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { 
        getPendingUsers, 
        getAllUsers, 
        approveUser, 
        approveKk,
        rejectKk,
        getKtpUrl, 
        getAdminLetterRequests, 
        approveLetterRequest, 
        rejectLetterRequest,
        getPdfDownloadUrl,
        getSettings,
        updateSettings
    } from '$lib/api.js';
    import { userStore } from '$lib/stores/auth.js';
    import StatusBadge from '$lib/components/StatusBadge.svelte';
    import ModalKtp from '$lib/components/ModalKtp.svelte';

    let user = $state(null);
    let activeTab = $state('permohonan'); // 'permohonan' | 'warga'

    // Baca param ?tab= dari URL agar sinkron dengan klik di Sidebar
    $effect(() => {
        const urlTab = $page.url.searchParams.get('tab');
        if (urlTab === 'warga' || urlTab === 'permohonan') {
            activeTab = urlTab;
        }
    });
    
    // Data State
    let letterRequests = $state([]);
    let pendingUsers = $state([]);
    let allUsers = $state([]);
    let filterStatus = $state('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
    let loading = $state(true);

    // KTP Modal State
    let isKtpModalOpen = $state(false);
    let currentKtpUrl = $state(null);
    let currentKtpUser = $state('');

    // Rejection Modal State
    let isRejectModalOpen = $state(false);
    let selectedRequestForReject = $state(null);
    let rejectionReasonInput = $state('');

    // Settings State
    let loadingSettings = $state(false);
    let savingSettings = $state(false);
    let formSettings = $state({
        kop_pemda: '',
        kop_desa: '',
        kop_alamat: '',
        kop_logo: ''
    });

    userStore.subscribe((val) => {
        user = val;
    });

    onMount(async () => {
        await loadAllData();
    });

    async function loadAllData() {
        loading = true;
        try {
            const [reqRes, pendRes, allRes, setRes] = await Promise.all([
                getAdminLetterRequests(filterStatus),
                getPendingUsers(),
                getAllUsers(),
                getSettings()
            ]);
            
            if (reqRes.status === 'success') letterRequests = reqRes.data;
            console.log('PENDING USERS RES:', pendRes);
            if (pendRes.status === 'success') pendingUsers = pendRes.data;
            if (allRes.status === 'success') allUsers = allRes.data;
            if (setRes.status === 'success') {
                formSettings = {
                    kop_pemda: setRes.data.kop_pemda || '',
                    kop_desa: setRes.data.kop_desa || '',
                    kop_alamat: setRes.data.kop_alamat || '',
                    kop_logo: setRes.data.kop_logo || ''
                };
            }
        } catch (e) {
            console.error('Gagal memuat data admin:', e);
        } finally {
            loading = false;
        }
    }

    async function handleFilterChange(status) {
        filterStatus = status;
        loading = true;
        try {
            const res = await getAdminLetterRequests(status);
            if (res?.status === 'success') letterRequests = res.data;
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }

    // Action Methods
    async function handleApproveUser(id) {
        if (!confirm('Setujui warga ini?')) return;
        try {
            const res = await approveUser(id);
            if (res.status === 'success') {
                alert('Warga berhasil disetujui');
                await loadAllData();
            }
        } catch (e) {
            alert('Gagal menyetujui warga');
        }
    }

    async function handleApproveKk(id) {
        if (!confirm('Setujui dokumen KK warga ini?')) return;
        try {
            const res = await approveKk(id);
            if (res.status === 'success') {
                alert('Dokumen KK berhasil disetujui');
                await loadAllData();
            }
        } catch (e) {
            alert('Gagal menyetujui dokumen KK');
        }
    }

    async function handleRejectKk(id) {
        if (!confirm('Tolak dan hapus dokumen KK warga ini beserta data anggota keluarganya?')) return;
        try {
            const res = await rejectKk(id);
            if (res.status === 'success') {
                alert('Dokumen KK berhasil ditolak dan dihapus');
                await loadAllData();
            }
        } catch (e) {
            alert('Gagal menolak dokumen KK');
        }
    }

    async function handleApproveLetter(requestId) {
        if (!confirm('Setujui permohonan dan terbitkan surat PDF dengan QR Code resmi?')) return;
        try {
            const res = await approveLetterRequest(requestId);
            if (res.status === 'success') {
                alert('Surat berhasil diterbitkan dan siap diunduh!');
                await loadAllData();
            }
        } catch (e) {
            alert('Gagal menyetujui surat: ' + (e.response?.data?.message || e.message));
        }
    }

    function openRejectModal(requestItem) {
        selectedRequestForReject = requestItem;
        rejectionReasonInput = '';
        isRejectModalOpen = true;
    }

    async function handleRejectSubmit(e) {
        e.preventDefault();
        if (!selectedRequestForReject || !rejectionReasonInput.trim()) return;
        try {
            const res = await rejectLetterRequest(selectedRequestForReject.id, rejectionReasonInput.trim());
            if (res.status === 'success') {
                isRejectModalOpen = false;
                await loadAllData();
            }
        } catch (e) {
            alert('Gagal menolak surat: ' + (e.response?.data?.message || e.message));
        }
    }

    function openKtpViewer(u) {
        currentKtpUrl = getKtpUrl(u.id);
        currentKtpUser = `${u.name} (NIK: ${u.nik})`;
        isKtpModalOpen = true;
    }

    let pendingLettersCount = $derived(
        letterRequests.filter(item => item.status === 'pending').length
    );

    let selectedLogoFile = null;

    async function handleSaveSettings(e) {
        e.preventDefault();
        savingSettings = true;
        try {
            const res = await updateSettings(formSettings, selectedLogoFile);
            if (res.status === 'success') {
                if (res.logo_url) {
                    formSettings.kop_logo = res.logo_url;
                    selectedLogoFile = null; // reset file input manually or just let it be
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

<div class="space-y-8">
    <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Dashboard Administrator</h2>
        <a href="/admin/templates" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Kelola Template Surat
        </a>
    </div>

    <!-- Summary Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1: Total Permohonan -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Permohonan</p>
                <p class="text-3xl font-extrabold text-slate-900 mt-2">{letterRequests.length}</p>
                <p class="text-xs text-slate-400 mt-1">Daftar surat masuk</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            </div>
        </div>

        <!-- Card 2: Menunggu Verifikasi Surat -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Tertunda</p>
                <p class="text-3xl font-extrabold text-amber-600 mt-2">{pendingLettersCount}</p>
                <p class="text-xs text-slate-400 mt-1">Perlu tindakan Anda</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>

        <!-- Card 3: Menunggu Verifikasi KTP -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifikasi Akun Warga</p>
                <p class="text-3xl font-extrabold text-rose-600 mt-2">{pendingUsers.length}</p>
                <p class="text-xs text-slate-400 mt-1">Warga menunggu persetujuan</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
            </div>
        </div>

        <!-- Card 4: Total Warga Terdaftar -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warga</p>
                <p class="text-3xl font-extrabold text-emerald-600 mt-2">{allUsers.length}</p>
                <p class="text-xs text-slate-400 mt-1">Terdaftar di E-Surat</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
            </div>
        </div>
    </div>

    <!-- Secondary Nav Tabs -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <div class="flex items-center gap-2">
            <button 
                type="button"
                onclick={() => activeTab = 'permohonan'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'permohonan' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Permohonan Surat</span>
                <span class="px-2 py-0.5 rounded-full text-xs bg-white/20">{letterRequests.length}</span>
            </button>
            <button 
                type="button"
                onclick={() => activeTab = 'warga'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'warga' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Verifikasi Akun Warga</span>
                {#if pendingUsers.length > 0}
                    <span class="px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white animate-pulse">{pendingUsers.length}</span>
                {/if}
            </button>
            <button 
                type="button"
                onclick={() => activeTab = 'pengaturan'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'pengaturan' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Pengaturan KOP</span>
            </button>
        </div>
    </div>

    {#if activeTab === 'permohonan'}
        <!-- TAB 1: PERMOHONAN SURAT -->
        <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden animate-fadeIn">
            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 class="font-bold text-slate-900 text-base">Daftar Permohonan Surat Masuk</h2>
                
                <!-- Filter Status -->
                <div class="flex items-center gap-2">
                    <button 
                        type="button"
                        onclick={() => handleFilterChange('pending')}
                        class={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Menunggu Verifikasi
                    </button>
                    <button 
                        type="button"
                        onclick={() => handleFilterChange('approved')}
                        class={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Telah Terbit
                    </button>
                    <button 
                        type="button"
                        onclick={() => handleFilterChange('all')}
                        class={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Semua
                    </button>
                </div>
            </div>

            {#if loading}
                <div class="p-12 text-center text-slate-500">Memuat permohonan surat...</div>
            {:else if letterRequests.length === 0}
                <div class="p-12 text-center">
                    <p class="text-slate-500 text-sm">Tidak ada permohonan surat untuk kategori status ini.</p>
                </div>
            {:else}
                <div class="divide-y divide-slate-100">
                    {#each letterRequests as req}
                        <div class="p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div class="space-y-2 max-w-2xl">
                                <div class="flex items-center gap-3">
                                    <span class="font-extrabold text-slate-900 text-lg">{req.template?.name || 'Surat'}</span>
                                    <StatusBadge status={req.status} />
                                    <span class="text-xs text-slate-400 font-mono">#{req.id}</span>
                                </div>

                                <div class="text-sm text-slate-600">
                                    Pemohon: <strong class="text-slate-900">{req.user?.name}</strong> (NIK: <span class="font-mono text-slate-700">{req.user?.nik}</span>) | No. HP: {req.user?.phone || '-'}
                                </div>

                                <!-- Form Data Details -->
                                {#if req.form_data}
                                    <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {#each Object.entries(req.form_data) as [key, value]}
                                            <div>
                                                <span class="text-slate-400 font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
                                                <strong class="text-slate-800">{value}</strong>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}

                                <div class="text-xs text-slate-400">
                                    Diajukan pada: {new Date(req.created_at).toLocaleString('id-ID')}
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex items-center gap-2 flex-shrink-0">
                                {#if req.status === 'pending'}
                                    <button 
                                        type="button"
                                        onclick={() => handleApproveLetter(req.id)}
                                        class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 hover-lift"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        <span>Setujui & Terbitkan PDF</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onclick={() => openRejectModal(req)}
                                        class="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all"
                                    >
                                        Tolak
                                    </button>
                                {:else if req.status === 'approved'}
                                    <a 
                                        href={getPdfDownloadUrl(req.id)}
                                        target="_blank"
                                        class="px-4 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        <span>Unduh Surat PDF</span>
                                    </a>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {:else}
        <!-- TAB 2: VERIFIKASI AKUN WARGA -->
        <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden animate-fadeIn">
            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                    <h2 class="font-bold text-slate-900 text-base">Verifikasi Akun & Dokumen KTP Warga</h2>
                    <p class="text-xs text-slate-500">Warga yang belum diverifikasi tidak dapat mengajukan permohonan surat online</p>
                </div>
                <span class="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                    {pendingUsers.length} Menunggu Verifikasi
                </span>
            </div>

            {#if loading}
                <div class="p-12 text-center text-slate-500">Memuat data warga...</div>
            {:else if allUsers.length === 0}
                <div class="p-12 text-center text-slate-500">Belum ada warga yang mendaftar.</div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                                <th class="py-3.5 px-6">NIK</th>
                                <th class="py-3.5 px-6">Nama Lengkap</th>
                                <th class="py-3.5 px-6">Kontak</th>
                                <th class="py-3.5 px-6">Status Akun</th>
                                <th class="py-3.5 px-6">Dokumen (KTP & KK)</th>
                                <th class="py-3.5 px-6 text-right">Aksi Verifikasi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            {#each allUsers as u}
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                    <td class="py-4 px-6 font-mono font-semibold text-slate-800">{u.nik}</td>
                                    <td class="py-4 px-6 font-bold text-slate-900">{u.name}</td>
                                    <td class="py-4 px-6 text-xs text-slate-600">
                                        <div>{u.email}</div>
                                        <div class="text-slate-400">{u.phone}</div>
                                    </td>
                                    <td class="py-4 px-6 space-y-1">
                                        {#if u.is_approved}
                                            <StatusBadge status="approved" label="Akun Aktif" />
                                        {:else}
                                            <StatusBadge status="pending" label="Menunggu Verifikasi" />
                                        {/if}
                                        
                                        {#if u.kk_path}
                                            <div class="mt-1">
                                                {#if u.is_kk_approved}
                                                    <span class="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">KK Disetujui</span>
                                                {:else}
                                                    <span class="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">KK Menunggu</span>
                                                {/if}
                                            </div>
                                        {/if}
                                    </td>
                                    <td class="py-4 px-6 flex flex-col gap-2">
                                        <button 
                                            type="button"
                                            onclick={() => openKtpViewer(u)}
                                            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Lihat KTP</span>
                                        </button>
                                        
                                        {#if u.kk_path}
                                            <a 
                                                href={u.kk_path.startsWith('http') ? u.kk_path : `http://localhost:8002/storage/${u.kk_path}`} 
                                                target="_blank"
                                                class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-all"
                                            >
                                                <span>Lihat KK</span>
                                            </a>
                                        {/if}
                                    </td>
                                    <td class="py-4 px-6 text-right space-y-2">
                                        {#if !u.is_approved}
                                            <button 
                                                type="button"
                                                onclick={() => handleApproveUser(u.id)}
                                                class="block w-full px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all hover-lift"
                                            >
                                                Setujui Akun
                                            </button>
                                        {/if}
                                        
                                        {#if u.kk_path && !u.is_kk_approved}
                                            <div class="flex gap-2">
                                                <button 
                                                    type="button"
                                                    onclick={() => handleApproveKk(u.id)}
                                                    class="flex-1 px-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all hover-lift"
                                                >
                                                    Setujui KK
                                                </button>
                                                <button 
                                                    type="button"
                                                    onclick={() => handleRejectKk(u.id)}
                                                    class="flex-1 px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all hover-lift"
                                                >
                                                    Tolak KK
                                                </button>
                                            </div>
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

    {#if activeTab === 'pengaturan'}
        <!-- TAB 3: PENGATURAN KOP SURAT -->
        <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden animate-fadeIn">
            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 class="font-bold text-slate-900 text-base">Pengaturan KOP Surat Cetak (PDF)</h2>
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
                                <input type="text" bind:value={formSettings.kop_pemda} class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="PEMERINTAH KABUPATEN NAGEKEO<br />KECAMATAN SOA" />
                                <p class="text-xs text-slate-500 mt-1">Gunakan <code>&lt;br /&gt;</code> untuk pindah baris.</p>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Nama Desa (Baris 2)</label>
                                <input type="text" bind:value={formSettings.kop_desa} class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-bold" placeholder="DESA MENGERUDA" />
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">Alamat (Baris 3)</label>
                                <textarea bind:value={formSettings.kop_alamat} rows="2" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Alamat: Jl. Raya Mengeruda, Soa..."></textarea>
                            </div>
                            <div>
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
                        
                        <div class="pt-4 border-t border-slate-200">
                            <button type="submit" class="px-6 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50" disabled={savingSettings}>
                                {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </form>
                {/if}
            </div>
        </div>
    {/if}
</div>

<!-- Modal KTP Viewer -->
<ModalKtp 
    isOpen={isKtpModalOpen} 
    ktpUrl={currentKtpUrl} 
    userName={currentKtpUser} 
    onClose={() => isKtpModalOpen = false} 
/>

<!-- Modal Tolak Permohonan Surat -->
{#if isRejectModalOpen && selectedRequestForReject}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={(e) => { if (e.target === e.currentTarget) isRejectModalOpen = false; }}
        onkeydown={(e) => e.key === 'Escape' && (isRejectModalOpen = false)}
        role="button"
        tabindex="0"
        aria-label="Tutup modal tolak permohonan"
    >
        <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div class="bg-rose-600 px-6 py-4 text-white">
                <h3 class="font-bold text-lg">Tolak Permohonan Surat</h3>
                <p class="text-xs text-rose-100">Pemohon: {selectedRequestForReject.user?.name}</p>
            </div>

            <form onsubmit={handleRejectSubmit} class="p-6 space-y-4">
                <div>
                    <label for="rejection_reason" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Alasan Penolakan (Wajib Diisi)
                    </label>
                    <textarea 
                        id="rejection_reason"
                        bind:value={rejectionReasonInput}
                        rows="3"
                        placeholder="Contoh: Alamat domisili pada KTP tidak sesuai / lampiran belum lengkap."
                        class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                        required
                    ></textarea>
                </div>

                <div class="pt-2 flex justify-end gap-3">
                    <button 
                        type="button"
                        onclick={() => isRejectModalOpen = false}
                        class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                    >
                        Konfirmasi Penolakan
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
