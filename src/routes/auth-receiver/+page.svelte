<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import api from '$lib/api';

    onMount(async () => {
        // Ambil token dari URL query parameter ?token=...
        const token = $page.url.searchParams.get('token');
        
        if (token) {
            // Simpan ke localStorage
            localStorage.setItem('sso_token', token);
            
            try {
                // Fetch user data from backend using the new token to store locally
                const response = await api.get('/auth/me');
                if (response.data) {
                    const userData = response.data.data || response.data;
                    localStorage.setItem('sso_user', JSON.stringify(userData));
                    
                    // Cek role untuk menentukan rute
                    let roles = [];
                    if (userData.roles && Array.isArray(userData.roles)) {
                        roles = userData.roles.map(r => r.name || r);
                    }
                    
                    if (roles.includes('Super Admin') || roles.includes('admin_surat')) {
                        goto('/admin');
                    } else {
                        goto('/dashboard');
                    }
                    return; // Berhenti agar tidak ter-override
                }
            } catch (err) {
                console.error('Failed to verify token on receiver', err);
            }
            
            // Redirect default jika gagal fetch role tapi token ada (fallback aman)
            goto('/dashboard');
        } else {
            // Jika tidak ada token, kembali ke halaman utama
            goto('/');
        }
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
        <svg class="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600 font-medium animate-pulse">Mengautentikasi sesi Anda...</p>
    </div>
</div>
