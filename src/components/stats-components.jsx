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

  const cardBase =
    "rounded-2xl p-4 sm:p-5 border transition-all duration-300 w-full text-left select-none cursor-pointer active:scale-95 transform-gpu will-change-transform shadow-md";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
      {/* Keuntungan Hari Ini */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className={`${cardBase} bg-emerald-50 border-emerald-200 hover:-translate-y-0.5 hover:shadow-lg`}
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Keuntungan Hari Ini
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-emerald-700 truncate">
              Rp {(d.keuntunganHariIni ?? 0).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Omset Hari Ini */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className={`${cardBase} bg-blue-50 border-blue-200 hover:-translate-y-0.5 hover:shadow-lg`}
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Omset Hari Ini
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-blue-700 truncate">
              Rp {(d.omsetHariIni ?? 0).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Transaksi Hari Ini */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className={`${cardBase} bg-indigo-50 border-indigo-200 hover:-translate-y-0.5 hover:shadow-lg`}
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Transaksi Hari Ini
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-indigo-700 truncate">
              {d.transaksiHariIni ?? 0}
            </p>
          </div>

          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Voucher Pending */}
      <div
        className={`${cardBase} bg-amber-50 border-amber-200 cursor-default`}
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Voucher Pending
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-amber-700 truncate">
              {d.voucherPending ?? 0} Pesanan
            </p>
          </div>

          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Omset Sparepart + Service */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className={`${cardBase} bg-violet-50 border-violet-200 hover:-translate-y-0.5 hover:shadow-lg`}
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Omset Sparepart + Service
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-violet-700 truncate">
              Rp {(d.omsetService ?? 0).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Keuntungan Sparepart + Service */}
      <button
        onClick={() => navigate("/dashboard/detail-overview")}
        className={`${cardBase} bg-rose-50 border-rose-200 hover:-translate-y-0.5 hover:shadow-lg`}
        style={{ minHeight: "100px" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Keuntungan Sparepart + Service
            </p>
            <p className="text-base sm:text-lg font-bold mt-1 text-rose-700 truncate">
              Rp {(d.keuntunganService ?? 0).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
      </button>
    </div>
  );
});
