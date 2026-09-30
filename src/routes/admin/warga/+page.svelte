<script>
    import { onMount } from 'svelte';
    import {
        getAllUsers, 
        approveUser, 
        getKtpUrl
    } from '$lib/api.js';
    import StatusBadge from '$lib/components/StatusBadge.svelte';
    import ModalDocument from '$lib/components/ModalDocument.svelte';

    let allUsers = $state([]);
    let loading = $state(true);

    // Document Modal State
    let isModalOpen = $state(false);
    let currentDocumentUrl = $state(null);
    let currentDocumentUser = $state('');
    let currentDocumentName = $state('Dokumen');

    let pendingUsers = $derived(allUsers.filter(u => !u.is_approved));

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        loading = true;
        try {
            const allRes = await getAllUsers();
            if (allRes?.status === 'success') allUsers = allRes.data;
        } catch (e) {
            console.error('Gagal memuat data warga:', e);
        } finally {
            loading = false;
        }
    }

    async function handleApproveUser(id) {
        if (!confirm('Setujui warga ini?')) return;
        try {
            const res = await approveUser(id);
            if (res.status === 'success') {
                alert('Warga berhasil disetujui');
                await loadData();
            }
        } catch (e) {
            alert('Gagal menyetujui warga');
        }
    }


    function openDocumentViewer(url, u, name) {
        currentDocumentUrl = url;
        currentDocumentUser = `${u.name} (NIK: ${u.nik})`;
        currentDocumentName = name;
        isModalOpen = true;
    }
</script>

<div class="space-y-6 animate-fadeIn">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-slate-800">Verifikasi Akun Warga</h2>
            <p class="text-slate-500 text-sm mt-1">Kelola pendaftaran dan dokumen kependudukan warga desa</p>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
                <h2 class="font-bold text-slate-900 text-base">Daftar Akun & Dokumen Warga</h2>
            </div>
            <span class="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {pendingUsers.length} Menunggu Verifikasi
            </span>
        </div>

        {#if loading}
            <div class="p-12 text-center text-slate-500">Memuat data warga...</div>
        {:else if allUsers.length === 0}
            <div class="p-12 text-center text-slate-500">Belum ada warga yang mendaftar.</div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                            <th class="py-3.5 px-6">NIK</th>
                            <th class="py-3.5 px-6">Nama Lengkap</th>
                            <th class="py-3.5 px-6">Kontak</th>
                            <th class="py-3.5 px-6">Status Akun</th>
                            <th class="py-3.5 px-6">Dokumen (KTP & KK)</th>
                            <th class="py-3.5 px-6 text-right">Aksi Verifikasi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm">
                        {#each allUsers as u}
                            <tr class="hover:bg-slate-50/60 transition-colors">
                                <td class="py-4 px-6 font-mono font-semibold text-slate-800">{u.nik}</td>
                                <td class="py-4 px-6 font-bold text-slate-900">{u.name}</td>
                                <td class="py-4 px-6 text-xs text-slate-600">
                                    <div>{u.email}</div>
                                    <div class="text-slate-400">{u.phone}</div>
                                </td>
                                <td class="py-4 px-6 space-y-1">
                                    {#if u.is_approved}
                                        <StatusBadge status="approved" label="Akun Aktif" />
                                    {:else}
                                        <StatusBadge status="pending" label="Menunggu Verifikasi" />
                                    {/if}
                                </td>
                                <td class="py-4 px-6 flex flex-col gap-2">
                                    <button 
                                        type="button"
                                        onclick={() => openDocumentViewer(getKtpUrl(u.id), u, 'KTP')}
                                        class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Lihat KTP</span>
                                    </button>
                                </td>
                                <td class="py-4 px-6 text-right space-y-2">
                                    {#if !u.is_approved}
                                        <button 
                                            type="button"
                                            onclick={() => handleApproveUser(u.id)}
                                            class="block w-full px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all hover-lift"
                                        >
                                            Setujui Akun
                                        </button>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>

<!-- Modal Document Viewer -->
<ModalDocument 
    isOpen={isModalOpen} 
    documentUrl={currentDocumentUrl} 
    userName={currentDocumentUser} 
    documentName={currentDocumentName}
    onClose={() => isModalOpen = false} 
/>
