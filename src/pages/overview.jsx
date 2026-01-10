import React, { useState } from "react";
import {
  Search,
  Wallet,
  ShoppingBag,
  Receipt,
  Wrench,
  Layers,
  X,
  TrendingUp,
  Package,
  BarChart3,
  PlusCircle,
  DollarSign,
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
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
      {/* STAT CARDS — DATA REAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="" onClick={() => setModalKeuntungan(true)}>
          <StatCard
            label="Keuntungan Hari Ini"
            value={`Rp ${Number(d?.totalKeuntunganHariIni + d.keuntunganGrosirVoucherHariIni + d.keuntunganAccHariIni).toLocaleString("id-ID")}`}
            icon={DollarSign}
          />
        </div>
        <div className="" onClick={() => setModalOmset(true)}>
          <StatCard
            label="Omset Hari Ini"
            value={`Rp ${d.omsetGrosirVoucherHariIni.toLocaleString("id-ID")}`}
            icon={Wallet}
          />
        </div>

        <div className="" onClick={() => setModalTrx(true)}>
          <StatCard
            label="Transaksi Hari Ini"
            value={
              d.totalTransaksiVoucherHarian +
              d.trxAccHariIniTotal +
              d.trxVoucherDownlineHariIniTotal +
              d.trxHariIniTotal
            }
            icon={Wallet}
          />
        </div>

        <StatCard
          label="Voucher Pending"
          value={` ${d.trxVoucherPendingHariIni} Pesanan`}
          icon={DollarSign}
        />

        <div className="" onClick={() => setModalService(true)}>
          <StatCard
            label="Pendapatan Sparepart + Service"
            value={`Rp ${(d.omsetServicetHariIni + d.omsetSparepartHariIni).toLocaleString("id-ID")}`}
            icon={DollarSign}
          />
        </div>
      </div>
      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionButton
          onClick={() => setOpenModalVD(true)}
          label="Tambah Transaksi Grosir Voucher"
        />
        <ActionButton
          label="Tambah Transaksi Aksesoris"
          onClick={() => setOpenModalAcc(true)}
        />
        <ActionButton
          onClick={() => setOpenModalService(true)}
          label="Tambah Service HP"
        />
        <ActionButton
          onClick={() => setOpenModalSparepart(true)}
          label="Tambah Transaksi Sparepart"
        />
      </div>
      {/* SEARCH INPUTS STOK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchInput
          placeholder="Cari stok voucher..."
          value={searchVdStok}
          onChange={(e) => {
            setSearchVdStok(e.target.value);
            setPageVdStok(1); // reset ke halaman 1 saat cari
          }}
        />
        <SearchInput
          placeholder="Cari stok aksesoris..."
          value={searchAccStok}
          onChange={(e) => {
            setSearchAccStok(e.target.value);
            setPageAccStok(1);
          }}
        />
        <SearchInput
          placeholder="Cari stok sparepart..."
          value={searchSparepartStok}
          onChange={(e) => {
            setSearchSparepartStok(e.target.value);
            setPageSparepartStok(1);
          }}
        />
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
        <TableSectionVoucherGrosirToday
          title="Transaksi Grosir Voucher Hari Ini"
          data={dashboardData.trxVoucherDownlineHariIni}
          onSuccess={refetch}
        />
        <TableSectionAccToday
          title="Transaksi Aksesoris Hari Ini"
          data={dashboardData.trxAccHariIni}
          onSuccess={refetch}
        />
        <TableSectionSparepartToday
          title="Transaksi Sparepart Hari Ini"
          data={dashboardData.trxSparepartHariIni}
          onSuccess={refetch}
        />
        <TableSectionServiceToday
          title="Service HP"
          data={d.trxServiceHariIni}
          onSuccess={refetch}
        />
        <TableUangModalToday
          title="Uang Modal Hari Ini"
          data={dashboardData.uangModalHariIni}
          onSuccess={refetch}
        />
        <TableStokVoucher title="Stok Voucher Menipis" data={d.stokVd} />
        <TableStokAcc title="Stok Aksesoris Menipis" data={d.stokAcc} />
        <TableStokSparepart
          title="Stok Sparepart Menipis"
          data={d.stokSparepart}
        />

        {/* Uang Modal — sesuaikan jika punya data */}
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
    </div>
  );
}

// === Komponen UI Tetap Sama ===
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5 flex gap-4 items-center">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
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
      value: keuntunganSparepart,
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
            <p className="text-gray-600">Total Omset Hari Ini</p>
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
function ActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-sm transition w-full"
    >
      <PlusCircle className="w-5 h-5" />
      {label}
    </button>
  );
}

function SearchInput({ placeholder, value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  );
}
