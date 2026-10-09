import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { Calendar, Users, ChevronRight } from "lucide-react";

const prisma = new PrismaClient();

export default async function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const kegiatanList = await prisma.kegiatan.findMany({
    where: {
      tanggalSelesai: {
        gte: today
      }
    },
    orderBy: {
      tanggalMulai: 'asc'
    },
    include: {
      _count: {
        select: {
          absensi: true
        }
      }
    }
  });

  const getStatusKegiatan = (tanggalMulai: Date, tanggalSelesai: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const mulai = new Date(tanggalMulai);
    mulai.setHours(0, 0, 0, 0);
    const selesai = new Date(tanggalSelesai);
    selesai.setHours(0, 0, 0, 0);

    if (now >= mulai && now <= selesai) {
      return { 
        label: "Sedang Berlangsung", 
        color: "bg-green-100 text-green-800",
        canAbsen: true
      };
    } else if (now < mulai) {
      return { 
        label: "Akan Datang", 
        color: "bg-blue-100 text-blue-800",
        canAbsen: false
      };
    }
    return { 
      label: "Selesai", 
      color: "bg-gray-100 text-gray-800",
      canAbsen: false
    };
  };

  const formatTanggal = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

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
            <Link 
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12" suppressHydrationWarning>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Portal Kegiatan Publik
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Temukan kegiatan yang sedang berlangsung atau akan datang dan isi absensi Anda dengan mudah
          </p>
        </div>

        {kegiatanList.length === 0 ? (
          <div className="text-center py-16" suppressHydrationWarning>
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4" suppressHydrationWarning>
              <Calendar className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Belum Ada Kegiatan
            </h3>
            <p className="text-slate-600">
              Saat ini belum ada kegiatan yang tersedia
            </p>
          </div>


        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning>
            {kegiatanList.map((kegiatan) => {
              const status = getStatusKegiatan(kegiatan.tanggalMulai, kegiatan.tanggalSelesai);
              
              return (
                <div 
                  key={kegiatan.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-indigo-300"
                  suppressHydrationWarning
                >
                  <div className="p-6 pb-4" suppressHydrationWarning>
                    <div className="flex items-start justify-between mb-3" suppressHydrationWarning>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1 text-slate-500" suppressHydrationWarning>
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{kegiatan._count.absensi}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">
                      {kegiatan.nama}
                    </h3>

                    <details className="group mb-4">
                      <summary className="cursor-pointer list-none text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="mt-3 space-y-2 text-sm text-slate-600 pl-2" suppressHydrationWarning>
                        {kegiatan.subKegiatan && (
                          <p>
                            <span className="font-medium text-slate-700">Sub Kegiatan:</span><br />
                            {kegiatan.subKegiatan}
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-slate-700">Penanggung Jawab:</span><br />
                          {kegiatan.penanggungJawab}
                        </p>
                      </div>
                    </details>

                    <div className="flex items-start gap-2 text-sm text-slate-600 mb-1" suppressHydrationWarning>
                      <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div suppressHydrationWarning>
                        <p className="font-medium">{formatTanggal(kegiatan.tanggalMulai)}</p>
                        {new Date(kegiatan.tanggalMulai).getTime() !== new Date(kegiatan.tanggalSelesai).getTime() && (
                          <p className="text-slate-500">s.d. {formatTanggal(kegiatan.tanggalSelesai)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6" suppressHydrationWarning>
                    {status.canAbsen ? (
                      <Link
                        href={`/absensi/${kegiatan.slug}`}
                        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
                      >
                        Isi Absensi
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="block w-full bg-gray-300 text-gray-500 text-center font-semibold py-3 rounded-xl cursor-not-allowed"
                      >
                        {status.label === "Akan Datang" ? "Belum Dibuka" : "Sudah Ditutup"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
