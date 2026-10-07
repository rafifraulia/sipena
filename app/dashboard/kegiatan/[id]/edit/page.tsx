"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface EditKegiatanPageProps {
  params: Promise<{ id: string }>;
}

export default function EditKegiatanPage({ params }: EditKegiatanPageProps) {
  const router = useRouter();
  const [kegiatanId, setKegiatanId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    subKegiatan: "",
    penanggungJawab: "",
    tanggalMulai: "",
    tanggalSelesai: "",
  });

  // Resolve params and fetch data
  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params;
      setKegiatanId(resolvedParams.id);

      try {
        setIsFetching(true);
        const response = await fetch(`/api/kegiatan/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error("Gagal mengambil data kegiatan");
        }

        const data = await response.json();
        
        // Format tanggal untuk input type="date" (YYYY-MM-DD)
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          nama: data.nama,
          subKegiatan: data.subKegiatan || "",
          penanggungJawab: data.penanggungJawab,
          tanggalMulai: formatDate(data.tanggalMulai),
          tanggalSelesai: formatDate(data.tanggalSelesai),
        });
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat mengambil data kegiatan");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/kegiatan/${kegiatanId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal memperbarui kegiatan");
      }

      // Redirect ke halaman daftar kegiatan setelah berhasil
      router.push("/dashboard/kegiatan");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memperbarui kegiatan");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat data kegiatan...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="mb-6">
        <Link href="/dashboard/kegiatan" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Kembali</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Edit Kegiatan</h1>
        <p className="text-sm text-slate-600 mt-2">Perbarui informasi kegiatan di bawah ini.</p>
      </div>

      {/* Card Form Utama */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
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
            <input type="text" id="nama" name="nama" value={formData.nama} onChange={handleChange}
              placeholder="Contoh: Sosialisasi Program Kerja 2026" required disabled={isLoading}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Sub Kegiatan */}
          <div>
            <label htmlFor="subKegiatan" className="block text-sm font-medium text-slate-700 mb-2">
              Sub Kegiatan <span className="text-slate-400">(Opsional)</span>
            </label>
            <input type="text" id="subKegiatan" name="subKegiatan" value={formData.subKegiatan} onChange={handleChange}
              placeholder="Contoh: Sesi Diskusi & Tanya Jawab" disabled={isLoading}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Penanggung Jawab */}
          <div>
            <label htmlFor="penanggungJawab" className="block text-sm font-medium text-slate-700 mb-2">
              Penanggung Jawab <span className="text-red-500">*</span>
            </label>
            <input type="text" id="penanggungJawab" name="penanggungJawab" value={formData.penanggungJawab} onChange={handleChange}
              placeholder="Contoh: Dr. Ahmad Fauzi" required disabled={isLoading}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Tanggal Mulai & Selesai */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tanggalMulai" className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input type="date" id="tanggalMulai" name="tanggalMulai" value={formData.tanggalMulai} onChange={handleChange}
                required disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="tanggalSelesai" className="block text-sm font-medium text-slate-700 mb-2">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input type="date" id="tanggalSelesai" name="tanggalSelesai" value={formData.tanggalSelesai} onChange={handleChange}
                required disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Area Tombol Submit */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
            <Link href="/dashboard/kegiatan">
              <button type="button" disabled={isLoading}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg px-6 py-2.5 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Batal
              </button>
            </Link>
            <button type="submit" disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-medium text-sm transition-colors shadow-sm disabled:bg-indigo-400 disabled:cursor-not-allowed">
              {isLoading ? "Memperbarui..." : "Perbarui Kegiatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
