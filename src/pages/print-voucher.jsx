import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function PrintVoucherGrosir() {
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
        const res = await api.get(`/grosir-vd-print/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setData(res.data.data);
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
  const tanggal = new Date(trx.tanggal);

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
            size: 80mm 300mm;
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
      `}</style>

      <div className="print-container">
        {/* HEADER TOKO */}

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
          VOUCHER GROSIR
        </div>

        {/* INFO DOWLINE */}
        <div className="row bold" style={{ marginBottom: "4px" }}>
          <span>Downline</span>
          <span>{trx.downline?.kodeDownline || "—"}</span>
        </div>
        <div className="row" style={{ marginBottom: "6px" }}>
          <span>Nama</span>
          <span>{trx.downline?.nama || "—"}</span>
        </div>

        <div className="divider" />

        {/* TANGGAL */}
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

        {/* HEADER ITEM */}
        <div className="row bold" style={{ marginBottom: "4px" }}>
          <span>Produk</span>
          <span style={{ width: "70px", textAlign: "right" }}>Subtotal</span>
        </div>
        <div className="divider" />

        {/* ITEM LIST */}
        {trx.items?.map((item, i) => {
          const subtotal = item.Voucher.hargaJual * item.quantity;
          return (
            <div key={i} className="item-row">
              <div className="item-name">
                {item.Voucher.nama} x{item.quantity}
              </div>
              <div className="item-price">
                {subtotal.toLocaleString("id-ID")}
              </div>
            </div>
          );
        })}

        <div className="divider" />

        {/* TOTAL */}
        <div
          className="row bold"
          style={{ fontSize: "16px", marginTop: "4px" }}
        >
          <span>TOTAL</span>
          <span>{trx.totalHarga?.toLocaleString("id-ID")}</span>
        </div>

        <div className="divider" />

        {/* FOOTER */}
        <div className="center" style={{ marginTop: "10px", fontSize: "13px" }}>
          Terima kasih 🙏
        </div>
        <div className="center text-xs" style={{ marginTop: "4px" }}>
          Simpan struk sebagai bukti transaksi
        </div>

        <div className="footer no-print" style={{ marginTop: "15px" }}>
          Struk ini akan otomatis tercetak. Tutup tab setelah selesai.
        </div>
      </div>
    </>
  );
}
