import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";
import Swal from "sweetalert2";

export default function TableSectionServiceToday({ title, data, onSuccess }) {
  // Dummy data BE format
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);

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
      text: "Transaksi ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await Swal.fire({
        title: "Menghapus...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await api.delete(`/service-hp/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      Swal.close();
      await Swal.fire({
        title: "Berhasil!",
        text: "Transaksi berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      onSuccess();
    } catch (err) {
      Swal.close();
      await Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menghapus transaksi.",
        icon: "error",
      });
    }
  };

  const handleSaveStatus = async () => {
    if (!openEdit) return;

    try {
      await Swal.fire({
        title: "Memperbarui status...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await api.patch(
        `/service-hp/${openEdit.id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      Swal.close();
      await Swal.fire({
        title: "Berhasil!",
        text: `Status berhasil diubah ke: ${newStatus}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      onSuccess();
      setOpenEdit(null);
    } catch (err) {
      console.error(err);
      Swal.close();
      await Swal.fire({
        title: "Gagal!",
        text: "Gagal mengubah status. Silakan coba lagi.",
        icon: "error",
      });
    }
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
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Biaya Jasa</th>
                <th className="px-4 py-3 text-left">Keuntungan</th>
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
                    <td className="px-4 py-3">{item.namaPelangan}</td>
                    <td className="px-4 py-3">{item.keterangan}</td>
                    <td className="px-4 py-3">{item.status}</td>

                    <td className="px-4 py-3">
                      Rp {item.biayaJasa.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{item.keuntungan}</td>
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

                      <button
                        title="Detail"
                        className="p-2 bg-yellow-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setOpenEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
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
        <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                  {openDetail.namaPelangan || "-"}
                </span>
              </div>

              {/* Member */}
              {openDetail.Member.nama ? (
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
                <span>{openDetail.Member?.noTelp || "-"}</span>
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
                  {new Date(openDetail.tanggal).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
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

                {openDetail?.Sparepart && openDetail?.Sparepart?.length > 0 ? (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="px-3 py-2 border">Nama</th>
                          <th className="px-3 py-2 border text-center">
                            quantity
                          </th>
                          <th className="px-3 py-2 border text-right">Harga</th>
                          <th className="px-3 py-2 border text-right">
                            Keuntungan
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {openDetail.Sparepart.map((item, idx) => {
                          const sparepart = item.Sparepart;
                          const untung =
                            (sparepart.hargaJual - sparepart.hargaModal) *
                            item.quantity;

                          return (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-3 py-2 border">
                                {sparepart.nama}
                              </td>
                              <td className="px-3 py-2 border text-center">
                                {item.quantity}
                              </td>
                              <td className="px-3 py-2 border text-right">
                                Rp{sparepart.hargaJual?.toLocaleString("id-ID")}
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
                        <div className="text-gray-600 text-xs">
                          Total Item {openDetail.Sparepart.nama}
                        </div>
                        <div className="font-bold">
                          {openDetail.Sparepart.reduce(
                            (a, b) => a + b.quantity,
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
                          {openDetail.Sparepart?.reduce(
                            (sum, sp) =>
                              sum + sp.Sparepart.hargaJual * sp.quantity,
                            0
                          ).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-gray-600 text-xs">
                          Total Keuntungan
                        </div>
                        <div className="font-bold text-green-700">
                          Rp
                          {openDetail.Sparepart?.reduce(
                            (sum, sp) =>
                              sum +
                              (sp.Sparepart.hargaJual -
                                sp.Sparepart.hargaModal) *
                                sp.quantity,
                            0
                          ).toLocaleString("id-ID")}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 -top-[100px] z-50">
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
              <option value="Selesai">Selesai</option>
              <option value="Gagal">Gagal</option>
              <option value="Batal">Batal</option>
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
