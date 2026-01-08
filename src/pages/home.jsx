// src/components/ModalGrosirVoucher.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import {
  X,
  Search,
  ShoppingCart,
  TrendingUp,
  Package,
  Wrench,
} from "lucide-react";

export default function Home({ isOpen, onClose, onSuccess }) {
  // State untuk data dari API

  const [grosirMaster, setGrosirMaster] = useState([]);
  const [listDownline, setListDownline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter & keranjang
  const [grosirList, setGrosirList] = useState([]);
  const [filter, setFilter] = useState("");
  const [nameVoucher, setNameVoucher] = useState("");
  const [selectedDownline, setSelectedDownline] = useState("");

  const [pesanan, setPesanan] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [totalHarga, setTotalHarga] = useState(0);
  const [totalKeuntungan, setTotalKeuntungan] = useState(0);

  const [trackingCode, setTrackingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackVoucher = () => {
    if (!trackingCode.trim()) {
      alert("Masukkan kode pelacakan");
      return;
    }
    alert(`Lacak Voucher: ${trackingCode}`);
  };

  const handleTrackService = () => {
    if (!trackingCode.trim()) {
      alert("Masukkan kode pelacakan");
      return;
    }
    alert(`Lacak Service: ${trackingCode}`);
  };

  // Fetch data saat modal dibuka
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [voucherRes, downlineRes] = await Promise.all([
          api.get("/vouchers-master"), // endpoint untuk ambil voucher
          api.get("/downline-master"), // endpoint untuk ambil downline
        ]);

        const vouchers = voucherRes.data.data || voucherRes.data || [];
        const downlines = downlineRes.data.data || downlineRes.data || [];

        setGrosirMaster(vouchers);
        setListDownline(downlines);

        // Set filter default ke brand pertama
        if (vouchers.length > 0 && !filter) {
          setFilter(vouchers[0].brand);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Gagal memuat data master");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter voucher
  useEffect(() => {
    if (!grosirMaster.length) return;

    const hasil = grosirMaster.filter(
      (item) =>
        item.brand === filter &&
        item.nama.toLowerCase().includes(nameVoucher.toLowerCase())
    );
    setGrosirList(hasil);
  }, [grosirMaster, filter, nameVoucher]);

  // Hitung total
  useEffect(() => {
    let harga = 0;
    let untung = 0;
    pesanan.forEach((item) => {
      harga += item.quantity * item.hargaJual;
      untung += item.quantity * (item.hargaJual - item.hargaModal);
    });
    setTotalHarga(harga);
    setTotalKeuntungan(untung);
  }, [pesanan]);

  const handleQtyChange = (index, value) => {
    setQuantities((prev) => ({ ...prev, [index]: Number(value) || 0 }));
  };

  const tambahKeranjang = (item, index) => {
    const qty = quantities[index] || 0;
    if (qty <= 0) {
      Swal.fire({
        title: "Jumlah Tidak Valid",
        text: "Masukkan jumlah minimal 1 untuk menambahkan ke keranjang.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    setPesanan((prev) => {
      const exist = prev.find((p) => p.idVoucher === item.id);
      if (exist) {
        return prev.map((p) =>
          p.idVoucher === item.id ? { ...p, quantity: p.quantity + qty } : p
        );
      }
      return [
        ...prev,
        {
          idVoucher: item.id,
          nama: item.nama,
          quantity: qty,
          brand: item.brand,
          hargaModal: item.hargaModal || item.hargaPokok,
          hargaJual: item.hargaJual,
        },
      ];
    });

    setQuantities((prev) => ({ ...prev, [index]: 0 }));
  };

  const hapusItem = (item) => {
    Swal.fire({
      title: "Hapus Item?",
      text: `Apakah Anda yakin ingin menghapus "${item.nama}" dari keranjang?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setPesanan((prev) =>
          prev.filter((x) => x.idVoucher !== item.idVoucher)
        );
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedDownline) {
      Swal.fire({
        title: "Downline Belum Dipilih",
        text: "Silakan pilih downline terlebih dahulu.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    if (pesanan.length === 0) {
      Swal.fire({
        title: "Keranjang Kosong",
        text: "Tambahkan minimal satu item sebelum mengirim pesanan.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      // Tampilkan loading
      Swal.fire({
        title: "Mengirim pesanan...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const today = new Date();
      const tanggal = today.toISOString().split("T")[0];

      const payload = {
        kodeDownline: selectedDownline,
        tanggal: tanggal,
        penempatan: "JAVA 1",
        keuntungan: totalKeuntungan,
        items: pesanan.map((item) => ({
          idVoucher: item.idVoucher,
          quantity: item.quantity,
        })),
      };

      const res = await api.post("/grosir-downline", payload);

      Swal.close();
      await Swal.fire({
        title: "Pesanan Berhasil!",
        text: "Pesanan grosir telah dikirim ke downline.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.close();

      const msg =
        err.response?.data?.error ||
        "Gagal membuat pesanan. Silakan coba lagi.";

      Swal.fire({
        title: "Gagal Mengirim",
        text: msg,
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Submit error:", err);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Tracking Section */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Masukkan kode pelacakan..."
                className="w-full h-[48px] border-2 border-slate-600 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg pl-11 pr-4 focus:border-blue-400 focus:outline-none transition"
                onKeyDown={(e) => e.key === "Enter" && handleTrackVoucher()}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTrackVoucher}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 h-[48px] rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Voucher</span>
              </button>

              <button
                onClick={handleTrackService}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 h-[48px] rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:inline">Service</span>
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                Pesan Voucher Grosir Java Cell
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Kelola pesanan voucher untuk downline Anda
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Filters & Products */}
            <div className="lg:col-span-2 space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Filters */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Kode Downline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedDownline}
                    onChange={(e) =>
                      setSelectedDownline(e.target.value.trim().toUpperCase())
                    }
                    placeholder="Masukkan kode downline"
                    className="w-full border-2 border-blue-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none transition bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Provider
                    </label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full border-2 border-blue-200 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none transition bg-white"
                    >
                      {[...new Set(grosirMaster.map((item) => item.brand))].map(
                        (brand, i) => (
                          <option key={i} value={brand}>
                            {brand}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Cari Voucher
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari voucher..."
                        value={nameVoucher}
                        onChange={(e) => setNameVoucher(e.target.value)}
                        className="w-full border-2 border-blue-200 rounded-lg p-2.5 pl-10 focus:border-blue-500 focus:outline-none transition bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              {loading && !grosirMaster.length ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-500">Memuat data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {grosirList.map((d, i) => (
                    <div
                      key={d.id}
                      className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">{d.nama}</h3>
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full mt-1 font-medium">
                            Stok: {d.stok}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 mb-3 text-sm">
                        <div className="flex justify-between items-center bg-blue-50 px-2 py-1 rounded">
                          <span className="text-gray-600">Harga Jual:</span>
                          <span className="font-bold text-blue-600">
                            Rp {(d.hargaJual || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={quantities[i] || ""}
                          onChange={(e) => handleQtyChange(i, e.target.value)}
                          placeholder="Jumlah"
                          className="flex-1 border-2 border-gray-200 rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => tambahKeranjang(d, i)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 rounded-lg font-medium transition shadow-md hover:shadow-lg"
                        >
                          Tambah
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel - Cart */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sticky top-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg">Keranjang</h3>
                  {pesanan.length > 0 && (
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {pesanan.length}
                    </span>
                  )}
                </div>

                {pesanan.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Keranjang kosong</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                      {pesanan.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-lg p-3 border-2 border-blue-100 hover:border-blue-300 transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-sm text-gray-800">
                              {item.nama}
                            </p>
                            <button
                              onClick={() => hapusItem(item)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>
                                {item.quantity} × Rp{" "}
                                {item.hargaJual.toLocaleString()}
                              </span>
                              <span className="font-semibold">
                                Rp{" "}
                                {(
                                  item.quantity * item.hargaJual
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-blue-200 pt-4 space-y-3">
                      <div className="flex justify-between text-sm bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-700">
                          Total Harga:
                        </span>
                        <span className="font-bold text-lg text-blue-600">
                          Rp {totalHarga.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Memproses..." : "Buat Pesanan"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
