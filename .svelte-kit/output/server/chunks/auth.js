import { v as writable } from "./index-server.js";
import "./exports.js";
import { a as getCurrentUser } from "./api.js";
//#region src/lib/stores/auth.js
var userStore = writable(null);
var isLoadingAuth = writable(true);
async function fetchAuthUser() {
	isLoadingAuth.set(true);
	try {
		const token = localStorage.getItem("sso_token");
		if (!token) throw new Error("No token");
		const ssoApiUrl = "http://localhost:8002/api";
		try {
			if ((await fetch(`${ssoApiUrl}/user`, { headers: {
				"Authorization": `Bearer ${token}`,
				"Accept": "application/json"
			} })).status === 401) throw new Error("Token invalidated by SSO");
		} catch (fetchError) {
			if (fetchError.message === "Token invalidated by SSO") throw fetchError;
			else console.warn("SSO Backend tidak bisa dihubungi untuk verifikasi:", fetchError);
		}
		const res = await getCurrentUser();
		if (res?.status === "success" && res.data) {
			userStore.set(res.data);
			return res.data;
		} else throw new Error("Gagal mengambil data user dari e-surat backend");
	} catch (e) {
		console.error("Logout Triggered:", e.message);
		localStorage.removeItem("sso_token");
		localStorage.removeItem("sso_user");
		userStore.set(null);
	} finally {
		isLoadingAuth.set(false);
	}
	return null;
}
//#endregion
export { isLoadingAuth as n, userStore as r, fetchAuthUser as t };
