import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Wallet,
  AlertTriangle,
  TrendingUp,
  FileText,
  Calendar,
  Filter,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function LaporanKeuanganPage() {
  const { user, isCheckingAuth, fetchUser } = useAuthStore();

  const kategoriList = ["Tarik Tunai", "Transit", "Transfer-Topup", "VD"];

  const [loading, setLoading] = useState(true);

  // Filter state
  const [page, setPage] = useState(1);
  const [page2, setPage2] = useState(1);

  const [pageSize, setPageSize] = useState(2);
  const [pageSize2, setPageSize2] = useState(2);

  const [filterPeriod, setFilterPeriod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");
  const [filterKategori, setFilterKategori] = useState("all");

  const fetchLaporanKeuangan = async ({
    page,
    pageSize,
    page2,
    pageSize2,
    filterPeriod,
    dateFrom,
    dateTo,
    filterJenis,
    filterKategori,
    token,
  }) => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);
    params.append("page2", page2);
    params.append("pageSize2", pageSize2);
    params.append("filterPeriod", filterPeriod);
    params.append("filterJenis", filterJenis);

    if (filterKategori !== "all") {
      params.append("filterKategori", filterKategori);
    }

    if (filterPeriod === "custom") {
      if (dateFrom) params.append("startDate", dateFrom);
      if (dateTo) params.append("endDate", dateTo);
    }

    const { data } = await api.get(`laporan?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  };

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "laporan-keuangan",
      page,
      pageSize,
      page2,
      pageSize2,
      filterPeriod,
      dateFrom,
      dateTo,
      filterJenis,
      filterKategori,
    ],
    queryFn: () =>
      fetchLaporanKeuangan({
        page,
        pageSize,
        page2,
        pageSize2,
        filterPeriod,
        dateFrom,
        dateTo,
        filterJenis,
        filterKategori,
        token: user.token,
      }),
    keepPreviousData: true,
  });

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

  // Fetch data

  // Hapus kejadian
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/kejadian-tak-terduga/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["laporan-keuangan"]);
    },
  });

  const deleteUnexpected = (id) => {
    if (!confirm("Yakin hapus data ini?")) return;
    deleteMutation.mutate(id);
  };

  // Format tanggal
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const laporan = data ?? {
    keuntungan: [],
    unexpected: [],
    totalKeuntungan: 0,
    totalKerugian: 0,
    saldoBersih: 0,
    meta: {
      totalItems: 0,
      totalKeuntunganItems: 0,
      totalUnexpectedItems: 0,
    },
  };
  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setFilterType("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };
  const [openFilter, setOpenFilter] = useState(false);

  // Reset page saat filter berubah
  const resetPage = () => setPage(1);
  if (isLoading) {
    return <div className="p-6 text-center">Memuat data...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        {error?.response?.data?.error || "Gagal memuat data"}
      </div>
    );
  }

  const totalPages = Math.ceil(data.meta.totalItems / pageSize);

  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      <div className="flex mt-4 w-full items-center justify-between mb-5">
        <h1 className="text-sm md:text-base font-bold text-gray-800">
          Laporan Keuangan
        </h1>

        <button
          onClick={() => setOpenFilter(true)}
          className="px-5 py-2.5 bg-white border text-sm border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-gray-700 font-medium"
        >
          <Filter className="w-5 h-5 text-gray-600" />
          Filter Data
        </button>
      </div>

      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenFilter(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Filter Data
                  </h2>
                  <p className="text-sm text-gray-500">
                    Atur periode, jenis, dan kategori
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
            <div className="space-y-6">
              {/* Periode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Periode Waktu
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
                        resetPage();
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        filterPeriod === opt.key
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow shadow-blue-500/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Range */}
              {filterPeriod === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        resetPage();
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        resetPage();
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Jenis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis
                  </label>
                  <select
                    value={filterJenis}
                    onChange={(e) => {
                      setFilterJenis(e.target.value);
                      resetPage();
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="all">Semua</option>
                    <option value="keuntungan">Keuntungan</option>
                    <option value="unexpected">Tak Terduga</option>
                  </select>
                </div>

                {(filterJenis === "all" || filterJenis === "keuntungan") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={filterKategori}
                      onChange={(e) => {
                        setFilterKategori(e.target.value);
                        resetPage();
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="all">Semua Kategori</option>
                      {kategoriList.map((kat) => (
                        <option key={kat} value={kat}>
                          {kat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-between items-center pt-5 border-t">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
              >
                Reset
              </button>

              <button
                onClick={() => {
                  setOpenFilter(false);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Keuntungan"
          value={`Rp ${data.totalKeuntungan.toLocaleString("id-ID")}`}
          icon={<Wallet className="w-4 h-4" />}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          title="Total Kerugian"
          value={`Rp ${data.totalKerugian.toLocaleString("id-ID")}`}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatCard
          title="Saldo Bersih"
          value={`Rp ${data.saldoBersih.toLocaleString("id-ID")}`}
          icon={<TrendingUp className="w-4 h-4" />}
          color={data.saldoBersih >= 0 ? "text-blue-600" : "text-red-600"}
          bg={data.saldoBersih >= 0 ? "bg-blue-50" : "bg-red-50"}
        />
        <StatCard
          title="Total Transaksi"
          value={data.meta.totalItems}
          icon={<FileText className="w-4 h-4" />}
          color="text-gray-600"
          bg="bg-gray-50"
        />
      </div>

      {/* TABEL KEUNTUNGAN */}
      {(filterJenis === "all" || filterJenis === "keuntungan") && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="md:text-xl text-xs font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daftar Keuntungan
            </h2>
            <span className="md:text-xl text-xs font-bold text-green-700">
              Total: Rp {data.totalKeuntungan.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Keuntungan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {data.keuntungan.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-4 bg-gray-100 rounded-full mb-3">
                            <Tag className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            Tidak ada data keuntungan
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Data keuntungan akan muncul di sini
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.keuntungan.map((row, i) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(page - 1) * pageSize + i + 1}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                            <Tag className="w-3.5 h-3.5" />
                            {row.kategori}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700">
                            Rp {Number(row.nominal).toLocaleString("id-ID")}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {formatDate(row.tanggal)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filterJenis !== "unexpected" && (
              <div className="flex flex-col sm:flex-row sm:items-center items-center justify-center sm:justify-between  px-6 py-4 border-t border-gray-100 bg-gray-50 gap-3">
                <span className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-900">
                    {(page - 1) * pageSize + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(page * pageSize, data.meta.totalKeuntunganItems)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-gray-900">
                    {data.meta.totalKeuntunganItems}
                  </span>{" "}
                  data
                </span>

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

                  <span className="text-sm text-gray-500">data / halaman</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft />
                  </button>

                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30">
                    {page} /{" "}
                    {Math.max(
                      1,
                      Math.ceil(data.meta.totalKeuntunganItems / pageSize)
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          p + 1,
                          Math.ceil(data.meta.totalKeuntunganItems / pageSize)
                        )
                      )
                    }
                    disabled={
                      page >=
                      Math.ceil(data.meta.totalKeuntunganItems / pageSize)
                    }
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TABEL KEJADIAN TAK TERDUGA */}
      {(filterJenis === "all" || filterJenis === "unexpected") && (
        <div>
          <div className="flex text-xs md:text-lg justify-between items-center mb-4">
            <h2 className=" font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Kejadian Tak Terduga
            </h2>
            <span className=" font-bold text-red-700">
              Total: Rp {data.totalKerugian.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Nominal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      No Transaksi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Keterangan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {data.unexpected.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-4 bg-gray-100 rounded-full mb-3">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">
                            Tidak ada data pengeluaran
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Data akan muncul di sini
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.unexpected.map((row, i) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(page2 - 1) * pageSize2 + i + 1}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700">
                            Rp {Math.abs(row.nominal).toLocaleString("id-ID")}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono text-sm text-gray-800">
                          {row.noTransaksi}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {row.keterangan}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {formatDate(row.tanggal)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => deleteUnexpected(row.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
                            title="Hapus"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filterJenis !== "keuntungan" && (
              <div className="flex flex-col sm:flex-row sm:items-center items-center sm:justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 gap-3">
                <span className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-900">
                    {(page2 - 1) * pageSize2 + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(
                      page2 * pageSize2,
                      data.meta.totalUnexpectedItems
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-gray-900">
                    {data.meta.totalUnexpectedItems}
                  </span>{" "}
                  data
                </span>

                <div className="flex items-center gap-3">
                  <select
                    value={pageSize2}
                    onChange={(e) => {
                      setPageSize2(Number(e.target.value));
                      setPage2(1);
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

                  <span className="text-sm text-gray-500">data / halaman</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage2((p) => Math.max(p - 1, 1))}
                    disabled={page2 <= 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft />
                  </button>

                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30">
                    {page2} /{" "}
                    {Math.max(
                      1,
                      Math.ceil(data.meta.totalUnexpectedItems / pageSize2)
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setPage2((p) =>
                        Math.min(
                          p + 1,
                          Math.ceil(data.meta.totalUnexpectedItems / pageSize2)
                        )
                      )
                    }
                    disabled={
                      page2 >=
                      Math.ceil(data.meta.totalUnexpectedItems / pageSize2)
                    }
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className={`${bg} p-3 rounded-lg border`}>
      <div className="flex items-center gap-2">
        <div className={`p-1.5 ${bg.replace("50", "200")} rounded ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-600">{title}</p>
          <p className={`text-sm font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
