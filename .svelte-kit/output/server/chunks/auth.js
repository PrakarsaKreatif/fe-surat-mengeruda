import { T as writable } from "./server.js";
import "./index-server2.js";
import { i as getCurrentUser } from "./api.js";
//#region src/lib/stores/auth.js
var userStore = writable(null);
var isLoadingAuth = writable(true);
async function fetchAuthUser() {
	isLoadingAuth.set(true);
	try {
		const res = await getCurrentUser();
		if (res?.status === "success" && res.data) {
			userStore.set(res.data);
			return res.data;
		}
	} catch (e) {
		userStore.set(null);
	} finally {
		isLoadingAuth.set(false);
	}
	return null;
}
//#endregion
export { userStore as n, fetchAuthUser as t };
