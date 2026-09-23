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
        
        // 1. Verifikasi token ke SSO Backend (jika server SSO hidup)
        const ssoApiUrl = import.meta.env.VITE_PUBLIC_SSO_API_URL || 'http://localhost:8001/api';
        try {
            const ssoCheck = await fetch(`${ssoApiUrl}/user`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (ssoCheck.status === 401) {
                // Pasti tidak valid / expired
                throw new Error('Token invalidated by SSO');
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
