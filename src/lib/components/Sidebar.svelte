<script>
    import { page } from '$app/stores';

    let { 
        user = null, 
        onLogout = () => {}, 
        isMobileOpen = false, 
        onCloseMobile = () => {},
        pendingUsersCount = 0,
        pendingLettersCount = 0
    } = $props();

    let currentPath = $derived($page.url.pathname);
    let currentTab = $derived($page.url.searchParams.get('tab'));

    let isAdmin = $derived(
        currentPath.startsWith('/admin') ||
        user?.roles?.some(r => r.name === 'admin_surat') || 
        user?.roles?.some(r => r.name === 'Super Admin') || 
        user?.roles?.includes('Admin')
    );

    function isItemActive(href, tabParam) {
        if (tabParam) {
            return currentPath.startsWith(href) && (currentTab === tabParam || (!currentTab && tabParam === (isAdmin ? 'permohonan' : 'ajukan')));
        }
        return currentPath === href && !currentTab;
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

                <!-- Menu Admin: Permohonan Surat -->
                <a 
                    href="/admin?tab=permohonan"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/admin', 'permohonan') 
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

                <!-- Menu Admin: Verifikasi Akun Warga -->
                <a 
                    href="/admin?tab=warga"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/admin', 'warga') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span>Verifikasi Akun Warga</span>
                    </div>
                    {#if pendingUsersCount > 0}
                        <span class="px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white font-bold animate-pulse">
                            {pendingUsersCount}
                        </span>
                    {/if}
                </a>
            {:else}
                <div class="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Layanan Warga
                </div>

                <!-- Menu Warga: Ajukan Surat -->
                <a 
                    href="/dashboard?tab=ajukan"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/dashboard', 'ajukan') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Ajukan Surat Baru</span>
                    </div>
                </a>

                <!-- Menu Warga: Riwayat Surat Saya -->
                <a 
                    href="/dashboard?tab=riwayat"
                    onclick={onCloseMobile}
                    class={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                        isItemActive('/dashboard', 'riwayat') 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <div class="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span>Riwayat Surat Saya</span>
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
