import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TableUangModalToday({ title, data = [] }) {
  // Dummy data BE format

  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);

  const totalItem = data.length;
  const totalPage = Math.ceil(totalItem / itemPerPage);
  const startIndex = (page - 1) * itemPerPage;
  const paginatedItems = data.slice(startIndex, startIndex + itemPerPage);

  const [openDetail, setOpenDetail] = useState(null);
  const [openEdit, setOpenEdit] = useState(null);

  const handleDelete = (id) => {
    // if (!confirm("Yakin hapus data ini?")) return;
    // setdata((prev) => prev.filter((x) => x.id !== id));
  };

  const handleSaveEdit = () => {
    // setdata((prev) =>
    //   prev.map((item) =>
    //     item.id === openEdit.id
    //       ? {
    //           ...item,
    //           keterangan: openEdit.keterangan,
    //           nominal: openEdit.nominal,
    //         }
    //       : item
    //   )
    // );
    // setOpenEdit(null);
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
              setPage(1);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[150vw] md:min-w-0 w-full text-sm">
            <thead>
              <tr className="text-gray-600 bg-gray-100">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Nominal</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedItems.length === 0 ? (
                <tr className="border-t">
                  <td className="px-4 py-3 text-gray-500" colSpan={5}>
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, i) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      {(page - 1) * itemPerPage + (i + 1)}
                    </td>
                    <td className="px-4 py-3">{item.keterangan}</td>
                    <td className="px-4 py-3">
                      {new Date(item.tanggal).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      Rp {item?.jumlah?.toLocaleString("id-ID")}
                    </td>

                    {/* <td className="px-4 py-3 flex gap-2">
                      <button
                        title="Detail"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setOpenDetail(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        title="Edit"
                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => setOpenEdit({ ...item })}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete"
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td> */}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Detail Uang Modal</h2>

            <p className="mb-2">
              <span className="font-medium">Keterangan: </span>
              {openDetail.keterangan}
            </p>

            <p className="mb-2">
              <span className="font-medium">Tanggal: </span>
              {openDetail.tanggal}
            </p>

            <p className="mb-2">
              <span className="font-medium">Nominal: </span>
              Rp {openDetail.nominal.toLocaleString("id-ID")}
            </p>

            <p>
              <span className="font-medium">Deskripsi:</span>{" "}
              {openDetail.detail?.deskripsi || "—"}
            </p>

            <div className="text-right mt-5">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded"
                onClick={() => setOpenDetail(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Edit Data Modal</h2>

            <label className="text-sm font-medium">Keterangan</label>
            <input
              className="w-full border px-3 py-2 rounded mb-3"
              value={openEdit.keterangan}
              onChange={(e) =>
                setOpenEdit({ ...openEdit, keterangan: e.target.value })
              }
            />

            <label className="text-sm font-medium">Nominal</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded mb-3"
              value={openEdit.nominal}
              onChange={(e) =>
                setOpenEdit({ ...openEdit, nominal: Number(e.target.value) })
              }
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded"
                onClick={() => setOpenEdit(null)}
              >
                Batal
              </button>

              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={handleSaveEdit}
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
