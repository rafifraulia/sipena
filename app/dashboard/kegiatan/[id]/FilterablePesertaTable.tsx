"use client";

import { useState, useMemo } from "react";
import PesertaTable from "./PesertaTable";

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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    window.location.reload();
  };

  return (
    <div className="w-full flex flex-col">
      {/* Filter Hari */}
      <div className="w-full px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Filter Hari:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedHari(null)}
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
                onClick={() => setSelectedHari(hari)}
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

      {/* Wrapper Tabel dengan Overflow Control */}
      <div className="w-full overflow-x-auto">
        <PesertaTable 
          key={refreshKey}
          pesertaList={filteredPeserta} 
          kegiatan={kegiatan}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
