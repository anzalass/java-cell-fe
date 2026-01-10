// src/pages/StokVoucherPage.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import UpdateStokModal from "../components/update-stok";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";

export default function StokVoucherPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);
  const [updateStokItem, setUpdateStokItem] = useState(null);

  // Filter & Sort
  const [searchNama, setSearchNama] = useState("");
  const [searchquery, setSearchQuery] = useState("");
  const [brand, setBrand] = useState("");

  const [filterDibuat, setFilterDibuat] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const resetPage = () => setPage(1);
  const clearFilters = () => {
    setSearchNama("");
    setFilterDibuat("");
    setPage(1);
    setSearchQuery("");
  };

  // === QUERY: Fetch Voucher Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "vouchers",
      searchquery,
      filterDibuat,
      brand,
      sortConfig,
      page,
      perPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchquery) params.append("search", searchquery);
      if (filterDibuat) params.append("createdAt", filterDibuat);
      if (brand) params.append("brand", brand);

      params.append("sortBy", sortConfig.key);
      params.append("sortOrder", sortConfig.direction);
      params.append("page", page);
      params.append("pageSize", perPage);

      const res = await api.get(`vouchers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const data = queryData?.data || [];
  const totalPage = queryData?.meta?.totalPages;

  useEffect(() => {
    setPage(1);
  }, [perPage]);

  // === MUTATIONS ===
  const createVoucherMutation = useMutation({
    mutationFn: (formData) =>
      api.post("/vouchers", formData, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      setOpenAdd(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Voucher berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menambah voucher.",
        icon: "error",
      });
    },
  });

  const updateVoucherMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.put(`/vouchers/${id}`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      setOpenEdit(null);
      Swal.fire({
        title: "Berhasil!",
        text: "Voucher berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui voucher.",
        icon: "error",
      });
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Voucher berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus voucher.",
        icon: "error",
      });
    },
  });

  const updateStokMutation = useMutation({
    mutationFn: ({ id, tipe, stok }) =>
      api.patch(
        `/vouchers/${id}/stok`,
        { tipe, stok },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
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
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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
      deleteVoucherMutation.mutate(id);
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
    reset();
    setOpenAdd(true);
  };

  const saveAdd = (form) => {
    const today = new Date();
    const tanggal = today.toISOString().split("T")[0];
    createVoucherMutation.mutate({ ...form, tanggal });
  };

  const saveEdit = (form) => {
    updateVoucherMutation.mutate({
      id: openEdit.id,
      payload: form,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
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
        Gagal memuat data: {error?.message || "Terjadi kesalahan"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-3xl font-bold text-gray-800">
                  Manajemen Stok Voucher
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Kelola inventori voucher dengan mudah
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              Tambah Voucher
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg text-gray-800">
              Filter & Pencarian
            </h2>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cari Nama Paket
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchNama}
                    onChange={(e) => setSearchNama(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                    placeholder="6 GB, Harian, dll..."
                  />
                </div>
                <button
                  onClick={() => setSearchQuery(searchNama)}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Cari
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand / Provider
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value={""}>Semua</option>
                <option value={"Smartfren"}>Smartfren</option>
                <option value={"XL"}>XL</option>
                <option value={"Axis"}>Axis</option>
                <option value={"Indosat / IM3"}>Indosat / IM3</option>
                <option value={"Telkomsel"}>Telkomsel</option>
                <option value={"Tri"}>Tri</option>
              </select>
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
                  value={filterDibuat}
                  onChange={(e) => setFilterDibuat(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
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
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort("brand")}
                  >
                    <div className="flex items-center gap-2">
                      Brand
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-left font-semibold cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort("nama")}
                  >
                    <div className="flex items-center gap-2">
                      Nama Paket
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-center font-semibold cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort("stok")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Stok
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="p-4 text-center font-semibold">Penempatan</th>
                  <th className="p-4 text-right font-semibold">Modal</th>
                  <th className="p-4 text-right font-semibold">Harga Grosir</th>
                  <th className="p-4 text-right font-semibold">Harga Eceran</th>
                  <th className="p-4 text-left font-semibold">Dibuat</th>
                  <th className="p-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada data voucher</p>
                    </td>
                  </tr>
                ) : (
                  data.map((v) => (
                    <tr key={v.id} className="hover:bg-blue-50 transition">
                      <td className="p-4">
                        <span className="font-bold text-gray-800">
                          {v.brand}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-gray-700">
                        {v.nama}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            v.stok > 30
                              ? "bg-green-100 text-green-700"
                              : v.stok > 10
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {v.stok}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-600">
                        {v.penempatan}
                      </td>
                      <td className="p-4 text-right text-gray-600">
                        Rp {v.hargaPokok.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-right font-semibold text-blue-600">
                        Rp {v.hargaJual.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-right font-semibold text-indigo-600">
                        Rp {v.hargaEceran.toLocaleString("id-ID")}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {formatDate(v.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              reset(v);
                              setOpenEdit(v);
                            }}
                            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-md hover:shadow-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStok(v)}
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
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">{data.length}</span>{" "}
                dari <span className="font-semibold">{perPage}</span> data
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
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm">
                  {page} / {totalPage}
                </div>
                <button
                  disabled={page >= totalPage || data.length === 0}
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

      {/* MODALS */}
      {updateStokItem && (
        <UpdateStokModal
          isOpen={!!updateStokItem}
          type="voucher"
          onClose={() => setUpdateStokItem(null)}
          currentNama={updateStokItem.nama}
          currentStok={updateStokItem.stok}
          onSubmit={handleSimpanStok}
        />
      )}

      {openAdd && (
        <ModalForm
          title="Tambah Voucher Baru"
          onClose={() => setOpenAdd(false)}
          onSubmit={handleSubmit(saveAdd)}
          register={register}
          errors={errors}
        />
      )}

      {openEdit && (
        <ModalForm
          title="Edit Voucher"
          onClose={() => setOpenEdit(null)}
          onSubmit={handleSubmit(saveEdit)}
          register={register}
          errors={errors}
          isEdit={true}
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
}) {
  // Validasi custom untuk harga
  const validateHargaJual = (value, formValues) => {
    const hargaPokok = formValues.hargaPokok
      ? Number(formValues.hargaPokok)
      : 0;
    const hargaJual = Number(value);
    if (hargaJual < hargaPokok) {
      return "Harga grosir tidak boleh lebih kecil dari harga modal";
    }
    return true;
  };

  const validateHargaEceran = (value, formValues) => {
    const hargaJual = formValues.hargaJual ? Number(formValues.hargaJual) : 0;
    const hargaEceran = Number(value);
    if (hargaEceran < hargaJual) {
      return "Harga eceran tidak boleh lebih kecil dari harga grosir";
    }
    return true;
  };

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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <select
              {...register("brand", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih provider</option>
              <option value="Smartfren">Smartfren</option>
              <option value="Axis">Axis</option>
              <option value="Telkomsel">Telkomsel</option>
              <option value="Tri">Tri</option>
              <option value="Indosat / IM3">Indosat / IM3</option>
              <option value="XL">XL</option>
            </select>
            {errors.brand && (
              <p className="text-xs text-red-500 mt-1">Wajib diisi</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Paket *
            </label>
            <input
              {...register("nama", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6 GB 7 Hari"
            />
            {errors.nama && (
              <p className="text-xs text-red-500 mt-1">Wajib diisi</p>
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
              placeholder="100"
            />
            {errors.stok && (
              <p className="text-xs text-red-500 mt-1">Stok ≥ 0</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Harga Modal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Modal *
              </label>
              <input
                type="number"
                min="0"
                {...register("hargaPokok", {
                  required: true,
                  min: 0,
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12000"
              />
              {errors.hargaPokok && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.hargaPokok.message || "Harga modal wajib diisi"}
                </p>
              )}
            </div>

            {/* Harga Grosir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Grosir *
              </label>
              <input
                type="number"
                min="0"
                {...register("hargaJual", {
                  required: true,
                  min: 0,
                  valueAsNumber: true,
                  validate: (value) =>
                    validateHargaJual(value, {
                      hargaPokok: document.querySelector(
                        'input[name="hargaPokok"]'
                      )?.value,
                    }),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15000"
              />
              {errors.hargaJual && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.hargaJual.message || "Harga grosir wajib diisi"}
                </p>
              )}
            </div>

            {/* Harga Eceran */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Eceran *
              </label>
              <input
                type="number"
                min="0"
                {...register("hargaEceran", {
                  required: true,
                  min: 0,
                  valueAsNumber: true,
                  validate: (value) =>
                    validateHargaEceran(value, {
                      hargaJual: document.querySelector(
                        'input[name="hargaJual"]'
                      )?.value,
                    }),
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="18000"
              />
              {errors.hargaEceran && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.hargaEceran.message || "Harga eceran wajib diisi"}
                </p>
              )}
            </div>
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
              {isEdit ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
