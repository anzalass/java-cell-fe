import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function PrintVoucherGrosir() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get(`/grosir-vd-print/${id}`);
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

  console.log(data);

  if (!data) return null;

  return (
    <>
      {/* CSS KHUSUS PRINT */}
      <style>{`
        body {
          margin: 0;
          font-family: monospace;
          font-size: 12px;
        }

        @page {
          size: A4;
          margin: 0;
        }

        .receipt {
          width: A4;
          padding: 6px;
        }

        .center {
          text-align: center;
        }

        .bold {
          font-weight: bold;
        }

        .small {
          font-size: 10px;
        }

        .row {
          display: flex;
          justify-content: space-between;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }

        @media print {
          body {
            margin: 0;
          }
        }
      `}</style>

      {/* STRUK */}
      <div className="receipt">
        <div className="center bold">VOUCHER GROSIR</div>

        <div className="center small">
          {data.downline.kodeDownline} - {data.downline.nama}
        </div>

        <div className="line" />

        <div className="small">
          {new Date(data.tanggal).toLocaleDateString("id-ID")}
        </div>

        <div className="line" />

        {data.items.map((item, i) => (
          <div key={i}>
            <div>{item.Voucher.nama}</div>
            <div className="row">
              <span>
                {item.quantity} x{" "}
                {item.Voucher.hargaJual.toLocaleString("id-ID")}
              </span>
              <span>
                {(item.quantity * item.Voucher.hargaJual).toLocaleString(
                  "id-ID"
                )}
              </span>
            </div>
          </div>
        ))}

        <div className="line" />

        <div className="row bold">
          <span>Total</span>
          <span>{data.totalHarga.toLocaleString("id-ID")}</span>
        </div>

        <div className="row">
          <span>Keuntungan</span>
          <span>{data.keuntungan.toLocaleString("id-ID")}</span>
        </div>

        <div className="line" />

        <div className="center small">Terima kasih 🙏</div>
      </div>
    </>
  );
}
