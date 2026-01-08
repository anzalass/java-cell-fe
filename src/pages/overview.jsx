import React, { useState } from "react";
import {
  Search,
  Wallet,
  ShoppingBag,
  Receipt,
  Wrench,
  Layers,
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
        <StatCard
          label="Keuntungan Transaksi Hari Ini"
          value={`Rp ${d.totalKeuntunganHariIni.toLocaleString("id-ID")}`}
          icon={DollarSign}
        />
        <StatCard
          label="Omset Grosir Voucher"
          value={`Rp ${d.omsetGrosirVoucherHariIni.toLocaleString("id-ID")}`}
          icon={Wallet}
        />
        <StatCard
          label="Transaksi Grosir Voucher"
          value={d.trxVoucherDownlineHariIniTotal}
          icon={Wallet}
        />
        <StatCard
          label="Keuntungan Grosir Voucher"
          value={`Rp ${d.keuntunganGrosirVoucherHariIni.toLocaleString("id-ID")}`}
          icon={Wallet}
        />

        <StatCard
          label="Penjualan ACC Hari Ini"
          value={`${d.trxAccHariIniTotal} Transaksi`}
          icon={ShoppingBag}
        />
        <StatCard
          label="Keuntungan ACC Hari Ini"
          value={`Rp ${d.keuntunganAccHariIni.toLocaleString("id-ID")}`}
          icon={DollarSign}
        />
        <StatCard
          label="Omset Accesoris Hari Ini"
          value={`Rp ${d.omsetAccHariIni.toLocaleString("id-ID")}`}
          icon={DollarSign}
        />
        <StatCard
          label="Pesanan Voucher Pending"
          value={`${d.trxVoucherPendingHariIni} Pesanan`}
          icon={Receipt}
        />

        <StatCard
          label="Service HP Hari Ini"
          value={`${d.trxServiceHariIniTotal} Unit`}
          icon={Wrench}
        />
        <StatCard
          label="Omset Service HP"
          value={`Rp ${d.omsetServicetHariIni.toLocaleString("id-ID")}`}
          icon={DollarSign}
        />
        <StatCard
          label="Keuntungan Service HP"
          value={`Rp ${d.keuntunganServiceHariIni.toLocaleString("id-ID")}`}
          icon={DollarSign}
        />
        <StatCard
          label="Transaksi Sparepart HP"
          value={`${d.trxSparepartHariIniTotal} Transaksi`}
          icon={Layers}
        />

        <StatCard
          label="Omset Sparepart HP"
          value={`Rp ${d.omsetSparepartHariIni.toLocaleString("id-ID")}`}
          icon={DollarSign}
        />
        <StatCard
          label="Keuntungan Sparepart HP"
          value={`Rp ${d.keuntunganSparepartHariIni.toLocaleString("id-ID")}`}
          icon={DollarSign}
        />

        <StatCard
          label="Uang Modal Hari Ini"
          value={`Rp. ${d.uangModal.toLocaleString("id-ID")}`}
          icon={Wallet}
        />
        {/* Kosongkan 1 slot jika perlu */}
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
