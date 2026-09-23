import axios from "axios";
//#region src/lib/api.js
var API_BASE = "http://localhost:8003/api/surat";
var api = axios.create({
	baseURL: API_BASE,
	headers: { "Accept": "application/json" }
});
api.interceptors.request.use((config) => {
	if (typeof localStorage !== "undefined") {
		const token = localStorage.getItem("sso_token");
		if (token) config.headers["Authorization"] = `Bearer ${token}`;
	}
	return config;
});
api.interceptors.response.use((response) => response, (error) => {
	if (error.response && error.response.status === 401) {
		if (typeof window !== "undefined") {
			localStorage.removeItem("sso_token");
			localStorage.removeItem("sso_user");
			const ssoUrl = "http://localhost:5176";
			window.location.href = ssoUrl;
		}
	}
	return Promise.reject(error);
});
async function getCurrentUser() {
	return (await api.get("/auth/me")).data;
}
async function getTemplates() {
	return (await api.get("/templates")).data;
}
async function getMyRequests() {
	return (await api.get("/permohonan/my")).data;
}
async function getPendingUsers() {
	return (await api.get("/admin/users/pending")).data;
}
async function getAllUsers() {
	return (await api.get("/admin/users/all")).data;
}
var ssoApi = axios.create({
	baseURL: "http://localhost:8002/api",
	headers: { "Accept": "application/json" }
});
ssoApi.interceptors.request.use((config) => {
	if (typeof localStorage !== "undefined") {
		const token = localStorage.getItem("sso_token");
		if (token) config.headers["Authorization"] = `Bearer ${token}`;
	}
	return config;
});
async function getFamilyMembers() {
	return (await ssoApi.get("/profile/family")).data;
}
async function getAdminLetterRequests(status = "all") {
	return (await api.get(`/admin/surat?status=${status}`)).data;
}
function getPdfDownloadUrl(requestId) {
	let token = "";
	if (typeof localStorage !== "undefined") token = localStorage.getItem("sso_token") || "";
	return `${API_BASE}/pdf/download/${requestId}?token=${token}`;
}
var getSettings = async () => {
	return (await api.get("/admin/settings")).data;
};
//#endregion
export { getCurrentUser as a, getPdfDownloadUrl as c, getTemplates as d, getAllUsers as i, getPendingUsers as l, api as n, getFamilyMembers as o, getAdminLetterRequests as r, getMyRequests as s, API_BASE as t, getSettings as u };
