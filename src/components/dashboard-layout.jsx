// src/layouts/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Outlet, Navigate } from "react-router-dom";
import { navItems } from "../data/nav-items";
import Sidebar from "./sidebar";
import { useAuthStore } from "../store/useAuthStore";

export default function DashboardLayout() {
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  // ✅ Jalankan fetchUser saat komponen mount
  useEffect(() => {
    fetchUser();
  }, []);

  console.log(user);

  // Sinkronkan sidebar
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  // ✅ Tampilkan loading saat sedang mengecek auth
  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Memeriksa sesi...
      </div>
    );
  }

  // ✅ Redirect hanya jika sudah selesai pengecekan dan user null
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen transition-all duration-300">
      <Sidebar
        navItems={navItems}
        isCollapsed={!sidebarOpen && isDesktop}
        isMobile={!isDesktop}
        sidebarOpen={sidebarOpen}
        onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
      />

      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`w-full flex flex-col transition-all duration-300 ${
          isDesktop ? (sidebarOpen ? "ml-64" : "ml-16") : "ml-0"
        }`}
      >
        <header className="sticky shadow-xl top-0 z-20 flex items-center justify-between bg-white p-4">
          <div className="flex space-x-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 text-xl"
            >
              ☰
            </button>
            <p className="mt-3">{user?.nama}</p>
          </div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>

        <div className="-mt-6 p-2 md:p-6 transition-all duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
