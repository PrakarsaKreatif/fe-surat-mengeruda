<script>
    import { onMount } from 'svelte';
    import { getMyRequests } from '$lib/api.js';
    import { userStore, isLoadingAuth } from '$lib/stores/auth.js';

    let user = $state(null);
    let myRequests = $state([]);
    let loading = $state(true);
    let authLoading = $state(true);

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
            const reqRes = await getMyRequests();
            if (reqRes?.status === 'success') myRequests = reqRes.data;
        } catch (e) {
            console.error('Gagal memuat data dasbor:', e);
        } finally {
            loading = false;
        }
    }

    let approvedCount = $derived(myRequests.filter(r => r.status === 'approved').length);
    let pendingCount = $derived(myRequests.filter(r => r.status === 'pending').length);
</script>

<div class="space-y-8 animate-fadeIn">
    <!-- Banner Verifikasi Akun -->
    {#if user && !user.is_approved}
        <div class="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4 shadow-xs">
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

    {#if user && user.is_approved && !user.kk_path}
        <div class="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-4 shadow-xs">
            <div class="w-10 h-10 rounded-xl bg-blue-200 text-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </div>
            <div>
                <h3 class="font-bold text-base mb-1">Lengkapi Profil Anda</h3>
                <p class="text-sm text-blue-800/90 leading-relaxed">
                    Anda belum mengunggah Kartu Keluarga (KK). Anda perlu mengunggah KK untuk bisa menambahkan anggota keluarga dan mengajukan surat atas nama mereka.
                </p>
                <div class="mt-2 text-sm">
                    <a href="/dashboard/profile" class="font-semibold text-blue-800 hover:text-blue-900 flex items-center gap-1">
                        Unggah KK Sekarang <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </div>
        </div>
    {/if}

    <!-- Stat Cards Warga -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1: Total Permohonan -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengajuan</p>
                {#if loading}
                    <div class="h-9 w-16 bg-slate-200 animate-pulse rounded mt-2"></div>
                {:else}
                    <p class="text-3xl font-extrabold text-slate-900 mt-2">{myRequests.length}</p>
                {/if}
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
                {#if loading}
                    <div class="h-9 w-16 bg-slate-200 animate-pulse rounded mt-2"></div>
                {:else}
                    <p class="text-3xl font-extrabold text-emerald-600 mt-2">{approvedCount}</p>
                {/if}
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
                {#if loading}
                    <div class="h-9 w-16 bg-slate-200 animate-pulse rounded mt-2"></div>
                {:else}
                    <p class="text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</p>
                {/if}
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
</div>
