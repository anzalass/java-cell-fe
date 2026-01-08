// src/components/TableSectionService.jsx
import {
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
  Wallet,
  BarChart3,
  Pencil,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function TableSectionService({
  title = "Transaksi Service Hari Ini",
}) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openDetail, setOpenDetail] = useState(null);
  const [openEdit, setOpenEdit] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Helpers
  const today = new Date().toISOString().slice(0, 10);
  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
  };
  const getStartOfMonth = () => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  };

  // === QUERY: Fetch Service Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "serviceHp",
      page,
      itemPerPage,
      searchQuery,
      filterStatus,
      filterType,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", itemPerPage);
      if (searchQuery) params.append("search", searchQuery);
      if (filterStatus !== "all") params.append("status", filterStatus);

      let startDate = "";
      let endDate = "";
      if (filterType === "today") {
        startDate = today;
        endDate = today;
      } else if (filterType === "week") {
        startDate = getStartOfWeek();
        endDate = today;
      } else if (filterType === "month") {
        startDate = getStartOfMonth();
        endDate = today;
      } else if (filterType === "custom") {
        startDate = dateFrom;
        endDate = dateTo;
      }
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`/service-hp?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  const data = queryData?.data || [];
  const total = queryData?.meta?.total || 0;
  const totalPages = queryData?.meta?.totalPages || 1;

  // === MUTATIONS ===
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/service-hp/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceHp"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Transaksi service berhasil dihapus.",
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

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(
        `/service-hp/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceHp"] });
      setOpenEdit(null);
      setNewStatus("");
      Swal.fire({
        title: "Berhasil!",
        text: "Status transaksi berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.error || "Gagal memperbarui status.",
        icon: "error",
      });
    },
  });

  // 📊 Statistik
  const stats = useMemo(() => {
    // ✅ Hanya ambil transaksi dengan status "SUCCES"
    const transaksiSelesai = data.filter((item) => item.status === "Selesai");

    const totalTransaksi = data.length; // Tetap hitung semua transaksi
    const totalBiayaJasa = transaksiSelesai.reduce(
      (sum, item) => sum + item.biayaJasa,
      0
    );
    const totalKeuntungan = transaksiSelesai.reduce(
      (sum, item) => sum + item.keuntungan,
      0
    );
    const avgKeuntungan =
      transaksiSelesai.length > 0
        ? Math.round(totalKeuntungan / transaksiSelesai.length)
        : 0;

    return { totalTransaksi, totalBiayaJasa, totalKeuntungan, avgKeuntungan };
  }, [data]);

  // 🗑️ Hapus
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Transaksi ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  // ✏️ Simpan status
  const handleSaveStatus = () => {
    if (!newStatus) {
      Swal.fire("Peringatan", "Pilih status terlebih dahulu", "warning");
      return;
    }
    updateStatusMutation.mutate({
      id: openEdit.id,
      status: newStatus,
    });
  };

  // 🔍 Cari
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  // 🔄 Reset
  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setFilterStatus("all");
    setFilterType("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // === RENDER ===
  if (isLoading) return <div className="text-center py-10">Memuat data...</div>;
  if (isError)
    return (
      <div className="text-center py-10 text-red-500">
        {error?.message || "Gagal memuat data transaksi"}
      </div>
    );

  return (
    <>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {/* === STATS === */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Transaksi"
              value={stats.totalTransaksi}
              icon={<BarChart3 className="w-5 h-5" />}
              color="text-blue-600"
            />
            <StatCard
              title="Biaya Jasa"
              value={`Rp ${stats.totalBiayaJasa.toLocaleString("id-ID")}`}
              icon={<Wallet className="w-5 h-5" />}
              color="text-green-600"
            />
            <StatCard
              title="Keuntungan"
              value={`Rp ${stats.totalKeuntungan.toLocaleString("id-ID")}`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="text-amber-600"
            />
            <StatCard
              title="Rata-rata/Transaksi"
              value={`Rp ${stats.avgKeuntungan.toLocaleString("id-ID")}`}
              icon={<Calendar className="w-5 h-5" />}
              color="text-purple-600"
            />
          </div>
        </div>

        {/* === FILTER SECTION === */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Nama
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="DL-001, dll..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded whitespace-nowrap"
                >
                  Cari
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="Proses">Proses</option>
                <option value="Selesai">Selesai</option>
                <option value="Batal">Batal</option>
                <option value="Gagal">Gagal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rekap Waktu
              </label>
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "all", label: "Semua" },
                  { key: "today", label: "Hari Ini" },
                  { key: "week", label: "Minggu Ini" },
                  { key: "month", label: "Bulan Ini" },
                  { key: "custom", label: "Custom" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setFilterType(opt.key);
                      if (opt.key !== "custom") {
                        setDateFrom("");
                        setDateTo("");
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      filterType === opt.key
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleReset}
                className="w-full px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {filterType === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Dari</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Sampai
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <select
              className="border px-2 py-1.5 rounded text-sm"
              value={itemPerPage}
              onChange={(e) => {
                setItemPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5/hal</option>
              <option value={10}>10/hal</option>
              <option value={20}>20/hal</option>
            </select>
          </div>
        </div>

        {/* === TABLE === */}
        <div className="px-4 py-3 bg-gray-50 border-b text-gray-700 font-medium">
          {title}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-600 bg-gray-100">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama Pembeli</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Biaya Jasa</th>
                <th className="px-4 py-3 text-left">Keuntungan</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr className="border-t">
                  <td
                    className="px-4 py-3 text-gray-500 text-center"
                    colSpan={8}
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      {(page - 1) * itemPerPage + i + 1}
                    </td>
                    <td className="px-4 py-3">{item.namaPembeli}</td>
                    <td className="px-4 py-3">{item.keterangan}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === "SUCCES"
                            ? "bg-green-100 text-green-700"
                            : item.status === "PROSES"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      Rp {item.biayaJasa.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      Rp {item.keuntungan.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{item.tanggal}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        title="Detail"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setOpenDetail(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Edit Status"
                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => {
                          setOpenEdit(item);
                          setNewStatus(item.status);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {item.status !== "SUCCES" && (
                        <button
                          title="Hapus"
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ PAGINATION YANG BENAR */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Menampilkan {(page - 1) * itemPerPage + 1}–
              {Math.min(page * itemPerPage, total)} dari {total} data
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1.5 text-sm">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page >= totalPages}
                className="px-3 py-1.5 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {openDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-5 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800">
                  Detail Service HP
                </h2>
                <button
                  onClick={() => setOpenDetail(null)}
                  className="text-gray-500 hover:text-gray-800 text-xl"
                  aria-label="Tutup"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-sm">
              {/* Nama Pelanggan */}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Nama Pelanggan:
                </span>
                <span className="font-semibold">
                  {openDetail.member.nama || "-"}
                </span>
              </div>

              {/* Member */}
              {openDetail.member ? (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Member:</span>
                  <span className="text-green-600 font-medium">Ya</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Member:</span>
                  <span className="text-gray-500 italic">Tidak</span>
                </div>
              )}

              {/* No HP */}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">No. HP:</span>
                <span>{openDetail.member?.noTelp || "-"}</span>
              </div>

              {/* Brand HP */}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Brand HP:</span>
                <span>{openDetail.brandHP || "-"}</span>
              </div>

              {/* Keterangan */}
              <div>
                <span className="font-medium text-gray-600">
                  Keterangan Kerusakan:
                </span>
                <p className="mt-1 p-2 bg-gray-50 rounded-md border text-gray-800">
                  {openDetail.keterangan || "Tidak ada keterangan"}
                </p>
              </div>

              {/* Status */}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    openDetail.status === "SELESAI"
                      ? "bg-green-100 text-green-800"
                      : openDetail.status === "PROSES"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {openDetail.status || "-"}
                </span>
              </div>

              {/* Tanggal */}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">
                  Tanggal Service:
                </span>
                <span>{openDetail.tanggal || "-"}</span>
              </div>

              {/* Biaya Jasa */}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Biaya Jasa:</span>
                <span>
                  Rp{(openDetail.biayaJasa || 0).toLocaleString("id-ID")}
                </span>
              </div>

              {/* Sparepart */}
              {/* Sparepart Digunakan — Dalam Bentuk Tabel */}
              <div>
                <span className="font-medium text-gray-600">
                  Sparepart Digunakan:
                </span>

                {openDetail.detail?.itemTransaksi &&
                openDetail.detail.itemTransaksi.length > 0 ? (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="px-3 py-2 border">Nama</th>
                          <th className="px-3 py-2 border text-center">Qty</th>
                          <th className="px-3 py-2 border text-right">Harga</th>
                          <th className="px-3 py-2 border text-right">
                            Keuntungan
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {openDetail.detail.itemTransaksi.map((sp, idx) => {
                          const untung =
                            (sp.hargaJual - sp.hargaPokok) * sp.qty;
                          return (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-3 py-2 border">
                                {sp.namaProduk}
                              </td>
                              <td className="px-3 py-2 border text-center">
                                {sp.qty}
                              </td>
                              <td className="px-3 py-2 border text-right">
                                Rp{sp.hargaJual.toLocaleString("id-ID")}
                              </td>
                              <td className="px-3 py-2 border text-right text-green-600">
                                Rp{untung.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Ringkasan Total di Bawah Tabel */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-gray-600 text-xs">Total Item</div>
                        <div className="font-bold">
                          {openDetail.detail.itemTransaksi.reduce(
                            (a, b) => a + b.qty,
                            0
                          )}
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded text-center">
                        <div className="text-gray-600 text-xs">
                          Total Harga Sparepart
                        </div>
                        <div className="font-bold">
                          Rp
                          {openDetail.detail.itemTransaksi
                            .reduce((sum, sp) => sum + sp.hargaJual * sp.qty, 0)
                            .toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-gray-600 text-xs">
                          Total Keuntungan
                        </div>
                        <div className="font-bold text-green-700">
                          Rp
                          {openDetail.detail.itemTransaksi
                            .reduce(
                              (sum, sp) =>
                                sum + (sp.hargaJual - sp.hargaPokok) * sp.qty,
                              0
                            )
                            .toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-500 italic">
                    Tidak ada sparepart digunakan
                  </p>
                )}
              </div>
            </div>

            <div className="flex p-5 justify-between text-lg font-bold mt-2">
              <span>Total Keuntungan:</span>
              <span className="text-green-600">
                Rp{(openDetail.keuntungan || 0).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="p-5 border-t">
              <button
                onClick={() => setOpenDetail(null)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT STATUS */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Edit Status</h2>
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Proses">Proses</option>
              <option value="Selesai">Selesai</option>
              <option value="Batal">Batal</option>
              <option value="Gagal">Gagal</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded"
                onClick={() => setOpenEdit(null)}
              >
                Batal
              </button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={handleSaveStatus}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-1">
        <span className={`${color}`}>{icon}</span>
        <span className="text-xs text-gray-500">{title}</span>
      </div>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}
