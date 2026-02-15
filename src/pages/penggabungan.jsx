import React from "react";
import JualanVoucher from "./jualan-voucher";
import TransaksiPage from "./transaksi";

export default function Penggabungan() {
  return (
    <div className="w-full mt-7 lg:mt-0 flex flex-col sm:flex-row gap-x-3 justify-between">
      <div className="sm:w-1/2 w-full">
        <JualanVoucher />
      </div>
      <div className="sm:w-1/2 w-full">
        <TransaksiPage />
      </div>
    </div>
  );
}
