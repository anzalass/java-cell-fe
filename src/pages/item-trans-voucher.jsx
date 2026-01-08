import React, { useState, useEffect, useMemo } from "react";
import { Package, Calendar, Search, Filter, Download } from "lucide-react";
import api from "../api/client"; // sesuaikan path API client
import { useAuthStore } from "../store/useAuthStore";

export default function LaporanBarangKeluarVoucherPage() {
  // State

  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // Ganti state searchNama jadi dua state
  const [searchInput, setSearchInput] = useState(""); // untuk input teks
  const [searchQuery, setSearchQuery] = useState(""); // untuk filter aktif
  const [sortQty, setSortQty] = useState("none"); // "none", "asc", "desc"

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", pageSize);
      params.append("filterPeriod", filterPeriod);
      if (searchQuery) params.append("searchNama", searchQuery); // ✅
      if (sortQty !== "none") params.append("sortQty", sortQty);

      if (filterPeriod === "custom") {
        if (dateFrom) params.append("startDate", dateFrom);
        if (dateTo) params.append("endDate", dateTo);
      }

      const response = await api.get(
        `barang-keluar-voucher?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setData(response.data.paginatedData);
      console.log(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal memuat data barang keluar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, filterPeriod, dateFrom, dateTo, searchQuery, sortQty]); // ✅
  // Reset page saat filter berubah
  const resetPage = () => setPage(1);

  // Format tanggal
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return <div className="p-6 text-center">Memuat data barang keluar...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const totalPages = data.meta?.totalPages || 1;
  const totalItems = data.meta?.total || 0;

  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Laporan Barang Keluar
        </h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1">
          <Download className="w-4 h-4" />
          Export Excel
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Filter Nama */}
          <div className="md:col-span-5 flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cari Nama Barang
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Charging Port, LCD, dll..."
                />
              </div>
            </div>

            {/* ✅ Tombol Cari */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery(searchInput); // Setel query saat klik
                  setPage(1);
                }}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Cari
              </button>
            </div>
          </div>

          {/* SORT QUANTITY */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Urutkan Qty
            </label>
            <select
              value={sortQty}
              onChange={(e) => {
                setSortQty(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="none">Default</option>
              <option value="desc">Qty Terbanyak</option>
              <option value="asc">Qty Terdikit</option>
            </select>
          </div>

          {/* Periode */}
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
                    resetPage();
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

          {/* Custom Date Range */}
          {filterPeriod === "custom" && (
            <div className="md:col-span-3 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Dari</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    resetPage();
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Sampai
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    resetPage();
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mt-2 sm:mt-0">
            <select
              className="border px-3 py-1.5 rounded text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5/hal</option>
              <option value={10}>10/hal</option>
              <option value={20}>20/hal</option>
              <option value={50}>50/hal</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama Barang</th>
                <th className="px-4 py-3 text-left">Merk</th>
                <th className="px-4 py-3 text-left">Harga Modal</th>
                <th className="px-4 py-3 text-left">Harga Jual</th>
                <th className="px-4 py-3 text-left">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada data barang keluar
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(page - 1) * pageSize + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.namaBarang}
                    </td>
                    <td className="px-4 py-3">{item.merk}</td>
                    <td className="px-4 py-3 text-green-700">
                      Rp {item.hargaModal.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-blue-700">
                      Rp {item.hargaJual.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.qty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-t bg-gray-50">
          <span className="text-sm text-gray-600">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
