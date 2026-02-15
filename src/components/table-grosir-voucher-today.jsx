import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.downline.nama?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // === Hitung data yang ditampilkan di halaman saat ini
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, startIndex, itemsPerPage]);

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

  const handlePrintThermal = (data) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");

    printWindow.document.write(`
    <html>
      <head>
        <title>Print Struk</title>
        <style>
@page {
  size: A4;
  margin: 4mm;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.flex {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.line {
  border-top: 1px dashed #000;
  margin: 8px 0;
}


        </style>
      </head>
      <body>
        <div class="center">
          <strong>VOUCHER GROSIR</strong><br/>
          ${data.downline.kodeDownline} - ${data.downline.nama}
        </div>

        <div class="line"></div>

        <div class="small">
          ${new Date(data.tanggal).toLocaleDateString("id-ID")}
        </div>

        <div class="line"></div>

        ${data.items
          .map(
            (item) => `
              <div>
                ${item.Voucher.nama}
              </div>
              <div class="flex">
                <span>${item.quantity} x ${item.Voucher.hargaJual.toLocaleString("id-ID")}</span>
                <span>${(item.quantity * item.Voucher.hargaJual).toLocaleString(
                  "id-ID"
                )}</span>
              </div>
              <br/>
            `
          )
          .join("")}

        <div class="line"></div>

        <div class="flex">
          <strong>Total</strong>
          <strong>${data.totalHarga.toLocaleString("id-ID")}</strong>
        </div>

        <div class="flex">
          <span>Keuntungan</span>
          <span>${data.keuntungan.toLocaleString("id-ID")}</span>
        </div>

        <div class="line"></div>

        <div class="center small">
          Terima kasih 🙏
        </div>

        <script>
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  return (
    <>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {/* HEADER */}
        {/* HEADER */}
        <div className="px-4 py-3 text-xs md:text-sm bg-gray-50 border-b text-gray-700 font-medium flex justify-between items-center">
          <div className="">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset ke halaman 1 saat search
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
            className="border px-2 py-1 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5 / hal</option>
            <option value={10}>10 / hal</option>
            <option value={20}>20 / hal</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="p-4 gap-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5">
          {paginatedData.length === 0 ? (
            <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border">
              Tidak ada data
            </div>
          ) : (
            paginatedData.map((item, i) => (
              <div
                key={item.id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                {/* HEADER CARD */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Downline</p>
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                      {item.downline.kodeDownline} – {item.downline.nama}
                    </h3>
                    <p className="text-xs text-gray-400">
                      #{startIndex + i + 1}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                </div>

                {/* INFO */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="font-medium text-gray-700">
                      {new Date(item.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Nominal</p>
                    <p className="font-semibold text-gray-800">
                      Rp {item.totalHarga.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Keuntungan</p>
                    <p className="font-semibold text-green-600">
                      Rp {item.keuntungan.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-2 border-t pt-3">
                  <button
                    onClick={() => setOpenDetail(item)}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title="Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setOpenEdit(item);
                      setNewStatus(item.status);
                    }}
                    className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                    title="Edit Status"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {item.status !== "Selesai" && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      title="Hapus"
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
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              {currentPage} dari {totalPages} • Total {filteredData?.length}{" "}
              data
            </span>
            <div className="space-x-2">
              <button
                className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft />
              </button>
              <button
                className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
              >
                <ChevronRight />
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
                onClick={() => handlePrintThermal(openDetail)}
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
