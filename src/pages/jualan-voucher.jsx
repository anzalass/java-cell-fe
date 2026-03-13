// src/pages/JualanVoucher.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
  X,
  RefreshCw,
  Tag,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { Html5Qrcode } from "html5-qrcode";

export default function JualanVoucher() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [membersList, setMembersList] = useState([]);
  const memberInputRef = useRef(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("member", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setMembersList(res.data.data || []);
      } catch (err) {
        console.error("Fetch members error:", err);
      }
    };

    if (user?.token) fetchMembers();
  }, [user]);

  const tambahKeKeranjang = (voucher) => {
    if (voucher.stok <= 0) {
      Swal.fire("Stok Habis!", "Voucher ini stoknya habis.", "warning");
      return;
    }

    setSelectedVoucher(voucher);
    setTimeout(() => {
      memberInputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    if (!memberSearch || !selectedVoucher) return;

    const cleaned = memberSearch.trim();

    const matched = membersList.find(
      (m) => m.noTelp === cleaned || m.kodeMember === cleaned
    );
    if (matched) {
      jualVoucherMutation.mutate(
        {
          idVoucher: selectedVoucher.id,
          idMember: matched.id,
        },
        {
          onSuccess: () => {
            setSelectedVoucher(null);
            setMemberSearch("");
          },
        }
      );
    }
  }, [memberSearch]);

  // === QUERY: Ambil Voucher Master ===
  const {
    data: voucherMaster,
    isLoading: loadingMaster,
    isError: errorMaster,
    refetch: refetchMaster,
  } = useQuery({
    queryKey: ["voucherMaster"],
    queryFn: async () => {
      const res = await api.get("vouchers-master", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
    staleTime: 5000,
  });

  // === QUERY: Ambil Transaksi Hari Ini ===
  const {
    data: transaksiHarian,
    isLoading: loadingTransaksi,
    isError: errorTransaksi,
    refetch: refetchTransaksi,
  } = useQuery({
    queryKey: ["transaksiHarian"],
    queryFn: async () => {
      const res = await api.get("voucher-harian", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
  });

  const vouchers = voucherMaster || [];
  const keranjang = transaksiHarian?.data.transaksi || [];

  console.log(transaksiHarian);

  // Brand unik
  const brands = [...new Set(vouchers.map((v) => v.brand))];

  // Filter voucher berdasarkan brand
  const filteredVouchers = selectedBrand
    ? vouchers.filter((v) => v.brand === selectedBrand)
    : vouchers;

  // Hitung statistik
  const stats = useMemo(() => {
    let omset = 0;
    let keuntungan = 0;
    keranjang.forEach((item) => {
      omset += item.hargaJual;
      keuntungan += item.keuntungan;
    });
    return { omset, keuntungan };
  }, [keranjang]);

  // === MUTATION: Jual Voucher ===
  const jualVoucherMutation = useMutation({
    mutationFn: ({ idVoucher, idMember }) =>
      api.post(
        `voucher-harian`,
        {
          idVoucher: idVoucher,
          idMember: idMember,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksiHarian"] });
      queryClient.invalidateQueries({ queryKey: ["voucherMaster"] });

      Swal.fire({
        title: "Berhasil!",
        text: "Voucher berhasil dijual.",
        icon: "success",
        timer: 200,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menjual voucher.",
        icon: "error",
      });
    },
  });

  // === MUTATION: Hapus Transaksi ===
  const hapusTransaksiMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`voucher-harian/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksiHarian"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Transaksi berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal menghapus transaksi.",
        icon: "error",
      });
    },
  });

  // Tambah ke keranjang (jual)

  // Hapus dari keranjang
  const hapusDariKeranjang = (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Transaksi ini akan dihapus dan stok dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        hapusTransaksiMutation.mutate(id);
      }
    });
  };

  const isLoading = loadingMaster || loadingTransaksi;
  const isError = errorMaster || errorTransaksi;

  // Tambahkan state untuk scanner
  const [isScanning, setIsScanning] = useState(false);
  const scannerInstance = useRef(null);

  // Fungsi bantu: cari member by noTelp atau kodeMember
  const findMemberByCode = (code) => {
    return membersList.find((m) => m.noTelp === code || m.kodeMember === code);
  };

  // Mulai scan
  // Tambahkan useEffect untuk handle scan
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
                await jualVoucherMutation.mutateAsync({
                  idVoucher: selectedVoucher.id,
                  idMember: matched.id,
                });
                Swal.fire({
                  title: "Berhasil!",
                  text: `Voucher terjual ke ${matched.nama}`,
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
  }, [isScanning, selectedVoucher, membersList]);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="animate-spin w-8 h-8 mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Gagal memuat data. Silakan coba lagi.
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-xl">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-base  font-bold text-gray-800">
              Penjualan Voucher
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              transaksi penjualan voucher
            </p>
          </div>
        </div>
      </div> */}
      <div className="grid grid-cols-1  gap-6">
        {/* === KIRI: BRAND & VOUCHER === */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Buttons */}
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Pilih Provider
              </h2>
            </div>
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
              <button
                onClick={() => setSelectedBrand("")}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  !selectedBrand
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
              >
                Semua
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-4 py-3 text-sm rounded-xl font-semibold transition-all ${
                    selectedBrand === brand
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                >
                  {brand === "Indosat / IM3" ? "Indosat" : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Voucher Cards */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Daftar Voucher {selectedBrand && `(${selectedBrand})`}
            </h2>
            {filteredVouchers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada voucher tersedia
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5  gap-4">
                {filteredVouchers.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => tambahKeKeranjang(v)}
                    className={`bg-white border-2 rounded-xl p-4 transition cursor-pointer ${
                      v.stok <= 0
                        ? "border-gray-300 opacity-60"
                        : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm text-gray-800">
                          {v.nama}
                        </h3>
                        <p className="text-xs text-gray-600">{v.brand}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-green-600 font-bold text-sm">
                        Rp {v.hargaEceran?.toLocaleString() || 0}
                      </span>
                    </div>
                    <p
                      className={`mt-2 w-fit text-xs px-2 py-1 rounded-full ${
                        v.stok <= 0
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      Stok: {v.stok}
                    </p>
                    {v.stok <= 0 && (
                      <div className="mt-1 text-center">
                        <span className="text-red-500 text-xs font-medium">
                          Stok Habis
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === KANAN: RINGKASAN & KERANJANG === */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Ringkasan Hari Ini
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600">Omset</span>
                </div>
                <span className="font-bold text-lg text-blue-700">
                  Rp {stats.omset.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Keuntungan</span>
                </div>
                <span className="font-bold text-lg text-green-700">
                  Rp {stats.keuntungan.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-600">Total Item</span>
                </div>
                <span className="font-bold text-lg text-purple-700">
                  {keranjang.length}
                </span>
              </div>
            </div>
          </div>

          {/* Keranjang */}
          <div className="bg-white border rounded-xl p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              Penjualan Hari Ini ({keranjang.length})
            </h2>
            {keranjang.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Belum ada penjualan
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {keranjang.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {item.voucher.nama}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.voucher.brand}
                      </p>
                      <p className="text-xs">
                        {" "}
                        {new Date(item.tanggal).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "numeric",
                        })}{" "}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium text-sm">
                        Rp {item.hargaJual?.toLocaleString() || 0}
                      </span>
                      <button
                        onClick={() => hapusDariKeranjang(item.id)}
                        disabled={hapusTransaksiMutation.isPending}
                        className="text-red-500 bg-red-100 rounded-full p-1 hover:bg-red-200 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedVoucher && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative">
            <h2 className="text-lg font-bold mb-4">Jual Voucher</h2>

            <p className="text-sm text-gray-600 mb-4">
              {selectedVoucher.nama} - Rp{" "}
              {selectedVoucher.hargaEceran?.toLocaleString()}
            </p>

            {/* Input + Tombol Kamera */}
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

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  jualVoucherMutation.mutate({
                    idVoucher: selectedVoucher.id,
                    idMember: memberSearch
                      ? findMemberByCode(memberSearch)?.id
                      : null,
                  });
                  setSelectedVoucher(null);
                  setMemberSearch("");
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg"
              >
                Simpan Tanpa Member
              </button>

              <button
                onClick={() => {
                  setSelectedVoucher(null);
                  setMemberSearch("");
                  setIsScanning(false); // ✅ Cukup ini
                }}
                className="flex-1 py-3 bg-gray-500 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
