import React, { useState } from "react";
import {
  Wallet,
  X,
  TrendingUp,
  Package,
  BarChart3,
  PlusCircle,
  Loader2Icon,
  DollarSign,
  Building2,
  ChevronDown,
  ArrowRightLeft,
  Clock,
  Wrench,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";

import TableSectionVoucherGrosirToday from "../components/table-grosir-voucher-today";
import TableSectionAccToday from "../components/table-acc-today";
import TableSectionSparepartToday from "../components/table-sparepart-today";
import TableUangModalToday from "../components/table-uang-modal";
import TableSectionServiceToday from "../components/table-service-today";
import TableStokVoucher from "../components/stok-voucher";
import TableStokAcc from "../components/stok-acc";
import TableStokSparepart from "../components/stok-sparepart";

import ModalGrosirVoucher from "../components/modal-trans-voucher";
import ModalTransaksiSparepart from "../components/modal-trans-sparepart";
import ModalServiceHP from "../components/modal-service";
import ModalTransaksiAcc from "../components/modal-trans-acc";
import { useAuthStore } from "../store/useAuthStore";
import PencarianCepat from "../components/pencarian-cepat";
import GrafikKeuntungan from "../components/grafik";
import GrafikKeuntungan2 from "../components/grafik2";

export default function Overview() {
  const { user } = useAuthStore();

  // Modal
  const [openModalAcc, setOpenModalAcc] = useState(false);
  const [openModalVD, setOpenModalVD] = useState(false);
  const [openModalSparepart, setOpenModalSparepart] = useState(false);
  const [openModalService, setOpenModalService] = useState(false);
  const [modalKeuntungan, setModalKeuntungan] = useState(false);
  const [modalOmset, setModalOmset] = useState(false);
  const [modalTrx, setModalTrx] = useState(false);
  const [modalService, setModalService] = useState(false);
  const [modalService2, setModalService2] = useState(false);

  const [jenis, setJenis] = useState("Transaksi Aksesoris Harian");

  // Search
  const [searchAccStok, setSearchAccStok] = useState("");
  const [searchSparepartStok, setSearchSparepartStok] = useState("");
  const [searchVdStok, setSearchVdStok] = useState("");

  // === REACT QUERY DASHBOARD ===
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
    keepPreviousData: true,
  });

  if (isLoading) {
    return <div className="p-6">Memuat data dashboard...</div>;
  }

  const d = dashboardData;

  return (
    <div className="p-2 space-y-8 mt-6">
      {/* HEADER */}
      {/* STAT CARDS — DATA REAL */}
      {/* Tambahkan loading state */}
      {!d ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl p-4 sm:p-5 animate-pulse min-h-[100px]"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {/* Keuntungan Hari Ini - GREEN */}
          <StatCard
            label="Keuntungan Hari Ini"
            value={`Rp ${(
              Number(d?.totalKeuntunganHariIni || 0) +
              Number(d?.keuntunganGrosirVoucherHariIni || 0) +
              Number(d?.keuntunganAccHariIni || 0) +
              Number(d?.keuntunganVoucherHarian || 0)
            ).toLocaleString("id-ID")}`}
            icon={DollarSign}
            color="emerald"
            onClick={() => setModalKeuntungan(true)}
          />

          {/* Omset Hari Ini - BLUE */}
          <StatCard
            label="Omset Hari Ini"
            value={`Rp ${(
              (d?.omsetGrosirVoucherHariIni || 0) +
              (d?.omsetAccHariIni || 0) +
              (d?.omsetVoucherHarian || 0)
            ).toLocaleString("id-ID")}`}
            icon={Wallet}
            color="blue"
            onClick={() => setModalOmset(true)}
          />

          {/* Transaksi Hari Ini - INDIGO */}
          <StatCard
            label="Transaksi Hari Ini"
            value={
              (d?.totalTransaksiVoucherHarian || 0) +
              (d?.trxAccHariIniTotal || 0) +
              (d?.trxVoucherDownlineHariIniTotal || 0) +
              (d?.trxHariIniTotal || 0)
            }
            icon={ArrowRightLeft}
            color="indigo"
            onClick={() => setModalTrx(true)}
          />

          {/* Voucher Pending - AMBER */}
          <StatCard
            label="Voucher Pending"
            value={`${d?.trxVoucherPendingHariIni || 0} Pesanan`}
            icon={Clock}
            color="amber"
          />

          {/* Omset Sparepart + Service - VIOLET */}
          <StatCard
            label="Omset Sparepart + Service"
            value={`Rp ${(
              (d?.omsetServicetHariIni || 0) + (d?.omsetSparepartHariIni || 0)
            ).toLocaleString("id-ID")}`}
            icon={TrendingUp}
            color="violet"
            onClick={() => setModalService(true)}
          />

          {/* Keuntungan Sparepart + Service - ROSE */}
          <StatCard
            label="Keuntungan Sparepart + Service"
            value={`Rp ${(
              (d?.keuntunganServiceHariIni || 0) +
              (d?.keuntunganSparepartHariIni || 0)
            ).toLocaleString("id-ID")}`}
            icon={Wrench}
            color="rose"
            onClick={() => setModalService2(true)}
          />
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-x-3">
        <div className="lg:w-1/2 w-full ">
          <GrafikKeuntungan />
        </div>
        <div className="lg:w-1/2 w-full">
          <GrafikKeuntungan2 />
        </div>
      </div>
      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton
          onClick={() => setOpenModalVD(true)}
          label="  Grosir Voucher"
        />
        <ActionButton
          label="  Aksesoris"
          onClick={() => setOpenModalAcc(true)}
        />
        <ActionButton
          onClick={() => setOpenModalService(true)}
          label=" Service HP"
        />
        <ActionButton
          onClick={() => setOpenModalSparepart(true)}
          label="  Sparepart"
        />
      </div>
      {/* SEARCH INPUTS STOK */}
      <div className="">
        <PencarianCepat />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pilih Transaksi
        </label>

        <div className="relative">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 
                 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                 outline-none transition appearance-none"
          >
            <option value="Transaksi Voucher Harian">
              Transaksi Voucher Harian
            </option>
            <option value="Transaksi Sparepart Harian">
              Transaksi Sparepart Harian
            </option>
            <option value="Service Harian">Service Harian</option>
            <option value="Transaksi Aksesoris Harian">
              Transaksi Aksesoris Harian
            </option>
          </select>

          {/* Arrow */}
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* MODALS */}
      <ModalTransaksiAcc
        isOpen={openModalAcc}
        onClose={() => setOpenModalAcc(false)}
        onSuccess={refetch}
      />
      <ModalTransaksiSparepart
        isOpen={openModalSparepart}
        onClose={() => setOpenModalSparepart(false)}
        onSuccess={refetch}
      />
      <ModalGrosirVoucher
        isOpen={openModalVD}
        onClose={() => setOpenModalVD(false)}
        onSuccess={refetch}
      />
      <ModalServiceHP
        isOpen={openModalService}
        onClose={() => setOpenModalService(false)}
        onSuccess={refetch}
      />
      {/* TABLES — KIRIM DATA & PAGINATION */}
      <div className="space-y-10">
        {jenis === "Transaksi Voucher Harian" ? (
          <TableSectionVoucherGrosirToday
            title="Grosir Voucher Hari Ini"
            data={dashboardData.trxVoucherDownlineHariIni}
            onSuccess={refetch}
          />
        ) : jenis === "Transaksi Sparepart Harian" ? (
          <TableSectionSparepartToday
            title="Sparepart Hari Ini"
            data={dashboardData.trxSparepartHariIni}
            onSuccess={refetch}
          />
        ) : jenis === "Transaksi Aksesoris Harian" ? (
          <TableSectionAccToday
            title="Aksesoris Hari Ini"
            data={dashboardData.trxAccHariIni}
            onSuccess={refetch}
          />
        ) : jenis === "Service Harian" ? (
          <TableSectionServiceToday
            title="Service HP"
            data={dashboardData.trxServiceHariIni}
            onSuccess={refetch}
          />
        ) : null}

        <TableUangModalToday
          title="Uang Keluar / Hutang Hari Ini"
          data={dashboardData.uangModalHariIni}
          onSuccess={refetch}
        />
        <TableStokVoucher title="Stok Voucher Menipis" data={d.stokVd} />
        <TableStokAcc title="Stok Aksesoris Menipis" data={d.stokAcc} />
        <TableStokSparepart
          title="Stok Sparepart Menipis"
          data={d.stokSparepart}
        />

        {/* Uang Keluar — sesuaikan jika punya data */}
      </div>
      {modalKeuntungan ? (
        <DetailKeuntunganModal
          isOpen={modalKeuntungan}
          onClose={setModalKeuntungan}
          keuntunganGrosirVoucher={d.keuntunganGrosirVoucherHariIni}
          keuntunganAcc={d.keuntunganAccHariIni}
          keuntunganTransaksi={d.totalKeuntunganHariIni}
          keuntunganVoucherHarian={d.keuntunganVoucherHarian}
        />
      ) : null}
      {modalOmset ? (
        <DetailOmsetModal
          isOpen={modalOmset}
          onClose={setModalOmset}
          omsetGrosirVoucher={d.omsetGrosirVoucherHariIni}
          omsetAcc={d.omsetAccHariIni}
          omsetVoucherHarian={d.omsetVoucherHarian}
        />
      ) : null}

      {modalTrx ? (
        <DetailTrxModal
          isOpen={modalTrx}
          onClose={setModalTrx}
          totalTrxGrosirVoucher={d.trxVoucherDownlineHariIniTotal}
          totalTrxAcc={d.trxAccHariIniTotal}
          totalTrx={d.trxHariIniTotal}
          totalTrxVoucherHarian={d.totalTransaksiVoucherHarian}
        />
      ) : null}

      {modalService ? (
        <DetailServiceModal
          isOpen={modalService}
          onClose={setModalService}
          totalService={d.trxServiceHariIniTotal}
          totalSparepartTrx={d.trxSparepartHariIniTotal}
          omsetService={d.omsetServicetHariIni}
          keuntunganService={d.keuntunganServiceHariIni}
          omsetSparepart={d.omsetSparepartHariIni}
          keuntunganSparepart={d.keuntunganSparepartHariIni}
        />
      ) : null}

      {modalService2 ? (
        <DetailServiceModal2
          isOpen={modalService2}
          onClose={setModalService2}
          totalService={d.trxServiceHariIniTotal}
          totalSparepartTrx={d.trxSparepartHariIniTotal}
          omsetService={d.omsetServicetHariIni}
          keuntunganService={d.keuntunganServiceHariIni}
          omsetSparepart={d.omsetSparepartHariIni}
          keuntunganSparepart={d.keuntunganSparepartHariIni}
        />
      ) : null}
    </div>
  );
}

