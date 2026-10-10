import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPengaturan } from "./actions/pengaturan";
import PublicEventList from "@/components/PublicEventList";

export default async function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch pengaturan untuk running text
  const pengaturan = await getPengaturan();

  const kegiatanList = await prisma.kegiatan.findMany({
    where: {
      tanggalSelesai: {
        gte: today
      }
    },
    orderBy: {
      tanggalMulai: 'asc'
    },
    select: {
      id: true,
      slug: true,
      nama: true,
      subKegiatan: true,
      penanggungJawab: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      flyerUrl: true,
      _count: {
        select: {
          absensi: true
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" suppressHydrationWarning>
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" suppressHydrationWarning>
          <div className="flex items-center justify-between" suppressHydrationWarning>
            <div className="flex items-center gap-3" suppressHydrationWarning>
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center" suppressHydrationWarning>
                <span className="text-xl font-bold text-white">SI</span>
              </div>
              <div suppressHydrationWarning>
                <h1 className="text-xl font-bold text-slate-800">SIPENA</h1>
                <p className="text-xs text-slate-500">Sistem Pengelola Kegiatan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Running Text / Pengumuman */}
      {pengaturan.runningText && (
        <div className="bg-indigo-600 text-white py-3 overflow-hidden w-full relative" suppressHydrationWarning>
          <div className="animate-marquee">
            <span className="text-sm font-medium">
              📢 {pengaturan.runningText}
            </span>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12" suppressHydrationWarning>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Portal Kegiatan Publik
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Temukan kegiatan yang sedang berlangsung atau akan datang dan isi absensi Anda dengan mudah
          </p>
        </div>

        <PublicEventList kegiatan={kegiatanList} />
      </section>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" suppressHydrationWarning>
          <p className="text-center text-sm text-slate-600">
            © 2026 SIPENA. Sistem Pengelola Kegiatan & Absensi
          </p>
        </div>
      </footer>
    </div>
  );
}

