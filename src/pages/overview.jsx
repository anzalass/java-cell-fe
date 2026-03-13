import React, { lazy, Suspense, useCallback, useMemo, useState } from "react";
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
const DetailKeuntunganModal = lazy(() =>
  import("../components/detail-keuntungan-modal").then((m) => ({
    default: m.DetailKeuntunganModal,
  }))
);

const DetailOmsetModal = lazy(() =>
  import("../components/detail-omset-modal").then((m) => ({
    default: m.DetailOmsetModal,
  }))
);

const DetailTrxModal = lazy(() =>
  import("../components/detail-trx-modal").then((m) => ({
    default: m.DetailTrxModal,
  }))
);

const DetailServiceModal = lazy(() =>
  import("../components/detail-service-modal").then((m) => ({
    default: m.DetailServiceModal,
  }))
);

const DetailServiceModal2 = lazy(() =>
  import("../components/detail-service-modal2").then((m) => ({
    default: m.DetailServiceModal2,
  }))
);

const StatsSection = lazy(() =>
  import("../components/stats-components").then((m) => ({
    default: m.StatsSection,
  }))
);
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

  const openKeuntungan = useCallback(() => {
    setModalKeuntungan(true);
  }, []);

  const openOmset = useCallback(() => {
    setModalOmset(true);
  }, []);

  const openTrx = useCallback(() => {
    setModalTrx(true);
  }, []);

  const openService = useCallback(() => {
    setModalService(true);
  }, []);

  const openService2 = useCallback(() => {
    setModalService2(true);
  }, []);

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
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <div className="p-6">Memuat data dashboard..</div>;
  }

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
  return (
    <div className="p-2 space-y-8 mt-6">
      {/* HEADER */}
      {/* STAT CARDS — DATA REAL */}
      {/* Tambahkan loading state */}
      <Suspense fallback={<div className="p-4">Memuat statistik...</div>}>
        <StatsSection
          stats={stats}
          onOpenKeuntungan={openKeuntungan}
          onOpenOmset={openOmset}
          onOpenTrx={openTrx}
          onOpenService={openService}
          onOpenService2={openService2}
        />
      </Suspense>
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
        <TableStokVoucher
          title="Stok Voucher Menipis"
          data={dashboardData.stokVd}
        />
        <TableStokAcc
          title="Stok Aksesoris Menipis"
          data={dashboardData.stokAcc}
        />
        <TableStokSparepart
          title="Stok Sparepart Menipis"
          data={dashboardData.stokSparepart}
        />

        {/* Uang Keluar — sesuaikan jika punya data */}
      </div>
      <Suspense fallback={null}>
        {modalKeuntungan && (
          <DetailKeuntunganModal
            isOpen={modalKeuntungan}
            onClose={setModalKeuntungan}
            keuntunganGrosirVoucher={
              dashboardData?.keuntunganGrosirVoucherHariIni
            }
            keuntunganAcc={dashboardData?.keuntunganAccHariIni}
            keuntunganTransaksi={dashboardData?.totalKeuntunganHariIni}
            keuntunganVoucherHarian={dashboardData?.keuntunganVoucherHarian}
          />
        )}

        {modalOmset && (
          <DetailOmsetModal
            isOpen={modalOmset}
            onClose={setModalOmset}
            omsetGrosirVoucher={dashboardData?.omsetGrosirVoucherHariIni}
            omsetAcc={dashboardData?.omsetAccHariIni}
            omsetVoucherHarian={dashboardData?.omsetVoucherHarian}
          />
        )}

        {modalTrx && (
          <DetailTrxModal
            isOpen={modalTrx}
            onClose={setModalTrx}
            totalTrxGrosirVoucher={
              dashboardData?.trxVoucherDownlineHariIniTotal
            }
            totalTrxAcc={dashboardData?.trxAccHariIniTotal}
            totalTrx={dashboardData?.trxHariIniTotal}
            totalTrxVoucherHarian={dashboardData?.totalTransaksiVoucherHarian}
          />
        )}

        {modalService && (
          <DetailServiceModal
            isOpen={modalService}
            onClose={setModalService}
            totalService={dashboardData?.trxServiceHariIniTotal}
            totalSparepartTrx={dashboardData?.trxSparepartHariIniTotal}
            omsetService={dashboardData?.omsetServicetHariIni}
            keuntunganService={dashboardData?.keuntunganServiceHariIni}
            omsetSparepart={dashboardData?.omsetSparepartHariIni}
            keuntunganSparepart={dashboardData?.keuntunganSparepartHariIni}
          />
        )}

        {modalService2 && (
          <DetailServiceModal2
            isOpen={modalService2}
            onClose={setModalService2}
            totalService={dashboardData?.trxServiceHariIniTotal}
            totalSparepartTrx={dashboardData?.trxSparepartHariIniTotal}
            omsetService={dashboardData?.omsetServicetHariIni}
            keuntunganService={dashboardData?.keuntunganServiceHariIni}
            omsetSparepart={dashboardData?.omsetSparepartHariIni}
            keuntunganSparepart={dashboardData?.keuntunganSparepartHariIni}
          />
        )}
      </Suspense>
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
