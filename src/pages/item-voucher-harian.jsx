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
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx"; // ✅ Install dulu: npm install xlsx
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

  // Export state
  const [openExportModal, setOpenExportModal] = useState(false);
  const [exportOption, setExportOption] = useState("filtered");
  const [loadingExport, setLoadingExport] = useState(false);

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

  // Format angka tanpa rupiah
  const formatAngka = (num) => {
    return new Intl.NumberFormat("id-ID").format(num || 0);
  };

  /* =======================
        EXPORT TO EXCEL
  ======================= */
  const exportToExcel = (exportData, filename) => {
    // Format data untuk Excel sesuai struktur voucher terlaris
    const worksheetData = exportData.map((item, index) => ({
      No: index + 1,
      "Nama Voucher": item.voucher?.nama || item.nama || "-",
      Provider: item.voucher?.brand || item.brand || "-",
      "Harga Modal": item.voucher?.hargaPokok
        ? `Rp ${formatAngka(item.voucher.hargaPokok)}`
        : "Rp 0",
      "Harga Jual": item.voucher?.hargaEceran
        ? `Rp ${formatAngka(item.voucher.hargaEceran)}`
        : "Rp 0",
      "Jumlah Terjual": item.jumlahTerjual || 0,
      "Modal Dikeluarkan": item.modal
        ? `Rp ${formatAngka(item.modal)}`
        : "Rp 0",
      Pendapatan: item.totalPendapatan
        ? `Rp ${formatAngka(item.totalPendapatan)}`
        : "Rp 0",
      Keuntungan: item.totalKeuntungan
        ? `Rp ${formatAngka(item.totalKeuntungan)}`
        : "Rp 0",
    }));

    // Buat worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Atur lebar kolom
    const wscols = [
      { wch: 5 }, // No
      { wch: 30 }, // Nama Voucher
      { wch: 15 }, // Provider
      { wch: 18 }, // Harga Modal
      { wch: 18 }, // Harga Jual
      { wch: 15 }, // Jumlah Terjual
      { wch: 20 }, // Modal Dikeluarkan
      { wch: 20 }, // Pendapatan
      { wch: 20 }, // Keuntungan
    ];
    worksheet["!cols"] = wscols;

    // Buat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voucher Terlaris");

    // Generate file
    XLSX.writeFile(workbook, filename);
  };

  const handleExport = async () => {
    try {
      setLoadingExport(true);

      // Tentukan parameter export
      const exportParams = {
        page: 1,
        pageSize: exportOption === "all" ? 10000 : 1000,
        periode: exportOption === "all" ? "semua" : periode,
        brand: exportOption === "all" ? "" : brand,
        search: exportOption === "all" ? "" : searchQuery,
        startDate: exportOption === "all" ? "" : startDate,
        endDate: exportOption === "all" ? "" : endDate,
      };

      // Build query params
      const params = new URLSearchParams();
      Object.entries(exportParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Fetch data export
      const res = await api.get(
        `/voucher-harian-terlaris?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      const exportData = res.data?.data?.data || [];

      if (exportData.length === 0) {
        alert("Tidak ada data untuk di-export");
        return;
      }

      // Generate filename dengan timestamp
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now
        .toLocaleTimeString("id-ID", { hour12: false })
        .replace(/:/g, "-");
      const filename = `voucher-terlaris-${dateStr}-${timeStr}.xlsx`;

      // Export ke Excel
      exportToExcel(exportData, filename);

      // Tutup modal
      setOpenExportModal(false);
      alert(`✅ Berhasil export ${exportData.length} data ke ${filename}`);
    } catch (err) {
      console.error("Export error:", err);
      alert(
        "❌ Gagal export: " +
          (err.response?.data?.message ||
            err.message ||
            "Error tidak diketahui")
      );
    } finally {
      setLoadingExport(false);
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
          <button
            onClick={() => setOpenExportModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 flex items-center gap-2 text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* MODAL FILTER */}
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
                  <option value={"Byu"}>Byu</option>
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

      {/* MODAL EXPORT */}
      {openExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                Export Data Voucher Terlaris
              </h3>
              <button
                onClick={() => setOpenExportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Pilih opsi export data sesuai kebutuhan:
            </p>

            <div className="space-y-3 mb-6">
              {/* Opsi 1: Sesuai Filter */}
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-emerald-300 transition bg-gray-50">
                <input
                  type="radio"
                  name="exportOption"
                  value="filtered"
                  checked={exportOption === "filtered"}
                  onChange={() => setExportOption("filtered")}
                  className="form-radio text-emerald-600 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-800">
                    Sesuai Filter Saat Ini
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hanya data yang terlihat di tabel dengan filter yang aktif (
                    {laporan.length} data)
                  </p>
                </div>
              </label>

              {/* Opsi 2: Semua Data */}
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-emerald-300 transition bg-gray-50">
                <input
                  type="radio"
                  name="exportOption"
                  value="all"
                  checked={exportOption === "all"}
                  onChange={() => setExportOption("all")}
                  className="form-radio text-emerald-600 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-800">Semua Data</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Seluruh data voucher terlaris tanpa filter (mungkin ribuan
                    data)
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenExportModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleExport}
                disabled={loadingExport}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition"
              >
                {loadingExport ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Menyiapkan...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
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
                <th className="px-4 py-3 text-left">Harga Modal</th>
                <th className="px-4 py-3 text-left">Harga Jual</th>
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
                    colSpan="9"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                laporan.map((item, i) => (
                  <tr key={item.voucher?.id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.voucher?.nama || "-"}
                    </td>
                    <td className="px-4 py-3">{item.voucher?.brand || "-"}</td>
                    <td className="px-4 py-3">
                      {formatRupiah(item.voucher?.hargaPokok || 0)}
                    </td>
                    <td className="px-4 py-3">
                      {formatRupiah(item.voucher?.hargaEceran || 0)}
                    </td>

                    <td className="px-4 py-3 font-bold text-blue-600">
                      {item.jumlahTerjual || 0} pcs
                    </td>
                    <td className="px-4 py-3 text-red-700">
                      {formatRupiah(item.modal || 0)}
                    </td>
                    <td className="px-4 py-3">
                      {formatRupiah(item.totalPendapatan || 0)}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      {formatRupiah(item.totalKeuntungan || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {/* <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Menampilkan {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, meta?.totalItems || 0)} dari{" "}
              <span className="font-semibold">{meta?.totalItems || 0}</span>{" "}
              data
            </div>
            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 / halaman</option>
                <option value={5}>5 / halaman</option>
                <option value={10}>10 / halaman</option>
                <option value={20}>20 / halaman</option>
                <option value={50}>50 / halaman</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <div className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold text-sm">
                {page} / {meta?.totalPages || 1}
              </div>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, meta?.totalPages || 1))
                }
                disabled={page >= (meta?.totalPages || 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
