import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ refresh token otomatis (jika kamu pakai refresh token di backend)

export default api;
