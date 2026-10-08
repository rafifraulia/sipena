"use client";

import { FileText, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

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

interface PesertaTableProps {
  pesertaList: Peserta[];
  kegiatan: Kegiatan;
  onRefresh?: () => void;
}

export default function PesertaTable({ pesertaList, kegiatan, onRefresh }: PesertaTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeletePeserta = async (pesertaId: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data peserta ${nama}?`)) {
      return;
    }

    setDeletingId(pesertaId);
    try {
      const response = await fetch(`/api/absensi?id=${pesertaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus data peserta');
      }

      alert('Data peserta berhasil dihapus');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting peserta:', error);
      alert('Gagal menghapus data peserta');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadBiodata = (peserta: Peserta, kegiatanData: Kegiatan) => {
    const doc = new jsPDF();
    
    // Header Surat - Rata Tengah
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("BIODATA PESERTA", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(kegiatanData.nama, doc.internal.pageSize.getWidth() / 2, 30, { align: "center" });
    
    const tanggalKegiatan = `${new Date(kegiatanData.tanggalMulai).toLocaleDateString("id-ID")} - ${new Date(kegiatanData.tanggalSelesai).toLocaleDateString("id-ID")}`;
    doc.text(tanggalKegiatan, doc.internal.pageSize.getWidth() / 2, 37, { align: "center" });
    
    // Format tanggal lahir
    const tanggalLahir = new Date(peserta.tanggalLahir).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    
    // Tabel Biodata
    autoTable(doc, {
      startY: 45,
      head: [],
      body: [
        ["Nama", peserta.nama],
        ["NIP/NIK", peserta.nik],
        ["Tempat/Tanggal Lahir", `${peserta.tempatLahir}, ${tanggalLahir}`],
        ["Pangkat/Golongan", peserta.pangkatGolongan],
        ["Jabatan", peserta.jabatan],
        ["Pendidikan Terakhir", peserta.pendidikan],
        ["Instansi", peserta.instansi],
        ["Alamat", `${peserta.alamatKantor}, ${peserta.kabupatenKota}, ${peserta.provinsi}`],
        ["Email", peserta.email],
        ["Telp", peserta.noTelp],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: 120 },
      },
    });

    
    // Tanda Tangan - jika ada
    if (peserta.tandaTanganUrl) {
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.text("Tanda Tangan:", 14, finalY);
      
      // Load dan tampilkan gambar tanda tangan
      const img = new Image();
      img.src = peserta.tandaTanganUrl;
      img.onload = () => {
        doc.addImage(img, "PNG", 14, finalY + 2, 40, 20);
        // Buka preview di tab baru
        window.open(doc.output('bloburl'), '_blank');
      };
      img.onerror = () => {
        // Jika gagal load gambar, tetap buka preview
        window.open(doc.output('bloburl'), '_blank');
      };
    } else {
      // Buka preview di tab baru
      window.open(doc.output('bloburl'), '_blank');
    }
  };

  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-100">No</th>
            <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-100">Hari</th>
            <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-100">Nama</th>
            <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-100">NIK</th>
            <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-slate-100">Instansi</th>
            <th className="hidden xl:table-cell px-3 md:px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Email</th>
            <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">TTD</th>
            <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {pesertaList.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 md:px-4 py-8 text-center text-sm text-slate-500">
                Belum ada peserta yang mengisi absensi
              </td>
            </tr>
          ) : (
            pesertaList.map((peserta, index) => (
              <tr key={peserta.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-medium">{index + 1}</td>
                <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Hari {peserta.hariKe || 1}
                  </span>
                </td>
                <td className="px-3 md:px-4 py-3 text-sm font-medium text-slate-900">{peserta.nama}</td>
                <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-slate-700">{peserta.nik}</td>
                <td className="px-3 md:px-4 py-3 text-sm text-slate-700">{peserta.instansi}</td>
                <td className="hidden xl:table-cell px-3 md:px-4 py-3 text-sm text-slate-600">{peserta.email}</td>
                <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm">
                  {peserta.tandaTanganUrl ? (
                    <img src={peserta.tandaTanganUrl} alt={`TTD ${peserta.nama}`}
                      className="h-10 w-auto border border-slate-200 rounded" />
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDownloadBiodata(peserta, kegiatan)}
                      className="inline-flex items-center justify-center p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Cetak Biodata"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePeserta(peserta.id, peserta.nama)}
                      disabled={deletingId === peserta.id}
                      className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Hapus Data"
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
  );
}
