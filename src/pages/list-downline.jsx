// src/pages/ListDownlinePage.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Hash,
  User,
} from "lucide-react";
import { useDebounce } from "../components/use-debounce";
export default function ListDownlinePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);

  // Filter state
  const [filterNama, setFilterNama] = useState("");
  const [filterKode, setFilterKode] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const resetPage = () => setPage(1);

  const debounceNama = useDebounce(filterNama, 1000);
  const debounceKode = useDebounce(filterKode, 1000);

  // === QUERY: Fetch Downline Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "downline",
      debounceKode,
      debounceNama,
      filterTanggal,
      sortConfig,
      page,
      perPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      const search = [filterNama, filterKode].filter(Boolean).join(" ");
      if (search) params.append("search", search.trim());
      if (filterTanggal) params.append("createdAt", filterTanggal);
      params.append("sortBy", sortConfig.key);
      params.append("sortOrder", sortConfig.direction);
      params.append("page", page);
      params.append("pageSize", perPage);

      const res = await api.get(`downline?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTotalPages(res.data.meta?.totalPages || 1);
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const downlines = queryData?.data || [];

  useEffect(() => {
    setPage(1);
  }, [perPage]);

  // === MUTATIONS ===
  const createDownlineMutation = useMutation({
    mutationFn: (payload) =>
      api.post("downline", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downline"] });
      setOpenAdd(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Downline berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menambah downline.",
        icon: "error",
      });
    },
  });

  const updateDownlineMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.put(`downline/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downline"] });
      setOpenEdit(null);
      Swal.fire({
        title: "Berhasil!",
        text: "Downline berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui downline.",
        icon: "error",
      });
    },
  });

  const deleteDownlineMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`downline/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downline"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Downline berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus downline.",
        icon: "error",
      });
    },
  });

  // Handlers
  const handleSort = (uiKey) => {
    const fieldMap = {
      kodeDownline: "kodeDownline",
      namaDownline: "nama",
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
      text: "Downline ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      deleteDownlineMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setFilterNama("");
    setFilterKode("");
    setFilterTanggal("");
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
    createDownlineMutation.mutate({
      kodeDownline: data.kodeDownline,
      nama: data.namaDownline,
    });
  };

  const saveEdit = (data) => {
    updateDownlineMutation.mutate({
      id: openEdit.id,
      payload: {
        kodeDownline: data.kodeDownline,
        nama: data.namaDownline,
      },
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  // === RENDER ===
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Gagal memuat data: {error?.message || "Terjadi kesalahan"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  List Downline
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Kelola jaringan downline Anda
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              Tambah Downline
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-violet-600" />
            <h2 className="font-bold text-lg text-gray-800">
              Filter & Pencarian
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Downline
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filterNama}
                  onChange={(e) => setFilterNama(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition"
                  placeholder="Cari nama..."
                />
              </div>
            </div>

            {/* Kode Downline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kode Downline
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filterKode}
                  onChange={(e) => setFilterKode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none transition"
                  placeholder="DL001, dll..."
                />
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Dibuat
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filterTanggal}
                  onChange={(e) => setFilterTanggal(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Per Page */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item per Halaman
              </label>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-violet-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
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

        {/* Stats Summary */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-violet-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Downline</p>
                <p className="text-3xl font-bold text-violet-600">
                  {downlines.length}
                </p>
              </div>
              <div className="bg-violet-100 p-4 rounded-xl">
                <Users className="w-8 h-8 text-violet-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aktif Bulan Ini</p>
                <p className="text-3xl font-bold text-purple-600">
                  {downlines.length - 1}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-fuchsia-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Terdaftar Baru</p>
                <p className="text-3xl font-bold text-fuchsia-600">1</p>
              </div>
              <div className="bg-fuchsia-100 p-4 rounded-xl">
                <Plus className="w-8 h-8 text-fuchsia-600" />
              </div>
            </div>
          </div>
        </div> */}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  <th className="p-4 text-center font-semibold w-20">No</th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-violet-700 transition"
                    onClick={() => handleSort("kodeDownline")}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Kode Downline
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-violet-700 transition"
                    onClick={() => handleSort("nama")}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nama Downline
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-violet-700 transition"
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
                {downlines.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada data downline</p>
                    </td>
                  </tr>
                ) : (
                  downlines.map((item, index) => (
                    <tr key={item.id} className="hover:bg-violet-50 transition">
                      <td className="p-4 text-center">
                        <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-semibold text-xs">
                          {(page - 1) * perPage + index + 1}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold">
                          {item.kodeDownline}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {item.nama}
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              resetForm({
                                kodeDownline: item.kodeDownline,
                                namaDownline: item.nama,
                              });
                              setOpenEdit(item);
                            }}
                            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-md hover:shadow-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                <span className="font-semibold">{downlines.length}</span> dari{" "}
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
                <div className="px-4 py-2 bg-violet-600 text-white rounded-lg font-semibold text-sm">
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
        <DownlineModal
          title="Tambah Downline Baru"
          onClose={() => setOpenAdd(false)}
          onSubmit={handleSubmit(saveAdd)}
          register={register}
          errors={errors}
        />
      )}

      {/* MODAL EDIT */}
      {openEdit && (
        <DownlineModal
          title="Edit Downline"
          onClose={() => setOpenEdit(null)}
          onSubmit={handleSubmit(saveEdit)}
          register={register}
          errors={errors}
          defaultValues={{
            kodeDownline: openEdit.kodeDownline,
            namaDownline: openEdit.nama,
          }}
        />
      )}
    </div>
  );
}

// ========== MODAL ==========
function DownlineModal({
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
              Kode Downline *
            </label>
            <input
              {...register("kodeDownline", { required: "Wajib diisi" })}
              defaultValue={defaultValues?.kodeDownline || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DL001"
            />
            {errors.kodeDownline && (
              <p className="text-xs text-red-500 mt-1">
                {errors.kodeDownline.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Downline *
            </label>
            <input
              {...register("namaDownline", { required: "Wajib diisi" })}
              defaultValue={defaultValues?.namaDownline || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ahmad Fauzi"
            />
            {errors.namaDownline && (
              <p className="text-xs text-red-500 mt-1">
                {errors.namaDownline.message}
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
