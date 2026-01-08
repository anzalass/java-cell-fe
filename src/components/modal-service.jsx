// src/components/ModalServiceHP.jsx
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import {
  X,
  Search,
  User,
  Smartphone,
  FileText,
  Wrench,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
} from "lucide-react";

export default function ModalServiceHP({ isOpen, onClose, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      namaPelanggan: "",
      brandHP: "",
      keterangan: "",
      status: "Pending",
      biayaJasa: 0,
    },
  });

  const { user } = useAuthStore();

  // Master sparepart
  const [sparepartMasterData, setSparepartsMasterData] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [spareparts, setSpareparts] = useState([]);
  const [selectedSparepart, setSelectedSparepart] = useState("");

  // Member
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [membersList, setMembersList] = useState([]);

  // Tambahkan state baru untuk autocomplete
  const [searchSparepart, setSearchSparepart] = useState("");
  const [showSparepartDropdown, setShowSparepartDropdown] = useState(false);
  const [selectedSparepartForAdd, setSelectedSparepartForAdd] = useState(null); // opsional: simpan objek, bukan hanya nama

  // Filter sparepart berdasarkan pencarian
  const filteredSpareparts = sparepartMasterData.filter((sp) =>
    sp.nama.toLowerCase().includes(searchSparepart.toLowerCase())
  );

  // Fungsi saat pilih dari dropdown
  const handleSelectSparepart = (sparepart) => {
    setSelectedSparepartForAdd(sparepart);
    setSearchSparepart(sparepart.nama);
    setShowSparepartDropdown(false);
  };

  // Perbarui addSparepart agar pakai selectedSparepartForAdd
  const addSparepart = (e) => {
    e.preventDefault();
    if (!selectedSparepartForAdd) {
      Swal.fire({
        title: "Pilih Sparepart Dulu",
        text: "Silakan pilih sparepart dari daftar yang muncul.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    const found = selectedSparepartForAdd;
    const existing = spareparts.find((sp) => sp.id === found.id);

    if (existing) {
      if (existing.qty + 1 > found.stok) {
        Swal.fire({
          title: "Stok Tidak Mencukupi",
          text: `Stok "${found.nama}" hanya tersisa ${found.stok}.`,
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
      setSpareparts((prev) =>
        prev.map((sp) => (sp.id === found.id ? { ...sp, qty: sp.qty + 1 } : sp))
      );
    } else {
      if (found.stok <= 0) {
        Swal.fire({
          title: "Stok Habis",
          text: `Sparepart "${found.nama}" saat ini tidak tersedia.`,
          icon: "info",
          confirmButtonText: "OK",
        });
        return;
      }
      setSpareparts([...spareparts, { ...found, qty: 1 }]);
    }

    // Reset input setelah ditambahkan
    setSearchSparepart("");
    setSelectedSparepartForAdd(null);
  };

  const timeoutRef = useRef(null);

  // Fetch members
  useEffect(() => {
    if (!memberSearch.trim()) {
      setMembersList([]);
      return;
    }

    const fetchMembers = async () => {
      try {
        const res = await api.get("member", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const allMembers = res.data.data || [];
        const filtered = allMembers.filter(
          (m) =>
            m.nama.toLowerCase().includes(memberSearch.toLowerCase()) ||
            (m.noTelp && m.noTelp.includes(memberSearch))
        );
        setMembersList(filtered);
        setShowMemberDropdown(true);
      } catch (err) {
        console.error("Fetch members error:", err);
      }
    };

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(fetchMembers, 300);
  }, [memberSearch, user.token]);

  // Fetch sparepart master
  useEffect(() => {
    if (!isOpen) return;

    const fetchMaster = async () => {
      try {
        setLoadingMaster(true);
        const res = await api.get("sparepart-master");
        setSparepartsMasterData(res.data || []);
      } catch (err) {
        console.error("Gagal load sparepart:", err);
        Swal.fire({
          title: "Error",
          text: "Gagal memuat daftar sparepart",
          icon: "error",
        });
      } finally {
        setLoadingMaster(false);
      }
    };

    fetchMaster();
  }, [isOpen]);

  // Hitung keuntungan
  const biayaJasa = watch("biayaJasa") || 0;
  const keuntungan =
    spareparts.reduce(
      (sum, sp) => sum + (sp.hargaJual - sp.hargaModal) * (sp.qty || 1),
      0
    ) + parseFloat(biayaJasa);

  // Fungsi tambah sparepart

  // Hapus sparepart
  const removeSparepart = (id) => {
    setSpareparts(spareparts.filter((sp) => sp.id !== id));
  };

  // Update qty sparepart
  const updateSparepartQty = (id, value) => {
    const qty = parseInt(value) || 0;
    const item = sparepartMasterData.find((sp) => sp.id === id);
    if (!item) return;

    if (qty <= 0) {
      setSpareparts(spareparts.filter((sp) => sp.id !== id));
      return;
    }

    if (qty > item.stok) {
      Swal.fire({
        title: "Stok Tidak Mencukupi",
        text: `Maksimal stok ${item.nama} adalah ${item.stok}`,
        icon: "error",
      });
      return;
    }

    setSpareparts(spareparts.map((sp) => (sp.id === id ? { ...sp, qty } : sp)));
  };

  // Submit form
  const submitForm = async (data) => {
    if (spareparts.length === 0) {
      Swal.fire({
        title: "Sparepart Belum Ditambahkan",
        text: "Silakan tambahkan minimal satu sparepart.",
        icon: "warning",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Menyimpan data...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const payload = {
        brandHP: data.brandHP,
        keterangan: data.keterangan,
        status: data.status,
        namaPelanggan: data.namaPelanggan,
        biayaJasa: Number(data.biayaJasa),
        sparePart: spareparts.map((sp) => ({
          id: sp.id,
          qty: sp.qty,
        })),
        ...(selectedMember && { idMember: selectedMember.id }),
      };

      await api.post("service-hp", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      Swal.close();
      await Swal.fire({
        title: "Berhasil!",
        text: "Data service berhasil disimpan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      reset();
      setSpareparts([]);
      setSelectedMember(null);
      onClose();
      onSuccess();
    } catch (err) {
      Swal.close();
      const msg = err.response?.data?.error || "Gagal menyimpan service.";
      Swal.fire({
        title: "Oops!",
        text: msg,
        icon: "error",
      });
      console.error("Submit error:", err);
    }
  };

  const selectMember = (member) => {
    setSelectedMember(member);
    setMemberSearch("");
    setShowMemberDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 -top-10 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Form Service HP</h2>
              <p className="text-purple-100 text-sm mt-0.5">
                Kelola data service handphone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingMaster ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Memuat data...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(submitForm)} className="space-y-5">
              {/* Member Selection */}
              <div className="bg-purple-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-3">
                  <User className="w-4 h-4" />
                  Pilih Member (Opsional)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setSelectedMember(null);
                    }}
                    placeholder="Cari nama atau nomor HP..."
                    className="w-full border-2 border-purple-200 rounded-lg pl-10 pr-4 py-2.5 focus:border-purple-500 focus:outline-none transition"
                    onFocus={() =>
                      membersList.length > 0 && setShowMemberDropdown(true)
                    }
                  />

                  {showMemberDropdown && (
                    <div className="absolute z-50 bg-white border-2 border-purple-200 w-full rounded-lg shadow-lg mt-2 max-h-48 overflow-y-auto">
                      {membersList.length === 0 ? (
                        <p className="p-3 text-gray-500 text-sm text-center">
                          Member tidak ditemukan
                        </p>
                      ) : (
                        membersList.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 hover:bg-purple-50 cursor-pointer flex justify-between items-center transition"
                            onClick={() => selectMember(m)}
                          >
                            <span className="font-medium">{m.nama}</span>
                            <span className="text-gray-500 text-sm">
                              {m.noTelp || "-"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {selectedMember && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                      <p className="text-sm text-green-700">
                        <span className="font-semibold">
                          {selectedMember.nama}
                        </span>
                      </p>
                      <button
                        onClick={() => {
                          setSelectedMember(null);
                          setMemberSearch("");
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Nama Pelanggan */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Nama Pelanggan
                </label>
                <input
                  {...register("namaPelanggan", {
                    required: "Nama pelanggan wajib diisi",
                  })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:outline-none transition"
                  placeholder="Masukkan nama pelanggan"
                />
                {errors.namaPelanggan && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.namaPelanggan.message}
                  </p>
                )}
              </div>

              {/* Brand HP */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Smartphone className="w-4 h-4" />
                  Brand HP <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("brandHP", { required: "Brand HP wajib diisi" })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:outline-none transition"
                  placeholder="Contoh: iPhone 12, Samsung S21"
                />
                {errors.brandHP && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.brandHP.message}
                  </p>
                )}
              </div>

              {/* Keterangan */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Keterangan <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("keterangan", {
                    required: "Keterangan wajib diisi",
                  })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:outline-none transition resize-none"
                  rows={3}
                  placeholder="Jelaskan kerusakan atau keluhan..."
                />
                {errors.keterangan && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.keterangan.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("status", { required: "Status wajib dipilih" })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:outline-none transition"
                >
                  <option value="Pending">⏳ Pending</option>
                  <option value="Proses">🔧 Proses</option>
                  <option value="Selesai">✅ Selesai</option>
                  <option value="Gagal">❌ Gagal</option>
                  <option value="Batal">🚫 Batal</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Sparepart Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Wrench className="w-4 h-4" />
                  Pilih Sparepart
                </label>
                <div className="flex gap-2 mb-3">
                  {/* Input Autocomplete */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchSparepart}
                      onChange={(e) => {
                        setSearchSparepart(e.target.value);
                        setSelectedSparepartForAdd(null); // reset selection saat ngetik
                        setShowSparepartDropdown(true);
                      }}
                      onFocus={() => setShowSparepartDropdown(true)}
                      placeholder="Ketik nama sparepart..."
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:outline-none transition"
                    />

                    {/* Dropdown */}
                    {showSparepartDropdown && searchSparepart && (
                      <div className="absolute z-10 bg-white border-2 border-gray-200 w-full rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {filteredSpareparts.length === 0 ? (
                          <p className="p-3 text-gray-500 text-sm text-center">
                            Tidak ditemukan
                          </p>
                        ) : (
                          filteredSpareparts.map((sp) => (
                            <div
                              key={sp.id}
                              className="p-3 hover:bg-purple-50 cursor-pointer flex justify-between items-center transition"
                              onClick={() => handleSelectSparepart(sp)}
                            >
                              <span className="font-medium text-gray-800">
                                {sp.nama}
                              </span>
                              <span className="text-sm text-gray-600">
                                Rp{(sp.hargaJual || sp.harga)?.toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tombol Tambah */}
                  <button
                    type="button"
                    onClick={addSparepart}
                    disabled={!selectedSparepartForAdd}
                    className={`px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
                      selectedSparepartForAdd
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Tambah
                  </button>
                </div>

                {/* Daftar sparepart yang dipilih */}
                {spareparts.length > 0 && (
                  <div className="space-y-2">
                    {spareparts.map((sp) => (
                      <div
                        key={sp.id}
                        className="bg-white border-2 border-gray-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{sp.nama}</p>
                          <p className="text-sm text-gray-500">
                            Rp{(sp.hargaJual || sp.harga)?.toLocaleString()} ×{" "}
                            {sp.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            max={sp.stok}
                            value={sp.qty}
                            onChange={(e) =>
                              updateSparepartQty(sp.id, e.target.value)
                            }
                            className="w-16 border-2 border-gray-200 rounded-lg px-2 py-1 text-center focus:border-purple-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeSparepart(sp.id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Biaya Jasa */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  Biaya Jasa <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("biayaJasa", {
                    valueAsNumber: true,
                    required: "Biaya jasa wajib diisi",
                    min: {
                      value: 0,
                      message: "Biaya jasa tidak boleh negatif",
                    },
                  })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-purple-500 focus:outline-none transition"
                  placeholder="0"
                />
                {errors.biayaJasa && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.biayaJasa.message}
                  </p>
                )}
              </div>

              {/* Keuntungan */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Estimasi Keuntungan
                </label>
                <div className="text-2xl font-bold text-green-700">
                  Rp {keuntungan.toLocaleString()}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Dihitung otomatis berdasarkan margin
                </p>
              </div>

              {/* Footer Actions */}
              <div className="border-t pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition"
                >
                  Simpan Service
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
