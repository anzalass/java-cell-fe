// src/pages/StokBarangSparepartPage.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import UpdateStokModal from "../components/update-stok";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Wrench,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Barcode,
  Tag,
} from "lucide-react";

export default function StokBarangSparepartPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);
  const [updateStokItem, setUpdateStokItem] = useState(null);

  // Filter state
  const [searchNama, setSearchNama] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [brandQuery, setFilterBrandQuery] = useState("");
  const [filterBarcode, setFilterBarcode] = useState("all");
  const [filterDibuat, setFilterDibuat] = useState("");
  const [filterDiupdate, setFilterDiupdate] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  const resetPage = () => setPage(1);

  // === QUERY: Fetch Sparepart Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "sparepart",
      searchQuery,
      brandQuery,
      filterBarcode,
      filterDibuat,
      filterDiupdate,
      sortConfig,
      page,
      perPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (brandQuery) params.append("brand", brandQuery);
      params.append("filterBarcode", filterBarcode);
      if (filterDibuat) params.append("createdAt", filterDibuat);
      if (filterDiupdate) params.append("updatedAt", filterDiupdate);
      params.append("sortBy", sortConfig.key);
      params.append("sortOrder", sortConfig.direction);
      params.append("page", page);
      params.append("pageSize", perPage);

      const res = await api.get(`/sparepart?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setTotalPage(res.data.meta?.totalPages || 1);
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const clearFilters = () => {
    setSearchNama("");
    setSearchQuery("");
    setFilterBrandQuery("");
    setFilterBrand("");
    setFilterBarcode("all");
    setFilterDibuat("");
    setFilterDiupdate("");
  };

  const data = queryData?.data || [];

  useEffect(() => {
    setPage(1);
  }, [perPage]);

  // === MUTATIONS ===
  const createSparepartMutation = useMutation({
    mutationFn: (payload) =>
      api.post("sparepart", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sparepart"] });
      setOpenAdd(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Sparepart berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menambah sparepart.",
        icon: "error",
      });
    },
  });

  const updateSparepartMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.put(`sparepart/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sparepart"] });
      setOpenEdit(null);
      Swal.fire({
        title: "Berhasil!",
        text: "Sparepart berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui sparepart.",
        icon: "error",
      });
    },
  });

  const deleteSparepartMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`sparepart/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sparepart"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Sparepart berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus sparepart.",
        icon: "error",
      });
    },
  });

  const updateStokMutation = useMutation({
    mutationFn: ({ id, tipe, stok }) =>
      api.patch(
        `sparepart/${id}/stok`,
        { tipe, stok },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sparepart"] });
      setUpdateStokItem(null);
      Swal.fire({
        title: "Stok Diperbarui!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal update stok.",
        icon: "error",
      });
    },
  });

  // Handlers
  const handleSort = (uiKey) => {
    const fieldMap = {
      barcode: "barcode",
      brand: "brand",
      nama: "nama",
      stok: "stok",
      penempatan: "penempatan",
      hargaJual: "hargaJual",
      dibuat: "createdAt",
      diupdate: "updatedAt", // ✅ perbaiki typo: "updateAt" → "updatedAt"
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
      text: "Data ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      deleteSparepartMutation.mutate(id);
    }
  };

  const handleUpdateStok = (item) => setUpdateStokItem(item);

  const handleSimpanStok = (delta) => {
    const tipe = delta > 0 ? "tambah" : "kurang";
    const stok = Math.abs(delta);
    updateStokMutation.mutate({
      id: updateStokItem.id,
      tipe,
      stok,
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const openAddModal = () => {
    reset({
      brand: "",
      barcode: "",
      nama: "",
      kategori: "",
      stok: "",
      hargaModal: "",
      hargaJual: "",
    });
    setOpenAdd(true);
  };

  const saveAdd = (form) => {
    createSparepartMutation.mutate({
      ...form,
      kategori: form.kategori || "Umum",
      stok: Number(form.stok),
      hargaModal: Number(form.hargaModal),
      hargaJual: Number(form.hargaJual),
    });
  };

  const saveEdit = (form) => {
    updateSparepartMutation.mutate({
      id: openEdit.id,
      payload: {
        ...form,
        stok: Number(form.stok),
        hargaModal: Number(form.hargaModal),
        hargaJual: Number(form.hargaJual),
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        Gagal memuat {error?.message || "Terjadi kesalahan"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-3xl font-bold text-gray-800">
                  Manajemen Stok Sparepart
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Kelola inventori sparepart dan aksesoris
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              Tambah Barang
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-lg text-gray-800">
              Filter & Pencarian
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Cari Nama Barang
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchNama}
                  onChange={(e) => setSearchNama(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Charger, Kabel..."
                />
              </div>

              <button
                onClick={() => setSearchQuery(searchNama)}
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                disabled={!searchNama.trim()}
              >
                Cari Nama
              </button>
            </div>

            {/* Search Brand */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Cari Brand
              </label>

              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Vivan, Baseus..."
                />
              </div>

              <button
                onClick={() => setFilterBrandQuery(filterBrand)}
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                disabled={!filterBrand.trim()}
              >
                Cari Brand
              </button>
            </div>
            {/* Barcode Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter Barcode
              </label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterBarcode}
                  onChange={(e) => setFilterBarcode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none appearance-none"
                >
                  <option value="all">Semua</option>
                  <option value="with">Dengan Barcode</option>
                  <option value="without">Tanpa Barcode</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Created */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Dibuat
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filterDibuat}
                  onChange={(e) => setFilterDibuat(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Date Updated */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Diupdate
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filterDiupdate}
                  onChange={(e) => setFilterDiupdate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
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

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-purple-700 transition"
                    onClick={() => handleSort("barcode")}
                  >
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4" />
                      Barcode
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-purple-700 transition"
                    onClick={() => handleSort("brand")}
                  >
                    <div className="flex items-center gap-2">
                      Brand
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-purple-700 transition"
                    onClick={() => handleSort("nama")}
                  >
                    <div className="flex items-center gap-2">
                      Nama Barang
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-center font-semibold cursor-pointer hover:bg-purple-700 transition"
                    onClick={() => handleSort("stok")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Stok
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="p-4 text-center font-semibold">Penempatan</th>
                  <th className="p-4 text-right font-semibold">Modal</th>
                  <th className="p-4 text-right font-semibold">Harga Jual</th>
                  <th className="p-4 text-left font-semibold">Dibuat</th>
                  <th className="p-4 text-left font-semibold">Diupdate</th>
                  <th className="p-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-12 text-gray-500"
                    >
                      <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada data sparepart</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50 transition">
                      <td className="p-4">
                        {item.barcode ? (
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
                            {item.barcode}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            Tidak ada
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-800">
                          {item.brand}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-700">
                        {item.nama}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.stok > 20
                              ? "bg-green-100 text-green-700"
                              : item.stok > 10
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.stok}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-600">
                        {item.penempatan}
                      </td>
                      <td className="p-4 text-right text-gray-600">
                        Rp {item.hargaModal.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-right font-semibold text-purple-600">
                        Rp {item.hargaJual.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-gray-600 text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-4 text-gray-600 text-xs">
                        {formatDate(item.updatedAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              reset(item);
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
                          <button
                            onClick={() => handleUpdateStok(item)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
                            title="Update Stok"
                          >
                            <TrendingUp className="w-4 h-4" />
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
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Baris/halaman:</span>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                >
                  {[1, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold">{data.length}</span> data
                </span>
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
                <div className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm">
                  {page} / {totalPage}
                </div>
                <button
                  disabled={page >= totalPage}
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
      {updateStokItem && (
        <UpdateStokModal
          isOpen={!!updateStokItem}
          type={"sparepart"}
          onClose={() => setUpdateStokItem(null)}
          currentNama={updateStokItem.nama}
          currentStok={updateStokItem.stok}
          onSubmit={handleSimpanStok}
        />
      )}

      {openAdd && (
        <ModalForm
          title="Tambah Barang Baru"
          onClose={() => setOpenAdd(false)}
          onSubmit={handleSubmit(saveAdd)}
          register={register}
          errors={errors}
          showKategori={true}
        />
      )}

      {openEdit && (
        <ModalForm
          title="Edit Barang"
          onClose={() => setOpenEdit(null)}
          onSubmit={handleSubmit(saveEdit)}
          register={register}
          errors={errors}
          isEdit={true}
          showKategori={true}
        />
      )}
    </div>
  );
}

// ========== MODAL FORM ==========
function ModalForm({
  title,
  onClose,
  onSubmit,
  register,
  errors,
  isEdit = false,
  showKategori = false,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Tutup"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-5">{title}</h2>

        <form onSubmit={(e) => e.preventDefault()}>
          {showKategori && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori *
              </label>
              <input
                {...register("kategori", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Aksesoris, Kabel, dll"
              />
              {errors.kategori && (
                <p className="text-xs text-red-500 mt-1">
                  Kategori wajib diisi
                </p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <input
              {...register("brand", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Vivan, Baseus, dsb"
            />
            {errors.brand && (
              <p className="text-xs text-red-500 mt-1">Brand wajib diisi</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode <span className="text-gray-500">(opsional)</span>
            </label>
            <input
              {...register("barcode")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A001"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Barang *
            </label>
            <input
              {...register("nama", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Charger Vivan Fast"
            />
            {errors.nama && (
              <p className="text-xs text-red-500 mt-1">Nama wajib diisi</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stok *
            </label>
            <input
              type="number"
              min="0"
              {...register("stok", {
                required: true,
                min: 0,
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
            />
            {errors.stok && (
              <p className="text-xs text-red-500 mt-1">Stok harus ≥ 0</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Modal *
              </label>
              <input
                type="number"
                min="0"
                {...register("hargaModal", {
                  required: true,
                  min: 0,
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="45000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual *
              </label>
              <input
                type="number"
                min="0"
                {...register("hargaJual", {
                  required: true,
                  min: 0,
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="55000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              {isEdit ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
