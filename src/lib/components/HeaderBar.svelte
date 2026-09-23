<script>
    import { page } from '$app/stores';

    let { 
        user = null, 
        onLogout = () => {}, 
        onOpenMobile = () => {} 
    } = $props();

    let currentPath = $derived($page.url.pathname);
    let isAdmin = $derived(
        currentPath.startsWith('/admin') ||
        user?.roles?.some(r => r.name === 'admin_surat') || 
        user?.roles?.some(r => r.name === 'Super Admin') || 
        user?.roles?.some(r => r.name === 'Admin')
    );
</script>

<header class="h-20 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-4">
        <!-- Tombol Hamburger Mobile -->
        <button 
            type="button"
            onclick={onOpenMobile}
            class="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Buka Menu Sidebar"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>

        <!-- Judul Halaman -->
        <div>
            <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                    {isAdmin ? 'Panel Admin' : 'Layanan Warga'}
                </span>
                <span class="text-slate-300">/</span>
                <span class="text-xs font-semibold text-slate-500">
                    {currentPath.startsWith('/admin') ? 'Manajemen Surat & Verifikasi' : 'Pengajuan & Riwayat Surat'}
                </span>
            </div>
            <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {currentPath.startsWith('/admin') ? 'Dasbor Manajemen E-Surat' : 'Dasbor Warga Desa Mengeruda'}
            </h1>
        </div>
    </div>

    <!-- Sebelah Kanan Header -->
    <div class="flex items-center gap-4">
        <!-- Status Sistem Online -->
        <div class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Pelayanan Digital Online</span>
        </div>

        <!-- User Info Quick view -->
        {#if user}
            <div class="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div class="hidden md:block text-right">
                    <p class="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                    <p class="text-[11px] text-slate-500 mt-1">{isAdmin ? 'Admin Desa' : `NIK: ${user.nik || '-'}`}</p>
                </div>
                <button 
                    type="button"
                    onclick={onLogout}
                    class="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all"
                    title="Keluar dari Sistem"
                    aria-label="Keluar dari Sistem"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                </button>
            </div>
        {/if}
    </div>
</header>
