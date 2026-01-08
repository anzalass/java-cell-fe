// src/pages/TransaksiPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  Wallet,
  Search,
  CheckCircle,
  Trash2,
  TrendingUp,
  DollarSign,
  Calendar,
  Tag,
  AlertCircle,
  AlertTriangle,
  Hash,
  FileText,
  Plus,
} from "lucide-react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

// Komponen KejadianTakTerduga (langsung di sini atau di file terpisah)
const KejadianTakTerduga = ({ data, onDelete }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: (payload) =>
      api.post("kejadian-tak-terduga", payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["transaksi-hari-ini"]);
      resetForm();
      Swal.fire("Berhasil!", "Kejadian berhasil ditambahkan.", "success");
    },
    onError: (err) => {
      Swal.fire(
        "Gagal!",
        err.response?.data?.error || "Gagal menambah kejadian.",
        "error"
      );
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(id);
      }
    });
  };

  const onSubmit = (data) => {
    mutation.mutate({
      keterangan: data.keterangan,
      nominal: Number(data.nominal),
      no_transaksi: data.noTransaksi,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto mt-5">
      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="md:text-2xl text-lg font-bold">
                Kejadian Tak Terduga
              </h2>
              <p className="text-orange-100 text-sm mt-0.5">
                Catat kejadian atau transaksi bermasalah hari ini
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* No Transaksi */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Hash className="w-4 h-4" />
                No Transaksi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: TRX001"
                {...register("noTransaksi", {
                  required: "No transaksi wajib diisi",
                })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
              />
              {errors.noTransaksi && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.noTransaksi.message}
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
                placeholder="Jelaskan kejadian yang terjadi..."
                {...register("keterangan", {
                  required: "Keterangan wajib diisi",
                })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition resize-none"
              />
              {errors.keterangan && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.keterangan.message}
                </p>
              )}
            </div>

            {/* Nominal */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Nominal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Masukkan nominal kerugian"
                {...register("nominal", {
                  required: "Nominal wajib diisi",
                  min: { value: 1, message: "Minimal 1" },
                  valueAsNumber: true,
                })}
                min="1"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E")
                    e.preventDefault();
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
              />
              {errors.nominal && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.nominal.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Tambah Data
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-orange-600" />
          Daftar Kejadian Hari Ini
        </h2>

        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <th className="px-4 py-4 text-left font-semibold">No</th>
                <th className="px-4 py-4 text-left font-semibold">
                  No Transaksi
                </th>
                <th className="px-4 py-4 text-left font-semibold">
                  Keterangan
                </th>
                <th className="px-4 py-4 text-left font-semibold">Nominal</th>
                <th className="px-4 py-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Belum ada kejadian hari ini</p>
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-orange-50 transition"
                  >
                    <td className="px-4 py-4">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {row.no_transaksi}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {row.keterangan}
                    </td>
                    <td className="px-4 py-4 font-bold text-red-600">
                      - Rp {Math.abs(row.nominal).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition inline-flex items-center gap-1 shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {data.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-gray-700">
                  Total Kerugian:
                </span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                - Rp{" "}
                {data
                  .reduce((sum, item) => sum + Math.abs(item.nominal), 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// Halaman Utama
export default function TransaksiPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const timeoutRef = useRef(null);

  const kategoriList = ["Tarik Tunai", "Transit", "Transfer-Topup", "VD"];
  const nominalList = [
    1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
    12000, 15000, 20000, 25000, 30000,
  ];

  // State transaksi sementara
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [selectedNominal, setSelectedNominal] = useState(null);

  // State member
  const [showMemberInput, setShowMemberInput] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset: resetForm,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      kategori: "",
      nominal: "",
      isForMember: false,
      memberId: null,
    },
  });

  // === QUERY: Data Hari Ini ===
  const { data: todayData, isLoading } = useQuery({
    queryKey: ["transaksi-hari-ini"],
    queryFn: async () => {
      const res = await api.get("today", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
    enabled: !!user?.token,
  });

  const keuntunganData = todayData?.jualanHarian || [];
  const totalKeuntungan = todayData?.totalKeuntungan || 0;
  const unexpectedData = todayData?.kejadianTakTerduga || [];

  console.log("sas", todayData);

  // === MUTATIONS ===
  const tambahTransaksiMutation = useMutation({
    mutationFn: (payload) =>
      api.post("jualan-harian", payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-hari-ini"] });
      Swal.fire("Berhasil!", "Transaksi berhasil disimpan.", "success");
    },
    onError: (err) => {
      Swal.fire(
        "Gagal!",
        err.response?.data?.error || "Gagal menyimpan transaksi.",
        "error"
      );
    },
  });

  const manualMutation = useMutation({
    mutationFn: (payload) =>
      api.post("jualan-harian", payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-hari-ini"] });
      resetForm();
      setSelectedMember(null);
      setMemberSearch("");
      Swal.fire(
        "Berhasil!",
        "Keuntungan manual berhasil ditambahkan.",
        "success"
      );
    },
    onError: (err) => {
      Swal.fire(
        "Gagal!",
        err.response?.data?.error || "Gagal menambah keuntungan.",
        "error"
      );
    },
  });

  const deleteKeuntunganMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`jualan-harian/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-hari-ini"] });
      Swal.fire("Dihapus!", "Transaksi berhasil dihapus.", "success");
    },
    onError: (err) => {
      Swal.fire(
        "Gagal!",
        err.response?.data?.error || "Gagal menghapus transaksi.",
        "error"
      );
    },
  });

  const deleteUnexpectedMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`kejadian-tak-terduga/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi-hari-ini"] });
    },
    onError: (err) => {
      Swal.fire(
        "Gagal!",
        err.response?.data?.error || "Gagal menghapus kejadian.",
        "error"
      );
    },
  });

  // === HANDLERS ===
  const submitTransaksi = (idMember = null) => {
    if (!selectedKategori || !selectedNominal) {
      Swal.fire(
        "Peringatan",
        "Pilih kategori dan nominal terlebih dahulu",
        "warning"
      );
      return;
    }

    tambahTransaksiMutation.mutate({
      kategori: selectedKategori,
      nominal: selectedNominal,
      ...(idMember && { idMember }),
    });

    setSelectedKategori(null);
    setSelectedNominal(null);
    setSelectedMember(null);
    setShowMemberInput(false);
    setMemberSearch("");
  };

  const handleManualSubmit = (data) => {
    manualMutation.mutate({
      kategori: data.kategori,
      nominal: Number(data.nominal),
      ...(data.memberId && { idMember: data.memberId }),
    });
  };

  const deleteKeuntungan = (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Transaksi ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteKeuntunganMutation.mutate(id);
      }
    });
  };

  useEffect(() => {
    if (!memberSearch.trim()) {
      setMembersList([]);
      setShowMemberDropdown(false);
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
      } catch (err) {
        console.error("Fetch members error:", err);
      }
    };

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(fetchMembers, 300);
  }, [memberSearch, user.token]);

  const selectMember = (member) => {
    setSelectedMember(member);
    setMemberSearch("");
    setShowMemberDropdown(false);
  };

  // === RENDER ===
  if (isLoading) {
    return <div className="p-6 text-center">Memuat data hari ini...</div>;
  }

  const watchIsForMember = watch("isForMember");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="lg:text-3xl text-lg font-bold text-gray-800">
                Hitung Keuntungan Hari Ini
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola dan pantau keuntungan transaksi harian
              </p>
            </div>
          </div>
        </div>

        {/* Quick Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Input Cepat
          </h2>

          {/* Kategori */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Tag className="w-4 h-4" />
              Pilih Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {kategoriList.map((kat) => (
                <button
                  key={kat}
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                    selectedKategori === kat
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg scale-105"
                      : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="w-4 h-4" />
              Pilih Nominal Keuntungan
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {nominalList.map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedNominal(num)}
                  className={`px-3 py-3 rounded-xl border-2 font-semibold transition-all text-sm ${
                    selectedNominal === num
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-lg scale-105"
                      : "bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md"
                  }`}
                >
                  {num.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {selectedKategori && selectedNominal && (
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <button
                onClick={() => submitTransaksi(null)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                💾 Simpan Tanpa Member
              </button>
              <button
                onClick={() => setShowMemberInput(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                👤 Simpan Dengan Member
              </button>
            </div>
          )}

          {/* Member Input */}
          {showMemberInput && (
            <div className="mt-4 p-5 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Pilih Member
              </h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    if (e.target.value.trim()) setShowMemberDropdown(true);
                  }}
                  placeholder="Cari nama atau no HP..."
                  className="w-full border-2 border-blue-200 rounded-lg pl-10 pr-4 py-3 focus:border-blue-500 focus:outline-none transition"
                  onFocus={() =>
                    membersList.length > 0 && setShowMemberDropdown(true)
                  }
                />

                {showMemberDropdown && (
                  <div className="absolute z-50 bg-white border-2 border-blue-200 w-full rounded-lg shadow-xl mt-2 max-h-48 overflow-y-auto">
                    {membersList.length === 0 ? (
                      <p className="p-3 text-gray-500 text-center">
                        Member tidak ditemukan
                      </p>
                    ) : (
                      membersList.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between transition"
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
                  <div className="mt-3 flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-800">
                        Member: <b>{selectedMember.nama}</b>
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => submitTransaksi(selectedMember?.id)}
                  disabled={!selectedMember}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ✅ Simpan dengan Member
                </button>
                <button
                  onClick={() => {
                    setShowMemberInput(false);
                    setSelectedMember(null);
                    setMemberSearch("");
                  }}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Manual Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-600" />
            Input Manual Keuntungan
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tarik Tunai"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nominal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 5000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
              <input
                type="checkbox"
                id="isForMember"
                checked={watchIsForMember}
                onChange={(e) => setWatchIsForMember(e.target.checked)}
                className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="isForMember"
                className="text-sm font-medium text-gray-700"
              >
                Tambahkan ke member? (opsional)
              </label>
            </div>

            <button
              onClick={handleManualSubmit}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              ➕ Tambah Keuntungan
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">
                Total Keuntungan Hari Ini
              </p>
              <h3 className="text-4xl font-bold">
                Rp {totalKeuntungan.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <TrendingUp className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Riwayat Keuntungan Hari Ini
          </h2>

          <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="px-4 py-4 text-left font-semibold">No</th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Kategori
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Keuntungan
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">Tanggal</th>
                  <th className="px-4 py-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {keuntunganData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada data keuntungan hari ini</p>
                    </td>
                  </tr>
                ) : (
                  keuntunganData.map((row, i) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium">{row.kategori}</td>
                      <td className="px-4 py-4 font-bold text-green-600">
                        Rp {Number(row.nominal).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {new Date(row.tanggal).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => deleteKeuntungan(row.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <KejadianTakTerduga
        data={unexpectedData}
        onDelete={(id) => deleteUnexpectedMutation.mutate(id)}
      />
    </div>
  );
}
