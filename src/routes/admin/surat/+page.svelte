<script>
    import { onMount } from 'svelte';
    import { 
        getAdminLetterRequests, 
        approveLetterRequest, 
        rejectLetterRequest,
        getPdfDownloadUrl
    } from '$lib/api.js';
    import StatusBadge from '$lib/components/StatusBadge.svelte';
    import ModalDocument from '$lib/components/ModalDocument.svelte';

    let letterRequests = $state([]);
    let filterStatus = $state('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
    let loading = $state(true);

    // Rejection Modal State
    let isRejectModalOpen = $state(false);
    let selectedRequestForReject = $state(null);
    let rejectionReasonInput = $state('');

    // Preview PDF Modal State
    let isPreviewModalOpen = $state(false);
    let selectedPdfRequest = $state(null);

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        loading = true;
        try {
            const reqRes = await getAdminLetterRequests(filterStatus);
            if (reqRes?.status === 'success') letterRequests = reqRes.data;
        } catch (e) {
            console.error('Gagal memuat permohonan surat:', e);
        } finally {
            loading = false;
        }
    }

    async function handleFilterChange(status) {
        filterStatus = status;
        await loadData();
    }

    // Edit & Revision Modal State
    import { updateLetterRequestData } from '$lib/api.js';
    let isEditModalOpen = $state(false);
    let selectedRequestForEdit = $state(null);
    let editFormData = $state({});
    let isEditing = $state(false);

    function openEditModal(requestItem) {
        selectedRequestForEdit = requestItem;
        editFormData = { ...requestItem.form_data };
        isEditModalOpen = true;
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        if (!selectedRequestForEdit) return;
        isEditing = true;
        try {
            const res = await updateLetterRequestData(selectedRequestForEdit.id, editFormData);
            if (res.status === 'success') {
                // Setelah diupdate, setujui ulang agar QR dan PDF ter-generate
                await approveLetterRequest(selectedRequestForEdit.id);
                alert('Data berhasil diperbarui dan surat dikirim ke Warga untuk ditinjau ulang!');
                isEditModalOpen = false;
                await loadData();
            }
        } catch (e) {
            alert('Gagal memperbarui surat: ' + (e.response?.data?.message || e.message));
        } finally {
            isEditing = false;
        }
    }

    async function handleApproveLetter(requestId) {
        if (!confirm('Setujui permohonan dan teruskan ke Warga untuk peninjauan (Preview PDF)?')) return;
        try {
            const res = await approveLetterRequest(requestId);
            if (res.status === 'success') {
                alert('Surat berhasil dibuat dan diteruskan ke Warga!');
                await loadData();
            }
        } catch (e) {
            alert('Gagal menyetujui surat: ' + (e.response?.data?.message || e.message));
        }
    }

    function openRejectModal(requestItem) {
        selectedRequestForReject = requestItem;
        rejectionReasonInput = '';
        isRejectModalOpen = true;
    }

    async function handleRejectSubmit(e) {
        e.preventDefault();
        if (!selectedRequestForReject || !rejectionReasonInput.trim()) return;
        try {
            const res = await rejectLetterRequest(selectedRequestForReject.id, rejectionReasonInput.trim());
            if (res.status === 'success') {
                isRejectModalOpen = false;
                await loadData();
            }
        } catch (e) {
            alert('Gagal menolak surat: ' + (e.response?.data?.message || e.message));
        }
    }

    function openPreviewModal(req) {
        selectedPdfRequest = req;
        isPreviewModalOpen = true;
    }
</script>

