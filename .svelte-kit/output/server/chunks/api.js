import axios from "axios";
var API_BASE = `http://localhost:8000/api/surat`;
var api = axios.create({
	baseURL: API_BASE,
	withCredentials: true,
	headers: {
		"Accept": "application/json",
		"X-Requested-With": "XMLHttpRequest"
	}
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
async function getAdminLetterRequests(status = "all") {
	return (await api.get(`/admin/surat?status=${status}`)).data;
}
function getPdfDownloadUrl(requestId) {
	return `${API_BASE}/pdf/download/${requestId}`;
}
//#endregion
export { getMyRequests as a, getTemplates as c, getCurrentUser as i, getAdminLetterRequests as n, getPdfDownloadUrl as o, getAllUsers as r, getPendingUsers as s, API_BASE as t };
