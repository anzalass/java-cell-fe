import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Calendar,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api/client"; // sesuaikan path API client
import { useAuthStore } from "../store/useAuthStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function LaporanBarangKeluarAccPage() {
  // State
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filterPeriod, setFilterPeriod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openFilter, setOpenFilter] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortQty, setSortQty] = useState("none");

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
  const fetchBarangKeluar = async () => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("pageSize", pageSize);
    params.append("filterPeriod", filterPeriod);

    if (searchQuery) params.append("searchNama", searchQuery);
    if (sortQty !== "none") params.append("sortQty", sortQty);

    if (filterPeriod === "custom") {
      if (dateFrom) params.append("startDate", dateFrom);
      if (dateTo) params.append("endDate", dateTo);
    }

    const res = await api.get(`barang-keluar-acc?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
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
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 flex items-center gap-2 text-sm font-semibold">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenFilter(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl p-6">
            {/* Header */}
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

            {/* Body */}
            <div className="space-y-4">
              {/* Search */}
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

              {/* Sort */}
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

              {/* Periode */}
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

              {/* Custom Date */}
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

            {/* Footer */}
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
                  setPage(1);
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
