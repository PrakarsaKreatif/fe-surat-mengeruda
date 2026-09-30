<script>
    import { onMount, onDestroy } from 'svelte';
    import 'quill/dist/quill.snow.css';

    let { value = $bindable(''), placeholder = 'Tulis di sini...' } = $props();

    let editorElement;
    let quillInstance;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            const Quill = (await import('quill')).default;
            
            quillInstance = new Quill(editorElement, {
                theme: 'snow',
                placeholder: placeholder,
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'align': [] }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['clean']
                    ]
                }
            });

            // Set initial value
            if (value) {
                quillInstance.clipboard.dangerouslyPasteHTML(value);
            }

            // Listen to changes
            quillInstance.on('text-change', () => {
                value = quillInstance.root.innerHTML;
            });
        }
    });

    // Handle external value changes (e.g. data loaded from API)
    $effect(() => {
        if (quillInstance && value !== quillInstance.root.innerHTML) {
            if (value) {
                const currentSelection = quillInstance.getSelection();
                quillInstance.clipboard.dangerouslyPasteHTML(value);
                if (currentSelection) {
                    quillInstance.setSelection(currentSelection);
                }
            } else {
                quillInstance.root.innerHTML = '';
            }
        }
    });

    onDestroy(() => {
        if (quillInstance) {
            quillInstance = null;
        }
    });
</script>

<div class="rich-text-container bg-white">
    <div bind:this={editorElement} class="h-32"></div>
</div>

<style>
    .rich-text-container :global(.ql-editor) {
        min-height: 8rem;
        font-family: inherit;
        font-size: 0.875rem;
    }
    .rich-text-container :global(.ql-toolbar) {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        border-color: #cbd5e1;
    }
    .rich-text-container :global(.ql-container) {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        border-color: #cbd5e1;
    }
</style>
