<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { getPendingUsers, getAllUsers, getAdminLetterRequests } from '$lib/api.js';

    let { 
        user = null, 
        onLogout = () => {}, 
        isMobileOpen = false, 
        onCloseMobile = () => {}
    } = $props();

    let pendingUsersCount = $state(0);
    let pendingLettersCount = $state(0);
    let pendingKkCount = $state(0);

    let currentPath = $derived($page.url.pathname);
    let currentTab = $derived($page.url.searchParams.get('tab'));

    let isAdmin = $derived(
        currentPath.startsWith('/admin') ||
        user?.roles?.some(r => r.name === 'admin_surat') || 
        user?.roles?.some(r => r.name === 'Super Admin') || 
        user?.roles?.includes('Admin')
    );

    function isItemActive(href) {
        return currentPath === href || currentPath.startsWith(href + '/');
    }

    onMount(() => {
        if (isAdmin) {
            fetchCounts();
        }
    });

    async function fetchCounts() {
        try {
            const pendRes = await getPendingUsers();
            if (pendRes.status === 'success') pendingUsersCount = pendRes.data.length;

            const allRes = await getAllUsers();
            if (allRes.status === 'success') {
                pendingKkCount = allRes.data.filter(u => u.kk_path && !u.is_kk_approved).length;
            }

            const reqRes = await getAdminLetterRequests('all');
            if (reqRes.status === 'success') {
                pendingLettersCount = reqRes.data.filter(item => item.status === 'pending').length;
            }
        } catch (e) {
            console.error('Failed to fetch sidebar counts:', e);
        }
    }
</script>

