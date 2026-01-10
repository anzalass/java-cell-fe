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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Laporan Keuangan
      </h1>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4">
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

          {filterPeriod === "custom" && (
            <div className="lg:col-span-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Dari</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    resetPage();
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
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
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>
          )}

          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Jenis
            </label>
            <select
              value={filterJenis}
              onChange={(e) => {
                setFilterJenis(e.target.value);
                resetPage();
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="all">Semua</option>
              <option value="keuntungan">Keuntungan</option>
              <option value="unexpected">Tak Terduga</option>
            </select>
          </div>

          {(filterJenis === "all" || filterJenis === "keuntungan") && (
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={filterKategori}
                onChange={(e) => {
                  setFilterKategori(e.target.value);
                  resetPage();
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
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

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daftar Keuntungan
            </h2>
            <span className="text-lg font-bold text-green-700">
              Total: Rp {data.totalKeuntungan.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Kategori</th>
                    <th className="px-4 py-3 text-left">Keuntungan</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.keuntungan.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        Tidak ada data keuntungan
                      </td>
                    </tr>
                  ) : (
                    data.keuntungan.map((row, i) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {(page - 1) * pageSize + i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="w-3 h-3 text-blue-600" />
                            {row.kategori}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-green-600 font-medium">
                          Rp {Number(row.nominal).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(row.tanggal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION KEUNTUNGAN */}
            {filterJenis !== "unexpected" && (
              <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
                <span className="text-sm text-gray-600">
                  Menampilkan {(page - 1) * pageSize + 1} -{" "}
                  {Math.min(page * pageSize, data.meta.totalKeuntunganItems)}{" "}
                  dari {data.meta.totalKeuntunganItems} data
                </span>
                <div>
                  <select
                    id="itemPerPage"
                    name="itemPerPage"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(e.target.value);
                      resetPage();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="5">5 / hal</option>
                    <option value="10">10 / hal</option>
                    <option value="30">30 / hal</option>
                    <option value="50">50 / hal</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm">
                    Halaman {page} dari{" "}
                    {Math.max(
                      1,
                      Math.ceil(data.meta.totalKeuntunganItems / pageSize)
                    )}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={
                      page >=
                      Math.ceil(data.meta.totalKeuntunganItems / pageSize)
                    }
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
                  >
                    Berikutnya
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Kejadian Tak Terduga
            </h2>
            <span className="text-lg font-bold text-red-700">
              Total: Rp {data.totalKerugian.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">No</th>
                    <th className="px-4 py-3 text-left">Nominal</th>
                    <th className="px-4 py-3 text-left">No Transaksi</th>
                    <th className="px-4 py-3 text-left">Keterangan</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.unexpected.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    data.unexpected.map((row, i) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {(page - 1) * pageSize + i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-red-600">
                          Rp {Math.abs(row.nominal).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {row.noTransaksi}
                        </td>
                        <td className="px-4 py-3">{row.keterangan}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(row.tanggal)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteUnexpected(row.id)}
                            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
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

            {/* PAGINATION UNEXPECTED */}
            {filterJenis !== "keuntungan" && (
              <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
                <span className="text-sm text-gray-600">
                  Menampilkan {(page2 - 1) * pageSize2 + 1} -{" "}
                  {Math.min(page2 * pageSize2, data.meta.totalUnexpectedItems)}{" "}
                  dari {data.meta.totalUnexpectedItems} data
                </span>
                <div>
                  <select
                    id="itemPerPage"
                    name="itemPerPage"
                    value={pageSize2}
                    onChange={(e) => {
                      setPageSize2(e.target.value);
                      resetPage();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="5">5 / hal</option>
                    <option value="10">10 / hal</option>
                    <option value="30">30 / hal</option>
                    <option value="50">50 / hal</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage2(page2 - 1)}
                    disabled={page2 <= 1}
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm">
                    Halaman {page2} dari{" "}
                    {Math.max(
                      1,
                      Math.ceil(data.meta.totalUnexpectedItems / pageSize2)
                    )}
                  </span>
                  <button
                    onClick={() => setPage2(page2 + 1)}
                    disabled={
                      page2 >=
                      Math.ceil(data.meta.totalUnexpectedItems / pageSize)
                    }
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-40"
                  >
                    Berikutnya
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
          <p className={`text-base font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
