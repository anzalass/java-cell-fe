import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  User,
  Mail,
  Key,
  MapPin,
  Filter,
  X,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import api from "../api/client"; // sesuaikan path API client
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function UserManagementPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // filter
  const [search, setSearch] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [role, setRole] = useState("");
  const [penempatan, setPenempatan] = useState("");
  const [penempatanQ, setPenempatanQ] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modal
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);

  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    useState(false);

  /* =============================
     FETCH USERS (React Query)
  ============================= */

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", page, pageSize, search, role, penempatan],
    queryFn: async () => {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("pageSize", pageSize);

      if (search) params.append("search", search);
      if (role) params.append("role", role);
      if (penempatan) params.append("penempatan", penempatan);

      const { data } = await api.get(`auth?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      return data;
    },
    keepPreviousData: true,
  });

  /* =============================
     DELETE USER
  ============================= */

  const deleteUserMutation = useMutation({
    mutationFn: (id) => api.delete(`auth/${id}`),

    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      Swal.fire({
        icon: "success",
        text: "User Berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
    },
  });

  /* =============================
     STATS
  ============================= */

  const stats = useMemo(() => {
    const totalUsers = users?.data?.length || 0;

    const adminCount =
      users?.data?.filter((u) => u.role === "admin").length || 0;

    const userCount = users?.data?.filter((u) => u.role === "user").length || 0;

    return { totalUsers, adminCount, userCount };
  }, [users]);

  /* =============================
     HANDLERS
  ============================= */

  const handleSearch = () => {
    setPage(1);
    setSearch(searchQ);
    setPenempatan(penempatanQ);
  };

  const handleReset = () => {
    setSearch("");
    setRole("");
    setSearchQ("");
    setPenempatan("");
    setPenempatanQ("");
    setPage(1);
  };

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus user ini? Tindakan tidak bisa dibatalkan!"))
      return;

    deleteUserMutation.mutate(id);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpenModal(true);
  };

  /* =============================
     LOADING / ERROR
  ============================= */

  if (isLoading) {
    return <div className="p-6 text-center">Memuat data user...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">Gagal memuat data user</div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      <div className="flex flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-base md:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-6 h-6" />
          Manajemen User
        </h1>
        {user.role === "Owner" && (
          <button
            onClick={() => {
              setEditUser(null);
              setOpenModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            User
          </button>
        )}
      </div>

      {/* STATS */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total User"
          value={stats.totalUsers}
          icon={<User className="w-5 h-5" />}
          color="text-blue-600"
        />
        <StatCard
          title="Admin"
          value={stats.adminCount}
          icon={<Key className="w-5 h-5" />}
          color="text-green-600"
        />
        <StatCard
          title="User Biasa"
          value={stats.userCount}
          icon={<User className="w-5 h-5" />}
          color="text-purple-600"
        />
      </div> */}

      {/* FILTER SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* SEARCH */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Nama / Email
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="John, john@email.com..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>
          {/* ROLE */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">Semua Role</option>
              <option value="Owner">Owner</option>
              <option value="Crew">Crew</option>
            </select>
          </div>
          {/* <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penempatan
            </label>

            <input
              type="text"
              value={penempatanQ}
              onChange={(e) => setPenempatanQ(e.target.value)}
              placeholder="Jakarta, Bandung..."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div> */}
          {/* ACTION BUTTON */}
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              Cari
            </button>

            <button
              onClick={handleReset}
              className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                {user.role === "Owner" && (
                  <th className="px-4 py-3 text-left">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data user
                  </td>
                </tr>
              ) : (
                users.data.map((userr, i) => (
                  <tr key={userr.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {userr.nama}
                    </td>
                    <td className="px-4 py-3 text-blue-600">{userr.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          userr.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {userr.role}
                      </span>
                    </td>

                    {user.role === "Owner" && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(userr)}
                            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(userr.id);
                              setIsUpdatePasswordModalOpen(true);
                              setUserData(user);
                            }}
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="Edit"
                          >
                            <Lock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(userr.id)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {users.meta && users.meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Menampilkan {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, users.meta.total)} dari{" "}
              {users.meta.total} user
            </span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-sm">
                Halaman {page} dari {users.meta.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= users.meta.totalPages}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <UserModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSubmitSuccess={() => queryClient.invalidateQueries(["users"])}
          user={editUser}
          token={user?.token}
        />
      )}

      <UpdatePasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => {
          setIsUpdatePasswordModalOpen(false);
          setEditingUserId(null);
        }}
        onUpdateSuccess={() => {}}
        userId={editingUserId}
        user={userData}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 ${color.replace("text", "bg").replace("600", "100")} rounded-lg`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

// Modal Form Component
function UserModal({ isOpen, onClose, onSubmitSuccess, user, token }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Reset form saat buka modal
  useEffect(() => {
    if (user) {
      reset({
        nama: user.nama,
        email: user.email,
        role: user.role,
        penempatan: user.penempatan || "",
        password: "", // Biarkan kosong untuk edit
      });
    } else {
      reset({
        nama: "",
        email: "",
        password: "",
        role: "user",
        penempatan: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      // Tampilkan loading
      Swal.fire({
        title: user ? "Memperbarui Akun..." : "Membuat Akun...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      if (user) {
        // Update
        await api.put(
          `auth/${user.id}`,
          {
            nama: data.nama,
            email: data.email,
            role: data.role,
            penempatan: data.penempatan || null,
            ...(data.password && { password: data.password }),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create
        await api.post(
          "auth",
          {
            nama: data.nama,
            email: data.email,
            password: data.password,
            role: data.role,
            penempatan: data.penempatan || null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      Swal.close();

      // Tampilkan sukses
      await Swal.fire({
        title: "Berhasil!",
        text: user
          ? "Data akun berhasil diperbarui."
          : "Akun baru berhasil dibuat.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      onSubmitSuccess();
      onClose();
    } catch (err) {
      Swal.close();

      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Terjadi kesalahan saat menyimpan data.";

      await Swal.fire({
        title: "Gagal Menyimpan",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {user ? "Edit User" : "Tambah User Baru"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register("nama", { required: "Nama wajib diisi" })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            {errors.nama && (
              <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                {...register("email", {
                  required: "Email wajib diisi",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Format email tidak valid",
                  },
                })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password (hanya untuk create atau reset) */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kata Sandi *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  {...register("password", {
                    required: "Kata sandi wajib diisi",
                    minLength: { value: 6, message: "Minimal 6 karakter" },
                  })}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              {...register("role", { required: "Role wajib dipilih" })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option selected value="">
                Pilih Role
              </option>
              <option value="Crew">Crew</option>
              <option value="Owner">Owner</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Penempatan */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penempatan
            </label>
            <select
              {...register("penempatan", {
                required: "Penempatan wajib dipilih",
              })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Java 1">Java 1</option>
              <option value="Java 2">Java 2</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">
                {errors.penempatan.message}
              </p>
            )}
          </div> */}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSubmitting ? "Menyimpan..." : user ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const UpdatePasswordModal = ({
  isOpen,
  onClose,
  onUpdateSuccess,
  userId,
  user,
}) => {
  if (!isOpen || !userId) return null;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (passwordData) =>
      api.put(`owner/users/${userId}/password`, passwordData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }),

    onSuccess: async () => {
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      onUpdateSuccess();
      onClose();
    },

    onError: async (error) => {
      const message =
        error.response?.data?.message || "Gagal memperbarui password";

      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    },
  });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      Swal.fire({
        icon: "error",
        text: "Password tidak sama ",
      });
      return;
    }
    updatePasswordMutation.mutate({ password: data.password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900">
            Update Password - {user.nama}
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
            <label className="block text-sm font-medium text-gray-700">
              Password Baru
            </label>

            <div className="relative">
              <input
                {...register("password", {
                  required: "Password wajib diisi",
                  minLength: {
                    value: 8,
                    message: "Password minimal 8 karakter",
                  },
                })}
                type={showPassword ? "text" : "password"}
                className={`w-full rounded-lg border px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${errors.password ? "border-red-500" : "border-gray-300"}`}
                placeholder="Minimal 8 karakter"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Konfirmasi Password Baru
            </label>

            <div className="relative">
              <input
                {...register("confirmPassword", {
                  required: "Konfirmasi password wajib diisi",
                  minLength: {
                    value: 8,
                    message: "Password minimal 8 karakter",
                  },
                })}
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full rounded-lg border px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                placeholder="Ulangi password baru"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg "
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
