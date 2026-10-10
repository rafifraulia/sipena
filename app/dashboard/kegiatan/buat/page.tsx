"use client";

import Link from "next/link";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BuatKegiatanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingFlyer, setIsUploadingFlyer] = useState(false);
  const [error, setError] = useState("");
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [flyerUrl, setFlyerUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    subKegiatan: "",
    penanggungJawab: "",
    tanggalMulai: "",
    tanggalSelesai: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFlyerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError('');
    setIsUploadingFlyer(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlyerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('flyer', file);

      const response = await fetch('/api/upload/flyer', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal mengupload flyer');
      }

      const data = await response.json();
      setFlyerUrl(data.url);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengupload flyer');
      setFlyerPreview(null);
      setFlyerUrl(null);
    } finally {
      setIsUploadingFlyer(false);
    }
  };

  const handleRemoveFlyer = async () => {
    if (!flyerUrl) return;

    try {
      await fetch(`/api/upload/flyer?url=${encodeURIComponent(flyerUrl)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error deleting flyer:', err);
    }

    setFlyerPreview(null);
    setFlyerUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/kegiatan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          flyerUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menyimpan kegiatan");
      }

      // Redirect ke halaman daftar kegiatan setelah berhasil
      router.push("/dashboard/kegiatan");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan kegiatan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="mb-6">
        {/* Tombol Kembali */}
        <Link
          href="/dashboard/kegiatan"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Kembali</span>
        </Link>

        {/* Judul & Deskripsi */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Buat Kegiatan Baru</h1>
        <p className="text-sm text-slate-600 mt-2">
          Isi formulir di bawah ini untuk menambahkan kegiatan baru ke dalam sistem.
        </p>
      </div>

      {/* Card Form Utama */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Nama Kegiatan */}
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-slate-700 mb-2">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: Sosialisasi Program Kerja 2026"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Sub Kegiatan */}
          <div>
            <label htmlFor="subKegiatan" className="block text-sm font-medium text-slate-700 mb-2">
              Sub Kegiatan
            </label>
            <input
              type="text"
              id="subKegiatan"
              name="subKegiatan"
              value={formData.subKegiatan}
              onChange={handleChange}
              placeholder="Contoh: Pembukaan dan Sambutan"
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Penanggung Jawab */}
          <div>
            <label htmlFor="penanggungJawab" className="block text-sm font-medium text-slate-700 mb-2">
              Penanggung Jawab <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="penanggungJawab"
              name="penanggungJawab"
              value={formData.penanggungJawab}
              onChange={handleChange}
              placeholder="Contoh: Dr. Ahmad Fauzi"
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Upload Flyer (Opsional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Flyer (Poster Kegiatan) <span className="text-slate-400">(Opsional)</span>
            </label>
            
            {flyerPreview ? (
              <div className="space-y-3">
                {/* Preview Image */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                  <Image
                    src={flyerPreview}
                    alt="Preview Flyer"
                    fill
                    className="object-contain"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={handleRemoveFlyer}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Hapus Flyer
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFlyerSelect}
                  disabled={isLoading || isUploadingFlyer}
                  className="hidden"
                  id="flyer-upload"
                />
                <label
                  htmlFor="flyer-upload"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isUploadingFlyer
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploadingFlyer ? (
                      <>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                        <p className="text-sm text-indigo-600 font-medium">Mengupload flyer...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-slate-400 mb-3" />
                        <p className="mb-2 text-sm text-slate-600">
                          <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG, atau JPEG (Maks. 5MB)</p>
                      </>
                    )}
                  </div>
                </label>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Flyer akan ditampilkan di halaman publik untuk menarik perhatian peserta
                </p>
              </div>
            )}
          </div>

          {/* Tanggal Mulai & Selesai - Grid 2 Kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tanggal Mulai */}
            <div>
              <label htmlFor="tanggalMulai" className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="tanggalMulai"
                name="tanggalMulai"
                value={formData.tanggalMulai}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Tanggal Selesai */}
            <div>
              <label htmlFor="tanggalSelesai" className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="tanggalSelesai"
                name="tanggalSelesai"
                value={formData.tanggalSelesai}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Area Tombol Submit */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
            {/* Tombol Batal */}
            <Link href="/dashboard/kegiatan">
              <button
                type="button"
                disabled={isLoading}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg px-6 py-2.5 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </Link>

            {/* Tombol Simpan */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-medium text-sm transition-colors shadow-sm disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Menyimpan..." : "Simpan Kegiatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
