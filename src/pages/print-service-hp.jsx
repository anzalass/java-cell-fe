import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function PrintServiceHP() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user?.token || !id) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/service-hp-print/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setData(res.data.data); // Ambil data dari res.data.data
      } catch (err) {
        console.error("Gagal load transaksi:", err);
        alert("Gagal memuat data transaksi");
      }
    };

    fetchData();
  }, [id, user?.token]);

  useEffect(() => {
    if (data) {
      setTimeout(() => window.print(), 500);
    }
  }, [data]);

  // Loading state
  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!data || !data.transaksi) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500 p-6">
          Data transaksi tidak ditemukan
        </div>
      </div>
    );
  }

  const trx = data.transaksi;
  const tanggal = new Date(trx.tanggal || trx.createdAt);
  const member = trx.Member || null;

  // Hitung total sparepart dari array Sparepart
  const totalSparepart =
    trx.Sparepart?.reduce(
      (sum, sp) => sum + (sp.Sparepart?.hargaJual || 0) * sp.quantity,
      0
    ) || 0;

  // Total bayar = total sparepart + biaya jasa
  const totalBayar = totalSparepart + (trx.biayaJasa || 0);

  return (
    <>
      <style>{`
        @media screen {
          body {
            background: #f5f5f5;
            padding: 20px;
          }
          .print-container {
            width: 80mm;
            margin: 0 auto;
            background: white;
            padding: 15px;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
          }
        }

        @media print {
          @page {
            size: 80mm 350mm;
            margin: 0;
          }
          html, body {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            padding: 8px !important;
            margin: 0 !important;
            box-shadow: none !important;
            font-size: 14px !important;
          }
          .divider {
            border-top: 1px dashed #000 !important;
          }
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Courier New', monospace;
          background: white;
          color: black;
          font-size: 14px;
          line-height: 1.4;
        }

        .center {
          text-align: center;
        }

        .bold {
          font-weight: bold;
        }

        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 2px;
        }

        .item-name {
          flex: 2;
          word-break: break-all;
        }

        .item-qty {
          flex: 0.8;
          text-align: center;
          font-size: 12px;
        }

        .item-price {
          flex: 1.2;
          text-align: right;
          font-size: 12px;
        }

        .footer {
          margin-top: 10px;
          text-align: center;
          font-size: 11px;
          color: #666;
        }

        .text-xs {
          font-size: 11px;
        }

        .text-sm {
          font-size: 13px;
        }

        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .status-selesai {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-proses {
          background-color: #fef3c7;
          color: #92400e;
        }

        .status-ditolak {
          background-color: #fee2e2;
          color: #b91c1c;
        }
      `}</style>

      <div className="print-container">
        {data.logoToko !== "" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            <img
              src={data.logoToko}
              alt="Logo Toko"
              style={{
                height: "100px",
                width: "100px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </div>
        )}
        {/* HEADER TOKO */}
        <div
          className="center bold"
          style={{ fontSize: "18px", marginBottom: "4px" }}
        >
          {data.namaToko}
        </div>
        {data.alamat && (
          <div className="center text-xs" style={{ marginBottom: "2px" }}>
            {data.alamat}
          </div>
        )}
        {data.noTelp && (
          <div className="center text-xs" style={{ marginBottom: "6px" }}>
            Telp: {data.noTelp}
          </div>
        )}

        <div className="divider" />

        {/* JUDUL TRANSAKSI */}
        <div
          className="center bold"
          style={{ fontSize: "16px", marginBottom: "6px" }}
        >
          BUKTI SERVICE HANDPHONE
        </div>

        {/* INFO PELANGGAN */}
        <div className="row bold" style={{ marginBottom: "2px" }}>
          <span>Nama</span>
          <span>{member?.nama || trx.namaPelangan || "—"}</span>{" "}
          {/* Perbaiki typo: namaPelangan */}
        </div>
        <div className="row" style={{ marginBottom: "2px" }}>
          <span>No HP</span>
          <span>{member?.noTelp || trx.noHP || "—"}</span>
        </div>
        <div className="row" style={{ marginBottom: "4px" }}>
          <span>Brand HP</span>
          <span>{trx.brandHP || "—"}</span>
        </div>

        <div className="divider" />

        {/* STATUS & TANGGAL */}
        <div className="row" style={{ marginBottom: "4px" }}>
          <span>Status</span>
          <span
            className={`status-badge ${
              trx.status?.toLowerCase() === "selesai"
                ? "status-selesai"
                : trx.status?.toLowerCase() === "proses"
                  ? "status-proses"
                  : "status-ditolak"
            }`}
          >
            {trx.status?.toUpperCase() || "—"}
          </span>
        </div>
        <div className="center text-sm" style={{ marginBottom: "6px" }}>
          {tanggal.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          {tanggal.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        <div className="divider" />

        {/* KETERANGAN KERUSAKAN */}
        <div className="bold" style={{ marginBottom: "4px" }}>
          Keluhan/Kerusakan:
        </div>
        <div
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: "1.5",
            marginBottom: "6px",
          }}
        >
          {trx.keterangan || "Tidak ada keterangan"}
        </div>

        <div className="divider" />

        {/* SPAREPART */}
        <div className="bold" style={{ marginBottom: "4px" }}>
          Sparepart yang Digunakan:
        </div>
        {trx.Sparepart && trx.Sparepart.length > 0 ? (
          trx.Sparepart.map((sp, i) => {
            const harga = sp.Sparepart?.hargaJual || 0;
            const subtotal = harga * sp.quantity;
            return (
              <div key={i} className="item-row">
                <div className="item-name">
                  {sp.Sparepart?.nama || "—"} x{sp.quantity}
                </div>
                <div className="item-price">
                  {subtotal.toLocaleString("id-ID")}
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="text-xs text-gray-500"
            style={{ marginBottom: "4px" }}
          >
            Tidak ada sparepart digunakan
          </div>
        )}

        <div className="divider" />

        {/* RINCIAN BIAYA */}
        <div className="row">
          <span>Biaya Jasa</span>
          <span>Rp{(trx.biayaJasa || 0).toLocaleString("id-ID")}</span>
        </div>
        <div className="row">
          <span>Total Sparepart</span>
          <span>Rp{totalSparepart.toLocaleString("id-ID")}</span>
        </div>

        <div className="divider" />

        {/* TOTAL */}
        <div
          className="row bold"
          style={{ fontSize: "16px", marginTop: "4px" }}
        >
          <span>TOTAL BAYAR</span>
          <span>Rp{totalBayar.toLocaleString("id-ID")}</span>
        </div>

        <div className="divider" />

        {/* FOOTER */}
        <div className="center" style={{ marginTop: "10px", fontSize: "13px" }}>
          Terima kasih telah menggunakan jasa kami 🙏
        </div>
        <div className="center text-xs" style={{ marginTop: "4px" }}>
          Simpan struk ini sebagai bukti garansi
        </div>
        <div className="center text-xs" style={{ marginTop: "2px" }}>
          Masa garansi: 7 hari untuk sparepart yang diganti
        </div>

        <div className="footer no-print" style={{ marginTop: "15px" }}>
          Struk ini akan otomatis tercetak. Tutup tab setelah selesai.
        </div>
      </div>
    </>
  );
}
