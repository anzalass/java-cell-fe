// src/pages/ListDownlinePage.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

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
      filterNama,
      filterKode,
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
    <div className="p-4 sm:p-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">List Downline</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Tambah Downline
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Downline
          </label>
          <input
            type="text"
            value={filterNama}
            onChange={(e) => {
              setFilterNama(e.target.value);
              resetPage();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cari nama..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kode Downline
          </label>
          <input
            type="text"
            value={filterKode}
            onChange={(e) => {
              setFilterKode(e.target.value);
              resetPage();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="DL001, dll..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Dibuat
          </label>
          <input
            type="date"
            value={filterTanggal}
            onChange={(e) => {
              setFilterTanggal(e.target.value);
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
            className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
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
              <th className="p-4 text-center">No</th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("kodeDownline")}
              >
                Kode Downline
                {sortConfig.key === "kodeDownline" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("namaDownline")}
              >
                Nama Downline
                {sortConfig.key === "nama" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("dibuat")}
              >
                Tanggal Dibuat
                {sortConfig.key === "createdAt" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {downlines.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Tidak ada data downline
                </td>
              </tr>
            ) : (
              downlines.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 text-center">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="p-4 font-mono font-medium text-gray-800">
                    {item.kodeDownline}
                  </td>
                  <td className="p-4">{item.nama}</td>
                  <td className="p-4 text-gray-600">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          resetForm({
                            kodeDownline: item.kodeDownline,
                            namaDownline: item.nama,
                          });
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
          Halaman {page} dari {Math.max(1, totalPages)}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Berikutnya
        </button>
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
