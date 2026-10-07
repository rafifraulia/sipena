import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import AbsensiForm from "./AbsensiForm";
import { Lock, XCircle } from "lucide-react";

const prisma = new PrismaClient();

export default async function FormAbsensiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  
  const kegiatan = await prisma.kegiatan.findUnique({
    where: { slug }
  });

  if (!kegiatan) {
    notFound();
  }

  // Validasi waktu - cek apakah absensi sudah ditutup
  const now = new Date();
  const endDate = new Date(kegiatan.tanggalSelesai);
  // Set ke akhir hari (23:59:59.999)
  endDate.setHours(23, 59, 59, 999);

  // Jika sudah melewati batas waktu, tampilkan halaman absensi ditutup
  if (now > endDate) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          {/* Card dengan shadow */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icon Gembok */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-red-600" />
              </div>
            </div>

            {/* Judul */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Absensi Telah Ditutup
            </h1>

            {/* Sub-teks dengan info kegiatan */}
            <p className="text-gray-600 mb-4 leading-relaxed">
              Mohon maaf, batas waktu pengisian absensi untuk kegiatan{" "}
              <span className="font-semibold text-gray-900">&quot;{kegiatan.nama}&quot;</span>{" "}
              telah berakhir.
            </p>

            {/* Info tanggal */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Periode kegiatan:
              </p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" - "}
                {new Date(kegiatan.tanggalSelesai).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Icon X Circle di bawah */}
            <div className="mt-6 flex justify-center">
              <XCircle className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form absensi asli (hanya tampil jika belum melewati batas waktu)
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
          <span className="text-2xl font-bold text-white">SI</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">SIPENA</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          Formulir Kehadiran Kegiatan
        </h2>
        <p className="text-slate-600">
          <span className="font-medium">{kegiatan.nama}</span>
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <AbsensiForm kegiatanId={kegiatan.id} kegiatanNama={kegiatan.nama} />
    </div>
  );
}
