// src/pages/StokVoucherPage.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import UpdateStokModal from "../components/update-stok";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function StokVoucherPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);
  const [updateStokItem, setUpdateStokItem] = useState(null);

  // Filter & Sort
  const [searchNama, setSearchNama] = useState("");
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
  };

  // === QUERY: Fetch Voucher Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vouchers", searchNama, filterDibuat, sortConfig, page, perPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchNama) params.append("search", searchNama);
      if (filterDibuat) params.append("createdAt", filterDibuat);
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
  const totalPage = Math.ceil((data.length || 0) / perPage);

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
    <div className="p-4 sm:p-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Manajemen Stok Voucher
        </h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Tambah Voucher
        </button>
      </div>

      {/* Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cari Nama
          </label>
          <input
            type="text"
            value={searchNama}
            onChange={(e) => {
              setSearchNama(e.target.value);
              resetPage();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="6 GB, Harian, dll..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Dibuat
          </label>
          <input
            type="date"
            value={filterDibuat}
            onChange={(e) => {
              setFilterDibuat(e.target.value);
              resetPage();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item per Halaman
          </label>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md w-full"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("brand")}
              >
                Brand
                {sortConfig.key === "brand" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("nama")}
              >
                Nama Paket
                {sortConfig.key === "nama" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-center cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("stok")}
              >
                Stok
                {sortConfig.key === "stok" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-center cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("penempatan")}
              >
                Penempatan
                {sortConfig.key === "penempatan" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-right cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("hargaPokok")}
              >
                Modal
                {sortConfig.key === "hargaPokok" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-right cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("hargaJual")}
              >
                Harga Jual
                {sortConfig.key === "hargaJual" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("createdAt")}
              >
                Dibuat
                {sortConfig.key === "createdAt" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("updatedAt")}
              >
                Diupdate
                {sortConfig.key === "updatedAt" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{v.brand}</td>
                  <td className="p-4">{v.nama}</td>
                  <td className="p-4 text-center font-medium">{v.stok}</td>
                  <td className="p-4">{v.penempatan}</td>
                  <td className="p-4 text-right text-green-700">
                    Rp {v.hargaPokok.toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-right font-medium text-blue-700">
                    Rp {v.hargaJual.toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(v.createdAt)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(v.updatedAt)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          reset(v);
                          setOpenEdit(v);
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded hover:bg-amber-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded hover:bg-rose-700"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => handleUpdateStok(v)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Update Stok
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
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Sebelumnya
        </button>
        <span className="text-sm font-medium">
          Halaman {page} dari {Math.max(1, totalPage)}
        </span>
        <button
          disabled={page >= totalPage || data.length === 0}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Berikutnya
        </button>
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
                placeholder="15000"
              />
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
