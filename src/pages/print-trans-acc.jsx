import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function PrintTransaksiAksesoris() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [dataTrx, setDataTrx] = useState(null);
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  // ✅ HOOK #1: Fetch user (selalu dipanggil)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user?.token || !id) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/print-transaksi-acc/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        console.log(res.data.data);

        setData(res.data.data.transaksi);
        setDataTrx(res.data.data);
      } catch (err) {
        console.error("Gagal load data:", err);
        alert("Gagal memuat data transaksi");
      }
    };
    fetchData();
  }, [id, user?.token]); // ✅ Bergantung pada token

  useEffect(() => {
    if (data) {
      // Delay sedikit agar konten ter-render sempurna sebelum print
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

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

  // Redirect jika belum login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Loading data transaksi
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }
  // Loading data transaksi
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media screen {
          body {
            background: #f5f5f5;
            padding: 20px;
          }
          .print-container {
            width: 80mm; /* Lebar struk kasir standar */
            margin: 0 auto;
            background: white;
            padding: 15px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }

        @media print {
          @page {
            size: 80mm 300mm; /* Lebar struk kasir */
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
            padding: 5px !important;
            margin: 0 !important;
            box-shadow: none !important;
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
          margin: 8px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .item-name {
          flex: 2;
          word-break: break-all;
        }

        .item-qty {
          flex: 1;
          text-align: center;
        }

        .item-price {
          flex: 1;
          text-align: right;
        }

        .footer {
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }

        .barcode {
          text-align: center;
          margin: 10px 0;
          font-family: 'Libre Barcode 39', monospace;
          font-size: 24px;
          line-height: 1.2;
        }
      `}</style>

      <div className="print-container">
        {/* HEADER */}
        {dataTrx.logoToko !== "" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            <img
              src={dataTrx.logoToko}
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
          style={{ fontSize: "18px", marginBottom: "8px" }}
        >
          {dataTrx.namaToko}
        </div>
        <div
          className="center"
          style={{ fontSize: "12px", marginBottom: "5px" }}
        >
          {dataTrx.alamat}
        </div>
        <div
          className="center"
          style={{ fontSize: "12px", marginBottom: "10px" }}
        >
          Telp: {dataTrx.noTelp}
        </div>

        <div className="divider" />

        {/* INFO TRANSAKSI */}
        <div className="row">
          <span>ID Transaksi</span>
          <span>{data.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="row">
          <span>Tanggal</span>
          <span>
            {new Date(data.tanggal).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {data.Member ? (
          <div className="row">
            <span>Member</span>
            <span>Ya</span>
          </div>
        ) : (
          <div className="row">
            <span>Member</span>
            <span>Tidak</span>
          </div>
        )}
        <div className="row">
          <span>Pembeli</span>
          <span>{data.namaPembeli || "—"}</span>
        </div>

        <div className="divider" />

        {/* HEADER ITEM */}
        <div className="row bold">
          <span>Produk</span>
          <span style={{ width: "80px", textAlign: "right" }}>Total</span>
        </div>
        <div className="divider" />

        {/* ITEM LIST */}
        {data.items?.map((item, i) => {
          const subtotal = item.Aksesoris.hargaJual * item.quantity;
          return (
            <div key={i} className="item-row">
              <div className="item-name">
                {item.Aksesoris.nama} x{item.quantity}
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
          style={{ fontSize: "16px", marginTop: "5px" }}
        >
          <span>TOTAL</span>
          <span>{data.totalHarga.toLocaleString("id-ID")}</span>
        </div>

        <div className="divider" />

        {/* FOOTER */}
        <div className="center" style={{ marginTop: "15px", fontSize: "13px" }}>
          Terima kasih telah berbelanja di Java Cell 🙏
        </div>
        <div
          className="center"
          style={{ fontSize: "11px", color: "#666", marginTop: "5px" }}
        >
          Simpan struk ini sebagai bukti transaksi
        </div>

        {/* BARCODE (Opsional - bisa diganti dengan library barcode beneran) */}
        <div className="barcode no-print">
          *{data.id.slice(0, 8).toUpperCase()}*
        </div>

        <div className="footer no-print" style={{ marginTop: "20px" }}>
          Halaman ini akan otomatis tercetak. Tutup jendela setelah selesai.
        </div>
      </div>
    </>
  );
}
