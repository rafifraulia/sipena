import Link from "next/link";
import { CheckCircle, Clock, CalendarClock, Plus, Activity, Calendar, Users, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getDashboardStats() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Count kegiatan by status
  const [selesai, sedangBerjalan, akanDatang] = await Promise.all([
    // Selesai: tanggalSelesai < today
    prisma.kegiatan.count({
      where: {
        tanggalSelesai: {
          lt: now,
        },
      },
    }),
    // Sedang Berjalan: tanggalMulai <= today <= tanggalSelesai
    prisma.kegiatan.count({
      where: {
        tanggalMulai: {
          lte: now,
        },
        tanggalSelesai: {
          gte: now,
        },
      },
    }),
    // Akan Datang: tanggalMulai > today
    prisma.kegiatan.count({
      where: {
        tanggalMulai: {
          gt: now,
        },
      },
    }),
  ]);

  return {
    selesai,
    sedangBerjalan,
    akanDatang,
  };
}

async function getRecentKegiatan() {
  const kegiatan = await prisma.kegiatan.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      nama: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      _count: {
        select: {
          absensi: true,
        },
      },
    },
  });

  return kegiatan;
}

function getStatusBadge(tanggalMulai: Date, tanggalSelesai: Date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const mulai = new Date(tanggalMulai);
  mulai.setHours(0, 0, 0, 0);
  const selesai = new Date(tanggalSelesai);
  selesai.setHours(0, 0, 0, 0);

  if (now >= mulai && now <= selesai) {
    return { label: "Sedang Berlangsung", color: "bg-green-100 text-green-800" };
  } else if (now < mulai) {
    return { label: "Akan Datang", color: "bg-blue-100 text-blue-800" };
  }
  return { label: "Selesai", color: "bg-gray-100 text-gray-800" };
}

function formatTanggal(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentKegiatan = await getRecentKegiatan();

  return (
    <div className="space-y-6">
      {/* Header Area with Indigo Background */}
      <div className="bg-indigo-600 rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-indigo-100 text-sm md:text-base">
              Selamat datang di SIPENA - Sistem Integrasi Presensi, Event, & Nota Autentikasi
            </p>
          </div>
          <Link href="/dashboard/kegiatan/buat">
            <button className="bg-white text-indigo-600 hover:bg-gray-50 font-medium px-6 py-3 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus className="w-5 h-5" />
              Buat Kegiatan
            </button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1: Kegiatan Selesai */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Kegiatan Selesai
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.selesai}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Card 2: Sedang Berjalan */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Sedang Berjalan
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.sedangBerjalan}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Card 3: Akan Datang */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Akan Datang
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.akanDatang}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <CalendarClock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Large Card - Kegiatan Terbaru */}
      <div className="bg-white shadow-sm rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Kegiatan Terbaru</h2>
            <p className="text-sm text-slate-500 mt-1">5 kegiatan terakhir yang dibuat</p>
          </div>
          <Link href="/dashboard/kegiatan">
            <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
              Lihat Semua
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
        
        {recentKegiatan.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 md:p-12 text-center">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Belum ada data kegiatan</p>
            <p className="text-sm text-slate-400 mt-2">Klik tombol "Buat Kegiatan" untuk menambahkan kegiatan baru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentKegiatan.map((kegiatan) => {
              const status = getStatusBadge(kegiatan.tanggalMulai, kegiatan.tanggalSelesai);
              return (
                <Link key={kegiatan.id} href={`/dashboard/kegiatan/${kegiatan.id}`}>
                  <div className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-1">
                            {kegiatan.nama}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatTanggal(kegiatan.tanggalMulai)}</span>
                            {kegiatan.tanggalMulai.toString() !== kegiatan.tanggalSelesai.toString() && (
                              <span className="text-slate-400">- {formatTanggal(kegiatan.tanggalSelesai)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{kegiatan._count.absensi} peserta</span>
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

