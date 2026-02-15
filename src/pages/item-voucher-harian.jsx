// src/pages/VoucherTerlarisPage.jsx
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
  ChevronRight,
  ChevronLeft,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function VoucherTerlarisPage() {
  const { user } = useAuthStore();

  // Filter state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [periode, setPeriode] = useState("semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openFilter, setOpenFilter] = useState(false);

  console.log(pageSize);

  // Daftar brand
  const [brands, setBrands] = useState([]);

  // Fetch brand list
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("vouchers-master", {
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

  const handleExportExcel = () => {};

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

  // === QUERY: Fetch Laporan Voucher Terlaris ===
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "voucherTerlaris",
      page,
      pageSize,
      searchQuery,
      brand,
      periode,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", pageSize);
      params.append("periode", periode);
      if (searchQuery) params.append("search", searchQuery);
      if (brand) params.append("brand", brand);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(
        `/voucher-harian-terlaris?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      // 🔥 BALIKIN ISI SERVICE-NYA, BUKAN WRAPPER
      return res.data.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const laporan = data?.data || [];
  const statistik = data?.statistik || {
    totalTerjual: 0,
    totalPendapatan: 0,
    totalKeuntungan: 0,
  };
  const meta = data?.meta || {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  };

  // Format rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
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
    <div className="p-4 sm:p-6 w-full mx-auto">
      <div className="flex mt-3 flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md shadow-indigo-500/30">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Laporan Barang Keluar
            </h1>
            <p className="text-sm text-gray-500">
              Rekap stok barang yang keluar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <button
            onClick={() => setOpenFilter(true)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter & Pencarian</span>
          </button>

          {/* Export */}
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 flex items-center gap-2 text-sm font-semibold">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistik */}

      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 animate-scaleIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filter Data
              </h2>
              <button
                onClick={() => setOpenFilter(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cari Voucher
                </label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Pulsa 10K, Paket Data..."
                  />
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Provider
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Semua Provider</option>
                  <option value="Smartfren">Smartfren</option>
                  <option value="XL">XL</option>
                  <option value="Axis">Axis</option>
                  <option value="Indosat / IM3">Indosat / IM3</option>
                  <option value="Telkomsel">Telkomsel</option>
                  <option value="Tri">Tri</option>
                </select>
              </div>

              {/* Periode */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Periode
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { key: "semua", label: "Semua" },
                    { key: "hari", label: "Hari Ini" },
                    { key: "minggu", label: "Minggu Ini" },
                    { key: "bulan", label: "Bulan Ini" },
                    { key: "custom", label: "Custom" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setPeriode(opt.key)}
                      className={`px-3 py-1 text-xs rounded-full border transition ${
                        periode === opt.key
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date */}
              {periode === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
                >
                  Reset
                </button>

                <button
                  onClick={() => {
                    handleSearch();
                    setOpenFilter(false);
                  }}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabel Voucher Terlaris */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Peringkat</th>
                <th className="px-4 py-3 text-left">Nama Voucher</th>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-left">Jumlah Terjual</th>
                <th className="px-4 py-3 text-left">Modal Dikeluarkan</th>
                <th className="px-4 py-3 text-left">Pendapatan</th>
                <th className="px-4 py-3 text-left">Keuntungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {laporan.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                laporan.map((item, i) => (
                  <tr key={item.voucher.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.voucher.nama}
                    </td>
                    <td className="px-4 py-3">{item.voucher.brand}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">
                      {item.jumlahTerjual} pcs
                    </td>
                    <td className="px-4 py-3">{formatRupiah(item.modal)}</td>
                    <td className="px-4 py-3">
                      {formatRupiah(item.totalPendapatan)}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      {formatRupiah(item.totalKeuntungan)}
                    </td>
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
              <span className="font-semibold">{meta?.totalPages}</span>
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
                  setPage((prev) => Math.min(prev + 1, meta?.totalPages))
                }
                disabled={page >= meta?.totalPages}
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
