"use client";

import { useRef, useState, FormEvent } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";

interface AbsensiFormProps {
  kegiatanId: string;
  kegiatanNama: string;
}

export default function AbsensiForm({ kegiatanId, kegiatanNama }: AbsensiFormProps) {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validasi tanda tangan
    if (sigCanvas.current?.isEmpty()) {
      setError("Mohon tanda tangan terlebih dahulu");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ambil data tanda tangan
      const signatureDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

      // Ambil data form
      const formData = new FormData(e.currentTarget);
      const data = {
        kegiatanId,
        nik: formData.get("nik") as string,
        nama: formData.get("nama") as string,
        tempatLahir: formData.get("tempatLahir") as string,
        tanggalLahir: formData.get("tanggalLahir") as string,
        pangkatGolongan: formData.get("pangkatGolongan") as string,
        jabatan: formData.get("jabatan") as string,
        pendidikan: formData.get("pendidikan") as string,
        instansi: formData.get("instansi") as string,
        alamatKantor: formData.get("alamatKantor") as string,
        provinsi: formData.get("provinsi") as string,
        kabupatenKota: formData.get("kabupaten") as string,
        email: formData.get("email") as string,
        noTelp: formData.get("telp") as string,
        tandaTanganUrl: signatureDataUrl,
      };

      // Kirim ke API
      const response = await fetch("/api/absensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan absensi");
      }

      // Redirect ke halaman sukses
      alert("Absensi berhasil disimpan! Terima kasih atas partisipasi Anda.");
      router.refresh();
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      clearSignature();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nik" className="block text-sm font-medium text-slate-700 mb-2">
            NIK/NIP <span className="text-red-500">*</span>
          </label>
          <input type="text" id="nik" name="nik" required disabled={isSubmitting}
            placeholder="Masukkan NIK/NIP"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>

        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-slate-700 mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input type="text" id="nama" name="nama" required disabled={isSubmitting}
            placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tempatLahir" className="block text-sm font-medium text-slate-700 mb-2">
              Tempat Lahir <span className="text-red-500">*</span>
            </label>
            <input type="text" id="tempatLahir" name="tempatLahir" required disabled={isSubmitting}
              placeholder="Kota kelahiran"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="tanggalLahir" className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <input type="date" id="tanggalLahir" name="tanggalLahir" required disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="pangkatGolongan" className="block text-sm font-medium text-slate-700 mb-2">
            Pangkat/Golongan <span className="text-red-500">*</span>
          </label>
          <input type="text" id="pangkatGolongan" name="pangkatGolongan" required disabled={isSubmitting}
            placeholder="Contoh: Pembina / IV/a"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>

        <div>
          <label htmlFor="jabatan" className="block text-sm font-medium text-slate-700 mb-2">
            Jabatan <span className="text-red-500">*</span>
          </label>
          <input type="text" id="jabatan" name="jabatan" required disabled={isSubmitting}
            placeholder="Contoh: Kepala Bagian SDM"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>

        <div>
          <label htmlFor="pendidikan" className="block text-sm font-medium text-slate-700 mb-2">
            Pendidikan Terakhir <span className="text-red-500">*</span>
          </label>
          <select id="pendidikan" name="pendidikan" required disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          >
            <option value="">-- Pilih Pendidikan --</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA/SMK">SMA/SMK</option>
            <option value="D3">D3</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
            <option value="S3">S3</option>
          </select>
        </div>

        <div>
          <label htmlFor="instansi" className="block text-sm font-medium text-slate-700 mb-2">
            Instansi <span className="text-red-500">*</span>
          </label>
          <input type="text" id="instansi" name="instansi" required disabled={isSubmitting}
            placeholder="Nama instansi tempat bekerja"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>

        <div>
          <label htmlFor="alamatKantor" className="block text-sm font-medium text-slate-700 mb-2">
            Alamat Kantor <span className="text-red-500">*</span>
          </label>
          <textarea id="alamatKantor" name="alamatKantor" required disabled={isSubmitting} rows={3}
            placeholder="Alamat lengkap kantor"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="provinsi" className="block text-sm font-medium text-slate-700 mb-2">
              Provinsi Kantor <span className="text-red-500">*</span>
            </label>
            <input type="text" id="provinsi" name="provinsi" required disabled={isSubmitting}
              placeholder="Contoh: Jawa Barat"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="kabupaten" className="block text-sm font-medium text-slate-700 mb-2">
              Kabupaten/Kota Kantor <span className="text-red-500">*</span>
            </label>
            <input type="text" id="kabupaten" name="kabupaten" required disabled={isSubmitting}
              placeholder="Contoh: Kota Bandung"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" id="email" name="email" required disabled={isSubmitting}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="telp" className="block text-sm font-medium text-slate-700 mb-2">
              No. Telp / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input type="tel" id="telp" name="telp" required disabled={isSubmitting}
              placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tanda Tangan Digital <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 w-full h-40 overflow-hidden">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: "w-full h-full cursor-crosshair",
              }}
              backgroundColor="rgb(248 250 252)"
            />
          </div>
          <button type="button" onClick={clearSignature} disabled={isSubmitting}
            className="text-red-500 hover:text-red-700 text-sm mt-2 font-medium disabled:opacity-50"
          >
            Hapus / Ulangi Tanda Tangan
          </button>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Formulir"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          © 2026 SIPENA. Sistem Pengelola Kegiatan & Absensi
        </p>
      </div>
    </div>
  );
}


