// src/components/stats-components.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightLeft,
  Clock,
  DollarSign,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";

export const StatsSection = React.memo(function StatsSection({ stats }) {
  const navigate = useNavigate();
  const d = stats || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
      {/* Keuntungan Hari Ini - Emerald */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200/60 
          transition-all duration-300 w-full text-left select-none 
          cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-200/50 active:scale-95"
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Keuntungan Hari Ini
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-emerald-700 truncate">
              Rp {d.keuntunganHariIni?.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-slate-200/50">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Omset Hari Ini - Blue */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className="bg-blue-50 rounded-2xl p-4 sm:p-5 border border-blue-200/60 
          transition-all duration-300 w-full text-left select-none 
          cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200/50 active:scale-95"
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Omset Hari Ini
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-blue-700 truncate">
              Rp {d.omsetHariIni?.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-slate-200/50">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Transaksi Hari Ini - Indigo */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className="bg-indigo-50 rounded-2xl p-4 sm:p-5 border border-indigo-200/60 
          transition-all duration-300 w-full text-left select-none 
          cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200/50 active:scale-95"
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Transaksi Hari Ini
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-indigo-700 truncate">
              {d.transaksiHariIni}
            </p>
          </div>
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-slate-200/50">
            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Voucher Pending - Amber */}
      <div
        className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200/60 
        transition-all duration-300 w-full text-left select-none min-h-[100px]"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Voucher Pending
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-amber-700 truncate">
              {d.voucherPending} Pesanan
            </p>
          </div>
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-slate-200/50">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Omset Service + Sparepart - Violet */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className="bg-violet-50 rounded-2xl p-4 sm:p-5 border border-violet-200/60 
          transition-all duration-300 w-full text-left select-none 
          cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200/50 active:scale-95"
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Omset Sparepart + Service
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-violet-700 truncate">
              Rp {d.omsetService?.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-slate-200/50">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Keuntungan Service + Sparepart - Rose */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className="bg-rose-50 rounded-2xl p-4 sm:p-5 border border-rose-200/60 
          transition-all duration-300 w-full text-left select-none 
          cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-200/50 active:scale-95"
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Keuntungan Sparepart + Service
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-rose-700 truncate">
              Rp {d.keuntunganService?.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-slate-200/50">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>
    </div>
  );
});
