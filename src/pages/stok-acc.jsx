// src/pages/StokBarangAksesorisPage.jsx
import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import UpdateStokModal from "../components/update-stok";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function StokBarangAksesorisPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);
  const [updateStokItem, setUpdateStokItem] = useState(null);

  // Filter state
  const [searchNama, setSearchNama] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterBarcode, setFilterBarcode] = useState("all");
  const [filterDibuat, setFilterDibuat] = useState("");
  const [filterDiupdate, setFilterDiupdate] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const resetPage = () => setPage(1);

  // === QUERY: Fetch Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "acc",
      searchNama,
      filterBrand,
      filterBarcode,
      filterDibuat,
      filterDiupdate,
      sortConfig,
      page,
      perPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchNama) params.append("search", searchNama);
      if (filterBrand) params.append("brand", filterBrand);
      params.append("filterBarcode", filterBarcode);
      if (filterDibuat) params.append("createdAt", filterDibuat);
      if (filterDiupdate) params.append("updatedAt", filterDiupdate);
      params.append("sortBy", sortConfig.key);
      params.append("sortOrder", sortConfig.direction);
      params.append("page", page);
      params.append("pageSize", perPage);

      const res = await api.get(`/acc?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const data = queryData?.data || [];
  const totalPage = queryData?.meta?.totalPages || 1;

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: (payload) =>
      api.post("acc", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acc"] });
      setOpenAdd(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Barang berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menambah barang.",
        icon: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.put(`acc/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acc"] });
      setOpenEdit(null);
      Swal.fire({
        title: "Berhasil!",
        text: "Barang berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui barang.",
        icon: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`acc/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acc"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Barang berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus barang.",
        icon: "error",
      });
    },
  });

  const updateStokMutation = useMutation({
    mutationFn: ({ id, tipe, stok }) =>
      api.patch(
        `acc/${id}/stok`,
        { tipe, stok },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acc"] });
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
      diupdate: "updatedAt",
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
      deleteMutation.mutate(id);
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

  const saveAdd = (form) => {
    createMutation.mutate({
      ...form,
      kategori: form.kategori || "Umum",
      stok: Number(form.stok),
      hargaModal: Number(form.hargaModal),
      hargaJual: Number(form.hargaJual),
    });
  };

  const saveEdit = (form) => {
    updateMutation.mutate({
      id: openEdit.id,
      payload: {
        ...form,
        stok: Number(form.stok),
        hargaModal: Number(form.hargaModal),
        hargaJual: Number(form.hargaJual),
      },
    });
  };

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
        Gagal memuat data: {error?.message || "Terjadi kesalahan"}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Manajemen Stok Aksesoris
      </h1>

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              placeholder="Charger..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Brand
            </label>
            <input
              type="text"
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                resetPage();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Vivan, Baseus..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode
            </label>
            <select
              value={filterBarcode}
              onChange={(e) => {
                setFilterBarcode(e.target.value);
                resetPage();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua</option>
              <option value="with">Dengan Barcode</option>
              <option value="without">Tanpa Barcode</option>
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <button
              onClick={openAddModal}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Tambah Barang
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Tanggal Diupdate
            </label>
            <input
              type="date"
              value={filterDiupdate}
              onChange={(e) => {
                setFilterDiupdate(e.target.value);
                resetPage();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("barcode")}
              >
                Barcode
                {sortConfig.key === "barcode" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
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
                Nama Barang
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
              <th className="p-4 text-right">Modal</th>
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
                onClick={() => handleSort("dibuat")}
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
                onClick={() => handleSort("diupdate")}
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
                <td colSpan={10} className="text-center py-8 text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-gray-800">
                    {item.barcode || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    {item.brand}
                  </td>
                  <td className="p-4">{item.nama}</td>
                  <td className="p-4 text-center font-medium">{item.stok}</td>
                  <td className="p-4 text-center font-medium">
                    {item.penempatan}
                  </td>
                  <td className="p-4 text-right text-green-700">
                    Rp {item.hargaModal.toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-right font-medium text-blue-700">
                    Rp {item.hargaJual.toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(item.updatedAt)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          reset(item);
                          setOpenEdit(item);
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded hover:bg-amber-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded hover:bg-rose-700"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => handleUpdateStok(item)}
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
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-gray-600">
          Menampilkan {data.length} data
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Baris/halaman:</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Sebelumnya
          </button>
          <span className="text-sm font-medium">
            {page} / {totalPage}
          </span>
          <button
            disabled={page >= totalPage}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Berikutnya
          </button>
        </div>
      </div>

      {/* Modals */}
      {updateStokItem && (
        <UpdateStokModal
          isOpen={!!updateStokItem}
          type={"acc"}
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
