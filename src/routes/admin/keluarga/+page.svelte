<script>
    import { onMount } from 'svelte';
    import {
        getAllUsers, 
        approveKk,
        rejectKk,
        getKkUrl
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
    let currentUserObj = $state(null);

    let usersWithKk = $derived(allUsers.filter(u => u.kk_path));
    let pendingKkCount = $derived(usersWithKk.filter(u => !u.is_kk_approved).length);

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



    async function handleApproveKk(id) {
        if (!confirm('Setujui dokumen KK warga ini?')) return;
        try {
            const res = await approveKk(id);
            if (res.status === 'success') {
                alert('Dokumen KK berhasil disetujui');
                await loadData();
            }
        } catch (e) {
            alert('Gagal menyetujui dokumen KK');
        }
    }

    async function handleRejectKk(id) {
        if (!confirm('Tolak dan hapus dokumen KK warga ini beserta data anggota keluarganya?')) return;
        try {
            const res = await rejectKk(id);
            if (res.status === 'success') {
                alert('Dokumen KK berhasil ditolak dan dihapus');
                await loadData();
            }
        } catch (e) {
            alert('Gagal menolak dokumen KK');
        }
    }

    function openDocumentViewer(url, u, name) {
        currentDocumentUrl = url;
        currentDocumentUser = `${u.name} (NIK: ${u.nik})`;
        currentDocumentName = name;
        currentUserObj = u;
        isModalOpen = true;
    }
</script>

<div class="space-y-6 animate-fadeIn">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-slate-800">Pengajuan Anggota Keluarga</h2>
            <p class="text-slate-500 text-sm mt-1">Kelola dokumen KK dan penambahan anggota keluarga warga</p>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
                <h2 class="font-bold text-slate-900 text-base">Daftar Pengajuan KK & Anggota Keluarga</h2>
            </div>
            <span class="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {pendingKkCount} Menunggu Verifikasi
            </span>
        </div>

        {#if loading}
            <div class="p-12 text-center text-slate-500">Memuat data warga...</div>
        {:else if usersWithKk.length === 0}
            <div class="p-12 text-center text-slate-500">Belum ada warga yang mengunggah KK.</div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                            <th class="py-3.5 px-6">Warga (Kepala Keluarga)</th>
                            <th class="py-3.5 px-6">Status KK</th>
                            <th class="py-3.5 px-6">Anggota Keluarga Diajukan</th>
                            <th class="py-3.5 px-6">Dokumen KK</th>
                            <th class="py-3.5 px-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm">
                        {#each usersWithKk as u}
                            <tr class="hover:bg-slate-50/60 transition-colors">
                                <td class="py-4 px-6">
                                    <div class="font-bold text-slate-900">{u.name}</div>
                                    <div class="font-mono text-xs text-slate-500">{u.nik}</div>
                                    <div class="text-xs text-slate-400 mt-1">{u.email}</div>
                                </td>
                                <td class="py-4 px-6">
                                    {#if u.is_kk_approved}
                                        <StatusBadge status="approved" label="KK Disetujui" />
                                    {:else}
                                        <StatusBadge status="pending" label="Menunggu Verifikasi" />
                                    {/if}
                                </td>
                                <td class="py-4 px-6">
                                    {#if u.family_members && u.family_members.length > 0}
                                        <ul class="list-disc pl-4 space-y-1 text-xs text-slate-600">
                                            {#each u.family_members as fm}
                                                <li><span class="font-bold">{fm.name}</span> ({fm.relationship})</li>
                                            {/each}
                                        </ul>
                                    {:else}
                                        <span class="text-xs text-slate-400 italic">Tidak ada anggota</span>
                                    {/if}
                                </td>
                                <td class="py-4 px-6 flex flex-col gap-2">

                                    
                                    {#if u.kk_path}
                                        <button 
                                            type="button"
                                            onclick={() => openDocumentViewer(getKkUrl(u.id), u, 'Kartu Keluarga')}
                                            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Lihat KK</span>
                                        </button>
                                    {/if}
                                </td>
                                <td class="py-4 px-6 text-right space-y-2">

                                    {#if u.kk_path && !u.is_kk_approved}
                                        <div class="flex gap-2">
                                            <button 
                                                type="button"
                                                onclick={() => handleApproveKk(u.id)}
                                                class="flex-1 px-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all hover-lift"
                                            >
                                                Setujui KK
                                            </button>
                                            <button 
                                                type="button"
                                                onclick={() => handleRejectKk(u.id)}
                                                class="flex-1 px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all hover-lift"
                                            >
                                                Tolak KK
                                            </button>
                                        </div>
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
    onClose={() => { isModalOpen = false; currentUserObj = null; }} 
>
    {#if currentUserObj && currentUserObj.family_members && currentUserObj.family_members.length > 0}
        <div class="mt-4 border-t border-slate-200 pt-4">
            <h4 class="font-bold text-slate-800 mb-3 text-sm">Daftar Anggota Keluarga yang Diajukan</h4>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-sm">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                            <th class="py-2 px-4">Nama Lengkap</th>
                            <th class="py-2 px-4">NIK</th>
                            <th class="py-2 px-4">Hubungan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        {#each currentUserObj.family_members as fm}
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="py-2 px-4 font-bold text-slate-800">{fm.name}</td>
                                <td class="py-2 px-4 font-mono text-slate-600">{fm.nik}</td>
                                <td class="py-2 px-4 text-slate-600">{fm.relationship}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</ModalDocument>
