import React, { useState } from "react";
import JualanVoucher from "./jualan-voucher";
import TransaksiPage from "./transaksi";
import ModalTransaksiAcc from "../components/modal-trans-acc";
import ModalTransaksiSparepart from "../components/modal-trans-sparepart";
import ModalGrosirVoucher from "../components/modal-trans-voucher";
import ModalServiceHP from "../components/modal-service";
import PencarianCepat from "../components/pencarian-cepat";
import { PlusCircle, Receipt, Ticket, LayoutGrid } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";

export default function Penggabungan() {
  const { user } = useAuthStore();

  const [openModalAcc, setOpenModalAcc] = useState(false);
  const [openModalVD, setOpenModalVD] = useState(false);
  const [openModalSparepart, setOpenModalSparepart] = useState(false);
  const [openModalService, setOpenModalService] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // 'all', 'transaksi', 'voucher'

  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
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

  return (
    <div className="mt-6">
      <div className="grid mt-8 mb-4 grid-cols-4  gap-2">
        <ActionButton onClick={() => setOpenModalVD(true)} label="Grosir VD" />
        <ActionButton label="Aksesoris" onClick={() => setOpenModalAcc(true)} />
        <ActionButton
          onClick={() => setOpenModalService(true)}
          label="Service HP"
        />
        <ActionButton
          onClick={() => setOpenModalSparepart(true)}
          label="Sparepart"
        />
      </div>

      <div className="">
        <PencarianCepat />
      </div>

      {/* === TOGGLE BUTTONS === */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
        <ToggleViewButton
          active={viewMode === "transaksi"}
          onClick={() => setViewMode("transaksi")}
          icon={<Receipt className="w-4 h-4" />}
          label="Transaksi"
        />
        <ToggleViewButton
          active={viewMode === "voucher"}
          onClick={() => setViewMode("voucher")}
          icon={<Ticket className="w-4 h-4" />}
          label="Voucher"
        />
        <ToggleViewButton
          active={viewMode === "all"}
          onClick={() => setViewMode("all")}
          icon={<LayoutGrid className="w-4 h-4" />}
          label="Semua"
        />
      </div>

      {/* === KONTEN DENGAN LAYOUT DINAMIS === */}
      <div className="w-full mt-4">
        {/* Mode ALL: 2 column */}
        {viewMode === "all" ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/2 w-full">
              <JualanVoucher />
            </div>
            <div className="sm:w-1/2 w-full">
              <TransaksiPage />
            </div>
          </div>
        ) : viewMode === "voucher" ? (
          // Mode VOUCHER: full width
          <div className="w-full">
            <JualanVoucher />
          </div>
        ) : (
          // Mode TRANSAKSI: full width
          <div className="w-full">
            <TransaksiPage />
          </div>
        )}
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
    </div>
  );
}

function ActionButton({ label, onClick }) {
  return (
    <div className="flex flex-col items-center rounded-xl gap-2 bg-blue-600 p-2">
      <PlusCircle onClick={onClick} className="w-6 h-6" color="white" />
      <span className="text-xs md:text-sm text-white text-center">{label}</span>
    </div>
  );
}

function ToggleViewButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? "bg-indigo-600 text-white shadow-md"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
