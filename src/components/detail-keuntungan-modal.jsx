import { BarChart3, Package, TrendingUp, Wallet, X } from "lucide-react";

export function DetailKeuntunganModal({
  isOpen,
  onClose,
  keuntunganGrosirVoucher = 0,
  keuntunganAcc = 0,
  keuntunganTransaksi = 0,
  keuntunganVoucherHarian = 0,
}) {
  if (!isOpen) return null;

  const totalKeuntungan =
    keuntunganGrosirVoucher +
    keuntunganAcc +
    keuntunganTransaksi +
    keuntunganVoucherHarian;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const items = [
    {
      title: "Grosir Voucher",
      value: keuntunganGrosirVoucher,
      icon: <Package className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Aksesoris",
      value: keuntunganAcc,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Transaksi Lain",
      value: keuntunganTransaksi,
      icon: <Wallet className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Voucher Harian",
      value: keuntunganVoucherHarian,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="fixed inset-0 -top-10 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Detail Keuntungan
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Rincian keuntungan hari ini
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-indigo-200 hover:text-white transition"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Total Keuntungan */}
          <div className="text-center mb-8">
            <p className="text-gray-600">Total Keuntungan Hari Ini</p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">
              {formatRupiah(totalKeuntungan)}
            </h3>
          </div>

          {/* Detail Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-800">
                    {item.title}
                  </span>
                </div>
                <span className={`font-bold ${item.color}`}>
                  {formatRupiah(item.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onClose(false)}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
