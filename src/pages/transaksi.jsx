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
import { Html5Qrcode } from "html5-qrcode";

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
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
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
      <div className="bg-white rounded-2xl shadow-md p-6">
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

  const [showModal, setShowModal] = useState(false);
  const memberInputRef = useRef(null);

  const kategoriList = ["Tarik Tunai", "PPOB", "Transfer", "Top-Up"];
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
  const watchIsForMember = watch("isForMember");

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
      Swal.fire({
        text: "Transaksi Berhasil Disimpan",
        icon: "success",
        timer: 500, // 1.5 detik
        showConfirmButton: false,
      });
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
      // ...(selectedMember?.id && { idMember: selectedMember?.id }),
      ...(data.isForMember && selectedMember
        ? { idMember: selectedMember.id }
        : {}),
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
    const fetchMembers = async () => {
      try {
        const res = await api.get("member", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const allMembers = res.data.data || [];
        setMembersList(allMembers);
      } catch (err) {
        console.error("Fetch members error:", err);
      }
    };

    fetchMembers();
  }, []);

  console.log("member", membersList);

  useEffect(() => {
    if (selectedKategori !== null && selectedNominal !== null) {
      setTimeout(() => {
        memberInputRef.current?.focus();
      }, 100);
    }
  }, [selectedKategori, selectedNominal]);

  const selectMember = (member) => {
    setSelectedMember(member);
    setShowMemberDropdown(false);
  };

  useEffect(() => {
    if (
      !memberSearch ||
      !selectedKategori ||
      !selectedNominal ||
      membersList.length === 0
    )
      return;

    const cleanedInput = memberSearch.trim();

    const matchedMember = membersList.find(
      (m) => m.noTelp === cleanedInput || m.kodeMember === cleanedInput
    );

    if (matchedMember) {
      submitTransaksi(matchedMember.id);
    }
  }, [memberSearch]);

  const [isScanning, setIsScanning] = useState(false);
  const [isScanning2, setIsScanning2] = useState(false);

  const scannerInstance = useRef(null);

  // Fungsi bantu: cari member by noTelp atau kodeMember
  const findMemberByCode = (code) => {
    return membersList.find((m) => m.noTelp === code || m.kodeMember === code);
  };

  useEffect(() => {
    selectMember(null);
  }, [selectedKategori, selectedNominal]);

  // Reset member saat checkbox dimatikan
  useEffect(() => {
    if (!watchIsForMember) {
      setSelectedMember(null);
      setMemberSearch("");
      setValue("idMember", ""); // Reset field form juga
    }
  }, [watchIsForMember, setSelectedMember, setMemberSearch, setValue]);

  useEffect(() => {
    let html5QrCode = null;

    if (isScanning) {
      // Tunggu sedikit agar DOM selesai render
      const timer = setTimeout(() => {
        const readerElement = document.getElementById("reader");
        if (!readerElement) {
          console.error("Elemen #reader tidak ditemukan!");
          return;
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        html5QrCode = new Html5Qrcode("reader");
        html5QrCode
          .start(
            { facingMode: "environment" },
            config,
            async (decodedText) => {
              const cleaned = decodedText.trim();
              const matched = membersList.find(
                (m) => m.noTelp === cleaned || m.kodeMember === cleaned
              );

              if (matched) {
                submitTransaksi(matched.id);
                Swal.fire({
                  title: "Berhasil!",
                  text: `${matched.nama} Telah mmelakukan transaksi`,
                  icon: "success",
                  timer: 1500,
                  showConfirmButton: false,
                });
              } else {
                Swal.fire({
                  title: "Member Tidak Ditemukan!",
                  text: `Kode "${cleaned}" tidak terdaftar.`,
                  icon: "error",
                });
              }
              setIsScanning(false);
            },
            (errorMessage) => {
              // Opsional: log error
              console.log(errorMessage);
            }
          )
          .catch((err) => {
            console.error("Gagal mulai scanner:", err);
            Swal.fire("Error", "Gagal membuka kamera", "error");
            setIsScanning(false);
          });
      }, 100); // Delay kecil agar DOM siap

      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          html5QrCode.stop().then(() => html5QrCode.clear());
        }
      };
    }
  }, [isScanning, selectedKategori, selectedNominal, membersList]);

  useEffect(() => {
    let html5QrCode = null;

    if (isScanning2) {
      // Tunggu sedikit agar DOM selesai render
      const timer = setTimeout(() => {
        const readerElement = document.getElementById("reader2");
        if (!readerElement) {
          console.error("Elemen #reader tidak ditemukan!");
          return;
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        html5QrCode = new Html5Qrcode("reader2");
        html5QrCode
          .start(
            { facingMode: "environment" },
            config,
            async (decodedText) => {
              const cleaned = decodedText.trim();
              const matched = membersList.find(
                (m) => m.noTelp === cleaned || m.kodeMember === cleaned
              );

              if (matched) {
                selectMember(matched);
                Swal.fire({
                  title: "Berhasil!",
                  text: `${matched.nama} Telah mmelakukan transaksi`,
                  icon: "success",
                  timer: 1500,
                  showConfirmButton: false,
                });
              } else {
                Swal.fire({
                  title: "Member Tidak Ditemukan!",
                  text: `Kode "${cleaned}" tidak terdaftar.`,
                  icon: "error",
                });
              }
              setIsScanning2(false);
            },
            (errorMessage) => {
              // Opsional: log error
              console.log(errorMessage);
            }
          )
          .catch((err) => {
            console.error("Gagal mulai scanner:", err);
            Swal.fire("Error", "Gagal membuka kamera", "error");
            setIsScanning2(false);
          });
      }, 100); // Delay kecil agar DOM siap

      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          html5QrCode.stop().then(() => html5QrCode.clear());
        }
      };
    }
  }, [isScanning2]);

  {
    /* Color Configuration untuk setiap kategori */
  }
  const kategoriConfig = {
    "Tarik Tunai": {
      active: "from-emerald-900 to-teal-900",
      inactive: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "💵",
      shadow: "shadow-emerald-500/30",
    },
    Transfer: {
      active: "from-blue-900 to-cyan-900",
      inactive: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "💸",
      shadow: "shadow-blue-500/30",
    },
    "Top-Up": {
      active: "from-violet-900 to-purple-900",
      inactive: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-200",
      icon: "📱",
      shadow: "shadow-violet-500/30",
    },
    PPOB: {
      active: "from-amber-900 to-orange-900",
      inactive: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: "🏪",
      shadow: "shadow-amber-500/30",
    },
  };

  // Helper untuk mendapatkan warna kategori
  const getKategoriColor = (kategoriName) => {
    return kategoriConfig[kategoriName] || kategoriConfig["PPOB"];
  };

  // === RENDER ===
  if (isLoading) {
    return <div className="p-6 text-center">Memuat data hari ini...</div>;
  }

  return (
    <div className="min-h-screen   ">
      <div className="w-full mx-auto">
        {/* Header */}
        {/* <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="xl:text-xl text-base font-bold text-gray-800">
                Hitung Keuntungan Hari Ini
              </h1>
              <p className="text-gray-600 mt-1 text-xs md:">
                Kelola dan pantau keuntungan transaksi harian
              </p>
            </div>
          </div>
        </div> */}

        {/* Quick Input Section */}
        <div className="bg-white rounded-2xl p-2 mb-6">
          <h2 className="font-bold md:text-xl text=base text-gray-800 mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Pilih Kategori
          </h2>

          {/* Kategori */}
          <div className="mb-6">
            {/* <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Tag className="w-4 h-4" />
              Pilih Kategori
            </label> */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Semua Kategori Button (Optional) */}

              {/* Category Buttons */}
              {kategoriList.map((kat) => {
                const colors = getKategoriColor(kat);
                const isSelected = selectedKategori === kat;

                return (
                  <button
                    key={kat}
                    onClick={() => setSelectedKategori(kat)}
                    className={`
          px-4 py-3 text-sm md:text-base rounded-xl border-2 font-semibold 
          transition-all duration-300 
          hover:scale-105 hover:shadow-lg
          flex items-center justify-center gap-2
          min-h-[60px]
          ${
            isSelected
              ? `bg-gradient-to-r ${colors.active} text-white border-transparent shadow-lg ${colors.shadow} scale-105`
              : `${colors.bg} ${colors.text} border ${colors.border} hover:shadow-md hover:bg-opacity-80`
          }
        `}
                  >
                    <span className="text-xl">{colors.icon}</span>
                    <span>{kat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nominal */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="w-4 h-4" />
              Pilih Nominal Keuntungan
            </label>
            <div className="grid grid-cols-4 gap-2">
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
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold mb-4">Simpan Transaksi</h2>

                <p className="text-sm text-gray-600 mb-4">
                  {selectedKategori} - Rp {selectedNominal?.toLocaleString()}
                </p>

                {/* Input No Telp */}
                <div className="relative">
                  <input
                    ref={memberInputRef}
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Masukkan No Telp / Kode Member (Opsional)"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsScanning(true)} // ✅ BENAR
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  >
                    📷
                  </button>
                </div>

                {/* Area Scanner — selalu ada di DOM, tapi hidden jika tidak scan */}
                <div
                  id="reader"
                  className={`w-full mx-auto transition-opacity duration-300 ${
                    isScanning ? "block opacity-100" : "hidden opacity-0"
                  }`}
                ></div>

                {isScanning && (
                  <button
                    type="button"
                    onClick={() => setIsScanning(false)}
                    className="w-full mt-3 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Batal Scan
                  </button>
                )}
                {/* Selected */}
                {selectedMember && (
                  <div className="mt-3 bg-green-50 p-3 rounded-lg text-sm">
                    ✅ {selectedMember.nama}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      submitTransaksi();
                      setShowModal(false);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    Simpan Tanpa Member
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      setMemberSearch("");
                      setSelectedKategori(null);
                    }}
                    className="flex-1 py-3 bg-gray-500 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Member Input */}
        </div>

        {/* Manual Input Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="font-bold md:text-xl text-base text-gray-800 mb-6 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-600" />
            Input Manual Keuntungan
          </h2>

          <form
            className="space-y-4"
            onSubmit={handleSubmit(handleManualSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("kategori", {
                    required: "Kategori wajib diisi",
                  })}
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
                  {...register("nominal", {
                    required: "Nominal wajib diisi",
                    min: { value: 1, message: "Minimal 1" },
                  })}
                  min="1"
                  placeholder="Contoh: 5000"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E")
                      e.preventDefault();
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
              <input
                checked={watchIsForMember}
                type="checkbox"
                id="isForMember"
                {...register("isForMember")}
                className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="isForMember"
                className="text-sm font-medium text-gray-700"
              >
                Tambahkan ke member? (opsional)
              </label>
            </div>

            {watchIsForMember && (
              <div className="mt-4 p-5 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Pilih Member
                </h3>
                <div className="relative mb-4">
                  <Search
                    className={`absolute left-3  ${selectedMember ? "top-6" : "top-1/2"} -translate-y-1/2 w-5 h-5 text-gray-400`}
                  />
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
                  <button
                    type="button"
                    onClick={() => setIsScanning2(true)} // ✅ BENAR
                    className={`absolute right-3 ${selectedMember ? "top-6" : "top-1/2"} -translate-y-1/2 text-blue-600 hover:text-blue-800`}
                  >
                    📷
                  </button>

                  {isScanning2 && (
                    <button
                      type="button"
                      onClick={() => setIsScanning2(false)}
                      className="w-full mt-3 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Batal Scan
                    </button>
                  )}

                  {/* Area Scanner — selalu ada di DOM, tapi hidden jika tidak scan */}
                  <div
                    id="reader2"
                    className={`w-full mx-auto transition-opacity duration-300 ${
                      isScanning2 ? "block opacity-100" : "hidden opacity-0"
                    }`}
                  ></div>

                  {showMemberDropdown && (
                    <div className="absolute z-50 bg-white border-2 border-blue-200 w-full rounded-lg shadow-md mt-2 max-h-48 overflow-y-auto">
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
              </div>
            )}
            <button
              type="submit"
              className="w-full text-sm md:text-base md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              ➕ Tambah Keuntungan
            </button>
          </form>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-md p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">
                Total Keuntungan Hari Ini
              </p>
              <h3 className=" lg:text-xl text-xl font-bold">
                Rp {totalKeuntungan.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <TrendingUp className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-bold md:text-xl text-base text-gray-800 mb-4 flex items-center gap-2">
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
