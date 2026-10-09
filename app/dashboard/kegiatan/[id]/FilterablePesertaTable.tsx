"use client";

import { useState, useMemo } from "react";
import PesertaTable from "./PesertaTable";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Peserta {
  id: string;
  nama: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: Date;
  pangkatGolongan: string;
  jabatan: string;
  pendidikan: string;
  instansi: string;
  alamatKantor: string;
  provinsi: string;
  kabupatenKota: string;
  email: string;
  noTelp: string;
  tandaTanganUrl: string | null;
  hariKe?: number;
}

interface Kegiatan {
  nama: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
}

interface FilterablePesertaTableProps {
  pesertaList: Peserta[];
  kegiatan: Kegiatan;
  totalHari: number;
}

export default function FilterablePesertaTable({ 
  pesertaList, 
  kegiatan,
  totalHari 
}: FilterablePesertaTableProps) {
  const [selectedHari, setSelectedHari] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Filter peserta berdasarkan hari yang dipilih
  const filteredPeserta = useMemo(() => {
    if (selectedHari === null) {
      return pesertaList;
    }
    return pesertaList.filter(p => (p.hariKe || 1) === selectedHari);
  }, [pesertaList, selectedHari]);

  // Hitung jumlah peserta per hari
  const pesertaPerHari = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= totalHari; i++) {
      counts[i] = pesertaList.filter(p => (p.hariKe || 1) === i).length;
    }
    return counts;
  }, [pesertaList, totalHari]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPeserta.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPeserta = filteredPeserta.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  const handleHariChange = (hari: number | null) => {
    setSelectedHari(hari);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    window.location.reload();
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col">
      {/* Filter Hari */}
      <div className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Filter Hari:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleHariChange(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedHari === null
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              Semua ({pesertaList.length})
            </button>
            {Array.from({ length: totalHari }, (_, i) => i + 1).map((hari) => (
              <button
                key={hari}
                onClick={() => handleHariChange(hari)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedHari === hari
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                Hari {hari} ({pesertaPerHari[hari] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Info & Controls Top */}
      <div className="w-full px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              Menampilkan <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, filteredPeserta.length)}</span> dari <span className="font-semibold">{filteredPeserta.length}</span> peserta
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={25}>25 / halaman</option>
              <option value={50}>50 / halaman</option>
              <option value={100}>100 / halaman</option>
              <option value={200}>200 / halaman</option>
            </select>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wrapper Tabel dengan Overflow Control */}
      <div className="w-full overflow-x-auto">
        <PesertaTable 
          key={refreshKey}
          pesertaList={paginatedPeserta} 
          kegiatan={kegiatan}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Pagination Controls Bottom */}
      {totalPages > 1 && (
        <div className="w-full px-6 py-4 bg-white border-t border-slate-200">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Sebelumnya
            </button>
            
            <span className="text-sm text-slate-600 px-4">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
