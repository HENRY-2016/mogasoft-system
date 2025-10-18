// services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://your-api-url.com/api';

const api = axios.create({
baseURL: API_BASE_URL,
timeout: 10000,
headers: {
    'Content-Type': 'application/json',
},
});

// Add auth token to requests
api.interceptors.request.use(
(config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
(error) => {
    return Promise.reject(error);
}
);

export const authAPI = {
login: (email, pin) => api.post('/auth/login', { email, pin }),
register: (userData) => api.post('/auth/register', userData),
verifyPin: (email, pin) => api.post('/auth/verify-pin', { email, pin }),
logout: () => api.post('/auth/logout'),
};

export const propertyAPI = {
getAll: () => api.get('/properties'),
getById: (id) => api.get(`/properties/${id}`),
create: (propertyData) => api.post('/properties', propertyData),
update: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
delete: (id) => api.delete(`/properties/${id}`),
};

export const tenantAPI = {
getApplications: () => api.get('/tenant/applications'),
submitApplication: (applicationData) => api.post('/tenant/applications', applicationData),
getLeases: () => api.get('/tenant/leases'),
};

export const landlordAPI = {
getProperties: () => api.get('/landlord/properties'),
getTenants: () => api.get('/landlord/tenants'),
getApplications: () => api.get('/landlord/applications'),
reviewApplication: (applicationId, status) => api.put(`/landlord/applications/${applicationId}`, { status }),
};

export default api;