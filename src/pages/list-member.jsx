// src/pages/member/ListMemberPage.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";

export default function ListMemberPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);

  // Filter state
  const [filterNama, setFilterNama] = useState("");
  const [filterNoTelp, setFilterNoTelp] = useState("");
  const [filterMinTransaksi, setFilterMinTransaksi] = useState("");
  const [filterMaxTransaksi, setFilterMaxTransaksi] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const resetPage = () => setPage(1);

  useEffect(() => {
    setPage(1);
  }, [perPage]);

  // === QUERY: Fetch Members ===
  const {
    data: membersData,
    isLoading: loadingMembers,
    isError: isErrorMembers,
    error: errorMembers,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: [
      "members",
      filterNama,
      filterNoTelp,
      filterMinTransaksi,
      filterMaxTransaksi,
      sortConfig,
      page,
      perPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterNama) params.append("search", filterNama);
      if (filterNoTelp) params.append("search", filterNoTelp);
      if (filterMinTransaksi)
        params.append("minTotalTransaksi", filterMinTransaksi);
      if (filterMaxTransaksi)
        params.append("maxTotalTransaksi", filterMaxTransaksi);
      params.append("sortBy", sortConfig.key);
      params.append("sortOrder", sortConfig.direction);
      params.append("page", page);
      params.append("pageSize", perPage);

      const res = await api.get(`member/filter?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTotalPages(res.data.meta?.totalPages || 1);
      return {
        members: res.data.data || [],
        totalMembers: res.data.totalMember,
        totalTransaksi: res.data.totalTrx?.totalTransaksi || 0,
      };
    },
    keepPreviousData: true,
    staleTime: 5000,
  });

  // === QUERY: Fetch Stats (opsional terpisah jika diperlukan) ===
  // Karena stats sudah ada di response members, kita tidak perlu query terpisah

  const members = membersData?.members || [];
  const stats = {
    totalMembers: membersData?.totalMembers || 0,
    totalTransaksi: membersData?.totalTransaksi || 0,
  };

  // === MUTATIONS ===
  const createMemberMutation = useMutation({
    mutationFn: (payload) =>
      api.post("member", payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpenAdd(false);
      Swal.fire({
        title: "Berhasil!",
        text: "Member berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal menambah member.",
        icon: "error",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api.put(`member/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpenEdit(null);
      Swal.fire({
        title: "Berhasil!",
        text: "Member berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal memperbarui member.",
        icon: "error",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`member/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      Swal.fire({
        title: "Dihapus!",
        text: "Member berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Gagal menghapus member.",
        icon: "error",
      });
    },
  });

  // Handlers
  const handleSort = (uiKey) => {
    const fieldMap = {
      nama: "nama",
      noTelp: "noTelp",
      totalTransaksi: "totalTransaksi",
      dibuat: "createdAt",
    };
    const dbField = fieldMap[uiKey] || "createdAt";
    let direction = "asc";
    if (sortConfig.key === dbField && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: dbField, direction });
    resetPage();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Member ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      deleteMemberMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setFilterNama("");
    setFilterNoTelp("");
    setFilterMinTransaksi("");
    setFilterMaxTransaksi("");
    resetPage();
  };

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm();

  const openAddModal = () => {
    resetForm();
    setOpenAdd(true);
  };

  const saveAdd = (data) => {
    createMemberMutation.mutate({
      nama: data.nama,
      noTelp: data.noTelp || null,
      totalTransaksi: parseInt(data.totalTransaksi) || 0,
    });
  };

  const saveEdit = (data) => {
    updateMemberMutation.mutate({
      id: openEdit.id,
      payload: {
        nama: data.nama,
        noTelp: data.noTelp,
        totalTransaksi: parseInt(data.totalTransaksi),
      },
    });
  };

  // Format angka
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  // === RENDER ===
  const loading = loadingMembers;
  const error = isErrorMembers ? "Gagal memuat data member" : null;

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Member</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Tambah Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-md">
          <h3 className="text-sm font-medium opacity-90">Total Member</h3>
          <p className="text-2xl font-bold mt-1">{stats.totalMembers}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-md">
          <h3 className="text-sm font-medium opacity-90">Total Transaksi</h3>
          <p className="text-2xl font-bold mt-1">
            {formatRupiah(stats.totalTransaksi)}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Member
          </label>
          <input
            type="text"
            value={filterNama}
            onChange={(e) => {
              setFilterNama(e.target.value);
              resetPage();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cari nama..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            No. Telepon
          </label>
          <input
            type="text"
            value={filterNoTelp}
            onChange={(e) => {
              setFilterNoTelp(e.target.value);
              resetPage();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0812..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaksi Min (Rp)
          </label>
          <input
            type="number"
            value={filterMinTransaksi}
            onChange={(e) => {
              setFilterMinTransaksi(e.target.value);
              resetPage();
            }}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaksi Max (Rp)
          </label>
          <input
            type="number"
            value={filterMaxTransaksi}
            onChange={(e) => {
              setFilterMaxTransaksi(e.target.value);
              resetPage();
            }}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="500000"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-center">No</th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("nama")}
              >
                Nama Member
                {sortConfig.key === "nama" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("noTelp")}
              >
                No. Telepon
                {sortConfig.key === "noTelp" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("totalTransaksi")}
              >
                Total Transaksi
                {sortConfig.key === "totalTransaksi" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="p-4 text-left cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("dibuat")}
              >
                Tanggal Dibuat
                {sortConfig.key === "createdAt" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Tidak ada data member
                </td>
              </tr>
            ) : (
              members.map((member, index) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="p-4 text-center">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    {member.nama}
                  </td>
                  <td className="p-4 text-gray-600">{member.noTelp || "-"}</td>
                  <td className="p-4 font-medium text-emerald-600">
                    {formatRupiah(member.totalTransaksi)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(member.createdAt)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          resetForm({
                            nama: member.nama,
                            noTelp: member.noTelp || "",
                            totalTransaksi: member.totalTransaksi.toString(),
                          });
                          setOpenEdit(member);
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded hover:bg-amber-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded hover:bg-rose-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Sebelumnya
          </button>
          <span className="text-sm font-medium">
            Halaman {page} dari {Math.max(1, totalPages)}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border rounded text-sm disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* MODAL TAMBAH */}
      {openAdd && (
        <MemberModal
          title="Tambah Member Baru"
          onClose={() => setOpenAdd(false)}
          onSubmit={handleSubmit(saveAdd)}
          register={register}
          errors={errors}
        />
      )}

      {/* MODAL EDIT */}
      {openEdit && (
        <MemberModal
          title="Edit Member"
          onClose={() => setOpenEdit(null)}
          onSubmit={handleSubmit(saveEdit)}
          register={register}
          errors={errors}
          defaultValues={{
            nama: openEdit.nama,
            noTelp: openEdit.noTelp || "",
            totalTransaksi: openEdit.totalTransaksi.toString(),
          }}
        />
      )}
    </div>
  );
}

// ========== MODAL ==========
function MemberModal({
  title,
  onClose,
  onSubmit,
  register,
  errors,
  defaultValues,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-5">{title}</h2>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Member *
            </label>
            <input
              {...register("nama", { required: "Wajib diisi" })}
              defaultValue={defaultValues?.nama || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ahmad Fauzi"
            />
            {errors.nama && (
              <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Telepon
            </label>
            <input
              {...register("noTelp")}
              defaultValue={defaultValues?.noTelp || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="081234567890"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Transaksi (Rp) *
            </label>
            <input
              type="number"
              {...register("totalTransaksi", {
                required: "Wajib diisi",
                min: { value: 0, message: "Minimal 0" },
                valueAsNumber: true,
              })}
              defaultValue={defaultValues?.totalTransaksi || "0"}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="250000"
            />
            {errors.totalTransaksi && (
              <p className="text-xs text-red-500 mt-1">
                {errors.totalTransaksi.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
