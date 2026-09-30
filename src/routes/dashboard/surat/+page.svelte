<script>
    import { onMount } from 'svelte';
    import { getTemplates, getMyRequests, submitLetterRequest, getFamilyMembers, getPdfDownloadUrl } from '$lib/api.js';
    import { userStore } from '$lib/stores/auth.js';
    import StatusBadge from '$lib/components/StatusBadge.svelte';
    import ModalDocument from '$lib/components/ModalDocument.svelte';
    import { page } from '$app/stores';

    let user = $state(null);
    let templates = $state([]);
    let myRequests = $state([]);
    let familyMembers = $state([]);
    let loading = $state(true);
    let isSubmitting = $state(false);
    
    // Preview PDF Modal State
    let isPreviewModalOpen = $state(false);
    let selectedPdfRequest = $state(null);
    
    // Internal tabs: 'ajukan' or 'riwayat'
    let activeTab = $state('ajukan'); 

    $effect(() => {
        const urlTab = $page.url.searchParams.get('tab');
        if (urlTab === 'ajukan' || urlTab === 'riwayat') {
            activeTab = urlTab;
        }
    });

    userStore.subscribe((val) => {
        user = val;
    });

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        loading = true;
        try {
            const [tempRes, reqRes, famRes] = await Promise.all([
                getTemplates(),
                getMyRequests(),
                getFamilyMembers().catch(() => ({ status: 'error', data: [] }))
            ]);
            if (tempRes?.status === 'success') templates = tempRes.data;
            if (reqRes?.status === 'success') myRequests = reqRes.data;
            if (famRes?.status === 'success') familyMembers = famRes.data;
        } catch (e) {
            console.error('Gagal memuat data surat:', e);
        } finally {
            loading = false;
        }
    }

    // Modal & Form State
    let isModalOpen = $state(false);
    let selectedTemplate = $state(null);
    let formData = $state({});
    let errorMsg = $state(null);
    let successMsg = $state(null);

    function openNewRequestModal(template) {
        selectedTemplate = template;
        formData = { request_for: 'self' };
        errorMsg = null;
        successMsg = null;
        isModalOpen = true;
    }

    async function handleSubmitRequest(e) {
        e.preventDefault();
        if (!selectedTemplate) return;

        isSubmitting = true;
        errorMsg = null;
        successMsg = null;

        try {
            let finalFormData = { ...formData };
            if (formData.request_for !== 'self') {
                const fam = familyMembers.find(f => f.id == formData.request_for);
                if (fam) {
                    finalFormData.family_member_id = fam.id;
                    finalFormData.family_member_name = fam.name;
                    finalFormData.family_member_nik = fam.nik;
                }
            }
            
            const res = await submitLetterRequest(selectedTemplate.id, finalFormData);
            if (res.status === 'success') {
                successMsg = 'Permohonan surat berhasil diajukan!';
                await loadData();
                setTimeout(() => {
                    isModalOpen = false;
                    activeTab = 'riwayat';
                }, 1500);
            }
        } catch (e) {
            errorMsg = e.response?.data?.message || 'Gagal mengajukan surat.';
        } finally {
            isSubmitting = false;
        }
    }

    // Review Modal State
    import { acceptLetter, requestRevision } from '$lib/api.js';
    let isReviewModalOpen = $state(false);
    let selectedRequestForReview = $state(null);
    let isRevisionMode = $state(false);
    let revisionReason = $state('');
    let isReviewSubmitting = $state(false);

    function openReviewModal(req) {
        selectedRequestForReview = req;
        isRevisionMode = false;
        revisionReason = '';
        isReviewModalOpen = true;
    }

    async function handleAcceptLetter() {
        if (!selectedRequestForReview) return;
        isReviewSubmitting = true;
        try {
            const res = await acceptLetter(selectedRequestForReview.id);
            if (res.status === 'success') {
                alert('Surat berhasil diterima dan difinalisasi.');
                isReviewModalOpen = false;
                await loadData();
            }
        } catch (e) {
            alert('Gagal menerima surat: ' + (e.response?.data?.message || e.message));
        } finally {
            isReviewSubmitting = false;
        }
    }

    async function handleRequestRevision(e) {
        e.preventDefault();
        if (!selectedRequestForReview || !revisionReason.trim()) return;
        isReviewSubmitting = true;
        try {
            const res = await requestRevision(selectedRequestForReview.id, revisionReason);
            if (res.status === 'success') {
                alert('Permintaan revisi berhasil dikirim ke Admin.');
                isReviewModalOpen = false;
                await loadData();
            }
        } catch (e) {
            alert('Gagal mengirim permintaan revisi: ' + (e.response?.data?.message || e.message));
        } finally {
            isReviewSubmitting = false;
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
            <p class="text-slate-500 text-sm mt-1">Ajukan permohonan surat baru dan pantau status surat Anda</p>
        </div>
    </div>

    <!-- Banner Verifikasi Akun -->
    {#if user && !user.is_approved}
        <div class="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4 shadow-xs animate-fadeIn">
            <div class="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
            <div>
                <h3 class="font-bold text-base mb-1">Akun Dalam Proses Verifikasi Admin</h3>
                <p class="text-sm text-amber-800/90 leading-relaxed">
                    Pendaftaran akun E-Surat Anda sedang ditinjau dan dicocokkan dengan dokumen KTP yang Anda unggah. Anda baru dapat mengajukan permohonan surat setelah akun disetujui.
                </p>
            </div>
        </div>
    {/if}

    <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <div class="flex items-center gap-2">
            <button 
                type="button"
                onclick={() => activeTab = 'ajukan'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'ajukan' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Ajukan Surat & Layanan</span>
            </button>
            <button 
                type="button"
                onclick={() => activeTab = 'riwayat'}
                class={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeTab === 'riwayat' 
                        ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
            >
                <span>Riwayat Surat Saya</span>
                <span class="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 font-semibold">{myRequests.length}</span>
            </button>
        </div>
    </div>

    {#if activeTab === 'ajukan'}
        <div class="animate-fadeIn">
            <h2 class="text-base font-bold text-slate-900 mb-4">Pilih Jenis Layanan Surat Resmi</h2>
            {#if loading}
                <div class="p-12 text-center text-slate-500">Memuat template surat...</div>
            {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {#each templates as t}
                        <div 
                            onclick={() => { if (user?.is_approved) openNewRequestModal(t); }}
                            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && user?.is_approved && openNewRequestModal(t)}
                            role="button"
                            tabindex="0"
                            class={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 flex flex-col justify-between ${
                                user?.is_approved 
                                    ? 'cursor-pointer hover:border-[#1e3a8a] hover:shadow-lg hover:-translate-y-1' 
                                    : 'opacity-60 cursor-not-allowed'
                            }`}
                        >
                            <div>
                                <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">Surat Resmi</span>
                                <h3 class="font-extrabold text-slate-900 text-lg mb-2">{t.name}</h3>
                                <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">{t.description}</p>
                            </div>

                            <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1e3a8a]">
                                <span>Ajukan Sekarang</span>
                                <span class="text-sm">&rarr;</span>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {:else}
        <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden animate-fadeIn">
            <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 class="font-bold text-slate-900 text-base">Riwayat Permohonan Surat Saya</h2>
            </div>
            {#if loading}
                <div class="p-12 text-center text-slate-500">Memuat riwayat surat...</div>
            {:else if myRequests.length === 0}
                <div class="p-12 text-center">
                    <p class="text-slate-500 text-sm mb-4">Belum ada riwayat pengajuan surat.</p>
                </div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                                <th class="py-3.5 px-6">Tanggal</th>
                                <th class="py-3.5 px-6">Jenis Surat</th>
                                <th class="py-3.5 px-6">Status</th>
                                <th class="py-3.5 px-6">Keterangan</th>
                                <th class="py-3.5 px-6 text-right">Unduh</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            {#each myRequests as req}
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                    <td class="py-4 px-6 text-slate-600">
                                        {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td class="py-4 px-6 font-bold text-slate-900">
                                        {req.template?.name || 'Surat'}
                                    </td>
                                    <td class="py-4 px-6">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td class="py-4 px-6 text-slate-500 text-xs max-w-xs truncate">
                                        {req.rejection_reason || (req.status === 'approved' ? 'Telah diterbitkan' : 'Dalam peninjauan')}
                                    </td>
                                    <td class="py-4 px-6 text-right">
                                        {#if req.status === 'approved'}
                                            <button 
                                                type="button"
                                                onclick={() => openPreviewModal(req)}
                                                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold text-xs shadow-sm"
                                            >
                                                Preview & Unduh PDF
                                            </button>
                                        {:else if req.status === 'review'}
                                            <button 
                                                type="button"
                                                onclick={() => openReviewModal(req)}
                                                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-sm"
                                            >
                                                Tinjau Surat
                                            </button>
                                        {:else}
                                            <span class="text-xs text-slate-400 italic">-</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    {/if}
</div>

{#if isModalOpen && selectedTemplate}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
        <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div class="bg-[#1e3a8a] px-6 py-4 text-white flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-lg">Formulir {selectedTemplate.name}</h3>
                </div>
                <button onclick={() => isModalOpen = false} class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white">&times;</button>
            </div>

            <form onsubmit={handleSubmitRequest} class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {#if errorMsg}<div class="p-3 bg-rose-50 text-rose-800 text-sm rounded-xl">{errorMsg}</div>{/if}
                {#if successMsg}<div class="p-3 bg-emerald-50 text-emerald-800 text-sm font-bold rounded-xl">{successMsg}</div>{/if}

                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Surat Ini Ditujukan Untuk Siapa? *
                    </label>
                    <select bind:value={formData.request_for} class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm">
                        <option value="self">Diri Sendiri ({user?.name})</option>
                        {#each familyMembers as fam}
                            <option value={fam.id}>Anggota Keluarga: {fam.name} ({fam.relationship})</option>
                        {/each}
                    </select>
                </div>

                {#if selectedTemplate.required_fields && selectedTemplate.required_fields.length > 0}
                    {#each selectedTemplate.required_fields as field}
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                {field.label} {field.required ? '*' : ''}
                            </label>
                            <input 
                                type={field.type || 'text'}
                                bind:value={formData[field.name]}
                                placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                                required={field.required}
                            />
                        </div>
                    {/each}
                {:else}
                    <p class="text-sm text-slate-600">Tidak ada isian tambahan yang diperlukan. Klik Kirim.</p>
                {/if}

                <div class="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button type="button" onclick={() => isModalOpen = false} class="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-sm">Batal</button>
                    <button type="submit" disabled={isSubmitting || !!successMsg} class="px-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white font-bold text-sm disabled:opacity-50">Kirim Permohonan</button>
                </div>
            </form>
        </div>
    </div>
{/if}

{#if isReviewModalOpen && selectedRequestForReview}
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
            <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 class="text-xl font-bold text-slate-800">Tinjau Surat: {selectedRequestForReview.template?.name}</h3>
                <button onclick={() => isReviewModalOpen = false} class="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="flex-1 p-6 overflow-y-auto bg-slate-100/50 flex flex-col items-center">
                <p class="text-slate-600 mb-4 text-center font-medium">Silakan tinjau draf surat di bawah ini. Jika ada kesalahan data (misal: nama, alamat, keperluan), silakan minta revisi ke Admin.</p>
                <div class="w-full bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden" style="height: 60vh;">
                    <iframe src={getPdfDownloadUrl(selectedRequestForReview.id)} class="w-full h-full" title="PDF Preview"></iframe>
                </div>
            </div>

            <div class="px-6 py-4 border-t border-slate-200 bg-white">
                {#if isRevisionMode}
                    <form onsubmit={handleRequestRevision} class="animate-fadeIn">
                        <label class="block text-sm font-bold text-slate-700 mb-2">Catatan Revisi (Jelaskan apa yang salah):</label>
                        <textarea 
                            bind:value={revisionReason} 
                            required 
                            rows="3"
                            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white transition-all text-sm mb-4"
                            placeholder="Contoh: Nama tempat lahir saya salah ketik, seharusnya..."
                        ></textarea>
                        <div class="flex justify-end gap-3">
                            <button type="button" onclick={() => {isRevisionMode = false; revisionReason = '';}} class="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-300">Batal Revisi</button>
                            <button type="submit" disabled={isReviewSubmitting || !revisionReason.trim()} class="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 hover:bg-red-700">Kirim Permintaan Revisi</button>
                        </div>
                    </form>
                {:else}
                    <div class="flex justify-between items-center">
                        <button type="button" onclick={() => isRevisionMode = true} class="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 flex items-center gap-2">
                            Minta Revisi
                        </button>
                        <button type="button" onclick={handleAcceptLetter} disabled={isReviewSubmitting} class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:from-emerald-700 shadow-md disabled:opacity-50 flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            Terima & Finalisasi Surat
                        </button>
                    </div>
                {/if}
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
        userName={user?.name || 'Warga'} 
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
