// src/components/TableSectionVoucherGrosir.jsx
import {
  Eye,
  Pencil,
  Trash2,
  BarChart3,
  Wallet,
  TrendingUp,
  Clock,
  RefreshCw,
  SearchIcon,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function TableSectionVoucherGrosir({
  title = "Transaksi Voucher Grosir",
}) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);

  const [searchKode, setSearchKode] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");

  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openDetail, setOpenDetail] = useState(null);
  console.log(openDetail?.detail);

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

  // === QUERY: Fetch Grosir Data ===
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "grosir",
      page,
      itemPerPage,
      currentSearch,
      filterType,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", itemPerPage);
      if (currentSearch) params.append("search", currentSearch);

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

      const res = await api.get(`grosir?${params.toString()}`, {
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
      api.delete(`grosir/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grosir"] });
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

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(
        `grosir/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grosir"] });
      setOpenEdit(null);
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
    const totalTransaksi = data.length;
    const totalNominal = data.reduce((sum, item) => sum + item.totalHarga, 0);
    const totalKeuntungan = data
      .filter((item) => item.status === "Selesai")
      .reduce((sum, item) => sum + item.keuntungan, 0);

    const statusCount = {
      Pending: 0,
      Proses: 0,
      Selesai: 0,
      Gagal: 0,
      Batal: 0,
    };
    data.forEach((item) => {
      if (statusCount.hasOwnProperty(item.status)) {
        statusCount[item.status]++;
      }
    });

    return { totalTransaksi, totalNominal, totalKeuntungan, statusCount };
  }, [data]);

  // 🗑️ Hapus dengan SweetAlert
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
    setCurrentSearch(searchKode);
    setPage(1);
  };

  // 🔄 Reset
  const handleReset = () => {
    setSearchKode("");
    setCurrentSearch("");
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
        {error?.message || "Gagal memuat data"}
      </div>
    );

  return (
    <>
      {/* STATISTICS */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            title="Total Transaksi"
            value={stats.totalTransaksi}
            icon={<BarChart3 className="w-4 h-4" />}
            color="text-blue-600"
          />
          <StatCard
            title="Nominal"
            value={`Rp ${stats.totalNominal.toLocaleString("id-ID")}`}
            icon={<Wallet className="w-4 h-4" />}
            color="text-green-600"
          />
          <StatCard
            title="Keuntungan"
            value={`Rp ${stats.totalKeuntungan.toLocaleString("id-ID")}`}
            icon={<TrendingUp className="w-4 h-4" />}
            color="text-amber-600"
          />
          <StatCard
            title="Selesai"
            value={stats.statusCount.Selesai}
            icon={<Clock className="w-4 h-4" />}
            color="text-green-600"
          />
          <StatCard
            title="Pending"
            value={stats.statusCount.Pending}
            icon={<RefreshCw className="w-4 h-4" />}
            color="text-yellow-600"
          />
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Kode Downline
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKode}
                onChange={(e) => setSearchKode(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DL-001, dll..."
              />
              <button
                onClick={handleSearch}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
              >
                <SearchIcon className="w-4 h-4" />
                Search
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
                  className={`px-2.5 py-1 text-xs rounded ${
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
              Reset
            </button>
          </div>
        </div>

        {filterType === "custom" && (
          <div className="flex gap-3 mt-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Dari</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Sampai</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded text-sm"
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

      {/* TABLE */}
      <div className="px-4 py-3 bg-gray-50 border-b text-gray-700 font-medium">
        {title}
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-600 bg-gray-100">
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Kode Downline</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Nominal</th>
              <th className="px-4 py-3 text-left">Keuntungan</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-3 text-gray-500 text-center border-t"
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
                    {item.downline.kodeDownline} - {item.downline.nama}
                  </td>
                  <td className="px-4 py-3">{item.tanggal}</td>
                  <td className="px-4 py-3">
                    Rp {item.totalHarga.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    Rp {item.keuntungan.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === "Sukses"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "Proses"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setOpenDetail(item)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => {
                        setOpenEdit(item);
                        setNewStatus(item.status);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {item.status !== "Sukses" && (
                      <button
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

      {/* ✅ PAGINATION BUTTONS */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
            className={`px-3 py-1.5 border rounded text-sm ${
              page <= 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Sebelumnya
          </button>

          <span className="text-sm font-medium">
            Halaman {page} dari {totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className={`px-3 py-1.5 border rounded text-sm ${
              page >= totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* MODAL DETAIL */}
      {openDetail && (
        <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Detail Transaksi</h2>
              <button
                onClick={() => setOpenDetail(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Kode Downline:</span>
                <span className="font-medium">
                  {openDetail?.downline?.kodeDownline}-{" "}
                  {openDetail?.downline?.nama}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal:</span>
                <span>
                  {new Date(openDetail.tanggal).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grand Total:</span>
                <span>Rp {openDetail.totalHarga.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Keuntungan:</span>
                <span className="text-green-600">
                  Rp {openDetail.keuntungan.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">Item Transaksi</h3>
            <div className="overflow-x-auto">
              <table className="md:w-full w-[130%] text-sm border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">No</th>
                    <th className="px-3 py-2 text-left">Produk</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Harga</th>
                    <th className="px-3 py-2 text-right">Total Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {openDetail?.detail?.itemTransaksi?.map((x, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{idx + 1}</td>

                      <td className="px-3 py-2">{x.namaProduk}</td>
                      <td className="px-3 py-2 text-center">{x.qty}</td>
                      <td className="px-3 py-2 text-right">
                        Rp {x.hargaJual.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rp {x.totalHarga.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setOpenDetail(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT STATUS */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Edit Status</h2>
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Proses">Proses</option>
              <option value="Sukses">Sukses</option>
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

// StatCard component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-1">
        <span className={`${color}`}>{icon}</span>
        <span className="text-xs text-gray-500">{title}</span>
      </div>
      <p className="text-base font-bold text-gray-800">{value}</p>
    </div>
  );
}
