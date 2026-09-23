<script>
    import './layout.css';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { userStore, fetchAuthUser, isLoadingAuth } from '$lib/stores/auth.js';
    import Navbar from '$lib/components/Navbar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import HeaderBar from '$lib/components/HeaderBar.svelte';

    let { children } = $props();

    let user = $state(null);
    let loadingAuth = $state(true);
    let isMobileOpen = $state(false);

    userStore.subscribe((val) => {
        user = val;
    });

    isLoadingAuth.subscribe((val) => {
        loadingAuth = val;
    });

    let isSidebarLayout = $derived(
        $page.url.pathname.startsWith('/admin') ||
        $page.url.pathname.startsWith('/dashboard')
    );

    $effect(() => {
        // Redirect to SSO if user is null and accessing protected routes
        if (!loadingAuth && !user && isSidebarLayout) {
            window.location.href = import.meta.env.VITE_PUBLIC_SSO_URL || 'http://localhost:5176/';
        }
    });

    onMount(() => {
        fetchAuthUser();
    });

    function handleLogoutCallback() {
        userStore.set(null);
        window.location.href = import.meta.env.VITE_PUBLIC_SSO_URL || 'http://localhost:5176/';
    }
</script>

{#if isSidebarLayout}
    <!-- Web Admin Layout (dengan Sidebar & HeaderBar) -->
    <div class="min-h-screen bg-slate-100 flex">
        <Sidebar 
            {user} 
            onLogout={handleLogoutCallback} 
            {isMobileOpen} 
            onCloseMobile={() => isMobileOpen = false} 
        />
        <div class="flex-1 flex flex-col min-h-screen lg:pl-72 w-full overflow-x-hidden">
            <HeaderBar 
                {user} 
                onLogout={handleLogoutCallback} 
                onOpenMobile={() => isMobileOpen = true} 
            />
            <main class="flex-1 p-4 sm:p-6 lg:p-8 animate-fadeIn">
                {@render children()}
            </main>
        </div>
    </div>
{:else}
    <!-- Publik Layout (dengan Navbar & Footer) -->
    <div class="min-h-screen flex flex-col bg-slate-50">
        <Navbar {user} onLogout={handleLogoutCallback} />
        <main class="flex-1 flex flex-col">
            {@render children()}
        </main>
        <Footer />
    </div>
{/if}
