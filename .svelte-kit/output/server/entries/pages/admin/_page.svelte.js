import "../../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, r as derived, s as stringify, t as attr_class, x as attr } from "../../../chunks/server.js";
import "../../../chunks/stores.js";
import "../../../chunks/api.js";
import { n as userStore } from "../../../chunks/auth.js";
import "../../../chunks/StatusBadge.js";
//#region src/lib/components/ModalKtp.svelte
function ModalKtp($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { isOpen = false, onClose = () => {}, ktpUrl = null, userName = "Warga" } = $$props;
		if (isOpen && ktpUrl) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"><div class="bg-white rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200"><div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between"><div><h3 class="font-bold text-lg">Dokumen KTP Warga</h3> <p class="text-xs text-slate-400">Pemilik: <strong class="text-white">${escape_html(userName)}</strong></p></div> <button class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="p-6 bg-slate-100 flex items-center justify-center min-h-[350px] max-h-[70vh] overflow-auto">`);
			if (ktpUrl.endsWith(".pdf")) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<iframe${attr("src", ktpUrl)} title="Dokumen KTP PDF" class="w-full h-[500px] border-0 rounded-lg shadow-sm bg-white"></iframe>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<img${attr("src", ktpUrl)}${attr("alt", `KTP ${stringify(userName)}`)} class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-slate-300" onerror="this.__e=event"/>`);
			}
			$$renderer.push(`<!--]--></div> <div class="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3"><a${attr("href", ktpUrl)} target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all">Buka di Tab Baru</a> <button class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm transition-all">Tutup</button></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/routes/admin/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let letterRequests = [];
		let pendingUsers = [];
		let allUsers = [];
		let isKtpModalOpen = false;
		let currentKtpUrl = null;
		let currentKtpUser = "";
		userStore.subscribe((val) => {});
		let pendingLettersCount = derived(() => letterRequests.filter((item) => item.status === "pending").length);
		$$renderer.push(`<div class="space-y-8"><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"><div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between"><div><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Permohonan</p> <p class="text-3xl font-extrabold text-slate-900 mt-2">${escape_html(letterRequests.length)}</p> <p class="text-xs text-slate-400 mt-1">Daftar surat masuk</p></div> <div class="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg></div></div> <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between"><div><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Surat Tertunda</p> <p class="text-3xl font-extrabold text-amber-600 mt-2">${escape_html(pendingLettersCount())}</p> <p class="text-xs text-slate-400 mt-1">Perlu tindakan Anda</p></div> <div class="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div></div> <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between"><div><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Verifikasi Akun Warga</p> <p class="text-3xl font-extrabold text-rose-600 mt-2">${escape_html(pendingUsers.length)}</p> <p class="text-xs text-slate-400 mt-1">Warga menunggu persetujuan</p></div> <div class="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path></svg></div></div> <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift flex items-center justify-between"><div><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Warga</p> <p class="text-3xl font-extrabold text-emerald-600 mt-2">${escape_html(allUsers.length)}</p> <p class="text-xs text-slate-400 mt-1">Terdaftar di E-Surat</p></div> <div class="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path></svg></div></div></div> <div class="flex items-center justify-between border-b border-slate-200 pb-2"><div class="flex items-center gap-2"><button type="button"${attr_class(`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-[#1e3a8a] text-white shadow-md shadow-blue-500/20`)}><span>Permohonan Surat</span> <span class="px-2 py-0.5 rounded-full text-xs bg-white/20">${escape_html(letterRequests.length)}</span></button> <button type="button"${attr_class(`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-white text-slate-600 hover:bg-slate-200 border border-slate-200`)}><span>Verifikasi Akun Warga</span> `);
		if (pendingUsers.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white animate-pulse">${escape_html(pendingUsers.length)}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></button></div></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden animate-fadeIn"><div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><h2 class="font-bold text-slate-900 text-base">Daftar Permohonan Surat Masuk</h2> <div class="flex items-center gap-2"><button type="button"${attr_class(`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-500 text-white shadow-xs`)}>Menunggu Verifikasi</button> <button type="button"${attr_class(`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200`)}>Telah Terbit</button> <button type="button"${attr_class(`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200`)}>Semua</button></div></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="p-12 text-center text-slate-500">Memuat permohonan surat...</div>`);
		$$renderer.push(`<!--]--></div>`);
		$$renderer.push(`<!--]--></div> `);
		ModalKtp($$renderer, {
			isOpen: isKtpModalOpen,
			ktpUrl: currentKtpUrl,
			userName: currentKtpUser,
			onClose: () => isKtpModalOpen = false
		});
		$$renderer.push(`<!----> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
