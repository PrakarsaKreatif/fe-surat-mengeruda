import "../../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, x as attr } from "../../../chunks/server.js";
import "../../../chunks/stores.js";
import "../../../chunks/api.js";
import "axios";
//#region src/routes/validasi/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		$$renderer.push(`<div class="py-12 bg-slate-100 flex-1 flex flex-col justify-center"><div class="max-w-2xl mx-auto px-4 sm:px-6 w-full"><div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"><div class="bg-[#1e3a8a] px-8 py-6 text-white text-center"><h1 class="text-2xl font-extrabold tracking-tight">Cek Keaslian &amp; Validasi Surat</h1> <p class="text-xs text-blue-200 mt-1">Sistem Verifikasi Tanda Tangan Elektronik Desa Mengeruda</p></div> <div class="p-8"><form class="flex flex-col sm:flex-row gap-3 mb-8"><input type="text"${attr("value", "")} placeholder="Masukkan token UUID dari QR Code surat..." class="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm" required=""/> <button type="submit"${attr("disabled", false, true)} class="px-6 py-3 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50">${escape_html("Verifikasi")}</button></form> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
