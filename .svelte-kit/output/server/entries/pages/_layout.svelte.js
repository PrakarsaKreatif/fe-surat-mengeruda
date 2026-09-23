import "../../chunks/index-server.js";
import { S as escape_html, c as unsubscribe_stores, o as store_get, r as derived, t as attr_class } from "../../chunks/server.js";
import { t as page } from "../../chunks/stores.js";
import "../../chunks/api.js";
import { n as userStore } from "../../chunks/auth.js";
//#region src/lib/components/Navbar.svelte
function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user = null, onLogout = () => {} } = $$props;
		$$renderer.push(`<header class="bg-[#1e3a8a] text-white shadow-lg sticky top-0 z-50"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between h-16"><a href="/" class="flex items-center gap-3 group"><div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all p-1"><img src="/logo.png" alt="Logo Desa Mengeruda" class="w-full h-full object-contain drop-shadow"/></div> <div><span class="font-bold text-lg tracking-tight block leading-tight">E-SURAT</span> <span class="text-xs text-blue-200 uppercase tracking-wider block">Desa Mengeruda</span></div></a> <nav class="hidden md:flex items-center gap-6"><a href="/" class="text-sm font-medium hover:text-blue-200 transition-colors">Beranda</a> <a href="/validasi" class="text-sm font-medium hover:text-blue-200 transition-colors">Cek Validasi Surat</a> `);
		if (user) {
			$$renderer.push("<!--[0-->");
			if (user.roles?.includes("admin_surat") || user.roles?.includes("Super Admin") || user.roles?.includes("Admin")) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<a href="/admin" class="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-sm font-semibold transition-all shadow-sm">Panel Admin</a>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<a href="/dashboard" class="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-sm font-semibold transition-all shadow-sm">Dasbor Warga</a>`);
			}
			$$renderer.push(`<!--]--> <div class="flex items-center gap-3 pl-4 border-l border-blue-700"><span class="text-sm font-medium text-blue-100">${escape_html(user.name)}</span> <button class="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md font-semibold transition-all">Keluar</button></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="flex items-center gap-3"><a href="/login" class="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/10 transition-all">Masuk</a> <a href="/register" class="text-sm font-semibold bg-white text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-blue-50 shadow-md transition-all">Daftar Akun</a></div>`);
		}
		$$renderer.push(`<!--]--></nav> <div class="md:hidden"><button class="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg></button></div></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></header>`);
	});
}
//#endregion
//#region src/lib/components/Footer.svelte
function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<footer class="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div><div class="flex items-center gap-3 mb-3"><img src="/logo.png" alt="Logo Desa Mengeruda" class="w-9 h-9 object-contain drop-shadow shrink-0"/> <span class="font-bold text-white text-lg tracking-wide">E-SURAT DESA MENGERUDA</span></div> <p class="text-sm text-slate-400 leading-relaxed">Sistem Pelayanan Surat Menyurat Digital resmi Pemerintah Desa Mengeruda, Kecamatan Soa, Kabupaten Nagekeo, Nusa Tenggara Timur.</p></div> <div><h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Layanan Warga</h4> <ul class="space-y-2 text-sm text-slate-400"><li><a href="/register" class="hover:text-white transition-colors">Pendaftaran Akun Baru</a></li> <li><a href="/dashboard" class="hover:text-white transition-colors">Pengajuan Surat Domisili</a></li> <li><a href="/dashboard" class="hover:text-white transition-colors">Pengajuan Surat Keterangan Usaha (SKU)</a></li> <li><a href="/dashboard" class="hover:text-white transition-colors">Pengajuan SKTM</a></li></ul></div> <div><h4 class="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Kontak &amp; Bantuan</h4> <ul class="space-y-2 text-sm text-slate-400"><li>Alamat: Jl. Raya Mengeruda, Soa, Nagekeo</li> <li>Email: admin@mengeruda.id</li> <li>Jam Pelayanan Online: 24 Jam</li></ul></div></div> <div class="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500"><p>© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Pemerintah Desa Mengeruda. Hak Cipta Dilindungi.</p> <p>Didukung oleh Prakarsa Kreatif - e-surat.mengeruda.id</p></div></div></footer>`);
	});
}
//#endregion
//#region src/lib/components/Sidebar.svelte
function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { user = null, onLogout = () => {}, isMobileOpen = false, onCloseMobile = () => {}, pendingUsersCount = 0, pendingLettersCount = 0 } = $$props;
		let currentPath = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname);
		let currentTab = derived(() => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("tab"));
		let isAdmin = derived(() => currentPath().startsWith("/admin") || user?.roles?.includes("admin_surat") || user?.roles?.includes("Super Admin") || user?.roles?.includes("Admin"));
		function isItemActive(href, tabParam) {
			if (tabParam) return currentPath().startsWith(href) && (currentTab() === tabParam || !currentTab() && tabParam === (isAdmin() ? "permohonan" : "ajukan"));
			return currentPath() === href && !currentTab();
		}
		if (isMobileOpen) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fadeIn" role="button" tabindex="0" aria-label="Tutup menu sidebar"></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <aside${attr_class(`
    fixed top-0 left-0 bottom-0 z-50 w-72 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out
    lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
