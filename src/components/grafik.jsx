import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/client";

const COLORS = {
  keuntunganTrx: "#3b82f6",
  keuntunganVd: "#10b981",
  keuntunganGrosirVd: "#0ea5e9",
  keuntunganAcc: "#8b5cf6",
  keuntunganSparepart: "#f59e0b",
  keuntunganService: "#ef4444",
};

const formatRupiah = (num) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

export default function GrafikKeuntungan() {
  const [data, setData] = useState([]);
  const [periode, setPeriode] = useState("harian");
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  const fetchChart = async () => {
    try {
      setLoading(true);

      const res = await api.get("chart2", {
        params: {
          periode,
        },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setData(res.data.data);
    } catch (err) {
      console.error("Error fetch chart:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchChart();
  }, [periode]);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Keuntungan per Kategori
        </h2>

        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm"
        >
          <option value="harian">Harian</option>
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
        </select>
      </div>

      {/* CHART */}
      <div className="h-[320px] md:h-[380px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="15%"
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              <XAxis dataKey="tanggal" />

              <YAxis
                tickFormatter={(value) =>
                  formatRupiah(value)
                    .replace(/[^0-9]/g, "")
                    .slice(0, 3) + "rb"
                }
              />

              {/* Transaksi */}
              <Bar dataKey="keuntunganTrx" name="Transaksi">
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS.keuntunganTrx} />
                ))}
              </Bar>

              {/* Voucher */}
              <Bar dataKey="keuntunganVd" name="Voucher">
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS.keuntunganVd} />
                ))}
              </Bar>

              {/* Grosir */}
              <Bar dataKey="keuntunganGrosirVd" name="Grosir">
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS.keuntunganGrosirVd} />
                ))}
              </Bar>

              {/* Aksesoris */}
              <Bar dataKey="keuntunganAcc" name="Aksesoris">
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS.keuntunganAcc} />
                ))}
              </Bar>

              {/* Sparepart */}
              <Bar dataKey="keuntunganSparepart" name="Sparepart">
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS.keuntunganSparepart} />
                ))}
              </Bar>

              {/* Service */}
              <Bar dataKey="keuntunganService" name="Service">
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS.keuntunganService} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
