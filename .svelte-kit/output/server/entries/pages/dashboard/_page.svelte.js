import "../../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, i as ensure_array_like, r as derived, t as attr_class } from "../../../chunks/server.js";
import "../../../chunks/stores.js";
import "../../../chunks/api.js";
import { n as userStore } from "../../../chunks/auth.js";
import "../../../chunks/StatusBadge.js";
//#region src/routes/dashboard/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let user = null;
		let templates = [];
		let myRequests = [];
		userStore.subscribe((val) => {
			user = val;
		});
		let approvedCount = derived(() => myRequests.filter((r) => r.status === "approved").length);
		let pendingCount = derived(() => myRequests.filter((r) => r.status === "pending").length);
		$$renderer.push(`<div class="space-y-8">`);
		if (user && !user.is_approved) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4 shadow-xs animate-fadeIn"><div class="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg></div> <div><h3 class="font-bold text-base mb-1">Akun Dalam Proses Verifikasi Admin</h3> <p class="text-sm text-amber-800/90 leading-relaxed">Pendaftaran akun E-Surat Anda sedang ditinjau dan dicocokkan dengan dokumen KTP yang Anda unggah. Anda baru dapat mengajukan permohonan surat setelah akun disetujui.</p></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"><div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between"><div><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengajuan</p> <p class="text-3xl font-extrabold text-slate-900 mt-2">${escape_html(myRequests.length)}</p> <p class="text-xs text-slate-400 mt-1">Seluruh surat saya</p></div> <div class="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg></div></div> <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between"><div><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Terbit</p> <p class="text-3xl font-extrabold text-emerald-600 mt-2">${escape_html(approvedCount())}</p> <p class="text-xs text-slate-400 mt-1">Siap diunduh PDF</p></div> <div class="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div></div> <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between"><div><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang Diproses</p> <p class="text-3xl font-extrabold text-amber-600 mt-2">${escape_html(pendingCount())}</p> <p class="text-xs text-slate-400 mt-1">Verifikasi Admin</p></div> <div class="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div></div> <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between"><div><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Identitas</p> <p class="text-lg font-extrabold text-slate-900 mt-2">${escape_html(user?.is_approved ? "Terverifikasi" : "Menunggu")}</p> <p class="text-xs text-slate-400 mt-1">Dokumen KTP</p></div> <div${attr_class(`w-13 h-13 rounded-2xl flex items-center justify-center shadow-inner ${user?.is_approved ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"></path></svg></div></div></div> <div class="flex items-center justify-between border-b border-slate-200 pb-2"><div class="flex items-center gap-2"><button type="button"${attr_class(`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20`)}><span>Ajukan Surat &amp; Layanan</span></button> <button type="button"${attr_class(`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-white text-slate-600 hover:bg-slate-200 border border-slate-200`)}><span>Riwayat Surat Saya</span> <span class="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 font-semibold">${escape_html(myRequests.length)}</span></button></div></div> `);
		{
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="animate-fadeIn"><h2 class="text-base font-bold text-slate-900 mb-4">Pilih Jenis Layanan Surat Resmi</h2> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"><!--[-->`);
			const each_array = ensure_array_like(templates);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let t = each_array[$$index];
				$$renderer.push(`<div role="button" tabindex="0"${attr_class(`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-300 flex flex-col justify-between ${user?.is_approved ? "cursor-pointer hover:border-[#1e3a8a] hover:shadow-lg hover:-translate-y-1" : "opacity-60 cursor-not-allowed"}`)}><div><span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">Surat Resmi</span> <h3 class="font-extrabold text-slate-900 text-lg mb-2">${escape_html(t.name)}</h3> <p class="text-sm text-slate-600 leading-relaxed line-clamp-2">${escape_html(t.description)}</p></div> <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1e3a8a]"><span>Ajukan Sekarang</span> <span class="text-sm">→</span></div></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		}
		$$renderer.push(`<!--]--></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
