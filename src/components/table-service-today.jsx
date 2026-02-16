import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function TableSectionServiceToday({ title, data, onSuccess }) {
  // Dummy data BE format
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);

  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item?.namaPelangan?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // Hitung pagination
  const totalPage = Math.ceil(filteredData?.length / itemPerPage);
  const startIndex = (page - 1) * itemPerPage;
  const paginatedItems = filteredData?.slice(
    startIndex,
    startIndex + itemPerPage
  );

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
      <div className="bg-white border text-xs md:text-sm border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {/* HEADER */}
        {/* <div className="px-4 py-3 bg-gray-50 border-b text-gray-700 font-medium flex items-center justify-between">
          <span>{title}</span>

          <select
            className="border px-2 py-1 rounded text-sm"
            value={itemPerPage}
            onChange={(e) => {
              setItemPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div> */}

        {/* TABLE */}
        <div className="px-4 py-3 bg-gray-50 border-b text-gray-700 font-medium flex items-center justify-between">
          <div className="">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // reset ke halaman 1 saat search
                }}
                placeholder="Masukkan nama pembeli..."
                className="
    w-full rounded-xl border border-gray-200 bg-gray-50
    px-4 py-3 text-sm text-gray-800 placeholder-gray-400
    transition-all
    focus:border-blue-500 focus:bg-white focus:outline-none
    focus:ring-2 focus:ring-blue-500/20
  "
              />
            </div>
          </div>
          <select
            className="border px-2 py-1 rounded text-sm"
            value={itemPerPage}
            onChange={(e) => {
              setItemPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedItems.length === 0 ? (
            <div className="text-gray-500 text-sm col-span-full text-center py-10">
              Tidak ada data
            </div>
          ) : (
            paginatedItems.map((item, i) => (
              <div
                key={item.id}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      #{(page - 1) * itemPerPage + (i + 1)}
                    </p>
                    <h3 className="font-semibold text-gray-900">
                      {item.namaPelangan}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(item.tanggal).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium
              ${
                item.status === "Selesai"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }
            `}
                  >
                    {item.status}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Keterangan:</span>{" "}
                    {item.keterangan}
                  </p>
                  <p>
                    <span className="font-medium">Biaya Jasa:</span> Rp{" "}
                    {item.biayaJasa.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Keuntungan:</span> Rp{" "}
                    {item.keuntungan.toLocaleString()}
                  </p>
                </div>

                {/* ACTION */}
                <div className="flex gap-2 mt-4">
                  <button
                    title="Detail"
                    className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center gap-1 text-sm"
                    onClick={() => setOpenDetail(item)}
                  >
                    <Eye className="w-4 h-4" />
                    Detail
                  </button>

                  <button
                    title="Edit"
                    className="flex-1 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 flex items-center justify-center gap-1 text-sm"
                    onClick={() => setOpenEdit(item)}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>

                  {item.status !== "Sukses" && (
                    <button
                      title="Delete"
                      className="py-2 px-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
          <span className=" text-gray-600">
            Page {page} / {totalPage} — Total {filteredData?.length} data
          </span>

          <div className="space-x-2">
            <button
              className="px-3 py-1 border rounded  bg-white hover:bg-gray-100 disabled:opacity-40"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Prev
            </button>

            <button
              className="px-3 py-1 border rounded  bg-white hover:bg-gray-100 disabled:opacity-40"
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

            <div className="p-5 flex-1 overflow-y-auto space-y-4 ">
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
              {openDetail.Member !== null ? (
                <>
                  {openDetail.Member.nama ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Member:
                        </span>
                        <span className="text-green-600 font-medium">Ya</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          No. HP:
                        </span>
                        <span>{openDetail.Member?.noTelp || "-"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Member:
                        </span>
                        <span className="text-gray-500 italic">Tidak</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          No. HP:
                        </span>
                        <span>{openDetail?.noHP || "-"}</span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Member:</span>
                    <span className="text-gray-500 italic">Tidak</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">No. HP:</span>
                    <span>{openDetail?.noHP || "-"}</span>
                  </div>
                </>
              )}

              {/* No HP */}

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
                    <table className="w-full  border-collapse">
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
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 ">
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
                onClick={() => nav(`/print-service-hp/${openDetail.id}`)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Print Cetak
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

            <label className="block mb-2  font-medium">Pilih Status Baru</label>
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
