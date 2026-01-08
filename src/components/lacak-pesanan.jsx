import React, { useState } from "react";
import { Search, Package, Wrench, ArrowRight } from "lucide-react";

export default function TrackingSection() {
  const [trackingCode, setTrackingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackVoucher = () => {
    if (!trackingCode.trim()) {
      alert("Masukkan kode pelacakan terlebih dahulu");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      alert(`Melacak voucher dengan kode: ${trackingCode}`);
      setIsLoading(false);
    }, 1000);
  };

  const handleTrackService = () => {
    if (!trackingCode.trim()) {
      alert("Masukkan kode pelacakan terlebih dahulu");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      alert(`Melacak service dengan kode: ${trackingCode}`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen ">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Search className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Lacak Pesanan</h1>
            </div>
            <p className="text-center text-blue-100">
              Masukkan kode pelacakan untuk mengecek status pesanan Anda
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Kode Pelacakan
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Masukkan kode pelacakan..."
                  className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 text-lg focus:border-purple-500 focus:outline-none transition shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTrackVoucher();
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Contoh: VCH-001234 atau SRV-567890
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lacak Voucher Button */}
              <button
                onClick={handleTrackVoucher}
                disabled={isLoading}
                className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex flex-col items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Package className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-lg">Lacak Voucher</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Lacak Service Button */}
              <button
                onClick={handleTrackService}
                disabled={isLoading}
                className="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex flex-col items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Wrench className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-lg">Lacak Service</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">
                      Pesanan Voucher
                    </h3>
                    <p className="text-xs text-blue-700">
                      Cek status pemesanan voucher pulsa, data, dan paket
                      lainnya
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 text-sm mb-1">
                      Service HP
                    </h3>
                    <p className="text-xs text-purple-700">
                      Pantau progress perbaikan dan service handphone Anda
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-gray-600 font-medium">Mencari data...</span>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Butuh bantuan? Hubungi customer service kami di{" "}
            <span className="font-semibold text-purple-600">
              0812-3456-7890
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
