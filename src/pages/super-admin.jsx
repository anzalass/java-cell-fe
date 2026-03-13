import React, { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Eye,
  EyeOff,
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Pencil,
  Lock,
} from "lucide-react";
import { format, isBefore, isToday } from "date-fns";
import { id } from "date-fns/locale";
import api from "../api/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ===== MODAL COMPONENTS (Extracted to prevent re-render/focus loss) =====

// Create Toko Modal
const CreateTokoModal = ({
  isOpen,
  onClose,
  onCreateSuccess,
  isEdit = false,
  toko,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      namaToko: "",
      alamat: "",
      noTelp: "",
      logoToko: undefined,
    },
  });

  // ✅ Reset form saat modal dibuka atau edit data berubah
  useEffect(() => {
    if (isOpen) {
      reset({
        namaToko: toko?.namaToko || "",
        alamat: toko?.alamat || "",
        noTelp: toko?.noTelp || "",
        logoToko: undefined,
      });
    }
  }, [isOpen, toko, reset]);

  const createTokoMutation = useMutation({
    mutationFn: async (formData) => {
      if (isEdit) {
        return api.put(`super-admin/toko/${toko.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return api.post("super-admin/toko", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success(
        isEdit ? "Toko berhasil diupdate!" : "Toko berhasil dibuat!"
      );
      queryClient.invalidateQueries({ queryKey: ["tokos"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      onCreateSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memproses toko");
    },
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("namaToko", data.namaToko);
    formData.append("alamat", data.alamat);
    formData.append("noTelp", data.noTelp);

    if (data.logoToko?.[0]) {
      formData.append("logoToko", data.logoToko[0]);
    }

    createTokoMutation.mutate(formData);
  };

  if (!isOpen) return null;

  const isLoading = isSubmitting || createTokoMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tambah Toko Baru
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Tutup modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Toko
            </label>
            <input
              {...register("namaToko", {
                required: "Nama toko wajib diisi",
                minLength: 2,
              })}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Contoh: Toko Berkah Jaya"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Alamat
            </label>
            <textarea
              {...register("alamat", {
                required: "Alamat wajib diisi",
                minLength: 10,
              })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Alamat lengkap toko"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              No. Telepon
            </label>
            <input
              {...register("noTelp", {
                required: "No. telepon wajib diisi",
                minLength: 10,
              })}
              type="tel"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="081234567890"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Logo Toko (Opsional)
            </label>
            <input
              {...register("logoToko")}
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500">Maks. 2MB, format JPG/PNG</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Simpan Toko"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add User Modal
const AddUserModal = ({ isOpen, onClose, onCreateSuccess, tokoId }) => {
  if (!isOpen || !tokoId) return null;

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      nama: "",
      email: "",
      password: "",
      role: "Crew",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (userData) =>
      api.post("super-admin/create-user", { idToko: tokoId, ...userData }),
    onSuccess: () => {
      toast.success("User berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      onCreateSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan user");
    },
  });

  const onSubmit = (data) => {
    createUserMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tambah User ke Toko
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Tutup modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Lengkap
            </label>
            <input
              {...register("nama", {
                required: "Nama wajib diisi",
                minLength: 2,
              })}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Nama user"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              {...register("email", {
                required: "Email wajib diisi",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Format email tidak valid",
                },
              })}
              type="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="user@contoh.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              {...register("password", {
                required: "Password wajib diisi",
                minLength: 8,
              })}
              type="password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              {...register("role")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Crew">Crew</option>
              <option value="Owner">Owner</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Tambah User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subscribe Modal
const SubscribeModal = ({ isOpen, onClose, onUpdateSuccess, tokoId }) => {
  if (!isOpen || !tokoId) return null;

  const [subscribeType, setSubscribeType] = useState("1 Bulan");
  const queryClient = useQueryClient();

  const updateSubscribeMutation = useMutation({
    mutationFn: (type) =>
      api.put(`super-admin/toko/${tokoId}/subscribe`, { type }),
    onSuccess: () => {
      toast.success("Berlangganan berhasil diperpanjang!");
      queryClient.invalidateQueries({ queryKey: ["tokos"] });
      onUpdateSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal memperpanjang berlangganan"
      );
    },
  });

  const handleUpdate = () => {
    updateSubscribeMutation.mutate(subscribeType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Perpanjang Berlangganan
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Tutup modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pilih Durasi
            </label>
            <select
              value={subscribeType}
              onChange={(e) => setSubscribeType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="1 Bulan">1 Bulan</option>
              <option value="3 Bulan">3 Bulan</option>
              <option value="6 Bulan">6 Bulan</option>
              <option value="1 Tahun">1 Tahun</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={updateSubscribeMutation.isPending}
            >
              Batal
            </button>
            <button
              onClick={handleUpdate}
              disabled={updateSubscribeMutation.isPending}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-70"
            >
              {updateSubscribeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Perpanjang Sekarang"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN DASHBOARD COMPONENT =====

const UpdateUserModal = ({ isOpen, onClose, onUpdateSuccess, user }) => {
  if (!isOpen || !user) return null;

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      nama: user.nama || "",
      email: user.email || "",
      role: user.role || "Crew",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData) => api.put(`super-admin/users/${user.id}`, userData),
    onSuccess: () => {
      toast.success("User berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["tokos"] });
      reset();
      onUpdateSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui user");
    },
  });

  const onSubmit = (data) => {
    updateUserMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Update User - {user.nama}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Lengkap
            </label>
            <input
              {...register("nama", {
                required: "Nama wajib diisi",
                minLength: 2,
              })}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Nama user"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              {...register("email", {
                required: "Email wajib diisi",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Format email tidak valid",
                },
              })}
              type="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="user@contoh.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              {...register("role")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Crew">Crew</option>
              <option value="Owner">Owner</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Password Modal
const UpdatePasswordModal = ({ isOpen, onClose, onUpdateSuccess, userId }) => {
  if (!isOpen || !userId) return null;

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (passwordData) =>
      api.put(`super-admin/users/${userId}/password`, passwordData),
    onSuccess: () => {
      toast.success("Password berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["tokos"] });
      reset();
      onUpdateSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui password"
      );
    },
  });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama!");
      return;
    }
    updatePasswordMutation.mutate({ password: data.password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Update Password
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password Baru
            </label>
            <input
              {...register("password", {
                required: "Password wajib diisi",
                minLength: 8,
              })}
              type="password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Konfirmasi Password Baru
            </label>
            <input
              {...register("confirmPassword", {
                required: "Konfirmasi password wajib diisi",
                minLength: 8,
              })}
              type="password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ulangi password baru"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== USER CARD COMPONENT =====
const UserCard = ({ user, formatDate, onEditUser, onEditPassword }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {user.nama.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {user.nama}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.role}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
              user.role === "Owner"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            }`}
          >
            {user.role}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
            <Mail size={16} className="flex-shrink-0" />
            <p className="text-sm truncate">{user.email}</p>
          </div>

          {user.toko && (
            <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
              <Building2 size={16} className="flex-shrink-0" />
              <p className="text-sm">{user.toko.namaToko}</p>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400 text-xs mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Calendar size={14} className="flex-shrink-0" />
            <span>Dibuat: {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            onClick={() => onEditUser(user)}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Pencil size={14} className="inline mr-1" /> Update User
          </button>
          <button
            onClick={() => onEditPassword(user.id)}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <Lock size={14} className="inline mr-1" /> Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN DASHBOARD COMPONENT =====
export default function SuperAdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isCreateTokoModalOpen, setIsCreateTokoModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedTokoId, setSelectedTokoId] = useState(null);

  // ✅ State untuk modal user (track user yang sedang di-edit)
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    useState(false);
  const [isEditToko, setIsEditToko] = useState(false);
  const [dataToko, setDataToko] = useState(null);

  const queryClient = useQueryClient();

  // Fetch Tokos with filters
  const { data: tokos = [], isLoading: loadingTokos } = useQuery({
    queryKey: ["tokos", searchQuery, activeFilter],
    queryFn: async () => {
      const res = await api.get(`super-admin/toko`, {
        params: {
          namaToko: searchQuery || undefined,
          isActive:
            activeFilter === "all" ? undefined : activeFilter === "active",
        },
      });
      return res.data.data;
    },
  });

  // Mutations
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      api.put(`super-admin/toko/${id}`, { isActive: !isActive }),
    onSuccess: (_, { isActive }) => {
      toast.success(
        `Toko berhasil ${isActive ? "dinonaktifkan" : "diaktifkan"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["tokos"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal mengubah status toko"
      );
    },
  });

  const deleteTokoMutation = useMutation({
    mutationFn: (id) => api.delete(`super-admin/toko/${id}`),
    onSuccess: () => {
      toast.success("Toko berhasil dinonaktifkan!");
      queryClient.invalidateQueries({ queryKey: ["tokos"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menghapus toko");
    },
  });

  const handleToggleActive = (id, currentStatus) => {
    if (toggleActiveMutation.isPending) return;
    toggleActiveMutation.mutate({ id, isActive: currentStatus });
  };

  const handleDeleteToko = (id) => {
    if (deleteTokoMutation.isPending) return;
    if (
      !confirm(
        "Yakin ingin menghapus toko ini? Operasi ini akan menonaktifkan toko."
      )
    )
      return;
    deleteTokoMutation.mutate(id);
  };

  const formatDate = (date) => {
    return format(new Date(date), "dd MMMM yyyy HH:mm", { locale: id });
  };

  const getSubscriptionStatus = (subscribeTime) => {
    const now = new Date();
    const expiryDate = new Date(subscribeTime);

    if (isBefore(expiryDate, now)) {
      return {
        text: "Expired",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      };
    }

    if (
      isToday(expiryDate) ||
      isBefore(expiryDate, new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000))
    ) {
      return {
        text: "Segera Expired",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
    }

    return {
      text: "Aktif",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  };

  // Loading state
  if (loadingTokos) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Super Admin Dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Kelola seluruh toko dan pengguna dalam sistem secara terpusat
          </p>
        </div>

        {/* Toko Management Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari toko berdasarkan nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>

              <button
                onClick={() => setIsCreateTokoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                <Plus size={20} /> Tambah Toko Baru
              </button>
            </div>
          </div>

          {/* Toko Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokos.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Belum ada toko
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tambahkan toko baru untuk memulai pengelolaan
                </p>
                <button
                  onClick={() => setIsCreateTokoModalOpen(true)}
                  className="mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium transition-colors"
                >
                  Tambah Toko Pertama
                </button>
              </div>
            ) : (
              tokos.map((toko) => {
                const status = getSubscriptionStatus(toko.SubscribeTime);
                return (
                  <div
                    key={toko.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {toko.logoToko ? (
                            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                              <img
                                src={toko.logoToko}
                                alt={toko.namaToko}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <span className="text-2xl font-bold text-blue-800 dark:text-blue-400">
                                {toko.namaToko.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                              {toko.namaToko}
                            </h3>
                            <div
                              className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                            >
                              {status.text}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex-shrink-0 w-3 h-3 rounded-full ${toko.isActive ? "bg-green-500" : "bg-red-500"}`}
                        />
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                        <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                        <p className="text-sm line-clamp-2">{toko.alamat}</p>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Phone size={18} className="flex-shrink-0" />
                        <p className="text-sm">{toko.noTelp}</p>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <Calendar size={18} className="flex-shrink-0" />
                        <p className="text-sm">
                          Berlangganan hingga:{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(toko.SubscribeTime)}
                          </span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedTokoId(toko.id);
                            setIsAddUserModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <UserPlus size={16} /> Tambah User
                        </button>

                        <button
                          onClick={() => {
                            setSelectedTokoId(toko.id);
                            setIsSubscribeModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <CreditCard size={16} /> Perpanjang
                        </button>

                        <button
                          onClick={() =>
                            handleToggleActive(toko.id, toko.isActive)
                          }
                          disabled={toggleActiveMutation.isPending}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            toko.isActive
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          } ${toggleActiveMutation.isPending ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          {toko.isActive ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                          {toko.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>

                        <button
                          onClick={() => handleDeleteToko(toko.id)}
                          disabled={deleteTokoMutation.isPending}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${deleteTokoMutation.isPending ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          <Trash2 size={16} /> Hapus
                        </button>

                        <button
                          onClick={() => {
                            setIsEditToko(true);
                            setDataToko(toko);
                          }}
                          disabled={deleteTokoMutation.isPending}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-red-50 rounded-lg transition-colors ${deleteTokoMutation.isPending ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                          <Pencil size={16} /> Update
                        </button>
                      </div>

                      {/* ✅ User List Section - TANPA MODAL DI DALAM LOOP */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Daftar User
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {toko.User?.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                              <Users className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                              Belum ada user
                            </div>
                          ) : (
                            toko.User?.map((user) => (
                              <UserCard
                                key={user.id}
                                user={user}
                                formatDate={formatDate}
                                onEditUser={(user) => {
                                  setEditingUser(user);
                                  setIsUpdateUserModalOpen(true);
                                }}
                                onEditPassword={(userId) => {
                                  setEditingUserId(userId);
                                  setIsUpdatePasswordModalOpen(true);
                                }}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ✅ MODALS - DI LUAR MAIN CONTENT (BUKAN DI DALAM .map()) */}
      <CreateTokoModal
        isOpen={isCreateTokoModalOpen}
        onClose={() => setIsCreateTokoModalOpen(false)}
        onCreateSuccess={() => {}}
      />

      <CreateTokoModal
        isOpen={isEditToko}
        onClose={() => setIsEditToko(false)}
        onCreateSuccess={() => {}}
        isEdit={isEditToko}
        toko={dataToko}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setSelectedTokoId(null);
        }}
        onCreateSuccess={() => {}}
        tokoId={selectedTokoId}
      />

      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => {
          setIsSubscribeModalOpen(false);
          setSelectedTokoId(null);
        }}
        onUpdateSuccess={() => {}}
        tokoId={selectedTokoId}
      />

      <UpdateUserModal
        isOpen={isUpdateUserModalOpen}
        onClose={() => {
          setIsUpdateUserModalOpen(false);
          setEditingUser(null);
        }}
        onUpdateSuccess={() => {}}
        user={editingUser}
      />

      <UpdatePasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => {
          setIsUpdatePasswordModalOpen(false);
          setEditingUserId(null);
        }}
        onUpdateSuccess={() => {}}
        userId={editingUserId}
      />
    </div>
  );
}
