import Link from "next/link";
import { CheckCircle, Clock, CalendarClock, Plus, TrendingUp, Activity } from "lucide-react";

export default function DashboardPage() {
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
              Selamat datang di SIPENA - Sistem Pengelola Kegiatan & Absensi
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
              <h3 className="text-3xl font-bold text-slate-900">24</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">12%</span>
            <span className="text-slate-500 ml-2">dari bulan lalu</span>
          </div>
        </div>

        {/* Card 2: Sedang Berjalan */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Sedang Berjalan
              </p>
              <h3 className="text-3xl font-bold text-slate-900">8</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-blue-600 font-medium">3%</span>
            <span className="text-slate-500 ml-2">dari bulan lalu</span>
          </div>
        </div>

        {/* Card 3: Akan Datang */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Akan Datang
              </p>
              <h3 className="text-3xl font-bold text-slate-900">12</h3>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <CalendarClock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-orange-600 font-medium">8%</span>
            <span className="text-slate-500 ml-2">dari bulan lalu</span>
          </div>
        </div>
      </div>

      {/* Large Card - Kegiatan Terbaru Placeholder */}
      <div className="bg-white shadow-sm rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Kegiatan Terbaru</h2>
            <p className="text-sm text-slate-500 mt-1">Daftar kegiatan yang sedang aktif</p>
          </div>
          <Link href="/dashboard/kegiatan">
            <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Lihat Semua →
            </button>
          </Link>
        </div>
        
        {/* Placeholder Content */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 md:p-12 text-center">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Belum ada data kegiatan</p>
          <p className="text-sm text-slate-400 mt-2">Klik tombol "Buat Kegiatan" untuk menambahkan kegiatan baru</p>
        </div>
      </div>
    </div>
  );
}

