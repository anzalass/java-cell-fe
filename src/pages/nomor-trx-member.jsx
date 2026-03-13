import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Phone,
  Users,
  ChevronsUpDown,
  Check,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import { useDebounce } from "../components/use-debounce";
import { Combobox } from "@headlessui/react";

export default function DataMemberPage() {
  const { user } = useAuthStore();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  const debounceNama = useDebounce(searchTerm, 1000);

  // Fetch data member
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dataMembers", page, debounceNama],
    queryFn: () =>
      api
        .get(`/data-member?page=${page}&pageSize=10&search=${debounceNama}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  // Fetch daftar member untuk dropdown
  const { data: membersList } = useQuery({
    queryKey: ["members"],
    queryFn: () =>
      api
        .get("/member", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        .then((res) => res.data.data || []),
  });

  const filteredMembers =
    query === ""
      ? membersList
      : membersList.filter((member) =>
          member.nama.toLowerCase().includes(query.toLowerCase())
        );

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) =>
      api.post("/data-member", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dataMembers"] });
      resetForm();
      setIsOpenModal(false);
      Swal.fire("Berhasil!", "Data member berhasil ditambahkan", "success");
    },
    onError: (error) => {
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Gagal menambahkan data",
        "error"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...formData }) =>
      api.put(`/data-member/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dataMembers"] });
      resetForm();
      setEditingMember(null);
      setIsOpenModal(false);
      Swal.fire("Berhasil!", "Data member berhasil diupdate", "success");
    },
    onError: (error) => {
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Gagal mengupdate data",
        "error"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/data-member/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dataMembers"] });
      Swal.fire("Berhasil!", "Data member berhasil dihapus", "success");
    },
    onError: (error) => {
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Gagal menghapus data",
        "error"
      );
    },
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nama: "",
      nomor: "",
      idMember: "",
    },
  });

  const selectedMemberId = watch("idMember");

  const resetForm = () => {
    reset({ nama: "", nomor: "", idMember: "" });
    setEditingMember(null);
  };

  const onSubmit = (data) => {
    // Validasi manual
    if (!data.idMember) {
      Swal.fire("Error!", "Silakan pilih member terlebih dahulu", "error");
      return;
    }

    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (dataMember) => {
    setEditingMember(dataMember);
    reset({
      nama: dataMember.nama || "",
      nomor: dataMember.nomor || "",
      idMember: dataMember.idMember || "",
    });
    setIsOpenModal(true);
  };

  const handleDelete = (dataMember) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: `Data ${dataMember.nama} akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(dataMember.id);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Gagal memuat data member
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 mt-5">
      {/* Header */}
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-base md:text-2xl font-bold text-gray-800">
          Data Member
        </h1>
        <p className="text-gray-600 mt-1">Kelola data member toko Anda</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-row  sm:items-center sm:justify-between gap-4 mb-6">
        {/* Search + Reset */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama atau nomor..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchTerm("");
              setPage(1);
            }}
            className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
          >
            <XCircle />
          </button>
        </div>

        {/* Tambah Data */}
        <button
          onClick={() => setIsOpenModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Nama
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Nomor HP
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Member Terkait
                </th>
                <th className="py-4 px-6 text-right text-sm font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.data?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    Tidak ada data member
                  </td>
                </tr>
              ) : (
                data?.data?.map((dm) => (
                  <tr
                    key={dm.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {dm.nama}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{dm.nomor}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-gray-700">
                          {dm.Member?.nama || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(dm)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dm)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Hapus"
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

        {/* Pagination */}
        {data?.pagination?.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-600 mb-3 sm:mb-0">
              Menampilkan {(page - 1) * 10 + 1}–
              {Math.min(page * 10, data.pagination.total)} dari{" "}
              {data.pagination.total} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-lg disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">
                {page} / {data.pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) =>
                    Math.min(prev + 1, data.pagination.totalPages)
                  )
                }
                disabled={page >= data.pagination.totalPages}
                className="px-3 py-1.5 border rounded-lg disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingMember ? "Edit Data Member" : "Tambah Data Member"}
                </h2>
                <button
                  onClick={() => {
                    setIsOpenModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Member *
                  </label>

                  <Combobox
                    value={selectedMember}
                    onChange={(member) => {
                      setSelectedMember(member);
                      setValue("idMember", member.id);
                    }}
                  >
                    <div className="relative">
                      <Combobox.Input
                        className="w-full border border-gray-300 rounded-xl py-3 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                        displayValue={(member) => member?.nama || ""}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari member..."
                      />

                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronsUpDown className="w-5 h-5 text-gray-400" />
                      </Combobox.Button>

                      <Combobox.Options className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto z-50">
                        {filteredMembers?.length === 0 ? (
                          <div className="px-4 py-2 text-gray-500">
                            Member tidak ditemukan
                          </div>
                        ) : (
                          filteredMembers.map((member) => (
                            <Combobox.Option
                              key={member.id}
                              value={member}
                              className={({ active }) =>
                                `cursor-pointer px-4 py-2 flex justify-between ${
                                  active ? "bg-blue-100" : ""
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span>{member.nama}</span>
                                  {selected && (
                                    <Check className="w-4 h-4 text-blue-600" />
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>
                {/* Nama (readonly) */}

                {/* Nomor HP (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama / Keterangan *
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <input
                      {...register("nama", {
                        required: "Nama wajib diisi",
                      })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                        errors.nama ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Contoh: No PLN Siti Rosipah / BCA Ahmad Abidin"
                    />
                  </div>

                  {errors.nama && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.nama.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor *
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <input
                      {...register("nomor", {
                        required: "Nomor wajib diisi",
                      })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                        errors.nomor ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Contoh: 1234567890"
                    />
                  </div>

                  {errors.nomor && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.nomor.message}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpenModal(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            fill="currentColor"
                          />
                        </svg>
                        Memproses...
                      </span>
                    ) : editingMember ? (
                      "Update Data"
                    ) : (
                      "Simpan Data"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
