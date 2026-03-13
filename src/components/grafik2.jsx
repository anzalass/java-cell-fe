import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/client";
import { User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const formatRupiah = (num) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-[320px]">
      <p className="font-bold text-gray-800 mb-2 text-sm">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">{entry.name}</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {formatRupiah(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function GrafikKeuntungan2() {
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
      console.log(res.data.data);

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

  // Hitung total statistik otomatis
  const stats = useMemo(() => {
    const total = {
      trx: 0,
      vd: 0,
      grosir: 0,
      acc: 0,
      sparepart: 0,
      service: 0,
    };

    data.forEach((d) => {
      total.trx += d.keuntunganTrx || 0;
      total.vd += d.keuntunganVd || 0;
      total.grosir += d.keuntunganGrosirVd || 0;
      total.acc += d.keuntunganAcc || 0;
      total.sparepart += d.keuntunganSparepart || 0;
      total.service += d.keuntunganService || 0;
    });

    return total;
  }, [data]);

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-gray-100 p-5 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800">Grafik Keuntungan</h2>

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
      <div className="h-[350px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis dataKey="tanggal" />

              <YAxis
                tickFormatter={(value) =>
                  formatRupiah(value)
                    .replace(/[^0-9]/g, "")
                    .slice(0, 3) + "rb"
                }
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend />

              <Line
                type="monotone"
                dataKey="keuntunganTrx"
                name="Voucher Harian"
                stroke="#3b82f6"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="keuntunganVd"
                name="Downline"
                stroke="#10b981"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="keuntunganGrosirVd"
                name="Grosir Voucher"
                stroke="#0ea5e9"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="keuntunganAcc"
                name="Aksesoris"
                stroke="#8b5cf6"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="keuntunganSparepart"
                name="Sparepart"
                stroke="#f59e0b"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="keuntunganService"
                name="Service HP"
                stroke="#ef4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* STATISTIK */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
        {[
          { label: "Voucher", value: stats.trx, color: "text-blue-600" },
          { label: "Downline", value: stats.vd, color: "text-green-600" },
          { label: "Grosir", value: stats.grosir, color: "text-sky-600" },
          { label: "Aksesoris", value: stats.acc, color: "text-purple-600" },
          {
            label: "Sparepart",
            value: stats.sparepart,
            color: "text-orange-500",
          },
          { label: "Service", value: stats.service, color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-sm font-bold ${stat.color} mt-0.5`}>
              {formatRupiah(stat.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
