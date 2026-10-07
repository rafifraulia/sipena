"use client";

import Link from "next/link";
import { Search, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Kegiatan {
  id: string;
  slug: string;
  nama: string;
  subKegiatan: string | null;
  penanggungJawab: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  createdAt: string;
  _count?: {
    absensi: number;
  };
}

function KegiatanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");

  // Fetch data kegiatan
  useEffect(() => {
    fetchKegiatan();
  }, [searchTerm, dateFilter]);

  const fetchKegiatan = async () => {
    try {
      setIsLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (dateFilter) params.append("date", dateFilter);
      
      const response = await fetch(`/api/kegiatan?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Gagal mengambil data kegiatan");
      }

      const data = await response.json();
      setKegiatanList(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL when filters change
  const updateURL = (search: string, date: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (date) params.append("date", date);
    
    const queryString = params.toString();
    router.push(`/dashboard/kegiatan${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateURL(value, dateFilter);
  };

  const handleDateChange = (value: string) => {
    setDateFilter(value);
    updateURL(searchTerm, value);
  };

  // Handle delete
  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${nama}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/kegiatan/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus kegiatan");
      }

      // Refresh data
      fetchKegiatan();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menghapus kegiatan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daftar Kegiatan</h1>
        <p className="text-sm text-slate-600 mt-1">
          Kelola semua data kegiatan pegawai dan absensi
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        {/* Toolbar Area */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Left Side - Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Kegiatan..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Filter Tanggal Input */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white cursor-pointer"
                />
              </div>
            </div>

            {/* Right Side - Buat Kegiatan Button */}
            <Link href="/dashboard/kegiatan/buat">
              <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
                + Buat Kegiatan
              </button>
            </Link>
          </div>
        </div>

        {/* Tabel Kegiatan */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Nama Kegiatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Tanggal Kegiatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Tautan Absensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Penanggung Jawab
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : kegiatanList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    {searchTerm ? "Tidak ada kegiatan yang cocok dengan pencarian" : "Belum ada data kegiatan"}
                  </td>
                </tr>
              ) : (
                kegiatanList.map((kegiatan, index) => (
                  <tr key={kegiatan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {kegiatan.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`${window.location.origin}/absensi/${kegiatan.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                      >
                        {`${window.location.origin}/absensi/${kegiatan.slug}`}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {kegiatan.penanggungJawab}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/kegiatan/${kegiatan.id}`}>
                          <button
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/kegiatan/${kegiatan.id}/edit`}>
                          <button
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit Kegiatan"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(kegiatan.id, kegiatan.nama)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Kegiatan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Menampilkan {kegiatanList.length} kegiatan
          </p>
        </div>
      </div>
    </div>
  );
}

export default function KegiatanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Memuat data...</p>
        </div>
      </div>
    }>
      <KegiatanContent />
    </Suspense>
  );
}

