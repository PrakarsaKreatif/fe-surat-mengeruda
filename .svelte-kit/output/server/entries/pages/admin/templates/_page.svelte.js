import "../../../../chunks/index-server.js";
import "../../../../chunks/client.js";
import "../../../../chunks/api.js";
import { r as userStore } from "../../../../chunks/auth.js";
import "../../../../chunks/navigation.js";
//#region src/routes/admin/templates/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		userStore.subscribe((val) => {});
		$$renderer.push(`<div class="min-h-screen bg-gray-50 py-8"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center mb-8"><div class="flex items-center gap-4"><a href="/admin" class="text-blue-600 hover:text-blue-800 font-medium">← Kembali ke Admin</a> <h1 class="text-2xl font-bold text-gray-900">Template Builder E-Surat</h1></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Buat Template Baru</button>`);
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="text-center py-12"><p class="text-gray-500">Memuat data template...</p></div>`);
		$$renderer.push(`<!--]--></div></div>`);
	});
}
//#endregion
export { _page as default };
