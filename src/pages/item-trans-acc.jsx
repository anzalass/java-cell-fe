import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Calendar,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import * as XLSX from "xlsx"; // ✅ Import library Excel
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { useQuery } from "@tanstack/react-query";

export default function LaporanBarangKeluarAccPage() {
  const { user } = useAuthStore();

  // State utama
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortQty, setSortQty] = useState("none");

  // State modal
  const [openFilter, setOpenFilter] = useState(false);
  const [openExportModal, setOpenExportModal] = useState(false);
  const [exportOption, setExportOption] = useState("filtered"); // 'filtered' | 'all'
  const [loadingExport, setLoadingExport] = useState(false);

  const resetPage = () => setPage(1);

  const handleReset = () => {
    setPage(1);
    setPageSize(10);
    setFilterPeriod("all");
    setDateFrom("");
    setDateTo("");
    setSearchInput("");
    setSearchQuery("");
    setSortQty("none");
  };

  /* =======================
        FETCH FUNCTION
  ======================= */
  const fetchBarangKeluar = async (customParams = {}) => {
    const params = new URLSearchParams();

    // Gunakan params custom untuk export, atau state untuk query biasa
    const p = {
      page: customParams.page || page,
      pageSize: customParams.pageSize || pageSize,
      filterPeriod: customParams.filterPeriod || filterPeriod,
      searchNama: customParams.searchNama || searchQuery,
      sortQty: customParams.sortQty || sortQty,
      startDate: customParams.startDate || dateFrom,
      endDate: customParams.endDate || dateTo,
      ...customParams,
    };

    params.append("page", p.page);
    params.append("pageSize", p.pageSize);
    params.append("filterPeriod", p.filterPeriod);

    if (p.searchNama) params.append("searchNama", p.searchNama);
    if (p.sortQty && p.sortQty !== "none") params.append("sortQty", p.sortQty);

    if (p.filterPeriod === "custom") {
      if (p.startDate) params.append("startDate", p.startDate);
      if (p.endDate) params.append("endDate", p.endDate);
    }

    const res = await api.get(`barang-keluar-acc?${params.toString()}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    return res.data;
  };

  /* =======================
        REACT QUERY
  ======================= */
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      "barang-keluar",
      page,
      pageSize,
      filterPeriod,
      dateFrom,
      dateTo,
      searchQuery,
      sortQty,
    ],
    queryFn: fetchBarangKeluar,
    enabled: !!user?.token,
    keepPreviousData: true,
  });

  const tableData = data?.paginatedData ?? [];
  const meta = data?.meta;

  /* =======================
        EXPORT FUNCTION
  ======================= */
  const exportToExcel = (exportData, filename) => {
    // Format data untuk Excel
    const worksheetData = exportData.map((item, index) => ({
      No: index + 1,
      "Nama Barang": item.namaBarang || "-",
      Merk: item.merk || "-",
      "Harga Modal": item.hargaModal
        ? `Rp ${item.hargaModal.toLocaleString("id-ID")}`
        : "Rp 0",
      "Harga Jual": item.hargaJual
        ? `Rp ${item.hargaJual.toLocaleString("id-ID")}`
        : "Rp 0",
      Qty: item.qty || 0,
      "Modal Dikeluarkan": item.modal
        ? `Rp ${item.modal.toLocaleString("id-ID")}`
        : "Rp 0",
      "Keuntungan Didapatkan": item.keuntungan
        ? `Rp ${item.keuntungan.toLocaleString("id-ID")}`
        : "Rp 0",
    }));

    // Buat worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Atur lebar kolom
    const wscols = [
      { wch: 5 }, // No
      { wch: 25 }, // Nama Barang
      { wch: 15 }, // Merk
      { wch: 18 }, // Harga Modal
      { wch: 18 }, // Harga Jual
      { wch: 8 }, // Qty
      { wch: 20 }, // Tanggal
      { wch: 20 }, // Tanggal
    ];
    worksheet["!cols"] = wscols;

    // Buat workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Barang Keluar");

    // Generate file
    XLSX.writeFile(workbook, filename);
  };

  const handleExport = async () => {
    try {
      setLoadingExport(true);

      // Tentukan parameter export
      const exportParams = {
        page: 1,
        pageSize: exportOption === "all" ? 10000 : 1000, // Ambil banyak data
        filterPeriod: exportOption === "all" ? "all" : filterPeriod,
        searchNama: exportOption === "all" ? "" : searchQuery,
        sortQty: exportOption === "all" ? "none" : sortQty,
        startDate: exportOption === "all" ? "" : dateFrom,
        endDate: exportOption === "all" ? "" : dateTo,
      };

      // Fetch data export
      const res = await fetchBarangKeluar(exportParams);
      const exportData = res.paginatedData || res.data || [];

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
      const filename = `barang-keluar-${dateStr}-${timeStr}.xlsx`;

      // Export ke Excel
      exportToExcel(exportData, filename);

      // Tutup modal
      setOpenExportModal(false);
      alert(`Berhasil export ${exportData.length} data ke ${filename}`);
    } catch (err) {
      console.error("Export error:", err);
      alert(
        "Gagal export data: " +
          (err.response?.data?.message ||
            err.message ||
            "Error tidak diketahui")
      );
    } finally {
      setLoadingExport(false);
    }
  };

  /* =======================
        LOADING & ERROR
  ======================= */
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Memuat data barang keluar...
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenFilter(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Filter & Pencarian
                  </h2>
                  <p className="text-sm text-gray-500">
                    Sesuaikan data barang keluar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpenFilter(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Cari Nama Barang
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    placeholder="LCD, Charging Port, dll"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Urutkan Qty
                </label>
                <select
                  value={sortQty}
                  onChange={(e) => setSortQty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white"
                >
                  <option value="none">Default</option>
                  <option value="desc">Qty Terbanyak</option>
                  <option value="asc">Qty Terdikit</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Periode
                </label>
                <div className="flex flex-wrap gap-2">
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
                      className={`px-3 py-1.5 text-sm rounded-lg ${
                        filterPeriod === opt.key
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {filterPeriod === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-xl">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-4 py-3 border rounded-xl"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-4 py-3 border rounded-xl"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setSearchQuery(searchInput);
                  resetPage();
                  setOpenFilter(false);
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXPORT */}
      {openExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Export Data Barang Keluar
              </h3>
              <button
                onClick={() => setOpenExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Pilih opsi export data sesuai kebutuhan:
            </p>

            <div className="space-y-3 mb-6">
              {/* Opsi 1: Sesuai Filter */}
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="radio"
                  name="exportOption"
                  value="filtered"
                  checked={exportOption === "filtered"}
                  onChange={() => setExportOption("filtered")}
                  className="form-radio text-indigo-600 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-800">
                    Sesuai Filter Saat Ini
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Hanya data yang terlihat di tabel dengan filter yang aktif (
                    {tableData.length} data)
                  </p>
                </div>
              </label>

              {/* Opsi 2: Semua Data */}
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="radio"
                  name="exportOption"
                  value="all"
                  checked={exportOption === "all"}
                  onChange={() => setExportOption("all")}
                  className="form-radio text-indigo-600 mt-1"
                />
                <div>
                  <p className="font-medium text-gray-800">Semua Data</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Seluruh data barang keluar tanpa filter (mungkin ribuan
                    data)
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenExportModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleExport}
                disabled={loadingExport}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
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

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-[150%] md:w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama Barang</th>
                <th className="px-4 py-3 text-left">Merk</th>
                <th className="px-4 py-3 text-left">Harga Modal</th>
                <th className="px-4 py-3 text-left">Harga Jual</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Modal Dikeluarkan</th>
                <th className="px-4 py-3 text-left">Keuntungan Didapatkan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData?.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data barang keluar
                  </td>
                </tr>
              ) : (
                tableData?.map((item, i) => (
                  <tr key={item.id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.namaBarang || "-"}
                    </td>
                    <td className="px-4 py-3">{item.merk || "-"}</td>
                    <td className="px-4 py-3 text-green-700">
                      Rp {item.hargaModal?.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="px-4 py-3 text-blue-700">
                      Rp {item.hargaJual?.toLocaleString("id-ID") || "0"}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.qty || 0}</td>
                    <td className="px-4 py-3  text-red-500 font-medium">
                      Rp {item.modal?.toLocaleString("id-ID") || 0}
                    </td>
                    <td className="px-4 py-3 text-green-500 font-medium">
                      Rp {item.keuntungan?.toLocaleString("id-ID") || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {meta?.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t">
            <p className="text-sm text-gray-600 mb-3 sm:mb-0">
              Menampilkan {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, meta.total)} dari {meta.total} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded font-medium">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= meta.totalPages}
                className="p-2 rounded-lg border disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