<div class="space-y-6 animate-fadeIn">
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-slate-800">Permohonan Surat</h2>
            <p class="text-slate-500 text-sm mt-1">Kelola dan verifikasi permohonan surat warga</p>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 class="font-bold text-slate-900 text-base">Daftar Permohonan Surat Masuk</h2>
            
            <!-- Filter Status -->
            <div class="flex items-center gap-2">
                <button 
                    type="button"
                    onclick={() => handleFilterChange('pending')}
                    class={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    Menunggu & Revisi
                </button>
                <button 
                    type="button"
                    onclick={() => handleFilterChange('approved')}
                    class={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    Telah Terbit
                </button>
                <button 
                    type="button"
                    onclick={() => handleFilterChange('all')}
                    class={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    Semua
                </button>
            </div>
        </div>

        {#if loading}
            <div class="p-12 text-center text-slate-500">Memuat permohonan surat...</div>
        {:else if letterRequests.length === 0}
            <div class="p-12 text-center">
                <p class="text-slate-500 text-sm">Tidak ada permohonan surat untuk kategori status ini.</p>
            </div>
        {:else}
            <div class="divide-y divide-slate-100">
                {#each letterRequests as req}
                    <div class="p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div class="space-y-2 max-w-2xl">
                            <div class="flex items-center gap-3">
                                <span class="font-extrabold text-slate-900 text-lg">{req.template?.name || 'Surat'}</span>
                                <StatusBadge status={req.status} />
                                <span class="text-xs text-slate-400 font-mono">#{req.id}</span>
                            </div>

                            <div class="text-sm text-slate-600">
                                Pemohon: <strong class="text-slate-900">{req.user?.name}</strong> (NIK: <span class="font-mono text-slate-700">{req.user?.nik}</span>) | No. HP: {req.user?.phone || '-'}
                            </div>

                            <!-- Form Data Details -->
                            {#if req.form_data}
                                <div class="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {#each Object.entries(req.form_data) as [key, value]}
                                        {#if !['request_for', 'family_member_id', 'family_member_name', 'family_member_nik'].includes(key)}
                                            <div>
                                                <span class="text-slate-400 font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
                                                <strong class="text-slate-800">{value}</strong>
                                            </div>
                                        {/if}
                                    {/each}
                                </div>
                            {/if}

                            <div class="text-xs text-slate-400">
                                Diajukan pada: {new Date(req.created_at).toLocaleString('id-ID')}
                            </div>

                            {#if req.status === 'revision'}
                                <div class="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p class="text-xs font-bold text-orange-800 uppercase mb-1">Catatan Revisi dari Warga:</p>
                                    <p class="text-sm text-orange-900">{req.rejection_reason}</p>
                                </div>
                            {/if}
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center gap-2 flex-shrink-0">
                            {#if req.status === 'pending'}
                                <button 
                                    type="button"
                                    onclick={() => handleApproveLetter(req.id)}
                                    class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 hover-lift"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span>Setujui & Teruskan ke Warga</span>
                                </button>
                                <button 
                                    type="button"
                                    onclick={() => openRejectModal(req)}
                                    class="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all"
                                >
                                    Tolak
                                </button>
                            {:else if req.status === 'review'}
                                <span class="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                                    Dalam Peninjauan Warga
                                </span>
                            {:else if req.status === 'revision'}
                                <button 
                                    type="button"
                                    onclick={() => openEditModal(req)}
                                    class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                    <span>Perbaiki & Setujui Ulang</span>
                                </button>
                                <button 
                                    type="button"
                                    onclick={() => openRejectModal(req)}
                                    class="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all"
                                >
                                    Tolak
                                </button>
                            {:else if req.status === 'approved'}
                                <button 
                                    type="button"
                                    onclick={() => openPreviewModal(req)}
                                    class="px-4 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Preview & Unduh PDF</span>
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Modal Tolak Permohonan Surat -->
{#if isRejectModalOpen && selectedRequestForReject}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={(e) => { if (e.target === e.currentTarget) isRejectModalOpen = false; }}
        onkeydown={(e) => e.key === 'Escape' && (isRejectModalOpen = false)}
        role="button"
        tabindex="0"
        aria-label="Tutup modal tolak permohonan"
    >
        <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div class="bg-rose-600 px-6 py-4 text-white">
                <h3 class="font-bold text-lg">Tolak Permohonan Surat</h3>
                <p class="text-xs text-rose-100">Pemohon: {selectedRequestForReject.user?.name}</p>
            </div>

            <form onsubmit={handleRejectSubmit} class="p-6 space-y-4">
                <div>
                    <label for="rejection_reason" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Alasan Penolakan (Wajib Diisi)
                    </label>
                    <textarea 
                        id="rejection_reason"
                        bind:value={rejectionReasonInput}
                        rows="3"
                        placeholder="Contoh: Alamat domisili pada KTP tidak sesuai / lampiran belum lengkap."
                        class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                        required
                    ></textarea>
                </div>

                <div class="pt-2 flex justify-end gap-3">
                    <button 
                        type="button"
                        onclick={() => isRejectModalOpen = false}
                        class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit"
                        class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                    >
                        Konfirmasi Penolakan
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Modal Edit Data & Setujui Ulang (Untuk Revisi) -->
{#if isEditModalOpen && selectedRequestForEdit}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        onclick={(e) => { if (e.target === e.currentTarget) isEditModalOpen = false; }}
        onkeydown={(e) => e.key === 'Escape' && (isEditModalOpen = false)}
        role="button"
        tabindex="0"
        aria-label="Tutup modal edit data"
    >
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div class="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-white flex-shrink-0">
                <h3 class="font-bold text-lg">Perbaiki Data Surat (Revisi)</h3>
                <p class="text-xs text-orange-100">Pemohon: {selectedRequestForEdit.user?.name}</p>
            </div>
            
            <div class="bg-amber-50 p-4 border-b border-amber-200 flex-shrink-0">
                <p class="text-xs font-bold text-amber-800 uppercase mb-1">Catatan Revisi dari Warga:</p>
                <p class="text-sm text-amber-900 bg-white p-3 rounded-xl border border-amber-100">{selectedRequestForEdit.rejection_reason}</p>
            </div>

            <div class="overflow-y-auto flex-1 p-6">
                <form id="editForm" onsubmit={handleEditSubmit} class="space-y-4">
                    <p class="text-sm text-slate-600 mb-4">Silakan perbaiki isian form di bawah ini sesuai catatan warga, lalu klik Setujui Ulang.</p>
                    
                    {#each Object.entries(editFormData) as [key, value]}
                        {#if !['request_for', 'family_member_id', 'family_member_name', 'family_member_nik'].includes(key)}
                            <div>
                                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    {key.replace(/_/g, ' ')}
                                </label>
                                <input 
                                    type="text"
                                    bind:value={editFormData[key]}
                                    class="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] text-sm"
                                />
                            </div>
                        {/if}
                    {/each}
                </form>
            </div>

            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
                <button type="button" onclick={() => isEditModalOpen = false} class="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition-colors">Batal</button>
                <button type="submit" form="editForm" disabled={isEditing} class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-sm transition-colors disabled:opacity-50">
                    {isEditing ? 'Menyimpan...' : 'Perbaiki & Setujui Ulang'}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Preview PDF Modal -->
{#if selectedPdfRequest}
    <ModalDocument 
        isOpen={isPreviewModalOpen} 
        onClose={() => { isPreviewModalOpen = false; selectedPdfRequest = null; }} 
        documentUrl={getPdfDownloadUrl(selectedPdfRequest.id)} 
        userName={selectedPdfRequest.user?.name} 
        documentName={selectedPdfRequest.template?.name + ' (PDF)'}
    >
        <div class="flex justify-center mt-4">
            <a 
                href={getPdfDownloadUrl(selectedPdfRequest.id)}
                download
                target="_blank"
                class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Unduh Surat PDF
            </a>
        </div>
    </ModalDocument>
{/if}