`)}><div><div class="h-20 px-6 border-b border-slate-800/80 flex items-center justify-between"><a href="/" class="flex items-center gap-3 group"><div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M19.5 22.5a3 3 0 003-3v-8.174l-6.879 4.022 3.485 1.876a.75.75 0 11-.712 1.321l-5.683-3.06a1.5 1.5 0 00-1.422 0l-5.683 3.06a.75.75 0 01-.712-1.32l3.485-1.877L1.5 11.326V19.5a3 3 0 003 3h15z"></path><path d="M1.5 9.589v-.745a3 3 0 011.578-2.641l7.5-4.039a3 3 0 012.844 0l7.5 4.039A3 3 0 0122.5 8.844v.745l-8.426 4.926-.652-.35a3 3 0 00-2.844 0l-.652.35L1.5 9.59z"></path></svg></div> <div><span class="font-extrabold text-white text-lg tracking-tight block leading-tight">E-SURAT DESA</span> <span class="text-xs text-blue-400 font-semibold uppercase tracking-wider block">Desa Mengeruda</span></div></a> <button type="button" class="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" aria-label="Tutup sidebar"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="px-6 py-4"><div class="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between"><span class="text-xs font-bold uppercase tracking-wider text-slate-400">Panel Mode</span> <span${attr_class(`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${isAdmin() ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`)}>${escape_html(isAdmin() ? "Admin Desa" : "Warga Desa")}</span></div></div> <nav class="px-4 py-2 space-y-1.5">`);
		if (isAdmin()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Manajemen Layanan</div> <a href="/admin?tab=permohonan"${attr_class(`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isItemActive("/admin", "permohonan") ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`)}><div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg> <span>Permohonan Surat</span></div> `);
			if (pendingLettersCount > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold animate-pulse">${escape_html(pendingLettersCount)}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></a> <a href="/admin?tab=warga"${attr_class(`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isItemActive("/admin", "warga") ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`)}><div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path></svg> <span>Verifikasi Akun Warga</span></div> `);
			if (pendingUsersCount > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white font-bold animate-pulse">${escape_html(pendingUsersCount)}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></a>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Layanan Warga</div> <a href="/dashboard?tab=ajukan"${attr_class(`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isItemActive("/dashboard", "ajukan") ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`)}><div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg> <span>Ajukan Surat Baru</span></div></a> <a href="/dashboard?tab=riwayat"${attr_class(`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isItemActive("/dashboard", "riwayat") ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`)}><div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg> <span>Riwayat Surat Saya</span></div></a>`);
		}
		$$renderer.push(`<!--]--> <div class="pt-4 pb-2"><div class="border-t border-slate-800"></div></div> <div class="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Umum &amp; Validasi</div> <a href="/validasi"${attr_class(`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${currentPath() === "/validasi" ? "bg-white/10 text-white border-l-4 border-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"></path></svg> <span>Validasi QR Code</span></a> <a href="/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path></svg> <span>Beranda Publik</span></a></nav></div> <div class="p-4 border-t border-slate-800/80 bg-slate-900/50">`);
		if (user) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex items-center justify-between gap-3 mb-3"><div class="flex items-center gap-3 min-w-0"><div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">${escape_html(user.name ? user.name.substring(0, 2).toUpperCase() : "W")}</div> <div class="min-w-0"><p class="text-sm font-bold text-white truncate">${escape_html(user.name)}</p> <p class="text-xs text-slate-400 font-mono truncate">NIK: ${escape_html(user.nik || "-")}</p></div></div></div> <button type="button" class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold border border-rose-500/20 transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"></path></svg> <span>Keluar dari Sistem</span></button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<a href="/login" class="block w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all">Masuk / Login</a>`);
		}
		$$renderer.push(`<!--]--></div></aside>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/lib/components/HeaderBar.svelte
function HeaderBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { user = null, onLogout = () => {}, onOpenMobile = () => {} } = $$props;
		let currentPath = derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname);
		let isAdmin = derived(() => currentPath().startsWith("/admin") || user?.roles?.includes("admin_surat") || user?.roles?.includes("Super Admin") || user?.roles?.includes("Admin"));
		$$renderer.push(`<header class="h-20 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm"><div class="flex items-center gap-4"><button type="button" class="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors" aria-label="Buka Menu Sidebar"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg></button> <div><div class="flex items-center gap-2"><span class="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">${escape_html(isAdmin() ? "Panel Admin" : "Layanan Warga")}</span> <span class="text-slate-300">/</span> <span class="text-xs font-semibold text-slate-500">${escape_html(currentPath().startsWith("/admin") ? "Manajemen Surat & Verifikasi" : "Pengajuan & Riwayat Surat")}</span></div> <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">${escape_html(currentPath().startsWith("/admin") ? "Dasbor Manajemen E-Surat" : "Dasbor Warga Desa Mengeruda")}</h1></div></div> <div class="flex items-center gap-4"><div class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> <span>Pelayanan Digital Online</span></div> `);
		if (user) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex items-center gap-3 pl-4 border-l border-slate-200"><div class="hidden md:block text-right"><p class="text-sm font-bold text-slate-900 leading-none">${escape_html(user.name)}</p> <p class="text-[11px] text-slate-500 mt-1">${escape_html(isAdmin() ? "Admin Desa" : `NIK: ${user.nik || "-"}`)}</p></div> <button type="button" class="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-all" title="Keluar dari Sistem" aria-label="Keluar dari Sistem"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"></path></svg></button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></header>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		let user = null;
		let isMobileOpen = false;
		userStore.subscribe((val) => {
			user = val;
		});
		function handleLogoutCallback() {
			userStore.set(null);
			window.location.href = "/login";
		}
		if (derived(() => store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/admin") || store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/dashboard"))()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="min-h-screen bg-slate-100 flex">`);
			Sidebar($$renderer, {
				user,
				onLogout: handleLogoutCallback,
				isMobileOpen,
				onCloseMobile: () => isMobileOpen = false
			});
			$$renderer.push(`<!----> <div class="flex-1 flex flex-col min-h-screen lg:pl-72 w-full overflow-x-hidden">`);
			HeaderBar($$renderer, {
				user,
				onLogout: handleLogoutCallback,
				onOpenMobile: () => isMobileOpen = true
			});
			$$renderer.push(`<!----> <main class="flex-1 p-4 sm:p-6 lg:p-8 animate-fadeIn">`);
			children($$renderer);
			$$renderer.push(`<!----></main></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="min-h-screen flex flex-col bg-slate-50">`);
			Navbar($$renderer, {
				user,
				onLogout: handleLogoutCallback
			});
			$$renderer.push(`<!----> <main class="flex-1 flex flex-col">`);
			children($$renderer);
			$$renderer.push(`<!----></main> `);
			Footer($$renderer, {});
			$$renderer.push(`<!----></div>`);
		}
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _layout as default };
