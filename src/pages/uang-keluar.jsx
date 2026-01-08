// src/pages/UangModalPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Calendar,
  Wallet,
  TrendingUp,
  X,
} from "lucide-react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function UangModalPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Filter state
  const [searchKeterangan, setSearchKeterangan] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Helpers
  const today = new Date().toISOString().slice(0, 10);
  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay() || 7;
    const diff = d.getDate() - day + 1;
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
  };
  const getStartOfMonth = () => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  };

  // === QUERY: Fetch Uang Modal Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "uangModal",
      page,
      pageSize,
      searchKeterangan,
      filterPeriod,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", pageSize);
      if (searchKeterangan) params.append("search", searchKeterangan);

      let startDate = "",
        endDate = "";
      if (filterPeriod === "today") {
        startDate = today;
        endDate = today;
      } else if (filterPeriod === "week") {
        startDate = getStartOfWeek();
        endDate = today;
      } else if (filterPeriod === "month") {
        startDate = getStartOfMonth();
        endDate = today;
      } else if (filterPeriod === "custom") {
        startDate = dateFrom;
        endDate = dateTo;
      }
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`/uang-modal?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const data = queryData || { data: [], meta: { total: 0, totalPages: 1 } };

  // Stats
  const stats = useMemo(() => {
    const totalTransaksi = data.data?.length || 0;
    const totalJumlah =
      data.data?.reduce((sum, item) => sum + item.jumlah, 0) || 0;
    return { totalTransaksi, totalJumlah };
  }, [data]);

  // === MUTATIONS ===
  const createUangModalMutation = useMutation({
    mutationFn: (payload) =>
      api.post("/uang-modal", payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uangModal"] });
      setOpenModal(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Uang modal berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menambah uang modal.",
        icon: "error",
      });
    },
  });

  const updateUangModalMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.put(`/uang-modal/${id}`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uangModal"] });
      setOpenModal(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Uang modal berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui uang modal.",
        icon: "error",
      });
    },
  });

  const deleteUangModalMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/uang-modal/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uangModal"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Uang modal berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus uang modal.",
        icon: "error",
      });
    },
  });

  // Handlers
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data uang modal ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      deleteUangModalMutation.mutate(id);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setOpenModal(true);
  };

  const handleReset = () => {
    setSearchKeterangan("");
    setFilterPeriod("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // === RENDER ===
  if (isLoading) return <div className="p-6 text-center">Memuat data...</div>;
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">
        {error?.message || "Gagal memuat data uang modal"}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Uang Modal
        </h1>
        <button
          onClick={() => {
            setEditId(null);
            setOpenModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Tambah Uang Modal
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Transaksi"
          value={stats.totalTransaksi}
          icon={<Calendar className="w-5 h-5" />}
          color="text-blue-600"
        />
        <StatCard
          title="Total Jumlah"
          value={`Rp ${stats.totalJumlah.toLocaleString("id-ID")}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-green-600"
        />
        <StatCard
          title="Rata-rata/Transaksi"
          value={`Rp ${stats.totalTransaksi > 0 ? Math.round(stats.totalJumlah / stats.totalTransaksi).toLocaleString("id-ID") : 0}`}
          icon={<Wallet className="w-5 h-5" />}
          color="text-purple-600"
        />
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* 🔍 Cari Keterangan */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cari Keterangan
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchKeterangan}
                onChange={(e) => setSearchKeterangan(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Modal awal, Penambahan, dll..."
              />
            </div>
          </div>

          {/* 🗓️ Periode */}
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Periode
            </label>
            <div className="flex flex-wrap gap-1">
              {[
                { key: "all", label: "Semua" },
                { key: "today", label: "Hari Ini" },
                { key: "week", label: "Minggu Ini" },
                { key: "month", label: "Bulan Ini" },
                { key: "custom", label: "Custom" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setFilterPeriod(opt.key);
                    if (opt.key !== "custom") {
                      setDateFrom("");
                      setDateTo("");
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded ${
                    filterPeriod === opt.key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 🔄 Action Buttons */}
          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={() => setPage(1)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded whitespace-nowrap flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              Cari
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 📅 Custom Date Range */}
        {filterPeriod === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Dari</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Sampai</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}

        {/* Per Page */}
        <div className="mt-3 flex justify-end">
          <select
            className="border px-2 py-1.5 rounded text-sm"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5/hal</option>
            <option value={10}>10/hal</option>
            <option value={20}>20/hal</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-left">Penempatan</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data uang modal
                  </td>
                </tr>
              ) : (
                data.data.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.keterangan}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.penempatan}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      Rp {item.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
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

        {/* PAGINATION */}
        {data.meta && data.meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Menampilkan {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, data.meta.total)} dari{" "}
              {data.meta.total} data
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
                Halaman {page} dari {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= data.meta.totalPages}
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
        <UangModalForm
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          editId={editId}
          user={user}
        />
      )}
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
function UangModalForm({ isOpen, onClose, editId, user }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const queryClient = useQueryClient();

  // Fetch data untuk edit
  useEffect(() => {
    if (editId) {
      const fetchEditData = async () => {
        try {
          const res = await api.get(`/uang-modal/${editId}`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          });
          reset({
            keterangan: res.data.keterangan,
            tanggal: res.data.tanggal.split("T")[0],
            jumlah: res.data.jumlah,
          });
        } catch (err) {
          console.error("Fetch edit error:", err);
          Swal.fire({
            title: "Gagal!",
            text: "Gagal memuat data untuk edit.",
            icon: "error",
          });
          onClose();
        }
      };
      fetchEditData();
    } else {
      reset({ keterangan: "", tanggal: "", jumlah: "" });
    }
  }, [editId, reset, onClose, user?.token]);

  const createMutation = useMutation({
    mutationFn: (payload) =>
      api.post("/uang-modal", payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uangModal"] });
      onClose();
      Swal.fire({
        title: "Berhasil!",
        text: "Uang modal berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menambah uang modal.",
        icon: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      api.put(`/uang-modal/${editId}`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uangModal"] });
      onClose();
      Swal.fire({
        title: "Berhasil!",
        text: "Uang modal berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui uang modal.",
        icon: "error",
      });
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      keterangan: data.keterangan,
      tanggal: data.tanggal,
      jumlah: Number(data.jumlah),
    };

    if (editId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
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
          {editId ? "Edit Uang Modal" : "Tambah Uang Modal"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan *
            </label>
            <input
              type="text"
              {...register("keterangan", {
                required: "Keterangan wajib diisi",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Modal awal, Penambahan, dll..."
            />
            {errors.keterangan && (
              <p className="text-red-500 text-sm mt-1">
                {errors.keterangan.message}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal *
            </label>
            <input
              type="date"
              {...register("tanggal", { required: "Tanggal wajib diisi" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.tanggal && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tanggal.message}
              </p>
            )}
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah (Rp) *
            </label>
            <input
              type="number"
              min="1"
              {...register("jumlah", {
                required: "Jumlah wajib diisi",
                min: { value: 1, message: "Jumlah minimal 1" },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100000"
            />
            {errors.jumlah && (
              <p className="text-red-500 text-sm mt-1">
                {errors.jumlah.message}
              </p>
            )}
          </div>

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
              disabled={
                isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
