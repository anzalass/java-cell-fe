import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";

export default function TableSectionSparepartToday({
  title,
  data = [],
  onSuccess,
}) {
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  // Hitung pagination
  const totalItem = data.length;
  const totalPage = Math.ceil(totalItem / itemPerPage);
  const startIndex = (page - 1) * itemPerPage;
  const paginatedItems = data.slice(startIndex, startIndex + itemPerPage);

  const [openDetail, setOpenDetail] = useState(null);
  const [openEdit, setOpenEdit] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Transaksi sparepart ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
      // Tampilkan loading
      Swal.fire({
        title: "Menghapus...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await api.delete(`/transaksi-sparepart/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      Swal.close(); // Tutup loading
      await Swal.fire({
        title: "Berhasil!",
        text: "Transaksi berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      onSuccess();
    } catch (err) {
      Swal.close(); // Pastikan loading ditutup saat error

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menghapus transaksi. Silakan coba lagi.";

      await Swal.fire({
        title: "Gagal Menghapus",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSaveStatus = () => {
    //   setdata((prev) =>
    //     prev.map((item) =>
    //       item.id === openEdit.id ? { ...item, status: newStatus } : item
    //     )
    //   );
    //   setOpenEdit(null);
    //   setNewStatus("");
  };

  return (
    <>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {/* HEADER */}
        <div className="px-4 py-3 bg-gray-50 border-b text-gray-700 font-medium flex justify-between">
          {title}

          <select
            className="border px-2 py-1 rounded text-sm"
            value={itemPerPage}
            onChange={(e) => {
              setItemPerPage(Number(e.target.value));
              setPage(1); // reset page
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">
          <table className="w-[180vw] md:w-full text-sm ">
            <thead>
              <tr className="text-gray-600 bg-gray-100">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Nama Pembeli</th>
                <th className="px-4 py-3 text-left">Total Harga</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedItems.length === 0 ? (
                <tr className="border-t">
                  <td className="px-4 py-3 text-gray-500" colSpan={6}>
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, i) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      {(page - 1) * itemPerPage + (i + 1)}
                    </td>
                    <td className="px-4 py-3">{item.namaPembeli}</td>
                    <td className="px-4 py-3">
                      Rp {item.totalHarga.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {" "}
                      {new Date(item.tanggal).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3 flex gap-2">
                      <button
                        title="Detail"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setOpenDetail(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {item.status !== "Sukses" && (
                        <button
                          title="Delete"
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

        {/* PAGINATION */}
        <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
          <span className="text-sm text-gray-600">
            Page {page} / {totalPage} — Total {totalItem} data
          </span>

          <div className="space-x-2">
            <button
              className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-40"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Prev
            </button>

            <button
              className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-40"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* MODAL DETAIL */}
      {openDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 -top-[100px] z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Detail Transaksi
              </h2>
              <button
                onClick={() => setOpenDetail(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Tutup"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Nama Pembeli:</span>
                <span className="text-gray-900">
                  {openDetail?.namaPembeli || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Tanggal:</span>
                <span className="text-gray-900">
                  {new Date(openDetail.tanggal).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Keuntungan:</span>
                <span className="text-gray-900">
                  {openDetail.keuntungan.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Total Harga:</span>
                <span className="text-gray-900">
                  {openDetail.totalHarga.toLocaleString() || "—"}
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-3">Item Transaksi</h3>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">No</th>

                    <th className="px-4 py-3 text-left font-medium">Produk</th>
                    <th className="px-4 py-3 text-left font-medium">Brand</th>
                    <th className="px-4 py-3 text-center font-medium">Qty</th>
                    <th className="px-4 py-3 text-right font-medium">Harga</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Total Harga
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {openDetail.items?.map((x, i) => (
                    <tr
                      key={x.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {i + 1 || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {x.Sparepart.nama || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {x.Sparepart.brand || "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {x.quantity || 0}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        Rp{" "}
                        {typeof x.Sparepart.hargaJual === "number"
                          ? x.Sparepart.hargaJual.toLocaleString("id-ID")
                          : "0"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        Rp{" "}
                        {Number(
                          x.Sparepart.hargaJual * x.quantity
                        ).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex gap-x-3 justify-end">
              <button
                onClick={() => setOpenDetail(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Print
              </button>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Edit Status</h2>

            <label className="block mb-2 text-sm font-medium">
              Pilih Status Baru
            </label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Proses">Proses</option>
              <option value="Sukses">Sukses</option>
              <option value="Gagal">Gagal</option>
            </select>

            <div className="flex justify-end gap-2 mt-4">
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
