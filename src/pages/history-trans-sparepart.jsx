// src/components/TableSectionSparepart.jsx
import {
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
  Wallet,
  BarChart3,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function TableSectionSparepart({
  title = "Transaksi Sparepart",
}) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openDetail, setOpenDetail] = useState(null);

  console.log(openDetail);

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

  // === QUERY: Fetch Transaksi Sparepart ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "transaksiSparepart",
      page,
      itemPerPage,
      searchQuery,
      filterType,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("pageSize", itemPerPage);

      if (searchQuery) {
        params.append("search", searchQuery);
      }

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
        if (dateFrom) startDate = dateFrom;
        if (dateTo) endDate = dateTo;
      }

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await api.get(`/transaksi-sparepart?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      // 🔎 DEBUG (boleh dihapus)
      console.log("API RESPONSE:", res.data);

      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  console.log("asa", queryData?.formatted);

  const data = queryData?.formatted || [];
  const total = queryData?.meta?.total || 0;
  const totalPages = queryData?.meta?.totalPages || 1;

  // === MUTATIONS ===
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/transaksi-sparepart/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksiSparepart"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Transaksi berhasil dihapus. Stok dikembalikan.",
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

  // 📊 Statistik
  const stats = useMemo(() => {
    const totalTransaksi = data.length;
    const totalPendapatan = data.reduce(
      (sum, item) => sum + item.totalHarga,
      0
    );
    const totalKeuntungan = data.reduce(
      (sum, item) => sum + item.keuntungan,
      0
    );
    const avgKeuntungan =
      totalTransaksi > 0 ? Math.round(totalKeuntungan / totalTransaksi) : 0;

    return { totalTransaksi, totalPendapatan, totalKeuntungan, avgKeuntungan };
  }, [data]);

  // 🗑️ Hapus dengan SweetAlert
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Transaksi ini akan dihapus dan stok akan dikembalikan!",
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

  // 🔍 Cari
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  // 🔄 Reset
  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
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
              title="Pendapatan"
              value={`Rp ${stats.totalPendapatan.toLocaleString("id-ID")}`}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Nama Pembeli
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ahmad, DL-001, dll..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  Cari
                </button>
              </div>
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
                    className={`px-2.5 py-2 text-xs rounded ${
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
          </div>

          {filterType === "custom" && (
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Dari</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex-1">
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

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Reset Filter
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Baris/halaman:</span>
              <select
                className="border px-2 py-1.5 rounded text-sm"
                value={itemPerPage}
                onChange={(e) => {
                  setItemPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
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
                <th className="px-4 py-3 text-left">Total Harga</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Keuntungan</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr className="border-t">
                  <td
                    className="px-4 py-3 text-gray-500 text-center"
                    colSpan={6}
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(page - 1) * itemPerPage + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.namaPembeli}
                    </td>
                    <td className="px-4 py-3">
                      Rp {item.totalHarga.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{item.tanggal}</td>
                    <td className="px-4 py-3 text-green-600">
                      Rp {item.keuntungan.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          title="Detail"
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => setOpenDetail(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Hapus"
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* === MODAL DETAIL === */}
      {openDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Detail Transaksi
              </h2>
              <button
                onClick={() => setOpenDetail(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama Pembeli:</span>
                <span className="font-medium">{openDetail.namaPembeli}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-medium">{openDetail.tanggal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">
                  Rp {openDetail.totalHarga.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Keuntungan:</span>
                <span className="font-medium text-green-600">
                  Rp {openDetail.keuntungan.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Item Transaksi</h3>
            <div className="overflow-hidden rounded border">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Produk</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Harga</th>
                    <th className="px-3 py-2 text-right">Total Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sesuaikan dengan struktur data Anda */}
                  {openDetail.detail?.itemTransaksi?.map((x, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{x.namaProduk}</td>
                      <td className="px-3 py-2 text-center">{x.qty}</td>
                      <td className="px-3 py-2 text-right">
                        Rp {x.hargaJual.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rp {Number(x.hargaJual * x.qty).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpenDetail(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Stat Card Component
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
