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
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Printer,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

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
  const [statusFilter, setStatusFilter] = useState("active");

  const [filterType, setFilterType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [openDetail, setOpenDetail] = useState(null);
  const [openEdit, setOpenEdit] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const nav = useNavigate();

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
      statusFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("pageSize", itemPerPage);
      params.append("deletedFilter", statusFilter);

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

  const handleWhatsapp = (item) => {
    const phone = item.noHP; // nomor customer

    const message = `
Halo ${item.namaPelangan}

Status servis Anda: ${item.status}

Merk : ${item.brandHP}

Keterangan:
${item.keterangan}

Terima kasih.
`;

    const encodedMessage = encodeURIComponent(message);

    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(url, "_blank");
  };

  const [openFilter, setOpenFilter] = useState(false);

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
        {/* === STATS === */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-2 mb-6">
          <div className="flex flex-row gap-4 my-6  items-center justify-between">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Statistik Transaksi
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  Ringkasan performa transaksi
                </p>
              </div>
            </div>

            {/* Right: Filter Button */}
            <div className="flex justify-end">
              {/* Desktop */}
              <button
                onClick={() => setOpenFilter(true)}
                className="hidden md:flex px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all items-center gap-2 text-gray-700 font-medium"
              >
                <Filter className="w-5 h-5 text-gray-600" />
                Filter & Pencarian
              </button>

              {/* Mobile */}
              <button
                onClick={() => setOpenFilter(true)}
                className="md:hidden p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
                aria-label="Filter"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Transaksi */}

            {/* Nominal */}
            <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {stats.totalTransaksi}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  Total Transaksi
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition">
                <Wallet className="w-4 h-4 text-green-600" />
              </div>
            </div>

            <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  Rp {stats.totalBiayaJasa.toLocaleString("id-ID")}
                </p>
                <p className="text-xs font-medium text-gray-500">Biaya Jasa</p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition">
                <Wallet className="w-4 h-4 text-green-600" />
              </div>
            </div>

            <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  Rp {stats.totalKeuntungan.toLocaleString("id-ID")}
                </p>
                <p className="text-xs font-medium text-gray-500">Keuntungan</p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition">
                <Wallet className="w-4 h-4 text-green-600" />
              </div>
            </div>

            <div className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  Rp {stats.avgKeuntungan.toLocaleString("id-ID")}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  Rata Rata Transaksi
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition">
                <Wallet className="w-4 h-4 text-green-600" />
              </div>
            </div>

            {/* Rata-rata */}
          </div>
        </div>

        {/* === FILTER SECTION === */}
        {openFilter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpenFilter(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Filter className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Filter & Pencarian
                    </h2>
                    <p className="text-sm text-gray-500">
                      Temukan transaksi yang Anda cari
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpenFilter(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5">
                {/* Search */}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status Transaksi
                    </label>

                    <div className="flex bg-gray-100 p-1 my-3 rounded-xl">
                      <button
                        onClick={() => setStatusFilter("active")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                          statusFilter === "active"
                            ? "bg-white shadow text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Active
                      </button>

                      <button
                        onClick={() => setStatusFilter("deleted")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                          statusFilter === "deleted"
                            ? "bg-white shadow text-red-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Void
                      </button>

                      {/* <button
                  onClick={() => setStatusFilter("all")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    statusFilter === "all"
                      ? "bg-white shadow text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Semua
                </button> */}
                    </div>
                  </div>
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cari Nama Pembeli
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                        placeholder="Ahmad, DL-001, dll..."
                      />
                    </div>
                  </div>

                  {/* Periode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Periode Waktu
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={filterType}
                        onChange={(e) => {
                          setFilterType(e.target.value);
                          if (e.target.value !== "custom") {
                            setDateFrom("");
                            setDateTo("");
                          }
                        }}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition font-medium"
                      >
                        <option value="all">Semua Waktu</option>
                        <option value="today">Hari Ini</option>
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Range */}
                  {filterType === "custom" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Dari Tanggal
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Sampai Tanggal
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cari Nama / Kode
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                      placeholder="DL-001, Ahmad, dll..."
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status Transaksi
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition font-medium"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Batal">Batal</option>
                    <option value="Gagal">Gagal</option>
                  </select>
                </div>

                {/* Periode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Periode Waktu
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        if (e.target.value !== "custom") {
                          setDateFrom("");
                          setDateTo("");
                        }
                      }}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition font-medium"
                    >
                      <option value="all">Semua Waktu</option>
                      <option value="today">Hari Ini</option>
                      <option value="week">Minggu Ini</option>
                      <option value="month">Bulan Ini</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                </div>

                {/* Custom Range */}
                {filterType === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Dari Tanggal
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Sampai Tanggal
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Item per page */}
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Baris per Halaman
                  </label>
                  <select
                    value={itemPerPage}
                    onChange={(e) => {
                      setItemPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-medium"
                  >
                    <option value={5}>5 / halaman</option>
                    <option value={10}>10 / halaman</option>
                    <option value={20}>20 / halaman</option>
                  </select>
                </div> */}
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-between items-center pt-4 border-t">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                >
                  Reset
                </button>

                <button
                  onClick={() => {
                    handleSearch();
                    setOpenFilter(false);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nama Pembeli
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Biaya Jasa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Keuntungan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-100 rounded-full mb-3">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">
                          Tidak ada data transaksi
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Data akan muncul setelah ada transaksi
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item, i) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(page - 1) * itemPerPage + i + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {item.namaPembeli?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.namaPembeli}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.keterangan}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === "SUCCES"
                              ? "bg-green-50 text-green-700"
                              : item.status === "PROSES"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rp {item.biayaJasa.toLocaleString("id-ID")}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Rp {item.keuntungan.toLocaleString("id-ID")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          }) || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            title="Detail"
                            onClick={() => setOpenDetail(item)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            title="Detail"
                            onClick={() => handleWhatsapp(item)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          <button
                            title="Detail"
                            onClick={() => nav(`/print-service-hp/${item.id}`)}
                            className="p-2 bg-zinc-500 text-white rounded-lg hover:bg-zinc-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            title="Edit Status"
                            onClick={() => {
                              setOpenEdit(item);
                              setNewStatus(item.status);
                            }}
                            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {item.status !== "SUCCES" && (
                            <button
                              title="Hapus"
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* <div className="bg-gray-50 border-t-2 border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{page}</span> dari{" "}
                <span className="font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center  gap-3">
                <select
                  value={itemPerPage}
                  onChange={(e) => {
                    setItemPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="
      px-4 py-2
      text-sm font-medium
      rounded-xl
      border border-gray-200
      bg-white
      shadow-sm
      focus:outline-none
      focus:ring-2 focus:ring-blue-500
      focus:border-blue-500
      hover:bg-gray-50
      transition
    "
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold text-sm">
                  {page}
                </div>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page >= totalPages}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div> */}
        </div>
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
                  {openDetail?.member
                    ? openDetail?.member?.nama
                    : openDetail?.namaPembeli}
                </span>
              </div>

              {/* Member */}
              {openDetail?.member ? (
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
                <span>
                  {openDetail?.member
                    ? openDetail?.member?.noTelp
                    : openDetail?.noHP}
                </span>
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
                <span>
                  {new Date(openDetail.tanggal).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }) || "-"}
                </span>
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
                onClick={() => nav(`/print-service-hp/${openDetail.id}`)}
                className="w-full py-2 mb-3 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition"
              >
                Print
              </button>
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
