import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function TableSectionVoucherGrosirToday({
  title,
  data = [],
  onSuccess,
}) {
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [openDetail, setOpenDetail] = useState(null);
  const [openEdit, setOpenEdit] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // === Hitung data yang ditampilkan di halaman saat ini
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, startIndex, itemsPerPage]);

  // === Reset ke halaman 1 saat ganti itemsPerPage
  const handleItemsPerPageChange = (e) => {
    const newSize = Number(e.target.value);
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  // === HANDLE AKSI (SESUAIKAN DENGAN API KAMU) ===
  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus transaksi ini?")) return;
    try {
      await api.delete(`/grosir/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      onSuccess();
    } catch (err) {
      alert("Gagal menghapus transaksi");
    }
  };

  const handleSaveStatus = async () => {
    if (!openEdit) return;
    console.log(openEdit.id);

    try {
      await api.patch(
        `/grosir/${openEdit.id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      alert(`Status diubah ke: ${newStatus}`);
      onSuccess();
    } catch (err) {
      alert("Gagal mengubah status");
    }
    setOpenEdit(null);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {/* HEADER */}
        <div className="px-4 py-3 bg-gray-50 border-b text-gray-700 font-medium flex justify-between items-center">
          <span>{title}</span>
          <select
            className="border px-2 py-1 rounded text-sm"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5 / hal</option>
            <option value={10}>10 / hal</option>
            <option value={20}>20 / hal</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm min-w-full">
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
              {paginatedData.length === 0 ? (
                <tr className="border-t">
                  <td
                    className="px-4 py-3 text-gray-500 text-center"
                    colSpan={7}
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, i) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{startIndex + i + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {item.downline.kodeDownline} - {item.downline.nama}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.tanggal).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      Rp {item.totalHarga.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      Rp {item.keuntungan.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === "Selesai"
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
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => {
                          setOpenEdit(item);
                          setNewStatus(item.status);
                        }}
                        title="Edit Status"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {item.status !== "Selesai" && (
                        <button
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => handleDelete(item.id)}
                          title="Hapus"
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
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages} • Total {data.length} data
            </span>
            <div className="space-x-2">
              <button
                className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Sebelumnya
              </button>
              <button
                className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {openDetail && (
        <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">
                Detail Transaksi Voucher Downline
              </h2>
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
                  {openDetail.downline.kodeDownline} -{" "}
                  {openDetail.downline.nama}
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
                <span className="text-gray-600">Total:</span>
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
              <table className="lg:w-full w-[130%] text-sm border rounded">
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
                  {openDetail?.items?.map((x, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{idx + 1}</td>

                      <td className="px-3 py-2">{x.Voucher.nama}</td>
                      <td className="px-3 py-2 text-center">{x.quantity}</td>
                      <td className="px-3 py-2 text-right">
                        Rp {x.Voucher.hargaJual.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rp{" "}
                        {Number(
                          x.Voucher.hargaJual * x.quantity
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

      {/* MODAL EDIT */}
      {openEdit && (
        <div className="fixed inset-0 -top-10 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Edit Status</h2>
            <select
              className="w-full border px-3 py-2 rounded text-sm"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Proses">Proses</option>
              <option value="Selesai">Selesai</option>
              <option value="Gagal">Gagal</option>
            </select>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                onClick={() => setOpenEdit(null)}
              >
                Batal
              </button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
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
