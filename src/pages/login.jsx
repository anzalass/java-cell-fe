import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const { user, isCheckingAuth, fetchUser } = useAuthStore();

  // ✅ Redirect jika sudah login
  if (!isCheckingAuth && user) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  // ✅ Tampilkan loading jika sedang mengecek auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Memeriksa sesi...
      </div>
    );
  }

  const nav = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Tampilkan loading
      Swal.fire({
        title: "Masuk...",
        text: "Memproses login Anda",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await api.post("auth/login", {
        email: data.username,
        password: data.password,
      });

      Swal.close();

      // Opsional: tampilkan notifikasi sukses singkat
      await Swal.fire({
        title: "Login Berhasil!",
        text: "Selamat datang kembali!",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });

      fetchUser();
      nav("/dashboard/overview");
    } catch (error) {
      Swal.close();

      let errorMsg = "Email atau password salah.";

      // Jika error dari backend menyediakan pesan spesifik
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMsg = "Email atau password salah.";
      } else if (error.response?.status === 404) {
        errorMsg = "Akun tidak ditemukan.";
      } else if (error.message === "Network Error") {
        errorMsg =
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      }

      await Swal.fire({
        title: "Login Gagal",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "OK",
      });

      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="mx-auto bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Selamat Datang</h1>
          <p className="text-gray-600 mt-2">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username/Email */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  {...register("username", {
                    required: "Username/email wajib diisi",
                    minLength: { value: 3, message: "Minimal 3 karakter" },
                  })}
                  className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.username
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-indigo-200"
                  } transition-colors`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Kata sandi wajib diisi",
                    minLength: { value: 6, message: "Minimal 6 karakter" },
                  })}
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-indigo-200"
                  } transition-colors`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Ingat saya
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Lupa kata sandi?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          {/* Divider */}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Nama Perusahaan. All rights reserved.
        </div>
      </div>
    </div>
  );
}
