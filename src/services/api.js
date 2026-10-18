import axios from "axios";

const API_BASE = "https://laporan-backend-seven.vercel.app/";

// Interceptor untuk menyisipkan Token JWT otomatis ke setiap request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const reportService = {
  getAll: () => axios.get(`${API_BASE}/reports`),
  create: (data) => axios.post(`${API_BASE}/reports`, data),
  uploadPhotos: (formData) => axios.post(`${API_BASE}/upload`, formData),
};
