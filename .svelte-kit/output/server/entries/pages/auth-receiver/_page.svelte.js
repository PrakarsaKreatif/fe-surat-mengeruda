import { d as unsubscribe_stores } from "../../../chunks/index-server.js";
import "../../../chunks/client.js";
import "../../../chunks/stores.js";
import "../../../chunks/api.js";
import "../../../chunks/navigation.js";
//#region src/routes/auth-receiver/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		$$renderer.push(`<div class="min-h-screen flex items-center justify-center bg-gray-50"><div class="text-center"><svg class="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <p class="text-gray-600 font-medium animate-pulse">Mengautentikasi sesi Anda...</p></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
