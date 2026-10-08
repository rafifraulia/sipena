import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import AbsensiForm from "./AbsensiForm";
import { Lock, XCircle } from "lucide-react";

const prisma = new PrismaClient();

// Helper function untuk hitung hari ke berapa
function calculateHariKe(tanggalMulai: Date): number {
  const now = new Date();
  const start = new Date(tanggalMulai);
  
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1;
}

// Helper function untuk hitung jumlah hari kegiatan
function calculateJumlahHari(tanggalMulai: Date, tanggalSelesai: Date): number {
  const start = new Date(tanggalMulai);
  const end = new Date(tanggalSelesai);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1;
}

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
  endDate.setHours(23, 59, 59, 999);

  // Hitung info hari
  const hariKe = calculateHariKe(kegiatan.tanggalMulai);
  const jumlahHari = calculateJumlahHari(kegiatan.tanggalMulai, kegiatan.tanggalSelesai);
  const isMultiHari = jumlahHari > 1;

  // Jika sudah melewati batas waktu, tampilkan halaman absensi ditutup
  if (now > endDate) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Absensi Telah Ditutup
            </h1>

            <p className="text-gray-600 mb-4 leading-relaxed">
              Mohon maaf, batas waktu pengisian absensi untuk kegiatan{" "}
              <span className="font-semibold text-gray-900">&quot;{kegiatan.nama}&quot;</span>{" "}
              telah berakhir.
            </p>

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
                {isMultiHari && (
                  <>
                    {" - "}
                    {new Date(kegiatan.tanggalSelesai).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <XCircle className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format tanggal untuk header
  const formatTanggal = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Form absensi dengan header yang diperbaiki
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
        
        {/* Nama Kegiatan */}
        <p className="text-slate-900 font-bold text-lg mt-3">
          {kegiatan.nama}
        </p>
        
        {/* Sub Kegiatan */}
        {kegiatan.subKegiatan && (
          <p className="text-slate-600 text-sm mt-1">
            {kegiatan.subKegiatan}
          </p>
        )}
        
        {/* Rentang Tanggal */}
        <p className="text-slate-500 text-sm mt-2">
          {formatTanggal(kegiatan.tanggalMulai)}
          {isMultiHari && (
            <>
              {" - "}
              {formatTanggal(kegiatan.tanggalSelesai)}
            </>
          )}
        </p>
        
        {/* Badge Hari Ke-X (hanya untuk multi-hari) */}
        {isMultiHari && (
          <div className="inline-flex items-center justify-center mt-3">
            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              Hari ke-{hariKe} dari {jumlahHari} hari
            </span>
          </div>
        )}
      </div>
      
      <AbsensiForm 
        kegiatanId={kegiatan.id} 
        kegiatanNama={kegiatan.nama}
      />
    </div>
  );
}
