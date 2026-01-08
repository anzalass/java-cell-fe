import { Pencil, Trash2, Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function TableStokAcc({ title, data = [] }) {
  // DUMMY DATA SPAREPART

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);

  // FILTER SEARCH
  const filtered = useMemo(() => {
    return data.filter((item) =>
      item.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // PAGINATION
  const totalItem = filtered.length;
  const totalPage = Math.ceil(totalItem / itemPerPage);
  const startIndex = (page - 1) * itemPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemPerPage);

  const handleDelete = (id) => {
    // if (!confirm("Yakin hapus stok?")) return;
    // setdata((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mt-5">
      {/* HEADER */}
      <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">{title}</h2>

        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Cari barang..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border rounded-lg pl-8 pr-3 py-1 text-sm"
            />
          </div>

          {/* ITEM PER PAGE */}
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
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <table className="w-[180vw] md:w-full text-sm">
          <thead>
            <tr className="text-gray-600 bg-gray-100">
              <th className="px-4 py-3 text-left">Nama Barang</th>
              <th className="px-4 py-3 text-left">Merk</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-right">Harga Pokok</th>
              <th className="px-4 py-3 text-right">Harga Jual</th>
              <th className="px-4 py-3 text-center">Stok</th>
              {/* <th className="px-4 py-3 text-center">Aksi</th> */}
            </tr>
          </thead>

          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-gray-500 text-center" colSpan={7}>
                  Tidak ada data
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{item.nama}</td>
                  <td className="px-4 py-3">{item.brand}</td>
                  <td className="px-4 py-3">{item.kategori}</td>

                  <td className="px-4 py-3 text-right">
                    Rp {item.hargaModal.toLocaleString("id-ID")}
                  </td>

                  <td className="px-4 py-3 text-right">
                    Rp {item.hargaJual.toLocaleString("id-ID")}
                  </td>

                  <td
                    className={`px-4 py-3 text-center font-semibold ${
                      item.stok <= 3 ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {item.stok}
                  </td>

                  {/* ACTION BUTTONS */}
                  {/* <td className="px-4 py-3 flex gap-2 justify-center">
                    <button className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
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
  );
}
