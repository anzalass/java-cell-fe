// src/pages/LogPage.jsx
import { useState, useEffect, useMemo } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const formatRupiah = (angka) => {
  if (angka == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function LogPage() {
  const { user } = useAuthStore();

  // State filter
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [nama, setNama] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minNominal, setMinNominal] = useState("");
  const [maxNominal, setMaxNominal] = useState("");
  const [openFilter, setOpenFilter] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data

  const fetchLogs = async ({ queryKey }) => {
    const [
      _key,
      {
        page,
        pageSize,
        search,
        kategori,
        nama,
        startDate,
        endDate,
        minNominal,
        maxNominal,
        token,
      },
    ] = queryKey;

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("pageSize", pageSize);

    if (search) params.append("search", search);
    if (kategori) params.append("kategori", kategori);
    if (nama) params.append("nama", nama);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (minNominal !== "") params.append("minNominal", minNominal);
    if (maxNominal !== "") params.append("maxNominal", maxNominal);

    const res = await api.get(`/log?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "logs",
      {
        page,
        pageSize,
        search,
        kategori,
        nama,
        startDate,
        endDate,
        minNominal,
        maxNominal,
        token: user?.token,
      },
    ],
    queryFn: fetchLogs,
    enabled: !!user?.token,
    keepPreviousData: true,
  });

  const logs = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };
  const loading = isLoading;

  const handleApplyFilter = () => {
    setPage(1);
    fetchLogs();
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    setSearch("");
    setKategori("");
    setNama("");
    setStartDate("");
    setEndDate("");
    setMinNominal("");
    setMaxNominal("");
    setPage(1);
    fetchLogs();
    setOpenFilter(false);
  };
  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      <div className="flex flex-row gap-4 my-6  items-center justify-between">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Log Aktivitas
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Management Aktivitas Pengguna
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

      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenFilter(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Filter Log
                  </h2>
                  <p className="text-sm text-gray-500">
                    Temukan log yang Anda cari
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

            <div className="space-y-5">
              {/* Pencarian Global */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pencarian (Keterangan / Nama)
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                    placeholder="Kerusakan HP, Ahmad, dll..."
                  />
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori
                </label>
                <input
                  type="text"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  placeholder="Kejadian, Pembayaran, dll"
                />
              </div>

              {/* Nama */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Terkait
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                  placeholder="Ahmad Fauzi"
                />
              </div>

              {/* Rentang Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rentang Tanggal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nominal (Rp)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={minNominal}
                      onChange={(e) => setMinNominal(e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={maxNominal}
                      onChange={(e) => setMaxNominal(e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t">
              <button
                onClick={handleResetFilter}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilter}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat data...</div>
      ) : (
        <>
          {/* Tabel Log */}
          <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Kategori</th>
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">Keterangan</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      Tidak ada data log
                    </td>
                  </tr>
                ) : (
                  logs?.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3 px-4 font-medium">{log.kategori}</td>
                      <td className="py-3 px-4">{log.nama || "-"}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-gray-700">
                        {log.keterangan}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatRupiah(log.nominal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            // <div className="flex justify-between items-center mt-6">
            //   <p className="text-sm text-gray-600">
            //     Menampilkan {Math.min((page - 1) * pageSize + 1, meta.total)}–
            //     {Math.min(page * pageSize, meta.total)} dari {meta.total} data
            //   </p>

            //   <div className="flex gap-2">
            //     <button
            //       disabled={page === 1}
            //       onClick={() => setPage(page - 1)}
            //       className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400"
            //     >
            //       Sebelumnya
            //     </button>
            //     <span className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">
            //       {page} / {meta.totalPages}
            //     </span>
            //     <button
            //       disabled={page >= meta.totalPages}
            //       onClick={() => setPage(page + 1)}
            //       className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400"
            //     >
            //       Berikutnya
            //     </button>
            //   </div>
            // </div>

            <div className="bg-gray-50 border-t-2 border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{page}</span> dari{" "}
                  <span className="font-semibold">{meta.totalPages}</span>
                </div>
                {/* <div className="flex items-center  gap-3">
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
                </div> */}
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
