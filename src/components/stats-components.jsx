import React from "react";
import { StatCard } from "./stats-overview";
import {
  ArrowRightLeft,
  Clock,
  DollarSign,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";

export const StatsSection = React.memo(function StatsSection({
  stats,
  onOpenKeuntungan,
  onOpenOmset,
  onOpenTrx,
  onOpenService,
  onOpenService2,
}) {
  const d = stats || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
      <StatCard
        label="Keuntungan Hari Ini"
        value={`Rp ${d.keuntunganHariIni?.toLocaleString("id-ID")}`}
        icon={DollarSign}
        color="emerald"
        onClick={onOpenKeuntungan}
      />

      <StatCard
        label="Omset Hari Ini"
        value={`Rp ${d.omsetHariIni?.toLocaleString("id-ID")}`}
        icon={Wallet}
        color="blue"
        onClick={onOpenOmset}
      />

      <StatCard
        label="Transaksi Hari Ini"
        value={d.transaksiHariIni}
        icon={ArrowRightLeft}
        color="indigo"
        onClick={onOpenTrx}
      />

      <StatCard
        label="Voucher Pending"
        value={`${d.voucherPending} Pesanan`}
        icon={Clock}
        color="amber"
      />

      <StatCard
        label="Omset Sparepart + Service"
        value={`Rp ${d.omsetService?.toLocaleString("id-ID")}`}
        icon={TrendingUp}
        color="violet"
        onClick={onOpenService}
      />

      <StatCard
        label="Keuntungan Sparepart + Service"
        value={`Rp ${d.keuntunganService?.toLocaleString("id-ID")}`}
        icon={Wrench}
        color="rose"
        onClick={onOpenService2}
      />
    </div>
  );
});
