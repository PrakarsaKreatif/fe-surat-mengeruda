import axios from 'axios';

const API_BASE = import.meta.env.DEV ? '/api/surat' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8003') + '/api/surat';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Accept': 'application/json'
    }
});

// Interceptor untuk menyisipkan token JWT
api.interceptors.request.use(config => {
    if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('sso_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

// Interceptor untuk meredirect ke SSO jika token invalid (401)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('sso_token');
                localStorage.removeItem('sso_user');
                const ssoUrl = import.meta.env.VITE_PUBLIC_SSO_URL || 'http://localhost:5176/';
                window.location.href = ssoUrl;
            }
        }
        return Promise.reject(error);
    }
);

export async function initCsrf() {}

// === AUTH & ACCOUNT API ===
export async function registerUser(formData) {
    await initCsrf();
    const response = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
}

export async function loginUser(email, password, remember = false) {
    await initCsrf();
    const response = await api.post('/auth/login', { email, password, remember });
    return response.data;
}

export async function logoutUser() {
    await initCsrf();
    const response = await api.post('/auth/logout');
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
}

// === WARGA API ===
export async function getTemplates() {
    const response = await api.get('/templates');
    return response.data;
}

export async function getTemplateById(id) {
    const response = await api.get(`/templates/${id}`);
    return response.data;
}

export async function submitLetterRequest(templateId, formData) {
    await initCsrf();
    const response = await api.post('/permohonan', {
        template_id: templateId,
        form_data: formData
    });
    return response.data;
}

export async function getMyRequests() {
    const response = await api.get('/permohonan/my');
    return response.data;
}

// === ADMIN API ===
export async function getPendingUsers() {
    const response = await api.get('/admin/users/pending');
    return response.data;
}

export async function getAllUsers() {
    const response = await api.get('/admin/users/all');
    return response.data;
}

export async function approveUser(userId) {
    await initCsrf();
    const response = await api.post(`/admin/users/${userId}/approve`);
    return response.data;
}

export async function approveKk(userId) {
    await initCsrf();
    const response = await api.post(`/admin/users/${userId}/approve-kk`);
    return response.data;
}

export async function rejectKk(userId) {
    await initCsrf();
    const response = await api.post(`/admin/users/${userId}/reject-kk`);
    return response.data;
}

// === SSO / KELUARGA API (Direct to SSO) ===
const SSO_API_BASE = import.meta.env.VITE_SSO_API_URL || 'http://localhost:8002/api';
const ssoApi = axios.create({
    baseURL: SSO_API_BASE,
    headers: { 'Accept': 'application/json' }
});

ssoApi.interceptors.request.use(config => {
    if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('sso_token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export async function uploadKk(formData) {
    const response = await ssoApi.post('/profile/upload-kk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
}

export async function getFamilyMembers() {
    const response = await ssoApi.get('/profile/family');
    return response.data;
}

export async function addFamilyMember(data) {
    const response = await ssoApi.post('/profile/family', data);
    return response.data;
}

export async function deleteFamilyMember(id) {
    const response = await ssoApi.delete(`/profile/family/${id}`);
    return response.data;
}

export function getKtpUrl(userId) {
    return `${API_BASE}/admin/users/${userId}/ktp`;
}

export async function createTemplate(data) {
    const response = await api.post('/admin/templates', data);
    return response.data;
}

export async function updateTemplate(id, data) {
    const response = await api.put(`/admin/templates/${id}`, data);
    return response.data;
}

export async function deleteTemplate(id) {
    const response = await api.delete(`/admin/templates/${id}`);
    return response.data;
}

export async function getAdminLetterRequests(status = 'all') {
    const response = await api.get(`/admin/surat?status=${status}`);
    return response.data;
}

export async function approveLetterRequest(requestId) {
    await initCsrf();
    const response = await api.post(`/admin/surat/${requestId}/approve`);
    return response.data;
}

export async function rejectLetterRequest(requestId, reason) {
    await initCsrf();
    const response = await api.post(`/admin/surat/${requestId}/reject`, {
        rejection_reason: reason
    });
    return response.data;
}

export function getPdfDownloadUrl(requestId) {
    let token = '';
    if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('sso_token') || '';
    }
    return `${API_BASE}/pdf/download/${requestId}?token=${token}`;
}

export default api;

// Settings
export const getSettings = async () => {
    const res = await api.get('/admin/settings');
    return res.data;
};

export const updateSettings = async (settings, kopLogoFile = null) => {
    if (kopLogoFile) {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('settings', JSON.stringify(settings));
        formData.append('kop_logo_file', kopLogoFile);
        
        const res = await api.post('/admin/settings', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } else {
        const res = await api.put('/admin/settings', { settings });
        return res.data;
    }
};

