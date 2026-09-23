import { S as escape_html, x as attr } from "../../../chunks/server.js";
import "../../../chunks/api.js";
//#region src/routes/register/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let nik = "";
		let name = "";
		let phone = "";
		let email = "";
		let password = "";
		let password_confirmation = "";
		let loading = false;
		$$renderer.push(`<div class="py-12 bg-slate-100 flex-1 flex flex-col justify-center"><div class="max-w-xl mx-auto px-4 w-full"><div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"><div class="bg-[#1e3a8a] px-8 py-6 text-white text-center"><h1 class="text-2xl font-extrabold tracking-tight">Pendaftaran Akun Warga</h1> <p class="text-xs text-blue-200 mt-1">Layanan E-Surat Resmi Desa Mengeruda</p></div> <div class="p-8">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form class="space-y-4"><div><label for="nik" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nomor Induk Kependudukan (NIK - 16 Angka)</label> <input id="nik" type="text"${attr("value", nik)} maxlength="16" placeholder="3512345678901234" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm font-mono" required=""/></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label for="name" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Lengkap (Sesuai KTP)</label> <input id="name" type="text"${attr("value", name)} placeholder="Nama Lengkap" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm" required=""/></div> <div><label for="phone" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">No. HP / WhatsApp</label> <input id="phone" type="text"${attr("value", phone)} placeholder="081234567890" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm" required=""/></div></div> <div><label for="email" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Alamat Email</label> <input id="email" type="email"${attr("value", email)} placeholder="email@contoh.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm" required=""/></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label for="password" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label> <input id="password" type="password"${attr("value", password)} placeholder="Min. 8 karakter" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm" required=""/></div> <div><label for="password_confirmation" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ulangi Password</label> <input id="password_confirmation" type="password"${attr("value", password_confirmation)} placeholder="Konfirmasi password" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm" required=""/></div></div> <div class="pt-2"><label for="ktp" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unggah Dokumen KTP (Foto / PDF - Maks. 4MB)</label> <input id="ktp" type="file" accept="image/jpeg,image/png,image/jpg,.pdf" class="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#1e3a8a] hover:file:bg-blue-100" required=""/> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <button type="submit"${attr("disabled", loading, true)} class="w-full py-3 rounded-xl bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50 mt-4">${escape_html("Daftarkan Akun")}</button></form> <div class="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">Sudah punya akun warga? <a href="/login" class="font-bold text-[#1e3a8a] hover:underline">Masuk di sini</a></div>`);
		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}
//#endregion
export { _page as default };
