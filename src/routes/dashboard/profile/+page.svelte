<script>
    import { onMount } from 'svelte';
    import { updateProfile } from '$lib/api.js';
    import { userStore } from '$lib/stores/auth.js';

    let user = $state(null);
    let isSubmitting = $state(false);

    // Profile Form State
    let profileForm = $state({ name: '', phone: '' });
    let profileMsg = $state(null);
    let profileError = $state(null);

    userStore.subscribe((val) => {
        user = val;
        if (user && !profileForm.name) {
            profileForm.name = user.name || '';
            profileForm.phone = user.phone || '';
        }
    });

    async function handleUpdateProfile(e) {
        e.preventDefault();
        isSubmitting = true;
        profileMsg = null;
        profileError = null;
        try {
            const res = await updateProfile(profileForm);
            if (res.status === 'success') {
                profileMsg = 'Profil berhasil diperbarui.';
                if (user) {
                    user.name = profileForm.name;
                    user.phone = profileForm.phone;
                    userStore.set(user);
                }
            }
        } catch (e) {
            profileError = e.response?.data?.message || 'Gagal memperbarui profil.';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="space-y-6 animate-fadeIn">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-slate-800">Pengaturan Profil</h2>
            <p class="text-slate-500 text-sm mt-1">Perbarui data informasi akun Anda</p>
        </div>
    </div>

    <!-- Update Profile Form -->
    <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 class="font-bold text-slate-900 text-base">Data Profil</h2>
        </div>
        <div class="p-6">
            <form onsubmit={handleUpdateProfile} class="space-y-4 max-w-lg">
                {#if profileMsg}<div class="p-3 bg-emerald-50 text-emerald-800 text-sm rounded-xl">{profileMsg}</div>{/if}
                {#if profileError}<div class="p-3 bg-rose-50 text-rose-800 text-sm rounded-xl">{profileError}</div>{/if}

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                    <input type="text" bind:value={profileForm.name} required class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-shadow" />
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon</label>
                    <input type="text" bind:value={profileForm.phone} required class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-shadow" />
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" value={user?.email || ''} disabled class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">NIK</label>
                    <input type="text" value={user?.nik || ''} disabled class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                </div>

                <div class="pt-4">
                    <button type="submit" disabled={isSubmitting} class="px-8 py-3 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 shadow-md shadow-blue-500/20">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
