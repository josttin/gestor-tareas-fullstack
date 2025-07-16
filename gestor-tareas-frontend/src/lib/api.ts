// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  // Esta es la versión final y correcta para ambos entornos
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

// Esto es un "interceptor". Se ejecuta antes de cada petición.
// Su trabajo es tomar el token de localStorage y añadirlo a los encabezados.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
