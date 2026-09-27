import { writable } from 'svelte/store';
import { getCurrentUser } from '$lib/api.js';

export const userStore = writable(null);
export const isLoadingAuth = writable(true);

export async function fetchAuthUser() {
    isLoadingAuth.set(true);
    try {
        const token = localStorage.getItem('sso_token');
        if (!token) {
            throw new Error('No token');
        }
        
        // 1. Verifikasi & Refresh token ke SSO Backend (jika server SSO hidup)
        const ssoApiUrl = import.meta.env.VITE_PUBLIC_SSO_API_URL || 'http://localhost:8001/api';
        try {
            const ssoCheck = await fetch(`${ssoApiUrl}/refresh`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (ssoCheck.ok) {
                const data = await ssoCheck.json();
                if (data.access_token) {
                    localStorage.setItem('sso_token', data.access_token);
                }
                if (data.user) {
                    localStorage.setItem('sso_user', JSON.stringify(data.user));
                }
            } else {
                const errData = await ssoCheck.json().catch(() => ({}));
                if (ssoCheck.status === 401 || (errData.exception && errData.exception.includes('JWTAuth'))) {
                    // Pasti tidak valid / expired / blacklisted
                    throw new Error('Token invalidated by SSO');
                }
                // Jika error lain (misal 500 karena DB SSO mati), biarkan jatuh ke getCurrentUser() sebagai toleransi.
            }
        } catch (fetchError) {
            // Jika Network Error (CORS, server mati, salah port), JANGAN paksa logout
            // Hanya throw jika benar-benar Error 'Token invalidated by SSO'
            if (fetchError.message === 'Token invalidated by SSO') {
                throw fetchError;
            } else {
                console.warn('SSO Backend tidak bisa dihubungi untuk verifikasi:', fetchError);
            }
        }

        // 2. Jika valid atau SSO tidak bisa dihubungi (toleransi), ambil data dari e-surat backend
        const res = await getCurrentUser();
        if (res?.status === 'success' && res.data) {
            userStore.set(res.data);
            return res.data;
        } else {
            throw new Error('Gagal mengambil data user dari e-surat backend');
        }
    } catch (e) {
        console.error('Logout Triggered:', e.message);
        localStorage.removeItem('sso_token');
        localStorage.removeItem('sso_user');
        userStore.set(null);
    } finally {
        isLoadingAuth.set(false);
    }
    return null;
}
