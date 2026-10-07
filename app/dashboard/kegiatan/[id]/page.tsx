import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import PesertaTable from "./PesertaTable";
import ExportButtons from "./ExportButtons";

const prisma = new PrismaClient();

export default async function DetailKegiatanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch kegiatan dari database
  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id },
    include: {
      absensi: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  // Redirect jika tidak ditemukan
  if (!kegiatan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header - Tombol Kembali */}
      <div className="mb-6">
        <Link
          href="/dashboard/kegiatan"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Kembali ke Daftar Kegiatan</span>
        </Link>
      </div>

      {/* Card 1: Informasi Kegiatan */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Bagian Kiri - Info Utama */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
              {kegiatan.nama}
            </h1>
            {kegiatan.subKegiatan && (
              <p className="text-slate-600 text-sm mb-6">
                Sub Kegiatan: <span className="font-medium">{kegiatan.subKegiatan}</span>
              </p>
            )}

            {/* Tombol Buka Form Absensi Publik */}
            <a
              href={`/absensi/${kegiatan.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Buka Form Absensi Publik
            </a>
          </div>

          {/* Bagian Kanan - Badge Informasi */}
          <div className="flex flex-col gap-3 lg:min-w-[250px]">
            <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Tanggal Mulai</p>
              <p className="text-sm font-semibold text-slate-800">
                {new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Tanggal Selesai</p>
              <p className="text-sm font-semibold text-slate-800">
                {new Date(kegiatan.tanggalSelesai).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Penanggung Jawab</p>
              <p className="text-sm font-semibold text-slate-800">{kegiatan.penanggungJawab}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Tabel Peserta Kegiatan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header Card */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Daftar Peserta</h2>
              <p className="text-sm text-slate-600 mt-1">
                Total: <span className="font-semibold text-indigo-600">{kegiatan.absensi.length}</span> peserta
              </p>
            </div>

            {/* Tombol Aksi */}
            <ExportButtons 
              kegiatan={{
                nama: kegiatan.nama,
                penanggungJawab: kegiatan.penanggungJawab,
                tanggalMulai: kegiatan.tanggalMulai,
                tanggalSelesai: kegiatan.tanggalSelesai,
                absensi: kegiatan.absensi,
              }}
            />
          </div>
        </div>

        {/* Tabel Peserta - Wrapped untuk scroll horizontal */}
        <div className="overflow-x-auto w-full">
          <PesertaTable 
            pesertaList={kegiatan.absensi} 
            kegiatan={{
              nama: kegiatan.nama,
              tanggalMulai: kegiatan.tanggalMulai,
              tanggalSelesai: kegiatan.tanggalSelesai
            }}
          />
        </div>
      </div>
    </div>
  );
}

