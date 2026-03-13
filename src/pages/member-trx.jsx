// src/pages/MemberTransactionHistory.jsx
import { useState, useEffect, useMemo } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const getTypeIcon = (jenis) => {
  switch (jenis) {
    case "voucher":
      return "🎟️";
    case "service":
      return "🔧";
    case "aksesoris":
      return "🎧";
    case "sparepart":
      return "⚙️";
    case "jualanHarian":
      return "💰";
    default:
      return "📄";
  }
};

const getTypeColor = (jenis) => {
  switch (jenis) {
    case "voucher":
      return "bg-blue-100 text-blue-800";
    case "service":
      return "bg-amber-100 text-amber-800";
    case "aksesoris":
      return "bg-purple-100 text-purple-800";
    case "sparepart":
      return "bg-emerald-100 text-emerald-800";
    case "jualanHarian":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatRupiah = (angka) => {
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

// Helper: cek apakah tanggal dalam rentang
const isDateInRange = (dateStr, start, end) => {
  const date = new Date(dateStr);
  return date >= start && date <= end;
};

export default function MemberTransactionHistory() {
  const { memberId } = useParams();

  const [filterJenis, setFilterJenis] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all"); // 'today', 'month', 'year', 'custom'
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { user } = useAuthStore();

  const fetchTransactions = async ({ queryKey }) => {
    const [_key, { memberId, token }] = queryKey;

    const res = await api.get(`/member/trx/${memberId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["member-transactions", { memberId, token: user?.token }],
    queryFn: fetchTransactions,
    enabled: !!memberId && !!user?.token,
  });

  const transactions = data?.result || [];
  const dataMember = data || null;
  const loading = isLoading;

  // Hitung rentang tanggal berdasarkan filter
  const getDateRange = () => {
    const now = new Date();
    let start = new Date(0); // awal waktu
    let end = new Date(now);

    if (filterPeriod === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filterPeriod === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filterPeriod === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (filterPeriod === "custom" && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999); // sampai akhir hari
    }

    return { start, end };
  };

  console.log(transactions);

  // Filter data
  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange();

    return transactions?.filter((trx) => {
      // Filter jenis
      if (filterJenis !== "all" && trx.jenis !== filterJenis) return false;
      // Filter tanggal
      return isDateInRange(trx.tanggal, start, end);
    });
  }, [transactions, filterJenis, filterPeriod, customStart, customEnd]);

  // Hitung total keuntungan
  const totalKeuntungan = useMemo(() => {
    return filteredTransactions.reduce(
      (sum, trx) => sum + (trx.keuntungan || 0),
      0
    );
  }, [filteredTransactions]);

  const jenisOptions = [
    { value: "all", label: "Semua Transaksi" },
    { value: "voucher", label: "Voucher" },
    { value: "service", label: "Service HP" },
    { value: "aksesoris", label: "Aksesoris" },
    { value: "sparepart", label: "Sparepart" },
    { value: "jualanHarian", label: "Jualan Harian" },
  ];

  const periodOptions = [
    { value: "all", label: "Semua Waktu" },
    { value: "today", label: "Hari Ini" },
    { value: "month", label: "Bulan Ini" },
    { value: "year", label: "Tahun Ini" },
    { value: "custom", label: "Custom Tanggal" },
    useQuery,
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-base md:text-2xl mt-4 font-bold text-gray-800">
          Riwayat Transaksi - {dataMember?.nama}
        </h1>
        <p className="text-gray-600 text-xs">
          Semua aktivitas transaksi member ini
        </p>
      </div>

      {/* STATS */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <h3 className="text-sm font-medium text-green-800 mb-1">
          Total Keuntungan
        </h3>
        <p className="text-2xl font-bold text-green-700">
          {formatRupiah(totalKeuntungan)}
        </p>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Filter Jenis */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Jenis Transaksi
          </label>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {jenisOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Periode */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Periode
          </label>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Start */}
        {filterPeriod === "custom" && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Dari
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        )}

        {/* Custom End */}
        {filterPeriod === "custom" && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sampai
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        )}
      </div>

      {/* Daftar Transaksi */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Tidak ada transaksi ditemukan.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((trx) => (
            <div
              key={trx.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(trx.jenis)}`}
                >
                  <span className="text-lg">{getTypeIcon(trx.jenis)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(trx.jenis)}`}
                    >
                      {jenisOptions.find((j) => j.value === trx.jenis)?.label ||
                        trx.jenis}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(trx.tanggal)}
                    </span>
                  </div>

                  {trx.items.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {trx.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          <span className="font-medium">{item.nama}</span>
                          {item.qty && <span> × {item.qty}</span>}
                          {trx.jenis !== "jualan Harian" &&
                            item.harga != null && (
                              <span className="ml-2 text-gray-500">
                                {formatRupiah(item.harga)}
                              </span>
                            )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      Tidak ada detail item
                    </p>
                  )}

                  <div className="mt-3 flex justify-between text-sm font-medium">
                    <span>Total: {formatRupiah(trx.totalHarga)}</span>
                    <span className="text-green-600">
                      Keuntungan: {formatRupiah(trx.keuntungan)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
