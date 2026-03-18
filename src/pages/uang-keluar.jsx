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
import { NumericFormat } from "react-number-format";

export default function UangModalPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset: resetForm,
    formState: { errors },
  } = useForm();

  // Filter state
  const [searchKeterangan, setSearchKeterangan] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(null);
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

  // === QUERY: Fetch Uang Keluar Data ===
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
        text: "Uang Keluar berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menambah Uang Keluar.",
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
      setOpenModalEdit(null);
      Swal.fire({
        title: "Berhasil!",
        text: "Uang Keluar berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui Uang Keluar.",
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
        text: "Uang Keluar berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus Uang Keluar.",
        icon: "error",
      });
    },
  });

  const saveAdd = (data) => {
    createUangModalMutation.mutate({
      keterangan: data.keterangan,
      tanggal: data.tanggal,
      jumlah: data.jumlah,
    });
    resetForm();
  };

  const saveEdit = (data) => {
    updateUangModalMutation.mutate({
      id: openModalEdit.id,
      payload: {
        keterangan: data.keterangan,
        tanggal: data.tanggal,
        jumlah: data.jumlah,
      },
    });
    resetForm();
  };

  // Handlers
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data Uang Keluar ini akan dihapus permanen!",
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
    resetForm({
      keterangan: item.keterangan,
      tanggal: item.tanggal,
      jumlah: item.jumlah,
    });

    setOpenModalEdit(item);
  };

  const handleReset = () => {
    setSearchKeterangan("");
    setFilterPeriod("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const isRangeInvalid =
    dateFrom && dateTo && new Date(dateTo) < new Date(dateFrom);

  // === RENDER ===
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">
        {error?.message || "Gagal memuat data Uang Keluar"}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-2 lg:p-8">
      <div className=" mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>

              <div>
                <h1 className="md:text-2xl text-lg lg:text-3xl font-bold text-gray-800">
                  Uang Keluar / Hutang
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Kelola transaksi uang keluar Anda
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditId(null);
                setOpenModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              Tambah Transaksi
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Transaksi
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTransaksi}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Jumlah
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {stats.totalJumlah.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Rata-rata/Transaksi
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp{" "}
                  {stats.totalTransaksi > 0
                    ? Math.round(
                        stats.totalJumlah / stats.totalTransaksi
                      ).toLocaleString("id-ID")
                    : 0}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTER SECTION */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <Search className="h-4 w-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Filter & Pencarian
            </h2>
          </div>

          {/* Filter Area */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* 🔍 Cari Keterangan */}
            <div className="md:col-span-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cari Keterangan
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchKeterangan}
                  onChange={(e) => setSearchKeterangan(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 📅 Periode */}
            <div className="md:col-span-7">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Periode
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterPeriod(value);
                  if (value !== "custom") {
                    setDateFrom("");
                    setDateTo("");
                  }
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* 📆 Custom Date */}
          {filterPeriod === "custom" && (
            <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isRangeInvalid && (
                <p className="text-red-500 text-sm mt-1">
                  Tanggal awal tidak boleh lebih besar dari tanggal akhir
                </p>
              )}
            </div>
          )}

          {/* Action */}
          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setPage(1)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
              >
                <Search className="h-4 w-4" />
                Terapkan
              </button>

              <button
                onClick={handleReset}
                className="rounded-xl bg-gray-100 px-5 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-200"
              >
                Reset
              </button>
            </div>

            {/* Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 / halaman</option>
                <option value={10}>10 / halaman</option>
                <option value={20}>20 / halaman</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Keterangan
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-gray-100 rounded-full mb-3">
                          <Wallet className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          Tidak ada data transaksi
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Mulai tambahkan transaksi uang keluar
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.data.map((item, i) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(page - 1) * pageSize + i + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.keterangan}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-green-600">
                          Rp {item.jumlah.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <span className="text-sm text-gray-600 mb-3 sm:mb-0">
                Menampilkan{" "}
                <span className="font-semibold text-gray-900">
                  {(page - 1) * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(page * pageSize, data.meta.total)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-gray-900">
                  {data.meta.total}
                </span>{" "}
                data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sebelumnya
                </button>
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                  {page} / {data.meta.totalPages}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
            isEdit={true}
            register={register}
            setValue={setValue}
            onSubmit={handleSubmit(saveAdd)}
            errors={errors}
            isLoading={createUangModalMutation.isPending}
          />
        )}

        {openModalEdit && (
          <UangModalForm
            title={"Edit Uang Keluar"}
            onClose={() => setOpenModal(null)}
            isEdit={true}
            onSubmit={handleSubmit(saveEdit)}
            register={register}
            setValue={setValue}
            errors={errors}
            defaultValues={{
              keterangan: openModalEdit.keterangan,
              tanggal: openModalEdit.tanggal,
              jumlah: openModalEdit.jumlah,
            }}
          />
        )}
      </div>
    </div>
  );
}

// Stat Card Component

// Modal Form Component
function UangModalForm({
  title,
  onClose,
  onSubmit,
  setValue,
  register,
  isEdit = false,
  errors,
  defaultValues,
  isLoading = false,
}) {
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

        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
            <div className="relative">
              <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                allowNegative={false}
                prefix="Rp "
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Rp 45.000"
                onValueChange={(values) => {
                  setValue("jumlah", values.floatValue);
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
      px-4 py-2 rounded-md
      text-gray-700 bg-gray-100
      hover:bg-gray-200
      disabled:opacity-50 disabled:cursor-not-allowed
    "
            >
              Batal
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading}
              className="
      px-4 py-2 rounded-md text-white
      bg-blue-600 hover:bg-blue-700
      disabled:opacity-70 disabled:cursor-not-allowed
      flex items-center gap-2
    "
            >
              {isLoading
                ? isEdit
                  ? "Memperbarui..."
                  : "Menyimpan..."
                : isEdit
                  ? "Perbarui"
                  : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
