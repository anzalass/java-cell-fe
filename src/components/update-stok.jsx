// src/components/UpdateStokModal.jsx
import { useForm } from "react-hook-form";

export default function UpdateStokModal({
  isOpen,
  onClose,
  type,
  currentNama = "",
  onSubmit,
  currentStok = 0,
  isLoading = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      tipe: "tambah", // 'tambah' atau 'kurang'
      jumlah: "",
    },
  });

  // Reset form saat modal dibuka/ditutup
  if (!isOpen) {
    reset({ tipe: "tambah", jumlah: "" });
  }

  const tipe = watch("tipe");
  const jumlah = watch("jumlah");

  const calculatedStok =
    tipe === "tambah"
      ? currentStok + (Number(jumlah) || 0)
      : currentStok - (Number(jumlah) || 0);

  const onSubmitForm = (data) => {
    const change =
      tipe === "tambah" ? Number(data.jumlah) : -Number(data.jumlah);
    onSubmit(change); // kirim delta perubahan ke parent
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Tutup"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-2">Update Stok</h2>
        <p className="text-gray-600 mb-5">
          <span className="font-medium">{currentNama}</span> — Stok saat ini:{" "}
          <span className="font-bold text-blue-600">{currentStok}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          {/* Tipe: Tambah / Kurang */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tindakan
            </label>
            <div className="flex gap-3">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="tambah"
                  {...register("tipe")}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Tambah Stok</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="kurang"
                  {...register("tipe")}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Kurangi Stok</span>
              </label>
            </div>
          </div>

          {/* Jumlah */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah
            </label>
            <input
              type="number"
              min="1"
              {...register("jumlah", {
                required: "Jumlah wajib diisi",
                min: { value: 1, message: "Minimal 1" },
                validate: (value) => {
                  const num = Number(value);
                  if (tipe === "kurang" && num > currentStok) {
                    return `Tidak bisa kurangi lebih dari ${currentStok}`;
                  }
                  return true;
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 10"
            />
            {errors.jumlah && (
              <p className="text-xs text-red-500 mt-1">
                {errors.jumlah.message}
              </p>
            )}
          </div>

          {/* Preview Stok Baru */}
          <div className="mb-5 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Stok setelah perubahan:
              <span
                className={`ml-2 font-bold ${
                  calculatedStok < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {calculatedStok >= 0 ? calculatedStok : "Tidak valid"}
              </span>
            </p>
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
