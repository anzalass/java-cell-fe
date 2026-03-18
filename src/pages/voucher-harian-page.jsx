// src/pages/TransaksiVoucherPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Calendar,
  TrendingUp,
  Wallet,
  Package,
  RefreshCw,
  Filter,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";

export default function TransaksiVoucherHarianPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Filter state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const [brand, setBrand] = useState("");
  const [periode, setPeriode] = useState("semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openFilter, setOpenFilter] = useState(false);

  // Daftar brand (ambil dari API atau state global)
  const [brands, setBrands] = useState([]);

  // Fetch brand list
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("voucher-master", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const uniqueBrands = [...new Set(res.data.map((v) => v.brand))];
        setBrands(uniqueBrands);
      } catch (err) {
        console.error("Gagal memuat brand:", err);
      }
    };
    fetchBrands();
  }, [user?.token]);

  // Reset ke halaman 1 saat filter berubah
  const resetPage = () => setPage(1);

  // Jalankan pencarian saat klik tombol
  const handleSearch = () => {
    setSearchQuery(searchInput);
    resetPage();
  };

  // Reset semua filter
  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setBrand("");
    setPeriode("semua");
    setStartDate("");
    setEndDate("");
    resetPage();
  };

  // === QUERY: Fetch Transaksi ===
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "transaksiVoucher",
      page,
      pageSize,
      searchQuery,
      brand,
      periode,
      startDate,
      endDate,
      statusFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", pageSize);
      params.append("periode", periode);
      params.append("deletedFilter", statusFilter);

      if (searchQuery) params.append("search", searchQuery);
      if (brand) params.append("brand", brand);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`/voucher-harian-all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const transaksi = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  };

  // === Statistik ===
  const stats = useMemo(() => {
    let totalTransaksi = 0;
    let totalOmset = 0;
    let totalKeuntungan = 0;

    transaksi.forEach((trx) => {
      totalTransaksi++;
      totalOmset += trx.hargaJual;
      totalKeuntungan += trx.keuntungan;
    });

    return { totalTransaksi, totalOmset, totalKeuntungan };
  }, [transaksi]);

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`voucher-harian/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksiVoucher"] });
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

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="animate-spin w-8 h-8 mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        {error?.message || "Gagal memuat data"}
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 w-full mx-auto">
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Total Transaksi */}
        <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              {stats.totalTransaksi}
            </p>
            <p className="text-xs font-medium text-gray-500">Total Transaksi</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Total Omset */}
        <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              {formatRupiah(stats.totalOmset)}
            </p>
            <p className="text-xs font-medium text-gray-500">Total Omset</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition">
            <Wallet className="w-4 h-4 text-green-600" />
          </div>
        </div>

        {/* Total Keuntungan */}
        <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              {formatRupiah(stats.totalKeuntungan)}
            </p>
            <p className="text-xs font-medium text-gray-500">
              Total Keuntungan
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>
      {/* Filter Section */}
      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenFilter(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Filter & Pencarian
                  </h2>
                  <p className="text-sm text-gray-500">
                    Atur pencarian dan data yang ditampilkan
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpenFilter(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5">
              {/* Search Voucher */}

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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cari Voucher
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                    placeholder="Nama voucher..."
                  />
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="">Semua Brand</option>
                  <option value="Smartfren">Smartfren</option>
                  <option value="XL">XL</option>
                  <option value="Axis">Axis</option>
                  <option value="Indosat / IM3">Indosat / IM3</option>
                  <option value="Telkomsel">Telkomsel</option>
                  <option value={"Byu"}>Byu</option>
                  <option value="Tri">Tri</option>
                </select>
              </div>

              {/* Periode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Periode
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "semua", label: "Semua" },
                    { key: "hari", label: "Hari Ini" },
                    { key: "minggu", label: "Minggu Ini" },
                    { key: "bulan", label: "Bulan Ini" },
                    { key: "custom", label: "Custom" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setPeriode(opt.key);
                        if (opt.key !== "custom") {
                          setStartDate("");
                          setEndDate("");
                        }
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition ${
                        periode === opt.key
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date */}
              {periode === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Dari
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Sampai
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Page Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data per Halaman
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value={5}>5 / hal</option>
                  <option value={10}>10 / hal</option>
                  <option value={20}>20 / hal</option>
                  <option value={50}>50 / hal</option>
                </select>
              </div>
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
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nama Voucher
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Harga Jual
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Keuntungan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tanggal
                </th>
                {statusFilter !== "deleted" && (
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transaksi.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                transaksi.map((trx, i) => (
                  <tr key={trx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {trx.voucher.nama}
                    </td>
                    <td className="px-4 py-3">{trx.voucher.brand}</td>
                    <td className="px-4 py-3">{formatRupiah(trx.hargaJual)}</td>
                    <td className="px-4 py-3 text-green-600">
                      {formatRupiah(trx.keuntungan)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(trx.tanggal)}
                    </td>
                    {statusFilter !== "deleted" && (
                      <td className="px-4 py-3 text-gray-600">
                        <button
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
                          onClick={() => handleDelete(trx.id)}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {/* <div className="bg-gray-50 border-t-2 border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{page}</span> dari{" "}
              <span className="font-semibold">{meta.totalPages}</span>
            </div>
            <div className="flex items-center  gap-3">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
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
                  setPage((prev) => Math.min(prev + 1, meta.totalPages))
                }
                disabled={page >= meta.totalPages}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center gap-3 mb-1">
        <div
          className={`p-2 ${color.replace("text", "bg").replace("600", "100")} rounded-lg ${color}`}
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
