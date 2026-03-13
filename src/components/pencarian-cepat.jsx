import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";

function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function PencarianCepat() {
  const { user } = useAuthStore();

  const [active, setActive] = useState(null);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 1000);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  /* =============================
     🔍 FETCH SEARCH
  ============================= */
  useEffect(() => {
    if (!debouncedKeyword || !active) {
      setResults([]);
      setHighlightIndex(-1);
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const endpoint =
          active === "sparepart"
            ? "/cari-sparepart"
            : active === "voucher"
              ? "/cari-voucher"
              : active === "acc"
                ? "/cari-acc"
                : "/cari-no-pelanggan";
        const res = await api.get(endpoint, {
          params: { q: debouncedKeyword },
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setResults(res.data.data || []);
        setHighlightIndex(0);
      } catch (err) {
        console.error(err);
        setResults([]);
        setHighlightIndex(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [debouncedKeyword, active, user.token]);

  const copyNomor = async (nomor) => {
    try {
      await navigator.clipboard.writeText(nomor);
      Swal.fire({
        text: "Berhasil mengcopy",
        icon: "success",
        timer: 500, // 1.5 detik
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Gagal copy", err);
    }
  };

  /* =============================
     ⌨️ KEYBOARD HANDLER
  ============================= */
  const handleKeyDown = (e) => {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0) {
        pickItem(results[highlightIndex]);
      }
    }
  };

  /* =============================
     🖱️ PICK ITEM
  ============================= */
  const pickItem = (item) => {
    console.log("Dipilih:", active, item);

    setKeyword("");
    setResults([]);
    setHighlightIndex(-1);
    setActive(null);
  };

  const handleChange = (type, value) => {
    setActive(type);
    setKeyword(value);
  };

  return (
    <div className="gap-3 relative flex flex-row ">
      <InputSearch
        placeholder="Cari Sparepart"
        active={active === "sparepart"}
        value={active === "sparepart" ? keyword : ""}
        onChange={(e) => handleChange("sparepart", e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <InputSearch
        placeholder="Cari Voucher"
        active={active === "voucher"}
        value={active === "voucher" ? keyword : ""}
        onChange={(e) => handleChange("voucher", e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <InputSearch
        placeholder="Cari Acc"
        active={active === "acc"}
        value={active === "acc" ? keyword : ""}
        onChange={(e) => handleChange("acc", e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <InputSearch
        placeholder="Cari No Pelanggan"
        active={active === "pelanggan"}
        value={active === "pelanggan" ? keyword : ""}
        onChange={(e) => handleChange("pelanggan", e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* RESULT */}
      {active && keyword && (
        <div className="absolute z-30 top-10 w-full bg-white border rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {loading && (
            <div className="p-3 text-xs text-gray-500">Mencari...</div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-3 text-xs text-gray-500">
              Data tidak ditemukan
            </div>
          )}

          {!loading &&
            results.map((item, index) => (
              <div
                key={item.id}
                onClick={() => pickItem(item)}
                className={`
                  px-3 py-2 text-xs cursor-pointer border-b last:border-b-0
                  ${
                    index === highlightIndex ? "bg-blue-50" : "hover:bg-blue-50"
                  }
                `}
              >
                <div className="font-medium">
                  {highlightText(item.nama, keyword)}
                </div>
                <div className="text-gray-500 flex items-center justify-between">
                  {active === "pelanggan" && (
                    <>
                      <span className="font-medium text-gray-700">
                        {item.nomor}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyNomor(item.nomor);
                        }}
                        className="text-blue-600 font-semibold text-sm px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Copy
                      </button>
                    </>
                  )}

                  {active !== "pelanggan" && (
                    <div className="flex gap-3">
                      <span>Stok: {item.stok}</span>
                      <span>{active === "voucher" ? item.brand : ""}</span>
                      {"hargaJual" in item && (
                        <span>
                          Rp {item.hargaJual?.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

/* =============================
   INPUT
============================= */
function InputSearch({ placeholder, value, onChange, onKeyDown, active }) {
  return (
    <div className="relative w-full md:h-[50px] h-[38px]">
      {/* <Search
        size={16}
        className={`absolute left-3 top-4 ${
          active ? "text-blue-500" : "text-gray-400"
        }`}
      /> */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`
          w-full text-sm h-full pl-3 pr-3 py-2 rounded-lg border
          transition
          ${active ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-300"}
          focus:outline-none
        `}
      />
    </div>
  );
}

/* =============================
   HIGHLIGHT
============================= */
function highlightText(text, keyword) {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bg-yellow-200 rounded px-0.5">
        {part}
      </span>
    ) : (
      part
    )
  );
}
