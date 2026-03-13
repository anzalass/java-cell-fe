// src/pages/KeuntunganPage.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import {
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Package,
  TrendingUp,
  DollarSign,
  CreditCard,
  Box,
  Wrench,
  ShoppingCart,
} from "lucide-react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function KeuntunganPage() {
  const [filter, setFilter] = useState("hari");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingExport, setLoadingExport] = useState(false);
  const { user } = useAuthStore();

  // Format Rupiah
  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // Format angka singkat (rb/Jt/M)
  const formatShort = (num) => {
    const value = num || 0;
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}rb`;
    return value.toLocaleString("id-ID");
  };

  // Config metric cards

  // Config table columns
  const columns = [
    {
      key: "keuntunganTransaksi",
      label: "Transaksi",
      icon: CreditCard,
      color: "text-slate-700",
    },
    {
      key: "keuntunganVoucherHarian",
      label: "Voucher",
      icon: Package,
      color: "text-indigo-600",
    },
    { key: "keuntunganAcc", label: "Acc", icon: Box, color: "text-violet-600" },
    {
      key: "keuntunganSparepart",
      label: "Sparepart",
      icon: Box,
      color: "text-blue-600",
    },
    {
      key: "keuntunganService",
      label: "Service",
      icon: Wrench,
      color: "text-purple-600",
    },
    {
      key: "keuntunganGrosirVoucher",
      label: "Grosir",
      icon: ShoppingCart,
      color: "text-amber-600",
    },
  ];

  // === REACT QUERY ===
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["keuntungan", filter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("filter", filter);

      if (filter === "custom") {
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
      }

      const res = await api.get(`/keuntungan?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      return res.data;
    },
    enabled: !!user?.token,
    staleTime: 5 * 60 * 1000, // 5 menit
  });

  const metrics = [
    {
      label: "Total Keuntungan",
      value: data?.total?.totalKeuntungan,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Voucher",
      value: data?.total?.keuntunganVoucherHarian,
      icon: Package,
      color: "from-indigo-500 to-blue-600",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      label: "Service",
      value: data?.total?.keuntunganService,
      icon: Wrench,
      color: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
    {
      label: "Grosir",
      value: data?.total?.keuntunganGrosirVoucher,
      icon: ShoppingCart,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
  ];

  // === EXPORT TO EXCEL ===
  const exportToExcel = async () => {
    try {
      setLoadingExport(true);

      // Fetch data khusus untuk export (semua data sesuai filter)
      const params = new URLSearchParams();
      params.append("filter", filter);
      if (filter === "custom" && startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }

      const res = await api.get(`/keuntungan?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const tableData = res.data?.data || [];
      const totalData = res.data?.total || {};

      // Format data untuk Excel
      const worksheetData = [
        // Header
        ["LAPORAN KEUNTUNGAN"],
        [
          `Periode: ${filter === "custom" && startDate && endDate ? `${startDate} - ${endDate}` : filter}`,
        ],
        [`Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`],
        [], // Empty row

        // Table Header
        [
          "Tanggal",
          "Transaksi",
          "Voucher",
          "Acc",
          "Sparepart",
          "Service",
          "Grosir",
          "TOTAL",
        ],

        // Table Rows
        ...tableData.map((item) => [
          new Date(item.createdAt).toLocaleDateString("id-ID"),
          item.keuntunganTransaksi,
          item.keuntunganVoucherHarian,
          item.keuntunganAcc,
          item.keuntunganSparepart,
          item.keuntunganService,
          item.keuntunganGrosirVoucher,
          item.totalKeuntungan,
        ]),

        [], // Empty row
        [], // Empty row

        // Summary Section
        ["RINGKASAN TOTAL", "", "", "", "", "", "", ""],
        ["Transaksi", totalData.keuntunganTransaksi],
        ["Voucher Harian", totalData.keuntunganVoucherHarian],
        ["Acc", totalData.keuntunganAcc],
        ["Sparepart", totalData.keuntunganSparepart],
        ["Service", totalData.keuntunganService],
        ["Grosir Voucher", totalData.keuntunganGrosirVoucher],
        ["GRAND TOTAL", totalData.totalKeuntungan],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Column widths
      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
      ];

      // Merge title
      worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuntungan");

      const filename = `laporan-keuntungan-${filter}-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);

      alert("✅ Export berhasil!");
    } catch (err) {
      console.error("Export error:", err);
      alert("❌ Gagal export: " + (err.message || "Error tidak diketahui"));
    } finally {
      setLoadingExport(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 mx-auto text-indigo-600 animate-spin" />
          <p className="mt-4 text-slate-600 font-medium">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  // Error state
  //   if (isError) {
  //     return (
  //       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
  //         <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-md mx-4">
  //           <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
  //             <span className="text-red-600 text-2xl">!</span>
  //           </div>
  //           <h3 className="font-semibold text-slate-800 mb-2">
  //             Gagal Memuat Data
  //           </h3>
  //           <p className="text-slate-500 text-sm mb-4">Silakan coba lagi nanti</p>
  //           <button
  //             onClick={() => refetch()}
  //             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
  //           >
  //             Coba Lagi
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Laporan Keuntungan
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Pantau performa bisnis Anda secara real-time
            </p>
          </div>

          <button
            onClick={exportToExcel}
            disabled={loadingExport || !data?.data?.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 
                     text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 
                     hover:shadow-emerald-500/40 hover:from-emerald-700 hover:to-teal-700 
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingExport ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Excel
          </button>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className={`${metric.bg} rounded-2xl p-4 sm:p-5 border border-slate-200/60 
                          hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 
                          hover:-translate-y-0.5 group`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium">
                      {metric.label}
                    </p>
                    <p
                      className={`text-lg sm:text-xl font-bold mt-1 ${metric.text}`}
                    >
                      {formatShort(metric.value)}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5 hidden sm:block">
                      {formatRupiah(metric.value)}
                    </p>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${metric.color} 
                                shadow-lg shadow-slate-200/50 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTER SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">
              Filter Periode
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "hari", label: "Hari Ini" },
              { key: "minggu", label: "Minggu Ini" },
              { key: "bulan", label: "Bulan Ini" },
              { key: "tahun", label: "Tahun Ini" },
              { key: "custom", label: "Custom" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                          ${
                            filter === opt.key
                              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                          }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {filter === "custom" && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Periode Custom:</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="date"
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 
                           focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                           outline-none transition text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                />
                <span className="flex items-center text-slate-400">—</span>
                <input
                  type="date"
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 
                           focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                           outline-none transition text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="px-4 sm:px-6 py-4 text-left font-semibold text-slate-700 border-b border-slate-200">
                    Tanggal
                  </th>
                  {columns.map((col) => {
                    const Icon = col.icon;
                    return (
                      <th
                        key={col.key}
                        className="px-3 sm:px-4 py-4 text-center font-semibold text-slate-700 border-b border-slate-200"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="inline">{col.label}</span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-4 sm:px-6 py-4 text-center font-bold text-slate-800 border-b border-slate-200">
                    <div className="flex items-center justify-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="inline">Total</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!data?.data?.length ? (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="px-6 py-12 text-center"
                    >
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-3">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        Tidak ada data
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Coba ubah filter periode
                      </p>
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4 font-medium text-slate-700">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-3 sm:px-4 py-4 text-center"
                        >
                          <span className={`${col.color} font-medium`}>
                            {formatShort(item[col.key])}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-lg 
                                       bg-gradient-to-r from-emerald-50 to-teal-50 
                                       text-emerald-700 font-bold text-sm"
                        >
                          {formatShort(item.totalKeuntungan)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY CARD */}
        {/* SUMMARY CARD - LIGHT THEME */}
        {/* <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-200">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            Ringkasan Total
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {[
              {
                label: "Transaksi",
                value: data?.total?.keuntunganTransaksi,
                color: "text-slate-700",
                bg: "bg-slate-50",
              },
              {
                label: "Voucher",
                value: data?.total?.keuntunganVoucherHarian,
                color: "text-indigo-700",
                bg: "bg-indigo-50",
              },
              {
                label: "Acc",
                value: data?.total?.keuntunganAcc,
                color: "text-violet-700",
                bg: "bg-violet-50",
              },
              {
                label: "Sparepart",
                value: data?.total?.keuntunganSparepart,
                color: "text-blue-700",
                bg: "bg-blue-50",
              },
              {
                label: "Service",
                value: data?.total?.keuntunganService,
                color: "text-purple-700",
                bg: "bg-purple-50",
              },
              {
                label: "Grosir",
                value: data?.total?.keuntunganGrosirVoucher,
                color: "text-amber-700",
                bg: "bg-amber-50",
              },
              {
                label: "GRAND TOTAL",
                value: data?.total?.totalKeuntungan,
                color: "text-emerald-700",
                bg: "bg-emerald-50",
                bold: true,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border ${
                  item.bold
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-md shadow-emerald-100"
                    : `${item.bg} border-slate-200/60`
                }`}
              >
                <p className="text-xs text-slate-500 mb-1 font-medium">
                  {item.label}
                </p>
                <p
                  className={`font-bold ${item.bold ? "text-xl" : "text-base"} ${item.color}`}
                >
                  {formatShort(item.value)}
                </p>
                {item.bold && (
                  <p className="text-xs text-emerald-600/80 mt-0.5 font-medium">
                    {formatRupiah(item.value)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div> */}

        {/* FOOTER */}
        <div className="text-center mt-8 pb-4">
          <p className="text-slate-400 text-xs">
            Data diperbarui:{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
