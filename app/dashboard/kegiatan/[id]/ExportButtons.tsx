"use client";

import { Printer, Download, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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
  hariKe: number;
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
  const [showModal, setShowModal] = useState(false);
  const [selectedHari, setSelectedHari] = useState<number | 'all'>(1);
  const [exportType, setExportType] = useState<"pdf" | "excel">("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");

  // Hitung jumlah hari kegiatan
  const calculateJumlahHari = () => {
    const start = new Date(kegiatan.tanggalMulai);
    const end = new Date(kegiatan.tanggalSelesai);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const jumlahHari = calculateJumlahHari();
  const isMultiHari = jumlahHari > 1;

  const handleExportClick = (type: "pdf" | "excel") => {
    if (isMultiHari) {
      setExportType(type);
      setShowModal(true);
    } else {
      if (type === "pdf") {
        handleDownloadPDF(1);
      } else {
        handleDownloadExcel(1);
      }
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus("Memulai export...");
    
    if (exportType === "pdf") {
      if (selectedHari === 'all') {
        handleDownloadPDFAllDays();
      } else {
        handleDownloadPDF(selectedHari);
      }
    } else {
      if (selectedHari === 'all') {
        handleDownloadExcel('all');
      } else {
        handleDownloadExcel(selectedHari);
      }
    }
  };

  // Fungsi Export Excel
  const handleDownloadExcel = async (hariKe: number | 'all') => {
    try {
      // Filter absensi berdasarkan hariKe
      const filteredAbsensi = hariKe === 'all' 
        ? kegiatan.absensi 
        : kegiatan.absensi.filter(p => p.hariKe === hariKe);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Absensi");

      // Baris 1: Nama Kegiatan (Merge A1:O1)
      worksheet.mergeCells("A1:O1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = hariKe === 'all' 
        ? `${kegiatan.nama} - Semua Hari` 
        : (isMultiHari ? `${kegiatan.nama} - Hari ke-${hariKe}` : kegiatan.nama);
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
  const handleDownloadPDF = async (hariKe: number) => {
    try {
      console.log('🚀 Mulai export PDF...');
      
      // Filter absensi berdasarkan hariKe
      const filteredAbsensi = kegiatan.absensi.filter(p => p.hariKe === hariKe);
      console.log(`📊 Total peserta: ${filteredAbsensi.length}`);

      // Buat PDF dengan orientasi portrait
      const doc = new jsPDF({
        orientation: "portrait",
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
      const title = isMultiHari ? `${kegiatan.nama} - Hari ke-${hariKe}` : kegiatan.nama;
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 22, {
        align: "center",
      });

      const tanggalKegiatan = `${new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID")} - ${new Date(kegiatan.tanggalSelesai).toLocaleDateString("id-ID")}`;
      doc.setFontSize(10);
      doc.text(tanggalKegiatan, doc.internal.pageSize.getWidth() / 2, 28, {
        align: "center",
      });

      // Siapkan data untuk tabel
      const tableData = filteredAbsensi.map((peserta, index) => [
        index + 1,
        peserta.nama,
        peserta.nik,
        peserta.instansi,
        "", // Placeholder untuk tanda tangan
      ]);

      // Load semua gambar tanda tangan terlebih dahulu (HANYA untuk filteredAbsensi)
      console.log('📸 Loading signatures...');
      setExportStatus(`Memuat ${filteredAbsensi.length} tanda tangan...`);
      setExportProgress(10);
      
      const signatureImages: { [key: number]: HTMLImageElement } = {};
      
      for (let i = 0; i < filteredAbsensi.length; i++) {
        const peserta = filteredAbsensi[i];
        if (peserta.tandaTanganUrl) {
          try {
            signatureImages[i] = await loadImage(peserta.tandaTanganUrl);
          } catch (error) {
            console.error(`❌ Failed to load signature for ${peserta.nama}:`, error);
          }
        }
        
        // Progress update setiap 50 gambar atau di akhir
        if ((i + 1) % 50 === 0 || i === filteredAbsensi.length - 1) {
          const progress = 10 + Math.floor((i + 1) / filteredAbsensi.length * 60);
          setExportProgress(progress);
          setExportStatus(`Memuat tanda tangan ${i + 1}/${filteredAbsensi.length}...`);
          console.log(`  Loaded ${i + 1}/${filteredAbsensi.length} signatures`);
        }
      }
      console.log('✅ All signatures loaded');
      setExportProgress(70);
      setExportStatus('Membuat tabel PDF...');

      console.log('✅ All signatures loaded');

      // Render tabel dengan autotable
      console.log('📄 Generating PDF table...');
      // Ukuran kertas A4 portrait: 210mm width
      // Margin left + right: 14 + 14 = 28mm
      // Available width: 210 - 28 = 182mm
      autoTable(doc, {
        startY: 35,
        head: [["No", "Nama", "NIP/NIK", "Instansi", "TTD"]],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          cellWidth: "wrap",
        },
        headStyles: {
          fillColor: [146, 208, 80], // Hijau
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 12, halign: "center" },  // No
          1: { cellWidth: 50, halign: "left" },    // Nama
          2: { cellWidth: 35, halign: "left" },    // NIP/NIK
          3: { cellWidth: 55, halign: "left" },    // Instansi
          4: { cellWidth: 30, halign: "center" },  // TTD
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
        margin: { top: 35, right: 14, bottom: 20, left: 14 },
      });

      console.log('✅ PDF table generated');

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

      // Buka PDF di tab baru (preview) alih-alih langsung download
      console.log('🎉 PDF ready! Opening preview...');
      setExportProgress(90);
      setExportStatus('Membuka PDF...');
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Try to open in new tab
      const newWindow = window.open(pdfUrl, '_blank');
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.warn('⚠️ Popup blocked! Falling back to download...');
        // Fallback: trigger download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Daftar_Hadir_${kegiatan.nama}_Hari${hariKe}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Popup diblokir oleh browser. PDF akan didownload otomatis.\n\nTip: Izinkan popup untuk preview PDF di tab baru.');
      }
      
      // Optional: Auto-cleanup URL setelah beberapa detik
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      
      console.log(`✅ Export PDF selesai (${filteredAbsensi.length} peserta)`);
      setExportProgress(100);
      setExportStatus('Selesai!');
      
      // Close progress modal setelah 1 detik
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.\n\nError: " + (error as Error).message);
      setIsExporting(false);
    }
  };

  // Fungsi Export PDF Semua Hari (Gabungan dengan separator per hari)
  const handleDownloadPDFAllDays = async () => {
    try {
      console.log('🚀 Mulai export PDF semua hari...');
      console.log(`📊 Total peserta: ${kegiatan.absensi.length}`);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Group peserta by hari
      const pesertaByHari: { [key: number]: Peserta[] } = {};
      kegiatan.absensi.forEach(p => {
        if (!pesertaByHari[p.hariKe]) {
          pesertaByHari[p.hariKe] = [];
        }
        pesertaByHari[p.hariKe].push(p);
      });

      const hariList = Object.keys(pesertaByHari).map(Number).sort((a, b) => a - b);
      console.log(`📅 Hari yang ada: ${hariList.join(', ')}`);

      let isFirstPage = true;
      let totalProcessed = 0;

      for (const hari of hariList) {
        const pesertaHari = pesertaByHari[hari];
        console.log(`📸 Loading signatures for Hari ${hari} (${pesertaHari.length} peserta)...`);
        
        const progressBase = Math.floor((hariList.indexOf(hari) / hariList.length) * 80);
        setExportStatus(`Memproses Hari ke-${hari} (${pesertaHari.length} peserta)...`);
        setExportProgress(10 + progressBase);

        // Add new page for each day (except first)
        if (!isFirstPage) {
          doc.addPage();
        }
        isFirstPage = false;

        // Header untuk setiap hari
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("DAFTAR HADIR", doc.internal.pageSize.getWidth() / 2, 15, {
          align: "center",
        });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${kegiatan.nama} - Hari ke-${hari}`, doc.internal.pageSize.getWidth() / 2, 22, {
          align: "center",
        });

        const tanggalKegiatan = `${new Date(kegiatan.tanggalMulai).toLocaleDateString("id-ID")} - ${new Date(kegiatan.tanggalSelesai).toLocaleDateString("id-ID")}`;
        doc.setFontSize(10);
        doc.text(tanggalKegiatan, doc.internal.pageSize.getWidth() / 2, 28, {
          align: "center",
        });

        // Load signatures untuk hari ini
        const signatureImages: { [key: number]: HTMLImageElement } = {};
        for (let i = 0; i < pesertaHari.length; i++) {
          const peserta = pesertaHari[i];
          if (peserta.tandaTanganUrl) {
            try {
              signatureImages[i] = await loadImage(peserta.tandaTanganUrl);
            } catch (error) {
              console.error(`❌ Failed to load signature for ${peserta.nama}:`, error);
            }
          }
          
          // Update progress setiap 50 signatures
          if ((i + 1) % 50 === 0 || i === pesertaHari.length - 1) {
            totalProcessed++;
            const hariProgress = Math.floor((i + 1) / pesertaHari.length * 80 / hariList.length);
            setExportProgress(10 + progressBase + hariProgress);
            setExportStatus(`Hari ${hari}: Memuat tanda tangan ${i + 1}/${pesertaHari.length}...`);
            console.log(`  Loaded ${i + 1}/${pesertaHari.length} signatures`);
          }
        }

        // Table data
        const tableData = pesertaHari.map((peserta, index) => [
          index + 1,
          peserta.nama,
          peserta.nik,
          peserta.instansi,
          "",
        ]);

        // Render table
        autoTable(doc, {
          startY: 35,
          head: [["No", "Nama", "NIP/NIK", "Instansi", "TTD"]],
          body: tableData,
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: "linebreak",
            cellWidth: "wrap",
          },
          headStyles: {
            fillColor: [146, 208, 80],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            halign: "center",
            fontSize: 9,
          },
          columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            1: { cellWidth: 50, halign: "left" },
            2: { cellWidth: 35, halign: "left" },
            3: { cellWidth: 55, halign: "left" },
            4: { cellWidth: 30, halign: "center" },
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
          margin: { top: 35, right: 14, bottom: 20, left: 14 },
        });

        console.log(`✅ Hari ${hari} selesai (${pesertaHari.length} peserta)`);
      }

      // Tanda tangan penanggung jawab di halaman terakhir
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

      // Open preview
      console.log('🎉 PDF ready! Opening preview...');
      setExportProgress(90);
      setExportStatus('Membuka PDF...');
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.warn('⚠️ Popup blocked! Falling back to download...');
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `Daftar_Hadir_${kegiatan.nama}_Semua_Hari.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Popup diblokir oleh browser. PDF akan didownload otomatis.\n\nTip: Izinkan popup untuk preview PDF di tab baru.');
      }
      
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      
      console.log(`✅ Export PDF semua hari selesai (${kegiatan.absensi.length} peserta, ${hariList.length} hari)`);
      setExportProgress(100);
      setExportStatus('Selesai!');
      
      // Close progress modal setelah 1 detik
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      alert("Gagal mengunduh PDF. Silakan coba lagi.\n\nError: " + (error as Error).message);
      setIsExporting(false);
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
    <>
      <div className="flex gap-3">
        <button
          onClick={() => handleExportClick("pdf")}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Printer className="h-4 w-4" />
          Cetak PDF
        </button>
        <button
          onClick={() => handleExportClick("excel")}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </button>
      </div>

      {/* Modal Pilihan Hari */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Pilih Hari</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Kegiatan ini berlangsung selama {jumlahHari} hari. Pilih hari yang ingin di-export:
            </p>
            <select
              value={selectedHari}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedHari(val === 'all' ? 'all' : parseInt(val));
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            >
              <option value="all">📋 Semua Hari ({jumlahHari} hari)</option>
              {Array.from({ length: jumlahHari }, (_, i) => i + 1).map((hari) => {
                const pesertaCount = kegiatan.absensi.filter(p => p.hariKe === hari).length;
                return (
                  <option key={hari} value={hari}>
                    Hari ke-{hari} ({pesertaCount} peserta)
                  </option>
                );
              })}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleModalConfirm}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Mengexport PDF...
              </h3>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 mb-3 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              
              {/* Progress Percentage */}
              <p className="text-2xl font-bold text-indigo-600 mb-2">
                {exportProgress}%
              </p>
              
              {/* Status Text */}
              <p className="text-sm text-slate-600">
                {exportStatus}
              </p>
              
              {/* Spinning loader */}
              {exportProgress < 100 && (
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
              
              {/* Success checkmark */}
              {exportProgress === 100 && (
                <div className="mt-4 flex justify-center">
                  <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
