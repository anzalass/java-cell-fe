// src/stores/useAuthStore.js
import { create } from "zustand";
import api from "../api/client";

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false, // ✅ ganti jadi isLoading (konsisten)
  isCheckingAuth: true, // ✅ tambahkan status pengecekan

  setUser: (userData) => set({ user: userData, isCheckingAuth: false }),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("me");
      set({
        user: res.data || res.data,
        isCheckingAuth: false,
        isLoading: false,
      });
    } catch (err) {
      console.error("Fetch user error:", err);
      set({
        user: null,
        isCheckingAuth: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await api.post("auth/logout");
    } catch (err) {
      console.warn("Logout gagal:", err);
    } finally {
      set({ user: null, isCheckingAuth: false });
    }
  },
}));