// === Komponen UI Tetap Sama ===
// StatCard Component dengan Color Variants
// StatCard Component - Colorful Version
// StatCard Component (update untuk terima onClick)
// Gunakan button bukan div untuk onClick
function StatCard({ label, value, icon: Icon, color = "emerald", onClick }) {
  const colorConfig = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200/60",
      shadow: "hover:shadow-emerald-200/50",
      text: "text-emerald-700",
      gradient: "from-emerald-500 to-teal-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200/60",
      shadow: "hover:shadow-blue-200/50",
      text: "text-blue-700",
      gradient: "from-blue-500 to-cyan-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200/60",
      shadow: "hover:shadow-indigo-200/50",
      text: "text-indigo-700",
      gradient: "from-indigo-500 to-purple-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200/60",
      shadow: "hover:shadow-amber-200/50",
      text: "text-amber-700",
      gradient: "from-amber-500 to-orange-600",
    },
    violet: {
      bg: "bg-violet-50",
      border: "border-violet-200/60",
      shadow: "hover:shadow-violet-200/50",
      text: "text-violet-700",
      gradient: "from-violet-500 to-fuchsia-600",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-200/60",
      shadow: "hover:shadow-rose-200/50",
      text: "text-rose-700",
      gradient: "from-rose-500 to-pink-600",
    },
  };

  const config = colorConfig[color] || colorConfig.emerald;

  // Jika ada onClick, gunakan button, jika tidak gunakan div
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`
        ${config.bg} rounded-2xl p-4 sm:p-5 border ${config.border} 
        hover:shadow-lg ${config.shadow} transition-all duration-300 
        hover:-translate-y-0.5 w-full text-left
        ${onClick ? "cursor-pointer active:scale-95" : ""}
      `}
      style={{ minHeight: "100px" }} // Fixed height untuk prevent layout shift
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            {label}
          </p>
          <p
            className={`text-base sm:text-lg font-bold mt-1 ${config.text} truncate`}
          >
            {value} ..
          </p>
        </div>
        <div
          className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} 
                      shadow-lg shadow-slate-200/50 transition-transform`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
    </Component>
  );
}
// src/components/DetailKeuntunganModal.jsx

function DetailKeuntunganModal({
  isOpen,
  onClose,
  keuntunganGrosirVoucher = 0,
  keuntunganAcc = 0,
  keuntunganTransaksi = 0,
  keuntunganVoucherHarian = 0,
}) {
  if (!isOpen) return null;

  const totalKeuntungan =
    keuntunganGrosirVoucher +
    keuntunganAcc +
    keuntunganTransaksi +
    keuntunganVoucherHarian;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const items = [
    {
      title: "Grosir Voucher",
      value: keuntunganGrosirVoucher,
      icon: <Package className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Aksesoris",
      value: keuntunganAcc,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Transaksi Lain",
      value: keuntunganTransaksi,
      icon: <Wallet className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Voucher Harian",
      value: keuntunganVoucherHarian,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Detail Keuntungan
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Rincian keuntungan hari ini
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-indigo-200 hover:text-white transition"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Total Keuntungan */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Total Keuntungan Hari Ini</p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">
              {formatRupiah(totalKeuntungan)}
            </h3>
          </div>

          {/* Detail Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-800">
                    {item.title}
                  </span>
                </div>
                <span className={`font-bold ${item.color}`}>
                  {formatRupiah(item.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onClose(false)}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailOmsetModal({
  isOpen,
  onClose,
  omsetGrosirVoucher = 0,
  omsetAcc = 0,
  omsetVoucherHarian = 0,
}) {
  if (!isOpen) return null;

  const totalKeuntungan = omsetGrosirVoucher + omsetAcc + omsetVoucherHarian;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const items = [
    {
      title: "Grosir Voucher",
      value: omsetGrosirVoucher,
      icon: <Package className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Aksesoris",
      value: omsetAcc,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },

    {
      title: "Voucher Harian",
      value: omsetVoucherHarian,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Detail omset
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Rincian omset hari ini
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-indigo-200 hover:text-white transition"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Totalomset */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Totalomset Hari Ini</p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">
              {formatRupiah(totalKeuntungan)}
            </h3>
          </div>

          {/* Detail Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-800">
                    {item.title}
                  </span>
                </div>
                <span className={`font-bold ${item.color}`}>
                  {formatRupiah(item.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onClose(false)}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailTrxModal({
  isOpen,
  onClose,
  totalTrxGrosirVoucher = 0,
  totalTrxAcc = 0,
  totalTrx = 0,
  totalTrxVoucherHarian = 0,
}) {
  if (!isOpen) return null;

  const totalKeuntungan =
    totalTrxGrosirVoucher + totalTrxAcc + totalTrxVoucherHarian + totalTrx;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const items = [
    {
      title: "Grosir Voucher",
      value: totalTrxGrosirVoucher,
      icon: <Package className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Aksesoris",
      value: totalTrxAcc,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Transaksi",
      value: totalTrx,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },

    {
      title: "Voucher Harian",
      value: totalTrxVoucherHarian,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Detail Transaksi
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Rincian Transaksi hari ini
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-indigo-200 hover:text-white transition"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Totalomset */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Total Transaksi Hari Ini</p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">
              {totalKeuntungan}
            </h3>
          </div>

          {/* Detail Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-800">
                    {item.title}
                  </span>
                </div>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onClose(false)}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailServiceModal({
  isOpen,
  onClose,
  totalService,
  totalSparepartTrx,
  omsetService,
  keuntunganService,
  omsetSparepart,
  keuntunganSparepart,
}) {
  if (!isOpen) return null;

  const totalKeuntungan = omsetService + omsetSparepart;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const items = [
    {
      title: "Service",
      value: totalService,
      icon: <Package className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Transaksi Sparepart",
      value: totalSparepartTrx,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Omset Sparepart",
      value: omsetSparepart,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },

    {
      title: "Omset Service",
      value: omsetService,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },

    {
      title: "Keuntungan Sparepart",
      value: keuntunganSparepart,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },

    {
      title: "Keuntungan Service",
      value: keuntunganService,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const isText = ["Service", "Transaksi Sparepart"].includes(items);

  return (
    <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Detail Transaksii
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Rincian Transaksi hari ini
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-indigo-200 hover:text-white transition"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Totalomset */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Total Omset Hari Ini</p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">
              Rp. {totalKeuntungan.toLocaleString()}
            </h3>
          </div>

          {/* Detail Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-800">
                    {item.title}
                  </span>
                </div>

                <span className={`font-bold ${item.color}`}>
                  {isText
                    ? item.value
                    : `${Number(item.value).toLocaleString("id-ID")}`}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onClose(false)}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailServiceModal2({
  isOpen,
  onClose,
  totalService,
  totalSparepartTrx,
  omsetService,
  keuntunganService,
  omsetSparepart,
  keuntunganSparepart,
}) {
  if (!isOpen) return null;

  const totalKeuntungan = keuntunganService + keuntunganSparepart;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const items = [
    {
      title: "Service",
      value: totalService,
      icon: <Package className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Transaksi Sparepart",
      value: totalSparepartTrx,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Omset Sparepart",
      value: omsetSparepart,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },

    {
      title: "Omset Service",
      value: omsetService,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },

    {
      title: "Keuntungan Sparepart",
      value: keuntunganSparepart,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },

    {
      title: "Keuntungan Service",
      value: keuntunganService,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const isText = ["Service", "Transaksi Sparepart"].includes(items);

  return (
    <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Detail Transaksi
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Rincian Transaksi hari ini
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-indigo-200 hover:text-white transition"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Totalomset */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Total Keuntungan Hari Ini</p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">
              Rp. {totalKeuntungan.toLocaleString()}
            </h3>
          </div>

          {/* Detail Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-800">
                    {item.title}
                  </span>
                </div>

                <span className={`font-bold ${item.color}`}>
                  {isText
                    ? item.value
                    : `${Number(item.value).toLocaleString("id-ID")}`}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onClose(false)}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center text-xs justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-sm transition w-full"
    >
      <PlusCircle className="w-5 h-5" />
      {label}
    </button>
  );
}
