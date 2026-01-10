// src/pages/member/ListMemberPage.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Phone,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { useDebounce } from "../components/use-debounce";

export default function ListMemberPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);

  // Filter state
  const [filterNama, setFilterNama] = useState("");
  const [filterNoTelp, setFilterNoTelp] = useState("");
  const [filterMinTransaksi, setFilterMinTransaksi] = useState("");
  const [filterMaxTransaksi, setFilterMaxTransaksi] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const resetPage = () => setPage(1);

  useEffect(() => {
    setPage(1);
  }, [perPage]);

  const debouncedSearchNama = useDebounce(filterNama, 1000);
  const debouncedTelp = useDebounce(filterNoTelp, 3000);

  // === QUERY: Fetch Members ===
  const {
    data: membersData,
    isLoading: loadingMembers,
    isError: isErrorMembers,
    error: errorMembers,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: [
      "members",
      debouncedSearchNama,
      debouncedTelp,
      filterMinTransaksi,
      filterMaxTransaksi,
      sortConfig,
      page,
      perPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterNama) params.append("search", filterNama);
      if (filterNoTelp) params.append("search", filterNoTelp);
      if (filterMinTransaksi)
        params.append("minTotalTransaksi", filterMinTransaksi);
      if (filterMaxTransaksi)
        params.append("maxTotalTransaksi", filterMaxTransaksi);
      params.append("sortBy", sortConfig.key);
      params.append("sortOrder", sortConfig.direction);
      params.append("page", page);
      params.append("pageSize", perPage);

      const res = await api.get(`member/filter?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTotalPages(res.data.meta?.totalPages || 1);
      return {
        members: res.data.data || [],
        totalMembers: res.data.totalMember,
        totalTransaksi: res.data.totalTrx?.totalTransaksi || 0,
      };
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  // === QUERY: Fetch Stats (opsional terpisah jika diperlukan) ===
  // Karena stats sudah ada di response members, kita tidak perlu query terpisah

  const members = membersData?.members || [];
  const stats = {
    totalMembers: membersData?.totalMembers || 0,
    totalTransaksi: membersData?.totalTransaksi || 0,
  };

  // === MUTATIONS ===
  const createMemberMutation = useMutation({
    mutationFn: (payload) =>
      api.post("member", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpenAdd(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Member berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal menambah member.",
        icon: "error",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.put(`member/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpenEdit(null);
      Swal.fire({
        title: "Berhasil!",
        text: "Member berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal memperbarui member.",
        icon: "error",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`member/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Member berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal menghapus member.",
        icon: "error",
      });
    },
  });

  // Handlers
  const handleSort = (uiKey) => {
    const fieldMap = {
      nama: "nama",
      noTelp: "noTelp",
      totalTransaksi: "totalTransaksi",
      dibuat: "createdAt",
    };
    const dbField = fieldMap[uiKey] || "createdAt";
    let direction = "asc";
    if (sortConfig.key === dbField && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: dbField, direction });
    resetPage();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Member ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      deleteMemberMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setFilterNama("");
    setFilterNoTelp("");
    setFilterMinTransaksi("");
    setFilterMaxTransaksi("");
    resetPage();
  };

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm();

  const openAddModal = () => {
    resetForm();
    setOpenAdd(true);
  };

  const saveAdd = (data) => {
    createMemberMutation.mutate({
      nama: data.nama,
      noTelp: data.noTelp || null,
      totalTransaksi: parseInt(data.totalTransaksi) || 0,
    });
  };

  const saveEdit = (data) => {
    updateMemberMutation.mutate({
      id: openEdit.id,
      payload: {
        nama: data.nama,
        noTelp: data.noTelp,
        totalTransaksi: parseInt(data.totalTransaksi),
      },
    });
  };

  // Format angka
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  // === RENDER ===
  const loading = loadingMembers;
  const error = isErrorMembers ? "Gagal memuat data member" : null;

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 p-4 md:p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-3xl font-bold text-gray-800">
                  Manajemen Member
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Kelola data pelanggan setia Anda
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              Tambah Member
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-rose-100 text-sm mb-1">Total Member</p>
                  <p className="text-4xl font-bold">{stats.totalMembers}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <UserCheck className="w-10 h-10" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-rose-50">
              <p className="text-xs text-rose-700">Pelanggan terdaftar</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">
                    Total Transaksi
                  </p>
                  <p className="text-3xl font-bold">
                    {formatRupiah(stats.totalTransaksi)}
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <TrendingUp className="w-10 h-10" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-emerald-50">
              <p className="text-xs text-emerald-700">Akumulasi semua member</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-lg text-gray-800">
              Filter & Pencarian
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Member
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filterNama}
                  onChange={(e) => setFilterNama(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none transition"
                  placeholder="Cari nama..."
                />
              </div>
            </div>

            {/* No Telepon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                No. Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filterNoTelp}
                  onChange={(e) => setFilterNoTelp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none transition"
                  placeholder="0812..."
                />
              </div>
            </div>

            {/* Min Transaksi */}
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
                  <th className="p-4 text-center font-semibold w-20">No</th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-rose-700 transition"
                    onClick={() => handleSort("nama")}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Nama Member
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-rose-700 transition"
                    onClick={() => handleSort("noTelp")}
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      No. Telepon
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-rose-700 transition"
                    onClick={() => handleSort("totalTransaksi")}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Total Transaksi
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-rose-700 transition"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal Dibuat
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="p-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada data member</p>
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr key={member.id} className="hover:bg-rose-50 transition">
                      <td className="p-4 text-center">
                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-semibold text-xs">
                          {(page - 1) * perPage + index + 1}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        {member.nama}
                      </td>
                      <td className="p-4 text-gray-600">
                        {member.noTelp ? (
                          <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {member.noTelp}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            -
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        {formatRupiah(member.totalTransaksi)}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              resetForm({
                                nama: member.nama,
                                noTelp: member.noTelp || "",
                                totalTransaksi:
                                  member.totalTransaksi.toString(),
                              });
                              setOpenEdit(member);
                            }}
                            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-md hover:shadow-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 border-t-2 border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Menampilkan{" "}
                <span className="font-semibold">{members.length}</span> dari{" "}
                <span className="font-semibold">{perPage}</span> data
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <div className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold text-sm">
                  {page} / {totalPages}
                </div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* MODAL TAMBAH */}
      {openAdd && (
        <MemberModal
          title="Tambah Member Baru"
          onClose={() => setOpenAdd(false)}
          onSubmit={handleSubmit(saveAdd)}
          register={register}
          errors={errors}
        />
      )}

      {/* MODAL EDIT */}
      {openEdit && (
        <MemberModal
          title="Edit Member"
          onClose={() => setOpenEdit(null)}
          onSubmit={handleSubmit(saveEdit)}
          register={register}
          errors={errors}
          defaultValues={{
            nama: openEdit.nama,
            noTelp: openEdit.noTelp || "",
            totalTransaksi: openEdit.totalTransaksi.toString(),
          }}
        />
      )}
    </div>
  );
}

// ========== MODAL ==========
function MemberModal({
  title,
  onClose,
  onSubmit,
  register,
  errors,
  defaultValues,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-5">{title}</h2>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Member *
            </label>
            <input
              {...register("nama", { required: "Wajib diisi" })}
              defaultValue={defaultValues?.nama || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ahmad Fauzi"
            />
            {errors.nama && (
              <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Telepon
            </label>
            <input
              {...register("noTelp", { required: "Wajib diisi" })}
              defaultValue={defaultValues?.noTelp || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="081234567890"
            />
            {errors.noTelp && (
              <p className="text-xs text-red-500 mt-1">
                {errors.noTelp.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Transaksi (Rp) *
            </label>
            <input
              type="number"
              {...register("totalTransaksi", {
                required: "Wajib diisi",
                min: { value: 0, message: "Minimal 0" },
              })}
              defaultValue={defaultValues?.totalTransaksi || "0"}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="250000"
            />
            {errors.totalTransaksi && (
              <p className="text-xs text-red-500 mt-1">
                {errors.totalTransaksi.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
