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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function VoucherTerlarisPage() {
  const { user } = useAuthStore();

  // Filter state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [periode, setPeriode] = useState("semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  console.log(pageSize);

  // Daftar brand
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <BarChart3 className="w-6 h-6 inline mr-2" />
          Laporan Voucher Terlaris
        </h1>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Terjual"
          value={statistik.totalTerjual}
          icon={<Package className="w-5 h-5" />}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(statistik.totalPendapatan)}
          icon={<Wallet className="w-5 h-5" />}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          title="Total Keuntungan"
          value={formatRupiah(statistik.totalKeuntungan)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Pencarian */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Voucher
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama voucher..."
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-md whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Brand */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                resetPage();
              }}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Brand</option>
              <option value={"Smartfren"}>Smartfren</option>
              <option value={"XL"}>XL</option>
              <option value={"Axis"}>Axis</option>
              <option value={"Indosat / IM3"}>Indosat / IM3</option>
              <option value={"Telkomsel"}>Telkomsel</option>
              <option value={"Tri"}>Tri</option>
            </select>
          </div>

          {/* Periode */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <div className="flex flex-wrap gap-1">
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
                    resetPage();
                  }}
                  className={`px-2 py-1 text-xs rounded ${
                    periode === opt.key
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleReset}
              className="w-full px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {periode === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Dari</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  resetPage();
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Sampai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  resetPage();
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}

        {/* Page Size */}
        {/* <div className="mt-3 flex justify-end">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border px-2 py-1.5 rounded text-sm"
          >
            <option value={5}>5/hal</option>
            <option value={10}>10/hal</option>
            <option value={20}>20/hal</option>
            <option value={50}>50/hal</option>
          </select>
        </div> */}
      </div>

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
        {meta.totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Menampilkan {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, meta.totalItems)} dari{" "}
              {meta.totalItems} data
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-sm">
                Halaman {page} dari {meta.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, meta.totalPages))
                }
                disabled={page >= meta.totalPages}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className={`${bg} p-4 rounded-lg shadow-sm border`}>
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 ${bg.replace("50", "200")} rounded-lg ${color}`}>
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