<!-- Backdrop untuk Mobile -->
{#if isMobileOpen}
    <div 
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        onclick={onCloseMobile}
        onkeydown={(e) => e.key === 'Escape' && onCloseMobile()}
        role="button"
        tabindex="0"
        aria-label="Tutup menu sidebar"
    ></div>
{/if}

<!-- Sidebar Container -->
<aside class={`
    fixed top-0 left-0 bottom-0 z-50 w-72 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out
    lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
    <div>
        <!-- Brand Header -->
        <div class="h-20 px-6 border-b border-slate-800/80 flex items-center justify-between">
            <a href="/" class="flex items-center gap-3 group">
                <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path d="M19.5 22.5a3 3 0 003-3v-8.174l-6.879 4.022 3.485 1.876a.75.75 0 11-.712 1.321l-5.683-3.06a1.5 1.5 0 00-1.422 0l-5.683 3.06a.75.75 0 01-.712-1.32l3.485-1.877L1.5 11.326V19.5a3 3 0 003 3h15z" />
                        <path d="M1.5 9.589v-.745a3 3 0 011.578-2.641l7.5-4.039a3 3 0 012.844 0l7.5 4.039A3 3 0 0122.5 8.844v.745l-8.426 4.926-.652-.35a3 3 0 00-2.844 0l-.652.35L1.5 9.59z" />
                    </svg>
                </div>
                <div>
                    <span class="font-extrabold text-white text-lg tracking-tight block leading-tight">E-SURAT DESA</span>
                    <span class="text-xs text-blue-400 font-semibold uppercase tracking-wider block">Desa Mengeruda</span>
                </div>
            </a>

            <!-- Tombol tutup untuk mobile -->
            <button 
                type="button"
                onclick={onCloseMobile}
                class="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Tutup sidebar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Role Badge -->
        <div class="px-6 py-4">
            <div class="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Panel Mode</span>
                <span class={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${isAdmin ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                    {isAdmin ? 'Admin Desa' : 'Warga Desa'}
                </span>
            </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="px-4 py-2 space-y-1.5">
            {#if isAdmin}
                <div class="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Manajemen Layanan
                </div>

                <!-- Menu Admin: Dashboard -->
                <a 
                    href="/admin"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        currentPath === '/admin' 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                        <span>Dashboard Admin</span>
                    </div>
                </a>

                <!-- Menu Admin: Permohonan Surat -->
                <a 
                    href="/admin/surat"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/admin/surat') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span>Permohonan Surat</span>
                    </div>
                    {#if pendingLettersCount > 0}
                        <span class="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold animate-pulse">
                            {pendingLettersCount}
                        </span>
                    {/if}
                </a>

                <!-- Menu Admin: Template Surat -->
                <a 
                    href="/admin/templates"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/admin/templates') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Template Surat</span>
                    </div>
                </a>

                <!-- Menu Admin: Verifikasi Akun Warga -->
                <a 
                    href="/admin/warga"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/admin/warga') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span>Verifikasi Warga</span>
                    </div>
                    {#if pendingUsersCount > 0}
                        <span class="px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white font-bold animate-pulse">
                            {pendingUsersCount}
                        </span>
                    {/if}
                </a>

                <!-- Menu Admin: Pengajuan Anggota Keluarga -->
                <a 
                    href="/admin/keluarga"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/admin/keluarga') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        <span>Pengajuan Keluarga</span>
                    </div>
                    {#if pendingKkCount > 0}
                        <span class="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white font-bold animate-pulse">
                            {pendingKkCount}
                        </span>
                    {/if}
                </a>

                <!-- Menu Admin: Pengaturan KOP -->
                <a 
                    href="/admin/kop"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/admin/kop') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014-8.81c-2.28 1.093-4.746 1.875-7.31 2.31M19.175 3c-2.28 1.093-4.746 1.875-7.31 2.31m0 0a23.705 23.705 0 00-1.875-5.395" />
                        </svg>
                        <span>Pengaturan Surat</span>
                    </div>
                </a>
            {:else}
                <div class="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Layanan Warga
                </div>

                <!-- Menu Warga: Dashboard -->
                <a 
                    href="/dashboard"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        currentPath === '/dashboard' 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                        </svg>
                        <span>Dashboard</span>
                    </div>
                </a>

                <!-- Menu Warga: Ajukan Surat -->
                <a 
                    href="/dashboard/surat"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/dashboard/surat') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span>Permohonan Surat</span>
                    </div>
                </a>

                <!-- Menu Warga: Profile -->
                <a 
                    href="/dashboard/profile"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/dashboard/profile') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Pengaturan Profil</span>
                    </div>
                </a>

                <!-- Menu Warga: Keluarga -->
                <a 
                    href="/dashboard/keluarga"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/dashboard/keluarga') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span>Keluarga Saya</span>
                    </div>
                </a>
            {/if}

            <!-- Pembatas -->
            <div class="pt-4 pb-2">
                <div class="border-t border-slate-800"></div>
            </div>

            <div class="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Umum & Validasi
            </div>

            <!-- Cek Keaslian QR Code -->
            <a 
                href="/validasi"
                onclick={onCloseMobile}
                class={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    currentPath === '/validasi' 
                        ? 'bg-white/10 text-white border-l-4 border-blue-400' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
                <span>Validasi QR Code</span>
            </a>

            <!-- Beranda Publik -->
            <a 
                href="/"
                onclick={onCloseMobile}
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span>Beranda Publik</span>
            </a>
        </nav>
    </div>

    <!-- User Footer & Logout -->
    <div class="p-4 border-t border-slate-800/80 bg-slate-900/50">
        {#if user}
            <div class="flex items-center justify-between gap-3 mb-3">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : 'W'}
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-bold text-white truncate">{user.name}</p>
                        <p class="text-xs text-slate-400 font-mono truncate">NIK: {user.nik || '-'}</p>
                    </div>
                </div>
            </div>

            <button 
                type="button"
                onclick={onLogout}
                class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold border border-rose-500/20 transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Keluar dari Sistem</span>
            </button>
        {:else}
            <a 
                href={import.meta.env.VITE_PUBLIC_SSO_URL || 'http://localhost:5176/'}
                class="block w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
            >
                Masuk / Login
            </a>
        {/if}
    </div>
</aside>
