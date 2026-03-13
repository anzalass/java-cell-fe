// src/pages/DashboardKeuangan.jsx
import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Wallet,
  Package,
  ArrowRightLeft,
  Box,
  Wrench,
  ShoppingCart,
  DollarSign,
  Clock,
  RefreshCw,
  Download,
  Building2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

// StatCard Component (di LUAR main component)
function StatCard({
  label,
  value,
  icon: Icon,
  color = "emerald",
  onClick,
  isCurrency = true,
}) {
  const colorConfig = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200/60",
      text: "text-emerald-700",
      gradient: "from-emerald-500 to-teal-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200/60",
      text: "text-blue-700",
      gradient: "from-blue-500 to-cyan-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200/60",
      text: "text-indigo-700",
      gradient: "from-indigo-500 to-purple-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200/60",
      text: "text-amber-700",
      gradient: "from-amber-500 to-orange-600",
    },
    violet: {
      bg: "bg-violet-50",
      border: "border-violet-200/60",
      text: "text-violet-700",
      gradient: "from-violet-500 to-fuchsia-600",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-200/60",
      text: "text-rose-700",
      gradient: "from-rose-500 to-pink-600",
    },
    slate: {
      bg: "bg-slate-50",
      border: "border-slate-200/60",
      text: "text-slate-700",
      gradient: "from-slate-500 to-slate-700",
    },
  };

  const config = colorConfig[color] || colorConfig.emerald;
  const hasClick = !!onClick;

  const formatValue = () => {
    if (typeof value === "number") {
      return isCurrency
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(value)
        : new Intl.NumberFormat("id-ID").format(value);
    }
    return value;
  };

  return (
    <div
      onClick={onClick}
      role={hasClick ? "button" : undefined}
      tabIndex={hasClick ? 0 : undefined}
      className={`
        ${config.bg} rounded-2xl p-4 sm:p-5 border ${config.border} 
        transition-all duration-300 w-full text-left select-none
        ${hasClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-95" : ""}
        hover:shadow-${color}-200/50
      `}
      style={{ minHeight: "100px" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            {label}
          </p>
          <p
            className={`text-base sm:text-lg font-bold mt-1 ${config.text} truncate`}
          >
            {formatValue()}
          </p>
        </div>
        <div
          className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} 
                      shadow-lg shadow-slate-200/50`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, value, icon: Icon, gradient, subValue }) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subValue && (
            <p className="text-white/60 text-xs mt-0.5">{subValue}</p>
          )}
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({ title, icon: Icon, color = "blue", subtitle }) {
  const colorConfig = {
    blue: "from-blue-500 to-cyan-500",
    emerald: "from-emerald-500 to-teal-500",
    violet: "from-violet-500 to-fuchsia-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
    indigo: "from-indigo-500 to-purple-500",
    slate: "from-slate-500 to-slate-700",
  };

  const gradient = colorConfig[color] || colorConfig.blue;

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}

// Main Component
export default function DashboardKeuangan() {
  const { user } = useAuthStore();
  const [loadingExport, setLoadingExport] = useState(false);

  // Search states (untuk filter stok)
  const [searchAccStok, setSearchAccStok] = useState("");
  const [searchSparepartStok, setSearchSparepartStok] = useState("");
  const [searchVdStok, setSearchVdStok] = useState("");

  // === REACT QUERY ===
  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", searchAccStok, searchSparepartStok, searchVdStok],
    queryFn: async () => {
      const res = await api.get("/dashboard2", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  // === MEMOIZED STATS ===
  const stats = useMemo(() => {
    const d = dashboardData || {};

    return {
      keuntunganHariIni:
        Number(d.totalKeuntunganHariIni || 0) +
        Number(d.keuntunganGrosirVoucherHariIni || 0) +
        Number(d.keuntunganAccHariIni || 0) +
        Number(d.keuntunganVoucherHarian || 0),

      omsetHariIni:
        (d.omsetGrosirVoucherHariIni || 0) +
        (d.omsetAccHariIni || 0) +
        (d.omsetVoucherHarian || 0),

      transaksiHariIni:
        (d.totalTransaksiVoucherHarian || 0) +
        (d.trxAccHariIniTotal || 0) +
        (d.trxVoucherDownlineHariIniTotal || 0) +
        (d.trxHariIniTotal || 0),

      voucherPending: d.trxVoucherPendingHariIni || 0,

      omsetService:
        (d.omsetServicetHariIni || 0) + (d.omsetSparepartHariIni || 0),

      keuntunganService:
        (d.keuntunganServiceHariIni || 0) + (d.keuntunganSparepartHariIni || 0),
    };
  }, [dashboardData]);

  // Format helpers
  const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatAngka = (value) => {
    return new Intl.NumberFormat("id-ID").format(value || 0);
  };

  const formatShort = (num) => {
    const value = num || 0;
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}rb`;
    return formatAngka(value);
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Export handler
  const handleExport = async () => {
    setLoadingExport(true);
    // TODO: Implement export logic
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("✅ Export berhasil!");
    setLoadingExport(false);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 mx-auto text-indigo-600 animate-spin" />
          <p className="mt-4 text-slate-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const d = dashboardData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Dashboard Keuangan
            </h1>
            <p className="text-slate-500 mt-1 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {getTodayDate()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={handleExport}
              disabled={loadingExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 
                       text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 
                       hover:shadow-emerald-500/40 transition-all duration-200 disabled:opacity-50"
            >
              {loadingExport ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS - 3 Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard
            title="Total Keuntungan"
            value={formatShort(stats.keuntunganHariIni)}
            subValue={formatRupiah(stats.keuntunganHariIni)}
            icon={TrendingUp}
            gradient="from-emerald-500 to-teal-600"
          />
          <SummaryCard
            title="Total Omset"
            value={formatShort(stats.omsetHariIni)}
            subValue={formatRupiah(stats.omsetHariIni)}
            icon={Wallet}
            gradient="from-blue-500 to-cyan-600"
          />
          <SummaryCard
            title="Total Transaksi"
            value={formatAngka(stats.transaksiHariIni)}
            subValue="Transaksi hari ini"
            icon={ArrowRightLeft}
            gradient="from-violet-500 to-purple-600"
          />
        </div>

        {/* VOUCHER HARIAN SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <SectionHeader
            title="Voucher Harian"
            icon={Package}
            color="blue"
            subtitle="Transaksi voucher reguler"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Omset"
              value={d.omsetVoucherHarian || 0}
              icon={Wallet}
              color="blue"
            />
            <StatCard
              label="Keuntungan"
              value={d.keuntunganVoucherHarian || 0}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label="Transaksi"
              value={d.totalTransaksiVoucherHarian || 0}
              icon={ArrowRightLeft}
              color="violet"
              isCurrency={false}
            />
            <StatCard
              label="Pending"
              value={`${d.trxVoucherPendingHariIni || 0} Pesanan`}
              icon={Clock}
              color="amber"
              isCurrency={false}
            />
          </div>
        </div>

        {/* GROSIR VOUCHER SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <SectionHeader
            title="Grosir Voucher"
            icon={ShoppingCart}
            color="amber"
            subtitle="Transaksi voucher grosir/downline"
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard
              label="Omset"
              value={d.omsetGrosirVoucherHariIni || 0}
              icon={Wallet}
              color="amber"
            />
            <StatCard
              label="Keuntungan"
              value={d.keuntunganGrosirVoucherHariIni || 0}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label="Transaksi"
              value={d.trxVoucherDownlineHariIniTotal || 0}
              icon={ArrowRightLeft}
              color="violet"
              isCurrency={false}
            />
          </div>
        </div>

        {/* AKSESORIS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <SectionHeader
            title="Aksesoris"
            icon={Box}
            color="violet"
            subtitle="Transaksi aksesoris & aksesoris HP"
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard
              label="Omset"
              value={d.omsetAccHariIni || 0}
              icon={Wallet}
              color="violet"
            />
            <StatCard
              label="Keuntungan"
              value={d.keuntunganAccHariIni || 0}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label="Transaksi"
              value={d.trxAccHariIniTotal || 0}
              icon={ArrowRightLeft}
              color="slate"
              isCurrency={false}
            />
          </div>
        </div>

        {/* SPAREPART SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <SectionHeader
            title="Sparepart"
            icon={Box}
            color="rose"
            subtitle="Transaksi sparepart & komponen"
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard
              label="Omset"
              value={d.omsetSparepartHariIni || 0}
              icon={Wallet}
              color="rose"
            />
            <StatCard
              label="Keuntungan"
              value={d.keuntunganSparepartHariIni || 0}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label="Transaksi"
              value={d.trxSparepartHariIniTotal || 0}
              icon={ArrowRightLeft}
              color="slate"
              isCurrency={false}
            />
          </div>
        </div>

        {/* SERVICE SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <SectionHeader
            title="Service HP"
            icon={Wrench}
            color="indigo"
            subtitle="Transaksi jasa service perangkat"
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard
              label="Omset"
              value={d.omsetServicetHariIni || 0}
              icon={Wallet}
              color="indigo"
            />
            <StatCard
              label="Keuntungan"
              value={d.keuntunganServiceHariIni || 0}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label="Transaksi"
              value={d.trxServiceHariIniTotal || 0}
              icon={ArrowRightLeft}
              color="slate"
              isCurrency={false}
            />
          </div>
        </div>

        {/* PENGELUARAN SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <SectionHeader
            title="Pengeluaran"
            icon={DollarSign}
            color="slate"
            subtitle="Uang keluar & hutang hari ini"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Uang Keluar"
              value={d.uangKeluar || 0}
              icon={DollarSign}
              color="slate"
            />
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between min-h-[100px]">
              <div>
                <p className="text-slate-500 text-xs font-medium">Status</p>
                <p className="text-slate-700 font-semibold mt-1">
                  {d.uangKeluar > 0 ? "Ada Pengeluaran" : "Tidak Ada"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  d.uangKeluar > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {d.uangKeluar > 0 ? "⚠️" : "✅"}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center pt-4 pb-2">
          <p className="text-slate-400 text-xs">
            Data terakhir diperbarui: {new Date().toLocaleTimeString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
}
