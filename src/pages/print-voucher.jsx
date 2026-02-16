import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

export default function PrintVoucherGrosir() {
  const { id } = useParams();
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

  if (!data) return null;

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          background: #fff;
          font-family: monospace;
          font-size: 38px;
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

        .small {
          font-size: 25px;
          
        }

        .item {
          margin-bottom: 40px;
        }

        .voucher-name {
          font-weight: 700;
          margin-bottom: 6px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 16px 0;
        }

        /* HILANGKAN GARIS SAAT PRINT */
        @media print {
          .line {
            display: none;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="receipt">
        <div className="center bold" style={{ fontSize: "40px" }}>
          VOUCHER GROSIR JAVA CELL
        </div>

        <div className="center small" style={{ marginBottom: "60px" }}>
          {data.downline.kodeDownline} - {data.downline.nama}
        </div>

        <div className="line" />

        <div className="small">
          {new Date(data.tanggal).toLocaleDateString("id-ID", {
            dateStyle: "full",
          })}
        </div>

        <div className="line" />

        {data.items.map((item, i) => (
          <div key={i} className="item">
            <div className="voucher-name">{item.Voucher.nama}</div>

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

        <div className="row bold" style={{ fontSize: "40px" }}>
          <span>Total</span>
          <span>{data.totalHarga.toLocaleString("id-ID")}</span>
        </div>

        <div className="line" />

        <div className="center small">Terima kasih 🙏</div>
      </div>
    </>
  );
}
