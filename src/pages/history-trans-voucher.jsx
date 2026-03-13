// src/components/TableSectionVoucherGrosir.jsx
import {
  BarChart3,
  Wallet,
  TrendingUp,
  Clock,
  RefreshCw,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Filter,
  Calendar,
  Printer,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function TableSectionVoucherGrosir({
  title = "Transaksi Voucher Grosir",
}) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);

  const [searchKode, setSearchKode] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");

  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [brand, setBrand] = useState("");

  const [openDetail, setOpenDetail] = useState(null);
  const navigate = useNavigate();

  const [openEdit, setOpenEdit] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [openFilter, setOpenFilter] = useState(false);

  // Helpers
  const today = new Date().toISOString().slice(0, 10);
  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
  };
  const getStartOfMonth = () => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  };

  // === QUERY: Fetch Grosir Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "grosir",
      page,
      itemPerPage,
      currentSearch,
      filterType,
      dateFrom,
      dateTo,
      statusFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("deletedFilter", statusFilter);
      params.append("pageSize", itemPerPage);
      if (currentSearch) params.append("search", currentSearch);

      let startDate = "";
      let endDate = "";

      if (filterType === "today") {
        startDate = today;
        endDate = today;
      } else if (filterType === "week") {
        startDate = getStartOfWeek();
        endDate = today;
      } else if (filterType === "month") {
        startDate = getStartOfMonth();
        endDate = today;
      } else if (filterType === "custom") {
        startDate = dateFrom;
        endDate = dateTo;
      }

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`grosir?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const data = queryData?.data || [];
  const total = queryData?.meta?.total || 0;
  const totalPages = queryData?.meta?.totalPages || 1;

  // === MUTATIONS ===
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`grosir/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grosir"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Transaksi berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus transaksi.",
        icon: "error",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(
        `grosir/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grosir"] });
      setOpenEdit(null);
      Swal.fire({
        title: "Berhasil!",
        text: "Status transaksi berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui status.",
        icon: "error",
      });
    },
  });

  // 📊 Statistik
  const stats = useMemo(() => {
    const totalTransaksi = data.length;
    const totalNominal = data.reduce((sum, item) => sum + item.totalHarga, 0);
    const totalKeuntungan = data
      .filter((item) => item.status === "Selesai")
      .reduce((sum, item) => sum + item.keuntungan, 0);

    const statusCount = {
      Pending: 0,
      Proses: 0,
      Selesai: 0,
      Gagal: 0,
      Batal: 0,
    };
    data.forEach((item) => {
      if (statusCount.hasOwnProperty(item.status)) {
        statusCount[item.status]++;
      }
    });

    return { totalTransaksi, totalNominal, totalKeuntungan, statusCount };
  }, [data]);

  // 🗑️ Hapus dengan SweetAlert
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Transaksi ini akan dihapus permanen!",
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

  // ✏️ Simpan status
  const handleSaveStatus = () => {
    if (!newStatus) {
      Swal.fire("Peringatan", "Pilih status terlebih dahulu", "warning");
      return;
    }
    updateStatusMutation.mutate({
      id: openEdit.id,
      status: newStatus,
    });
  };

  // 🔍 Cari
  const handleSearch = () => {
    setCurrentSearch(searchKode);
    setPage(1);
  };

  // 🔄 Reset
  const handleReset = () => {
    setSearchKode("");
    setCurrentSearch("");
    setFilterType("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // === RENDER ===
  if (isLoading) return <div className="text-center py-10">Memuat data...</div>;
  if (isError)
    return (
      <div className="text-center py-10 text-red-500">
        {error?.message || "Gagal memuat data"}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Statistik Transaksi */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
        <div className="flex flex-row gap-4 my-6  items-center justify-between">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Statistik Transaksi
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Ringkasan performa transaksi
              </p>
            </div>
          </div>

          {/* Right: Filter Button */}
          <div className="flex justify-end">
            {/* Desktop */}
            <button
              onClick={() => setOpenFilter(true)}
              className="hidden md:flex px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all items-center gap-2 text-gray-700 font-medium"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              Filter & Pencarian
            </button>

            {/* Mobile */}
            <button
              onClick={() => setOpenFilter(true)}
              className="md:hidden p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
              aria-label="Filter"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Total Transaksi */}
          <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {stats.totalTransaksi}
              </p>
              <p className="text-xs font-medium text-gray-500">
                Total Transaksi
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          {/* Nominal */}
          <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                Rp {stats.totalNominal.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-gray-500">Total Nominal</p>
            </div>
            <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition">
              <Wallet className="w-4 h-4 text-green-600" />
            </div>
          </div>

          {/* Keuntungan */}
          <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                Rp {stats.totalKeuntungan.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-gray-500">Keuntungan</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
          </div>

          {/* Selesai */}
          <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {stats.statusCount.Selesai}
              </p>
              <p className="text-xs font-medium text-gray-500">Selesai</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Pending */}
          <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {stats.statusCount.Pending}
              </p>
              <p className="text-xs font-medium text-gray-500">Pending</p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50 group-hover:bg-yellow-100 transition">
              <RefreshCw className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenFilter(false)}
          />

          {/* Modal Box */}
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Filter & Pencarian
                  </h2>
                  <p className="text-sm text-gray-500">
                    Temukan transaksi yang Anda cari
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpenFilter(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status Transaksi
              </label>

              <div className="flex bg-gray-100 p-1 my-3 rounded-xl">
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    statusFilter === "active"
                      ? "bg-white shadow text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Active
                </button>

                <button
                  onClick={() => setStatusFilter("deleted")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    statusFilter === "deleted"
                      ? "bg-white shadow text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Void
                </button>

                {/* <button
                  onClick={() => setStatusFilter("all")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    statusFilter === "all"
                      ? "bg-white shadow text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Semua
                </button> */}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cari Kode Downline
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchKode}
                    onChange={(e) => setSearchKode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                    placeholder="Cari kode downline..."
                  />
                </div>
              </div>

              {/* Time Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rekap Waktu
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                  >
                    <option value="all">Semua Waktu</option>
                    <option value="today">Hari Ini</option>
                    <option value="week">Minggu Ini</option>
                    <option value="month">Bulan Ini</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>

              {/* Custom Date */}
              {filterType === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
              >
                Reset
              </button>

              <button
                onClick={() => {
                  handleSearch();
                  setOpenFilter(false);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700 to-gray-700 text-white">
                  <th className="px-4 py-4 text-left font-semibold">No</th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Kode Downline
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">Tanggal</th>
                  <th className="px-4 py-4 text-left font-semibold">Nominal</th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Keuntungan
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">Status</th>
                  {statusFilter !== "deleted" && (
                    <th className="px-4 py-4 text-center font-semibold">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-gray-500 text-center"
                    >
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada data transaksi</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold text-xs">
                          {(page - 1) * itemPerPage + i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block text-xs font-bold">
                          {item.downline.kodeDownline}
                        </div>
                        <p className="text-gray-600 text-xs mt-1">
                          {item.downline.nama}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4 font-bold text-blue-600">
                        Rp {item.totalHarga.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 font-bold text-green-600">
                        Rp {item.keuntungan.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === "Sukses"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.status === "Proses"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {statusFilter !== "deleted" && (
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
                              onClick={() => setOpenDetail(item)}
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-md hover:shadow-lg"
                              onClick={() => {
                                setOpenEdit(item);
                                setNewStatus(item.status);
                              }}
                              title="Edit Status"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                              title="Edit Status"
                              onClick={() =>
                                navigate(`/print/grosir/${item.id}`)
                              }
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {item.status !== "Selesai" && (
                              <button
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
                                onClick={() => handleDelete(item.id)}
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination
          <div className="bg-gray-50 border-t-2 border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{page}</span> dari{" "}
                <span className="font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center  gap-3">
                <select
                  value={itemPerPage}
                  onChange={(e) => {
                    setItemPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="
      px-4 py-2
      text-sm font-medium
      rounded-xl
      border border-gray-200
      bg-white
      shadow-sm
      focus:outline-none
      focus:ring-2 focus:ring-blue-500
      focus:border-blue-500
      hover:bg-gray-50
      transition
    "
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold text-sm">
                  {page}
                </div>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page >= totalPages}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Modal Detail - Use the previous TransactionDetailModal design */}
      {openDetail && (
        <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">
                Detail Transaksi Voucher Downline
              </h2>
              <button
                onClick={() => setOpenDetail(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Kode Downline:</span>
                <span className="font-medium">
                  {openDetail.downline.kodeDownline} -{" "}
                  {openDetail.downline.nama}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal:</span>
                <span>
                  {new Date(openDetail.tanggal).toLocaleString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}{" "}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span>Rp {openDetail.totalHarga.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Keuntungan:</span>
                <span className="text-green-600">
                  Rp {openDetail.keuntungan.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">Item Transaksi</h3>
            <div className="overflow-x-auto">
              <table className="lg:w-full w-[130%] text-sm border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">No</th>

                    <th className="px-3 py-2 text-left">Produk</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Harga</th>
                    <th className="px-3 py-2 text-right">Total Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {openDetail?.detail?.itemTransaksi?.map((x, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{idx + 1}</td>

                      <td className="px-3 py-2">{x.namaProduk}</td>
                      <td className="px-3 py-2 text-center">{x.qty}</td>
                      <td className="px-3 py-2 text-right">
                        Rp {x.hargaJual.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rp {Number(x.hargaJual * x.qty).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex gap-x-3 justify-end">
              <button
                onClick={() => navigate(`/print/grosir/${item.id}`)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Print
              </button>
              <button
                onClick={() => setOpenDetail(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Edit Status */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Edit Status Transaksi
            </h2>
            <select
              className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {" "}
              <option value="">Pilih Status</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Proses">🔧 Proses</option>
              <option value="Selesai">✅ Selesai</option>
              <option value="Gagal">❌ Gagal</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                onClick={() => setOpenEdit(null)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                onClick={handleSaveStatus}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// StatCard component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-1">
        <span className={`${color}`}>{icon}</span>
        <span className="text-xs text-gray-500">{title}</span>
      </div>
      <p className="text-base font-bold text-gray-800">{value}</p>
    </div>
  );
}
