import { Routes, Route, Navigate } from "react-router-dom";
// import LoginSiswa from "./pages/LoginSiswa";
import "./index.css"; // <-- import Tailwind global CSS di sini
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import DashboardLayout from "./components/dashboard-layout";
import Overview from "./pages/overview";
import TransaksiPage from "./pages/transaksi";
import StokVoucherPage from "./pages/stok-voucher";
import StokBarangAksesorisPage from "./pages/stok-acc";
import StokBarangSparepartPage from "./pages/stok-sparepart";
import ListDownlinePage from "./pages/list-downline";
import TableSectionVoucherGrosir from "./pages/history-trans-voucher";
import LaporanKeuanganPage from "./pages/history-trans";
import TableSectionAccecoris from "./pages/history-trans-acc";
import TableSectionSparepart from "./pages/history-trans-sparepart";
import TableSectionService from "./pages/history-trans-service";
import LaporanBarangKeluarAccPage from "./pages/item-trans-acc";
import LaporanBarangKeluarSparepartPage from "./pages/item-trans-sparepart";
import LaporanBarangKeluarVoucherPage from "./pages/item-trans-voucher";
import UangModalPage from "./pages/uang-keluar";
import LoginPage from "./pages/login";
import UserManagementPage from "./pages/user";
import ListMemberPage from "./pages/list-member";
import Home from "./pages/home";
import JualanVoucher from "./pages/jualan-voucher";

function App() {
  const { user, isLoading, isCheckingAuth, fetchUser } = useAuthStore();

  useEffect(() => {
    // 🔁 Cek sesi login saat app pertama kali dimuat
    fetchUser();
  }, [fetchUser]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="jualan-voucher" element={<JualanVoucher />} />
        <Route path="overview" element={<Overview />} />
        <Route path="user" element={<UserManagementPage />} />
        <Route path="transaksi" element={<TransaksiPage />} />
        <Route path="master-data/stok-voucher" element={<StokVoucherPage />} />
        <Route
          path="master-data/stok-aksesoris"
          element={<StokBarangAksesorisPage />}
        />
        <Route
          path="master-data/stok-sparepart"
          element={<StokBarangSparepartPage />}
        />
        <Route
          path="master-data/list-downline"
          element={<ListDownlinePage />}
        />
        <Route path="master-data/uang-keluar" element={<UangModalPage />} />
        <Route path="master-data/list-member" element={<ListMemberPage />} />
        <Route path="transaksi/aksesoris" element={<TableSectionAccecoris />} />
        <Route path="transaksi/sparepart" element={<TableSectionSparepart />} />
        <Route path="transaksi/service" element={<TableSectionService />} />
        <Route
          path="transaksi/voucher"
          element={<TableSectionVoucherGrosir />}
        />{" "}
        <Route
          path="transaksi/item-voucher"
          element={<LaporanBarangKeluarVoucherPage />}
        />
        <Route
          path="transaksi/item-sparepart"
          element={<LaporanBarangKeluarSparepartPage />}
        />
        <Route
          path="transaksi/item-acc"
          element={<LaporanBarangKeluarAccPage />}
        />{" "}
        <Route path="transaksi/jualan" element={<LaporanKeuanganPage />} />
      </Route>
    </Routes>
  );
}

export default App;
