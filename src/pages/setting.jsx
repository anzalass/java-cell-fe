// src/pages/StoreSettingsPage.jsx
import { useState, useRef, useEffect } from "react";
import api from "../api/client"; // Sesuaikan path API client-mu
import { useAuthStore } from "../store/useAuthStore"; // Jika pakai store

export default function StoreSettingsPage() {
  const { user } = useAuthStore();
  console.log(user);

  const fileInputRef = useRef(null);

  // State form
  const [storeName, setStoreName] = useState("");
  const [isActive, setIsActive] = useState();
  const [subscribeTime, setSubscribeTime] = useState("");

  const [address, setAddress] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Fetch data toko saat pertama kali
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get("/toko-user", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const toko = res.data.data;
        console.log(toko);

        setStoreName(toko.namaToko || "");
        setIsActive(toko.isActive);
        setSubscribeTime(toko.SubscribeTime);
        setAddress(toko.alamat || "");
        if (toko.logoToko) {
          setLogoPreview(toko.logoToko);
        }
        setInitialDataLoaded(true);
      } catch (err) {
        console.error("Gagal memuat data toko:", err);
        alert("Gagal memuat data toko");
      }
    };

    if (user?.token) {
      fetchStore();
    }
  }, [user?.token]);

  // Handle pilih gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Hanya file gambar yang diizinkan!");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Trigger input file
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Simpan perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      alert("Nama toko wajib diisi");
      return;
    }

    setLoading(true);
    try {
      let logoUrl = null;

      // Upload gambar jika ada
      if (logoFile) {
        const formData = new FormData();
        formData.append("logoToko", logoFile);
        const uploadRes = await api.put("/update-foto-toko", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        });
        logoUrl = uploadRes.data.url;
      }

      // Update toko
      await api.put(
        "/update-toko",
        {
          namaToko: storeName,
          alamat: address,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      alert("Pengaturan toko berhasil disimpan!");
    } catch (err) {
      console.error("Error simpan toko:", err);
      alert(
        "Gagal menyimpan pengaturan: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (!initialDataLoaded) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* LEFT - LOGO */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-gray-700 mb-4">
              Logo Toko
            </label>

            <div
              onClick={triggerFileInput}
              className="relative cursor-pointer group"
            >
              <div className="w-36 h-36 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Toko"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-4xl">+</span>
                )}
              </div>

              {/* overlay */}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                  Ganti
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              disabled={user.role === "Crew" ? true : false}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <p className="text-xs text-gray-500 mt-3 text-center">
              Klik foto untuk mengganti logo toko
            </p>
          </div>

          {/* RIGHT CONTENT */}
          <div className="md:col-span-2 space-y-5">
            {/* STATUS */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status Langganan</p>
                <p className="text-sm mt-1 font-medium text-gray-800">
                  Berlaku hingga{" "}
                  {new Date(subscribeTime).toLocaleDateString("id-ID", {
                    dateStyle: "full",
                  })}
                </p>
              </div>

              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {isActive ? "Aktif" : "Non Aktif"}
              </span>
            </div>

            {/* NAMA TOKO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Toko
              </label>

              <input
                type="text"
                value={storeName}
                disabled={user.role === "Crew" ? true : false}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Java Cell Official"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* ALAMAT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Toko
              </label>

              <textarea
                value={address}
                disabled={user.role === "Crew" ? true : false}
                onChange={(e) => setAddress(e.target.value)}
                rows="3"
                placeholder="Jl. Merdeka No.123, Kota..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* BUTTON */}
            {user.role === "Owner" && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
