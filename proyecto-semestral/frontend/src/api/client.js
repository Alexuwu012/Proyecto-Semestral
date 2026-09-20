import axios from 'axios';

export const API_URL = 'http://localhost:3000';

const api = axios.create({ baseURL: API_URL });

// Adjunta automáticamente el JWT guardado en localStorage a cada petición.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('alerta_segura_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expiró o es inválido, limpia la sesión para forzar un nuevo login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('alerta_segura_token');
      localStorage.removeItem('alerta_segura_user');
    }
    return Promise.reject(error);
  }
);

// Las fotos subidas al backend se guardan como rutas relativas (/uploads/x.jpg);
// hay que anteponer la URL del backend para que el navegador las resuelva bien
// (si ya es una URL completa, como http://..., se deja igual).
export function resolvePhotoUrl(photo) {
  if (!photo) return null;
  if (/^https?:\/\//i.test(photo)) return photo;
  return `${API_URL}${photo}`;
}

export default api;
