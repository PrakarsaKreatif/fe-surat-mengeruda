<script>
    import { onMount } from 'svelte';
    import { getPendingUsers, getAllUsers, getAdminLetterRequests } from '$lib/api.js';

    // Data State
    let letterRequests = $state([]);
    let pendingUsers = $state([]);
    let allUsers = $state([]);
    let loading = $state(true);

    onMount(async () => {
        await loadDashboardData();
    });

    async function loadDashboardData() {
        loading = true;
        try {
            const reqRes = await getAdminLetterRequests('all'); // Load all for total count
            const pendRes = await getPendingUsers();
            const allRes = await getAllUsers();
            if (reqRes.status === 'success') letterRequests = reqRes.data;
            if (pendRes.status === 'success') pendingUsers = pendRes.data;
            if (allRes.status === 'success') allUsers = allRes.data;
        } catch (e) {
            console.error('Gagal memuat data admin:', e);
        } finally {
            loading = false;
        }
    }

    let pendingLettersCount = $derived(
        letterRequests.filter(item => item.status === 'pending').length
    );
    let pendingKkCount = $derived(
        allUsers.filter(u => u.kk_path && !u.is_kk_approved).length
    );
</script>

<div class="space-y-8 animate-fadeIn">
    <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Dashboard Administrator</h2>
    </div>

    <!-- Notification Banners -->
    {#if !loading && (pendingLettersCount > 0 || pendingUsers.length > 0 || pendingKkCount > 0)}
        <div class="space-y-4">
            {#if pendingLettersCount > 0}
                <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start shadow-sm">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-amber-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3 flex-1">
                        <h3 class="text-sm font-bold text-amber-800">Perhatian: {pendingLettersCount} Permohonan Surat Baru</h3>
                        <div class="mt-1 text-sm text-amber-700">
                            Ada {pendingLettersCount} permohonan surat yang menunggu verifikasi Anda.
                        </div>
                        <div class="mt-2 text-sm">
                            <a href="/admin/surat" class="font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1">
                                Proses sekarang <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                </div>
            {/if}

            {#if pendingUsers.length > 0}
                <div class="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg flex items-start shadow-sm">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-rose-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                    </div>
                    <div class="ml-3 flex-1">
                        <h3 class="text-sm font-bold text-rose-800">Perhatian: {pendingUsers.length} Pendaftaran Warga Baru</h3>
                        <div class="mt-1 text-sm text-rose-700">
                            Ada {pendingUsers.length} warga baru yang mendaftar dan menunggu verifikasi Anda.
                        </div>
                        <div class="mt-2 text-sm">
                            <a href="/admin/warga" class="font-semibold text-rose-800 hover:text-rose-900 flex items-center gap-1">
                                Verifikasi sekarang <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                </div>
            {/if}

            {#if pendingKkCount > 0}
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start shadow-sm">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-blue-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <div class="ml-3 flex-1">
                        <h3 class="text-sm font-bold text-blue-800">Perhatian: {pendingKkCount} Pengajuan Anggota Keluarga Baru</h3>
                        <div class="mt-1 text-sm text-blue-700">
                            Ada {pendingKkCount} pengajuan KK dan anggota keluarga baru yang menunggu verifikasi Anda.
                        </div>
                        <div class="mt-2 text-sm">
                            <a href="/admin/keluarga" class="font-semibold text-blue-800 hover:text-blue-900 flex items-center gap-1">
                                Verifikasi sekarang <span aria-hidden="true">&rarr;</span>
                            </a>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}

    <!-- Summary Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1: Total Permohonan -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between">
            <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Permohonan</p>
                {#if loading}
                    <div class="h-9 w-16 bg-slate-200 animate-pulse rounded mt-2"></div>
                {:else}
                    <p class="text-3xl font-extrabold text-slate-900 mt-2">{letterRequests.length}</p>
                {/if}
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
                {#if loading}
                    <div class="h-9 w-16 bg-slate-200 animate-pulse rounded mt-2"></div>
                {:else}
                    <p class="text-3xl font-extrabold text-amber-600 mt-2">{pendingLettersCount}</p>
                {/if}
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
                {#if loading}
                    <div class="h-9 w-16 bg-slate-200 animate-pulse rounded mt-2"></div>
                {:else}
                    <p class="text-3xl font-extrabold text-rose-600 mt-2">{pendingUsers.length}</p>
                {/if}
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
                {#if loading}
                    <div class="h-9 w-16 bg-slate-200 animate-pulse rounded mt-2"></div>
                {:else}
                    <p class="text-3xl font-extrabold text-emerald-600 mt-2">{allUsers.length}</p>
                {/if}
                <p class="text-xs text-slate-400 mt-1">Terdaftar di E-Surat</p>
            </div>
            <div class="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
            </div>
        </div>
    </div>
</div>
