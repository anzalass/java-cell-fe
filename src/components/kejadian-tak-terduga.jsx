import React from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";

export default function KejadianTakTerduga({ data = [], onSuccess }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  /* =======================
     REACT HOOK FORM
  ======================= */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const tambahMutation = useMutation({
    mutationFn: (payload) =>
      api.post("/kejadian-tak-terduga", payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Kejadian berhasil ditambahkan",
        timer: 1500,
        showConfirmButton: false,
      });
      reset();
    },
    onError: (err) => {
      Swal.fire(
        "Gagal",
        err.response?.data?.error || "Terjadi kesalahan",
        "error"
      );
    },
  });

  /* =======================
     HAPUS DATA (MUTATION)
  ======================= */
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/kejadian-tak-terduga/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
    },
  });

  /* =======================
     SUBMIT HANDLER
  ======================= */
  const onSubmit = (data) => {
    tambahMutation.mutate({
      keterangan: data.keterangan,
      nominal: Number(data.nominal),
      no_transaksi: data.noTransaksi,
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin?",
      text: "Data ini akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  /* =======================
     UI
  ======================= */
  return (
    <div>
      {/* FORM */}
      <div className="mt-10 mb-4 p-4 border rounded-lg bg-gray-50">
        <h2 className="font-semibold mb-3">Kejadian Tak Terduga Hari Ini</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input
            type="text"
            placeholder="No Transaksi"
            {...register("noTransaksi", { required: "Wajib diisi" })}
            className="border p-2 rounded w-full"
          />
          {errors.noTransaksi && (
            <p className="text-xs text-red-600">{errors.noTransaksi.message}</p>
          )}

          <input
            type="text"
            placeholder="Keterangan"
            {...register("keterangan", { required: "Wajib diisi" })}
            className="border p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Nominal"
            {...register("nominal", {
              required: "Nominal wajib",
              min: { value: 1, message: "Minimal 1" },
            })}
            min="1"
            className="border p-2 rounded w-full"
          />
          {errors.nominal && (
            <p className="text-xs text-red-600">{errors.nominal.message}</p>
          )}

          <button
            type="submit"
            disabled={tambahMutation.isLoading}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
          >
            {tambahMutation.isLoading ? "Menyimpan..." : "Tambah Data"}
          </button>
        </form>
      </div>

      {/* TABLE */}
      <h2 className="text-lg font-semibold mt-6 mb-2">
        Daftar Kejadian Hari Ini
      </h2>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">No</th>
              <th className="px-4 py-2">Nominal</th>
              <th className="px-4 py-2">No Transaksi</th>
              <th className="px-4 py-2">Keterangan</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Memuat data...
                </td>
              </tr>
            ) : unexpectedData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Belum ada kejadian
                </td>
              </tr>
            ) : (
              unexpectedData.map((row, i) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 text-red-600">
                    Rp {row.nominal.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2">{row.no_transaksi}</td>
                  <td className="px-4 py-2">{row.keterangan}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                    >
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
  );
}
