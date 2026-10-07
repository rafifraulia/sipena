import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import AbsensiForm from "./AbsensiForm";

const prisma = new PrismaClient();

export default async function FormAbsensiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  
  const kegiatan = await prisma.kegiatan.findUnique({
    where: { slug }
  });

  if (!kegiatan) {
    notFound();
  }

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
