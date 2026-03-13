import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom"; // ✅ Import Navigate
import api from "../api/client";
import { useAuthStore } from "../store/useAuthStore";

export default function PrintTransaksiSparepart() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [dataTrx, setDataTrx] = useState(null);

  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  // ✅ HOOK #1: Fetch user (selalu dipanggil)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ✅ HOOK #2: Fetch data transaksi (selalu dipanggil)
  useEffect(() => {
    // ❌ Jangan fetch jika belum ada token atau id
    if (!user?.token || !id) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/print-transaksi-sparepart/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setData(res.data.data.transaksi);
        setDataTrx(res.data.data);
      } catch (err) {
        console.error("Gagal load transaksi:", err);
        alert("Gagal memuat data transaksi");
      }
    };

    fetchData();
  }, [id, user?.token]); // ✅ Bergantung pada token

  // ✅ HOOK #3: Auto-print (selalu dipanggil)
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // ✅ CONDITIONAL LOGIC — SETELAH SEMUA HOOKS
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

  // ✅ RENDER STRUK — SETELAH SEMUA HOOKS
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
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
        @media print {
          @page { size: 80mm 300mm; margin: 0; }
          html, body { width: 80mm; margin: 0; padding: 0; background: white !important; }
          .no-print { display: none !important; }
          .print-container { width: 100% !important; padding: 5px !important; margin: 0 !important; box-shadow: none !important; }
        }
        body { margin: 0; padding: 0; font-family: 'Courier New', monospace; background: white; color: black; font-size: 14px; line-height: 1.4; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .item-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 3px; }
        .item-name { flex: 2; word-break: break-all; }
        .item-brand { flex: 1; text-align: center; font-size: 12px; color: #666; }
        .item-price { flex: 1.2; text-align: right; }
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
        <div className="row">
          <span>Kasir</span>
          <span>{data.User?.nama || "—"}</span>
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
          <span style={{ width: "90px", textAlign: "right" }}>Total</span>
        </div>
        <div className="divider" />

        {/* ITEM LIST */}
        {data.items?.map((item, i) => {
          const subtotal = item.Sparepart.hargaJual * item.quantity;
          return (
            <div key={i} className="item-row">
              <div className="item-name">
                {item.Sparepart.nama} x{item.quantity}
              </div>
              <div className="item-brand">{item.Sparepart.brand}</div>
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
      </div>
    </>
  );
}
