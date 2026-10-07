"use client";

import { Printer, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
  createdAt: Date;
}

interface Kegiatan {
  nama: string;
  penanggungJawab: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  absensi: Peserta[];
}

interface ExportButtonsProps {
  kegiatan: Kegiatan;
}

export default function ExportButtons({ kegiatan }: ExportButtonsProps) {

  
  // Fungsi Export Excel
  const handleDownloadExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Absensi");

      // Baris 1: Nama Kegiatan (Merge A1:O1)
      worksheet.mergeCells("A1:O1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = kegiatan.nama;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };

      // Baris 2: Tanggal Kegiatan
      worksheet.mergeCells("A2:O2");
      const dateCell = worksheet.getCell("A2");
      const tanggalKegiatan = `${new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID")} - ${new Date(kegiatan.tanggalSelesai).toLocaleDateString("id-ID")}`;
      dateCell.value = `Tanggal Kegiatan: ${tanggalKegiatan}`;
      dateCell.alignment = { vertical: "middle", horizontal: "center" };

      // Baris 3: Header Kolom
      const headers = [
        "No", "Tanggal", "Nama", "NIP/NIK", "Instansi", "Tempat Lahir",
        "Tanggal Lahir", "Pangkat/Golongan", "Jabatan", "Pendidikan Terakhir",
        "Alamat", "Provinsi", "Kabupaten", "Email", "Telp",
      ];

      worksheet.getRow(3).values = headers;
      
      // Styling Header - Background Hijau Tebal (FF92D050) dan Border
      worksheet.getRow(3).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF92D050" },
        };
        cell.font = { bold: true, color: { argb: "FF000000" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Set column widths
      worksheet.columns = [
        { width: 5 }, { width: 12 }, { width: 25 }, { width: 18 }, { width: 30 },
        { width: 15 }, { width: 15 }, { width: 18 }, { width: 25 }, { width: 20 },
        { width: 35 }, { width: 15 }, { width: 20 }, { width: 25 }, { width: 15 },
      ];

      // Loop Data Absensi
      kegiatan.absensi.forEach((peserta, index) => {
        const rowNumber = index + 4;
        const tanggalAbsensi = new Date(peserta.createdAt).toLocaleDateString("id-ID");
        const tanggalLahir = new Date(peserta.tanggalLahir).toLocaleDateString("id-ID");
        
        const rowData = [
          index + 1, tanggalAbsensi, peserta.nama, peserta.nik, peserta.instansi,
          peserta.tempatLahir, tanggalLahir, peserta.pangkatGolongan, peserta.jabatan,
          peserta.pendidikan, peserta.alamatKantor, peserta.provinsi,
          peserta.kabupatenKota, peserta.email, peserta.noTelp,
        ];

        worksheet.getRow(rowNumber).values = rowData;
        
        // Border untuk setiap sel data
        worksheet.getRow(rowNumber).eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle" };
        });
      });

      // Generate file dan download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `Data_Absensi_${kegiatan.nama.replace(/\s+/g, "_")}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel:", error);
      alert("Gagal mengunduh Excel. Silakan coba lagi.");
    }
  };



  // Fungsi Export PDF Daftar Hadir
  const handleDownloadPDF = async () => {
    try {
      // Buat PDF dengan orientasi landscape
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Judul di tengah atas
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("DAFTAR HADIR", doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(kegiatan.nama, doc.internal.pageSize.getWidth() / 2, 22, {
        align: "center",
      });

      const tanggalKegiatan = `${new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID")} - ${new Date(kegiatan.tanggalSelesai).toLocaleDateString("id-ID")}`;
      doc.setFontSize(10);
      doc.text(tanggalKegiatan, doc.internal.pageSize.getWidth() / 2, 28, {
        align: "center",
      });

      // Siapkan data untuk tabel
      const tableData = kegiatan.absensi.map((peserta, index) => [
        index + 1,
        peserta.nama,
        peserta.nik,
        peserta.instansi,
        "", // Placeholder untuk tanda tangan
      ]);

      // Load semua gambar tanda tangan terlebih dahulu
      const signatureImages: { [key: number]: HTMLImageElement } = {};
      
      for (let i = 0; i < kegiatan.absensi.length; i++) {
        const peserta = kegiatan.absensi[i];
        if (peserta.tandaTanganUrl) {
          try {
            signatureImages[i] = await loadImage(peserta.tandaTanganUrl);
          } catch (error) {
            console.error(`Failed to load signature for ${peserta.nama}:`, error);
          }
        }
      }

      // Render tabel dengan autotable
      autoTable(doc, {
        startY: 35,
        head: [["#", "Nama", "NIP/NIK", "Instansi", "Tanda Tangan"]],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [146, 208, 80], // Hijau
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 },
          3: { cellWidth: 70 },
          4: { cellWidth: 50, halign: "center" },
        },
        didDrawCell: (data) => {
          if (data.column.index === 4 && data.section === "body") {
            const rowIndex = data.row.index;
            const img = signatureImages[rowIndex];
            
            if (img) {
              try {
                const cellX = data.cell.x + 2;
                const cellY = data.cell.y + 2;
                const imgWidth = data.cell.width - 4;
                const imgHeight = data.cell.height - 4;
                
                doc.addImage(img, "PNG", cellX, cellY, imgWidth, imgHeight);
              } catch (error) {
                console.error("Error adding signature image:", error);
              }
            }
          }
        },
        rowPageBreak: "avoid",
        margin: { top: 35, right: 14, bottom: 50, left: 14 },
      });

      // Tanda Tangan Penanggung Jawab
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      const pageWidth = doc.internal.pageSize.getWidth();
      const rightMargin = 40;
      const signatureX = pageWidth - rightMargin - 50;

      const tanggalCetak = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      doc.setFontSize(10);
      doc.text(tanggalCetak, signatureX + 25, finalY + 10, { align: "center" });
      doc.text("Penanggung Jawab,", signatureX + 25, finalY + 16, { align: "center" });

      const nameY = finalY + 40;
      doc.setFont("helvetica", "bold");
      doc.text(kegiatan.penanggungJawab, signatureX + 25, nameY, { align: "center" });
      
      const textWidth = doc.getTextWidth(kegiatan.penanggungJawab);
      doc.line(
        signatureX + 25 - textWidth / 2,
        nameY + 1,
        signatureX + 25 + textWidth / 2,
        nameY + 1
      );

      doc.save(`Daftar_Hadir_${kegiatan.nama.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    }
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDownloadPDF}
        className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Printer className="h-4 w-4" />
        Cetak PDF
      </button>
      <button
        onClick={handleDownloadExcel}
        className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="h-4 w-4" />
        Download Excel
      </button>
    </div>
  );
}
