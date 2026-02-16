import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

export default function PrintServiceHP() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get(`/service-hp-print/${id}`);
      setData(res.data.data);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  }, [data]);

  if (!data) return null;

  const totalSparepart =
    data.Sparepart?.reduce(
      (sum, sp) => sum + sp.Sparepart.hargaJual * sp.quantity,
      0
    ) || 0;

  const totalKeuntunganSparepart =
    data.detail?.itemTransaksi?.reduce(
      (sum, sp) => sum + (sp.hargaJual - sp.hargaPokok) * sp.qty,
      0
    ) || 0;

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          font-family: monospace;
          background: #fff;
          font-size: 30px;
        }

        @page {
          size: auto;
          margin: 0mm;
        }

        .receipt {
          width: 100%;
          padding: 10px;
          box-sizing: border-box;
        }

        .center {
          text-align: center;
        }

        .bold {
          font-weight: bold;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 12px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .item {
          margin-bottom: 12px;
        }

        @media print {
          .no-print {
            display: none;
          }

          .line {
            border: none;
          }
        }
      `}</style>

      <div className="receipt">
        <div className="center bold" style={{ fontSize: "35px" }}>
          SERVICE HP
        </div>

        <div className="line" />
        <div className="row">
          <span>Nama</span>
          <span>{data.Member?.nama || data?.namaPelanggan}</span>
        </div>

        <div className="row">
          <span>No HP</span>
          <span>{data.Member?.noTelp || data.noHP}</span>
        </div>

        <div className="row">
          <span>Brand</span>
          <span>{data.brandHP}</span>
        </div>

        <div className="row">
          <span>Status</span>
          <span>{data.status}</span>
        </div>

        <div className="row">
          <span>Tanggal</span>
          <span>
            {new Date(data.tanggal).toLocaleDateString("id-ID", {
              dateStyle: "full",
            })}
          </span>
        </div>

        <div className="line" />

        <div className="bold">Kerusakan:</div>
        <div style={{ marginBottom: "10px" }}>{data.keterangan || "-"}</div>

        <div className="line" />

        <div className="bold">Sparepart:</div>

        {data.Sparepart?.length > 0 ? (
          data.Sparepart.map((sp, i) => (
            <div key={i} className="item">
              <div className="bold">{sp.Sparepart.nama}</div>
              <div className="row">
                <span>
                  {sp.quantity} x Rp
                  {sp.Sparepart.hargaJual.toLocaleString("id-ID")}
                </span>
                <span>
                  Rp
                  {(sp.quantity * sp.Sparepart?.hargaJual).toLocaleString(
                    "id-ID"
                  )}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div>Tidak ada sparepart</div>
        )}

        <div className="line" />

        <div className="row">
          <span>Biaya Jasa</span>
          <span>Rp{(data.biayaJasa || 0).toLocaleString("id-ID")}</span>
        </div>

        <div className="row">
          <span>Total Sparepart</span>
          <span>Rp{totalSparepart.toLocaleString("id-ID")}</span>
        </div>

        <div className="line" />

        <div className="row bold" style={{ fontSize: "40px" }}>
          <span>Total Bayar</span>
          <span>
            Rp
            {(totalSparepart + (data.biayaJasa || 0)).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="line" />

        <div className="center">Terima kasih 🙏</div>
      </div>
    </>
  );
}
