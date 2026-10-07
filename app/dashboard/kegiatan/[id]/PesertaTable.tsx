"use client";

import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
}

interface Kegiatan {
  nama: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
}

interface PesertaTableProps {
  pesertaList: Peserta[];
  kegiatan: Kegiatan;
}

export default function PesertaTable({ pesertaList, kegiatan }: PesertaTableProps) {
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
        const filename = `Biodata_${peserta.nama.replace(/\s+/g, "_")}.pdf`;
        doc.save(filename);
      };
      img.onerror = () => {
        const filename = `Biodata_${peserta.nama.replace(/\s+/g, "_")}.pdf`;
        doc.save(filename);
      };
    } else {
      const filename = `Biodata_${peserta.nama.replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Nama</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">NIK</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Instansi</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Tanda Tangan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {pesertaList.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                Belum ada peserta yang mengisi absensi
              </td>
            </tr>
          ) : (
            pesertaList.map((peserta, index) => (
              <tr key={peserta.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{index + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{peserta.nama}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{peserta.nik}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{peserta.instansi}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{peserta.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {peserta.tandaTanganUrl ? (
                    <img src={peserta.tandaTanganUrl} alt={`TTD ${peserta.nama}`}
                      className="h-12 w-auto border border-slate-200 rounded" />
                  ) : (
                    <span className="text-slate-400">Belum TTD</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button onClick={() => handleDownloadBiodata(peserta, kegiatan)}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    title="Cetak Biodata">
                    <FileText className="h-4 w-4" />
                    Cetak Biodata
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
