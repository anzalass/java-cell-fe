import React, { useState, useRef, useEffect } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import {
  X,
  Search,
  User,
  Barcode,
  ShoppingCart,
  Hash,
  TrendingUp,
  Trash2,
  Plus,
} from "lucide-react";
export default function ModalTransaksiSparepart({
  isOpen,
  onClose,
  onSuccess,
}) {
  const { user } = useAuthStore();

  const [barcode, setBarcode] = useState("");
  const [manualId, setManualId] = useState("");
  const [namaPembeli, setNamaPembeli] = useState("");
  const [searchNama, setSearchNama] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [masterAksesoris, setMasterAksesoris] = useState([]);
  const [loading, setLoading] = useState(false);

  // === STATE UNTUK MEMBER ===
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [membersList, setMembersList] = useState([]);

  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch master aksesoris saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    const fetchMaster = async () => {
      try {
        const res = await api.get("sparepart-master", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMasterAksesoris(res.data || []);
      } catch (err) {
        console.error("Fetch master error:", err);
        alert("Gagal memuat data aksesoris");
      }
    };

    fetchMaster();
  }, [isOpen, user.token]);

  // Fetch member saat ketik (autocomplete)
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

  // Handle barcode scan
  useEffect(() => {
    if (!barcode) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      addByBarcode(barcode);
    }, 400);
  }, [barcode]);

  // Auto-focus input barcode saat modal buka
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  // === FUNGSI TAMBAH ITEM ===
  const addItem = (aks) => {
    if (quantity > aks.stok) {
      alert(`Stok tidak cukup! Tersedia: ${aks.stok}`);
      return;
    }

    const existing = items.find((i) => i.idSparepart === aks.id);
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.idSparepart === aks.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          idSparepart: aks.id,
          nama: aks.nama,
          quantity,
          hargaModal: aks.hargaModal,
          hargaJual: aks.hargaJual,
        },
      ]);
    }
    setQuantity(1);
  };

  const addByBarcode = (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const aks = masterAksesoris.find(
      (a) => a.barcode?.toLowerCase() === cleanCode.toLowerCase()
    );

    if (!aks) {
      Swal.fire({
        title: "Barcode Tidak Ditemukan",
        text: "Pastikan barcode sudah benar dan tersedia di stok.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    addItem(aks);
    setBarcode("");
  };

  const addByManualId = (id) => {
    if (!id) return;

    const aks = masterAksesoris.find((a) => a.id === id);

    if (!aks) {
      Swal.fire({
        title: "ID Tidak Ditemukan",
        text: "ID aksesoris tidak valid atau tidak tersedia.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    addItem(aks);
    setManualId("");
  };

  const addByNama = (nama) => {
    const cleanNama = nama.trim();
    if (!cleanNama) return;

    const aks = masterAksesoris.find(
      (a) => a.nama?.toLowerCase() === cleanNama.toLowerCase()
    );

    if (!aks) {
      Swal.fire({
        title: "Nama Tidak Ditemukan",
        text: "Nama aksesoris tidak ditemukan dalam daftar.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    addItem(aks);
    setSearchNama("");
    setShowDropdown(false);
  };

  const filteredNama = masterAksesoris.filter((a) =>
    a.nama.toLowerCase().includes(searchNama.toLowerCase())
  );

  // Pilih member dari dropdown
  const selectMember = (member) => {
    setSelectedMember(member);
    setMemberSearch(``);
    setShowMemberDropdown(false);
  };

  // Hitung total
  const totalModal = items.reduce(
    (sum, i) => sum + i.hargaModal * i.quantity,
    0
  );
  const totalJual = items.reduce((sum, i) => sum + i.hargaJual * i.quantity, 0);
  const totalKeuntungan = totalJual - totalModal;

  // Simpan transaksi
  const handleSave = async () => {
    if (items.length === 0) {
      Swal.fire({
        title: "Keranjang Kosong",
        text: "Tambahkan minimal satu sparepart sebelum menyimpan transaksi.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        items: items.map((item) => ({
          idSparepart: item.idSparepart,
          quantity: item.quantity,
        })),
        keuntungan: totalKeuntungan,
        status: "selesai",
        nama: namaPembeli,
        ...(selectedMember && { idMember: selectedMember.id }),
      };

      await api.post("transaksi-sparepart", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Reset state
      setItems([]);
      setSelectedMember(null);
      setMemberSearch("");
      onSuccess();
      onClose();

      // Notifikasi sukses
      await Swal.fire({
        title: "Berhasil!",
        text: "Transaksi sparepart berhasil disimpan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Terjadi kesalahan saat menyimpan transaksi.";

      await Swal.fire({
        title: "Gagal Menyimpan",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 -top-10 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Transaksi Sparepart</h2>
              <p className="text-indigo-100 text-sm mt-0.5">
                Kelola penjualan sparepart HP
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Customer Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Pembeli */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Nama Pembeli
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama pembeli"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-indigo-500 focus:outline-none transition"
                  onChange={(e) => setNamaPembeli(e.target.value)}
                  value={namaPembeli}
                />
              </div>

              {/* Member Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
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
                    placeholder="Cari nama atau no HP..."
                    className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:border-indigo-500 focus:outline-none transition"
                    onFocus={() =>
                      membersList.length > 0 && setShowMemberDropdown(true)
                    }
                  />

                  {showMemberDropdown && (
                    <div className="absolute z-50 bg-white border-2 border-indigo-200 w-full rounded-lg shadow-lg mt-2 max-h-48 overflow-y-auto">
                      {membersList.length === 0 ? (
                        <p className="p-3 text-gray-500 text-sm text-center">
                          Member tidak ditemukan
                        </p>
                      ) : (
                        membersList.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center transition"
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
            </div>

            {/* Product Search Section */}
            <div className="bg-indigo-50 rounded-xl p-4">
              <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Tambah Produk
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                {/* Scan Barcode */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Barcode className="w-4 h-4" />
                    Scan Barcode
                  </label>
                  <input
                    ref={inputRef}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full border-2 border-indigo-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="A001..."
                  />
                </div>

                {/* Input ID */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4" />
                    Input ID
                  </label>
                  <input
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && addByManualId(manualId)
                    }
                    className="w-full border-2 border-indigo-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="UUID atau ID"
                  />
                </div>

                {/* Cari Nama */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4" />
                    Cari Nama
                  </label>
                  <input
                    value={searchNama}
                    onChange={(e) => {
                      setSearchNama(e.target.value);
                      setShowDropdown(true);
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && addByNama(searchNama)
                    }
                    className="w-full border-2 border-indigo-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="LCD, Baterai..."
                  />
                  {showDropdown && searchNama.length > 0 && (
                    <div className="absolute z-50 bg-white border-2 border-indigo-200 w-full rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                      {filteredNama.length === 0 ? (
                        <p className="p-2 text-gray-500 text-sm">
                          Tidak ditemukan
                        </p>
                      ) : (
                        filteredNama.map((a) => (
                          <p
                            key={a.id}
                            className="p-2 hover:bg-indigo-50 cursor-pointer text-sm"
                            onClick={() => addByNama(a.nama)}
                          >
                            {a.nama}
                          </p>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value)))
                    }
                    className="w-full border-2 border-indigo-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Items Table */}
            {items.length > 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">
                          Nama Produk
                        </th>
                        <th className="py-3 px-4 text-center font-semibold text-gray-700">
                          Qty
                        </th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">
                          Harga Modal
                        </th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">
                          Harga Jual
                        </th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">
                          Keuntungan
                        </th>
                        <th className="py-3 px-4 text-center font-semibold text-gray-700">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, i) => {
                        const subtotalModal = item.hargaModal * item.quantity;
                        const subtotalJual = item.hargaJual * item.quantity;
                        const subtotalKeuntungan = subtotalJual - subtotalModal;
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="py-3 px-4 font-medium">
                              {item.nama}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-600">
                              Rp {subtotalModal.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                              Rp {subtotalJual.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-green-600">
                              Rp {subtotalKeuntungan.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() =>
                                  setItems((prev) =>
                                    prev.filter(
                                      (i) => i.idAksesoris !== item.idAksesoris
                                    )
                                  )
                                }
                                className="text-red-500 hover:text-red-700 transition"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                      <tr className="font-bold">
                        <td
                          colSpan={2}
                          className="py-4 px-4 text-right text-gray-700"
                        >
                          Total
                        </td>
                        <td className="py-4 px-4 text-right text-gray-700">
                          Rp {totalModal.toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 px-4 text-right text-indigo-700 text-lg">
                          Rp {totalJual.toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 px-4 text-right text-green-700 text-lg flex items-center justify-end gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Rp {totalKeuntungan.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">Belum ada item ditambahkan</p>
                <p className="text-sm text-gray-400 mt-1">
                  Scan barcode atau cari produk untuk menambah item
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={items.length === 0 || loading}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}
