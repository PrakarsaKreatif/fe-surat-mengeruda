<script>
    import { onMount, onDestroy } from 'svelte';
    import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '$lib/api.js';
    import { userStore } from '$lib/stores/auth.js';
    import { goto } from '$app/navigation';
    
    // Import Quill css & js dynamically to avoid SSR issues
    import 'quill/dist/quill.snow.css';

    let user = $state(null);
    let templates = $state([]);
    let loading = $state(true);
    let currentTemplate = $state(null); // null = mode tambah
    let isEditing = $state(false);
    
    // Form fields
    let formName = $state('');
    let formDesc = $state('');
    let formFieldsArray = $state([]);
    
    let editor;
    let quillInstance;

    userStore.subscribe((val) => {
        user = val;
    });

    onMount(async () => {
        if (!user || !user.roles?.some(r => r.name === 'admin_surat' || r.name === 'Super Admin')) {
            alert('Akses ditolak.');
            goto('/admin');
            return;
        }
        await loadTemplates();
    });

    async function loadTemplates() {
        loading = true;
        try {
            const res = await getTemplates();
            if (res.status === 'success') {
                templates = res.data;
            }
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }

    async function initQuill() {
        if (typeof window !== 'undefined' && !quillInstance && editor) {
            const Quill = (await import('quill')).default;
            const quillMention = await import('quill-mention');
            
            try {
                if (quillMention.Mention && quillMention.MentionBlot) {
                    Quill.register({
                        'blots/mention': quillMention.MentionBlot,
                        'modules/mention': quillMention.Mention
                    }, true);
                }
            } catch (e) {
                console.warn('Mention module already registered', e);
            }
            
            // Tambahkan style kustom untuk menu dropdown mention
            if (!document.getElementById('quill-mention-style')) {
                const style = document.createElement('style');
                style.id = 'quill-mention-style';
                style.innerHTML = `
                .ql-mention-list-container {
                    width: 280px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background-color: #ffffff;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    overflow-y: auto;
                    max-height: 250px;
                    z-index: 9001;
                }
                .ql-mention-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                .ql-mention-list-item {
                    padding: 10px 14px;
                    font-size: 14px;
                    color: #334155;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    border-bottom: 1px solid #f1f5f9;
                }
                .ql-mention-list-item:last-child {
                    border-bottom: none;
                }
                .ql-mention-list-item.selected {
                    background-color: #eff6ff;
                    color: #1e40af;
                    font-weight: 600;
                }
                .ql-mention-list-item:hover:not(.selected) {
                    background-color: #f8fafc;
                }
                span.mention {
                    background-color: #e0e7ff;
                    color: #3730a3;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                    user-select: all;
                    cursor: pointer;
                }
                `;
                document.head.appendChild(style);
            }

            const getMentionValues = () => {
                let values = [
                    { id: 'NAMA', value: 'Nama Pemohon' },
                    { id: 'NIK', value: 'NIK Pemohon' },
                    { id: 'PHONE', value: 'Nomor HP' },
                    { id: 'NOMOR_SURAT', value: 'Nomor Surat' },
                    { id: 'TANGGAL_SURAT', value: 'Tanggal Surat' }
                ];
                
                formFieldsArray.forEach(f => {
                    if (f.name) {
                        values.push({ id: `FORM:${f.name}`, value: `[Isian Warga] ${f.label || f.name}` });
                    }
                });
                return values;
            };

            quillInstance = new Quill(editor, {
                theme: 'snow',
                placeholder: 'Ketik isi template surat di sini...\nKetik simbol "#" untuk memanggil variabel otomatis (seperti Nama, NIK, Isian Formulir).',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['clean']
                    ],
                    mention: {
                        allowedChars: /^[A-Za-z\sÅÄÖåäö_]*$/,
                        mentionDenotationChars: ["#"],
                        source: function (searchTerm, renderList, mentionChar) {
                            let values = getMentionValues();
                            
                            if (searchTerm.length === 0) {
                                renderList(values, searchTerm);
                            } else {
                                const matches = [];
                                for (let i = 0; i < values.length; i++) {
                                    if (values[i].value.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        values[i].id.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        matches.push(values[i]);
                                    }
                                }
                                renderList(matches, searchTerm);
                            }
                        }
                    }
                }
            });
            
            if (currentTemplate && currentTemplate.content) {
                let restoredHtml = currentTemplate.content;
                const values = getMentionValues();
                
                // Ubah kembali [NAMA] menjadi UI Mention Blot agar terlihat interaktif saat diedit
                restoredHtml = restoredHtml.replace(/\[([A-Za-z0-9_:]+)\]/g, (match, id) => {
                    const found = values.find(v => v.id === id);
                    if (found) {
                        return `<span class="mention" data-index="0" data-denotation-char="#" data-id="${id}" data-value="${found.value}">&#xFEFF;<span contenteditable="false"><span class="ql-mention-denotation-char">#</span>${found.value}</span>&#xFEFF;</span>`;
                    }
                    return match;
                });
                
                quillInstance.clipboard.dangerouslyPasteHTML(restoredHtml);
            }
        }
    }

    function openCreate() {
        currentTemplate = null;
        formName = '';
        formDesc = '';
        formFieldsArray = [
            { name: 'keperluan', type: 'text', label: 'Keperluan', required: true }
        ];
        isEditing = true;
        setTimeout(initQuill, 100);
    }

    function openEdit(tpl) {
        currentTemplate = tpl;
        formName = tpl.name;
        formDesc = tpl.description || '';
        
        let parsed = [];
        if (Array.isArray(tpl.required_fields)) {
            parsed = tpl.required_fields;
        } else if (typeof tpl.required_fields === 'string') {
            try { parsed = JSON.parse(tpl.required_fields); } catch(e) {}
        }
        formFieldsArray = parsed;
        
        isEditing = true;
        
        setTimeout(() => {
            if (quillInstance) {
                quillInstance.root.innerHTML = '';
            }
            initQuill();
            if (quillInstance) {
                quillInstance.clipboard.dangerouslyPasteHTML(tpl.content || '');
            }
        }, 100);
    }

    function closeEdit() {
        isEditing = false;
        if (quillInstance) {
            quillInstance = null;
        }
    }
    
    function addField() {
        formFieldsArray = [...formFieldsArray, { name: '', label: '', type: 'text', required: false }];
    }
    
    function removeField(index) {
        formFieldsArray = formFieldsArray.filter((_, i) => i !== index);
    }

    async function saveTemplate() {
        if (!formName) return alert('Nama surat wajib diisi!');
        
        // Validasi field
        for (let i = 0; i < formFieldsArray.length; i++) {
            if (!formFieldsArray[i].name || !formFieldsArray[i].label) {
                return alert('Pastikan semua field memiliki Name ID dan Label!');
            }
            // Hapus spasi dari Name ID dan jadikan huruf kecil (snake_case/camelCase)
            formFieldsArray[i].name = formFieldsArray[i].name.toLowerCase().replace(/\s+/g, '_');
        }
        
        let htmlContent = quillInstance ? quillInstance.root.innerHTML : '';
        
        // Gunakan DOM Parser untuk membersihkan span mention yang bersarang (nested)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const mentionSpans = tempDiv.querySelectorAll('span.mention');
        mentionSpans.forEach(span => {
            const dataId = span.getAttribute('data-id');
            if (dataId) {
                const textNode = document.createTextNode(`[${dataId}] `);
                span.parentNode.replaceChild(textNode, span);
            }
        });
        
        htmlContent = tempDiv.innerHTML;
        
        // Bersihkan spasi kosong aneh (zero-width space) peninggalan quill-mention
        htmlContent = htmlContent.replace(/\uFEFF/g, '');
        
        const payload = {
            name: formName,
            description: formDesc,
            content: htmlContent,
            required_fields: formFieldsArray
        };

        try {
            if (currentTemplate) {
                await updateTemplate(currentTemplate.id, payload);
                alert('Template berhasil diupdate!');
            } else {
                await createTemplate(payload);
                alert('Template baru berhasil dibuat!');
            }
            closeEdit();
            loadTemplates();
        } catch (e) {
            console.error(e);
            alert('Gagal menyimpan template.');
        }
    }

    async function handleDelete(id) {
        if (!confirm('Yakin ingin menghapus template ini?')) return;
        try {
            await deleteTemplate(id);
            loadTemplates();
        } catch (e) {
            console.error(e);
            alert('Gagal menghapus template.');
        }
    }
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-4">
                <a href="/admin" class="text-blue-600 hover:text-blue-800 font-medium">&larr; Kembali ke Admin</a>
                <h1 class="text-2xl font-bold text-gray-900">Template Builder E-Surat</h1>
            </div>
            
            {#if !isEditing}
                <button onclick={openCreate} class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Buat Template Baru
                </button>
            {/if}
        </div>

        {#if loading && !isEditing}
            <div class="text-center py-12">
                <p class="text-gray-500">Memuat data template...</p>
            </div>
        {:else if !isEditing}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each templates as tpl}
                    <div class="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col h-full">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">{tpl.name}</h3>
                        <p class="text-gray-600 text-sm flex-grow mb-4">{tpl.description || 'Tidak ada deskripsi'}</p>
                        
                        <div class="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                            <button onclick={() => openEdit(tpl)} class="flex-1 bg-yellow-50 text-yellow-600 font-medium py-2 rounded border border-yellow-200 hover:bg-yellow-100 transition">
                                Edit
                            </button>
                            <button onclick={() => handleDelete(tpl.id)} class="bg-red-50 text-red-600 font-medium p-2 rounded border border-red-200 hover:bg-red-100 transition">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                {/each}
                {#if templates.length === 0}
                    <div class="col-span-full bg-white rounded-xl p-12 text-center text-gray-500 shadow border border-gray-100">
                        Belum ada template surat yang dibuat.
                    </div>
                {/if}
            </div>
        {:else}
            <!-- Editor Mode -->
            <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto mb-12">
                <h2 class="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                    {currentTemplate ? 'Edit Template: ' + currentTemplate.name : 'Buat Template Baru'}
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Jenis Surat</label>
                        <input type="text" bind:value={formName} placeholder="Contoh: Surat Keterangan Usaha" class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                        <input type="text" bind:value={formDesc} placeholder="Jelaskan kegunaan surat ini..." class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                </div>

                <div class="mb-8">
                    <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm font-medium text-gray-700">Kerangka Isi Surat</label>
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Gunakan tag: [NAMA], [NIK], [PHONE], [FORM:nama_variabel]</span>
                    </div>
                    <!-- Editor Container -->
                    <div class="border rounded-md border-gray-300 bg-white">
                        <div bind:this={editor} class="min-h-[300px] prose max-w-none p-4"></div>
                    </div>
                </div>
                
                <div class="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-800">Formulir Isian Tambahan (Required Fields)</label>
                            <p class="text-xs text-gray-500 mt-1">Konfigurasi kolom formulir yang harus diisi warga saat memohon surat ini.</p>
                        </div>
                        <button type="button" onclick={addField} class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            Tambah Kolom
                        </button>
                    </div>
                    
                    {#if formFieldsArray.length === 0}
                        <div class="text-center py-6 bg-white rounded border border-dashed border-gray-300 text-sm text-gray-500">
                            Tidak ada isian tambahan. Warga hanya perlu menekan tombol kirim.
                        </div>
                    {:else}
                        <div class="space-y-3">
                            {#each formFieldsArray as field, i}
                                <div class="flex flex-col sm:flex-row gap-3 items-start bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group">
                                    <div class="flex-1 w-full">
                                        <label class="block text-xs font-medium text-gray-500 mb-1">Label (Tampil di Warga)</label>
                                        <input type="text" bind:value={field.label} placeholder="Contoh: Keperluan" class="w-full text-sm rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div class="flex-1 w-full">
                                        <label class="block text-xs font-medium text-gray-500 mb-1">Name ID (Untuk Template)</label>
                                        <input type="text" bind:value={field.name} placeholder="Contoh: keperluan" class="w-full text-sm rounded-md border-gray-300 bg-gray-50 focus:bg-white focus:ring-blue-500 focus:border-blue-500 font-mono" />
                                    </div>
                                    <div class="w-full sm:w-32">
                                        <label class="block text-xs font-medium text-gray-500 mb-1">Tipe Isian</label>
                                        <select bind:value={field.type} class="w-full text-sm rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                            <option value="text">Teks Pendek</option>
                                            <option value="textarea">Teks Panjang</option>
                                            <option value="number">Angka</option>
                                            <option value="date">Tanggal</option>
                                        </select>
                                    </div>
                                    <div class="w-full sm:w-auto flex items-center gap-2 pt-1 sm:pt-6">
                                        <label class="flex items-center gap-1.5 cursor-pointer text-sm">
                                            <input type="checkbox" bind:checked={field.required} class="rounded text-blue-600 focus:ring-blue-500" />
                                            <span class="text-gray-700">Wajib Diisi</span>
                                        </label>
                                        <button type="button" onclick={() => removeField(i)} class="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Hapus Kolom">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                    <div class="mt-4 text-xs text-blue-700 bg-blue-50 p-2 rounded flex gap-2 items-start">
                        <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p><strong>Tips:</strong> Gunakan <strong>Name ID</strong> di dalam kerangka surat dengan format <code>[FORM:name_id]</code> untuk menampilkan otomatis isian dari warga.</p>
                    </div>
                </div>
                
                <div class="flex gap-4 border-t pt-6">
                    <button onclick={saveTemplate} class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 shadow transition flex-1">
                        Simpan Template
                    </button>
                    <button onclick={closeEdit} class="bg-white text-gray-700 px-6 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 shadow-sm transition">
                        Batal
                    </button>
                </div>
            </div>
        {/if}

    </div>
</div>

<style>
    /* Quill Editor adjustments */
    :global(.ql-editor) {
        font-family: inherit;
        font-size: 1rem;
        min-height: 300px;
    }
</style>
