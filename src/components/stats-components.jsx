import React from "react";
import { StatCard } from "./stats-overview";

import {
  DollarSign,
  Wallet,
  ArrowRightLeft,
  Clock,
  TrendingUp,
  Wrench,
} from "lucide-react";

export const StatsSection = React.memo(function StatsSection({
  data,
  onOpenKeuntungan,
  onOpenOmset,
  onOpenTrx,
  onOpenService,
  onOpenService2,
}) {
  const d = data || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
      {/* Keuntungan Hari Ini */}
      <StatCard
        label="Keuntungan Hari Ini"
        value={`Rp ${(
          Number(d.totalKeuntunganHariIni || 0) +
          Number(d.keuntunganGrosirVoucherHariIni || 0) +
          Number(d.keuntunganAccHariIni || 0) +
          Number(d.keuntunganVoucherHarian || 0)
        ).toLocaleString("id-ID")}`}
        icon={DollarSign}
        color="emerald"
        onClick={onOpenKeuntungan}
      />

      {/* Omset Hari Ini */}
      <StatCard
        label="Omset Hari Ini"
        value={`Rp ${(
          (d.omsetGrosirVoucherHariIni || 0) +
          (d.omsetAccHariIni || 0) +
          (d.omsetVoucherHarian || 0)
        ).toLocaleString("id-ID")}`}
        icon={Wallet}
        color="blue"
        onClick={onOpenOmset}
      />

      {/* Transaksi Hari Ini */}
      <StatCard
        label="Transaksi Hari Ini"
        value={
          (d.totalTransaksiVoucherHarian || 0) +
          (d.trxAccHariIniTotal || 0) +
          (d.trxVoucherDownlineHariIniTotal || 0) +
          (d.trxHariIniTotal || 0)
        }
        icon={ArrowRightLeft}
        color="indigo"
        onClick={onOpenTrx}
      />

      {/* Voucher Pending */}
      <StatCard
        label="Voucher Pending"
        value={`${d.trxVoucherPendingHariIni || 0} Pesanan`}
        icon={Clock}
        color="amber"
      />

      {/* Omset Sparepart + Service */}
      <StatCard
        label="Omset Sparepart + Service"
        value={`Rp ${(
          (d.omsetServicetHariIni || 0) + (d.omsetSparepartHariIni || 0)
        ).toLocaleString("id-ID")}`}
        icon={TrendingUp}
        color="violet"
        onClick={onOpenService}
      />

      {/* Keuntungan Sparepart + Service */}
      <StatCard
        label="Keuntungan Sparepart + Service"
        value={`Rp ${(
          (d.keuntunganServiceHariIni || 0) +
          (d.keuntunganSparepartHariIni || 0)
        ).toLocaleString("id-ID")}`}
        icon={Wrench}
        color="rose"
        onClick={onOpenService2}
      />
    </div>
  );
});
