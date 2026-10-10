"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react";
import { getPengaturan, updatePengaturan } from "@/app/actions/pengaturan";

export default function PengaturanPage() {
  const [runningText, setRunningText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    loadPengaturan();
  }, []);

  const loadPengaturan = async () => {
    try {
      setIsLoading(true);
      const data = await getPengaturan();
      setRunningText(data.runningText || "");
    } catch (error) {
      console.error("Error loading pengaturan:", error);
      setNotification({
        type: "error",
        message: "Gagal memuat pengaturan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const result = await updatePengaturan(runningText);
      
      if (result.success) {
        setNotification({
          type: "success",
          message: "Pengaturan berhasil disimpan!",
        });
        
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          type: "error",
          message: result.error || "Gagal menyimpan pengaturan",
        });
      }
    } catch (error) {
      console.error("Error saving pengaturan:", error);
      setNotification({
        type: "error",
        message: "Terjadi kesalahan saat menyimpan",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
            <p className="text-sm text-slate-600">Kelola pengaturan aplikasi</p>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Running Text Pengumuman
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Teks ini akan ditampilkan sebagai pengumuman berjalan di halaman utama
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="runningText" className="block text-sm font-medium text-slate-700 mb-2">
              Isi Pengumuman <span className="text-red-500">*</span>
            </label>
            <textarea
              id="runningText"
              value={runningText}
              onChange={(e) => setRunningText(e.target.value)}
              required
              disabled={isSaving}
              rows={4}
              placeholder="Contoh: Selamat datang di Portal SIPENA. Silakan isi absensi kegiatan Anda."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-slate-50 resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">Karakter: {runningText.length}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Preview</label>
            <div className="bg-indigo-600 text-white py-3 px-4 rounded-lg overflow-hidden">
              <div className="whitespace-nowrap animate-marquee">
                {runningText || "Teks pengumuman akan tampil di sini..."}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !runningText.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Informasi</h3>
            <p className="text-sm text-blue-800 mt-1">
              Perubahan running text akan langsung terlihat di halaman utama setelah disimpan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
