/**
 * Script untuk generate 1000 peserta dummy dengan tanda tangan WebP
 * 
 * Cara menjalankan:
 * npx tsx scripts/generate-dummy-peserta.ts <kegiatanId>
 * 
 * Contoh:
 * npx tsx scripts/generate-dummy-peserta.ts cm1abc123xyz
 */

import { PrismaClient } from '@prisma/client';
import { createCanvas } from 'canvas';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Data dummy untuk generate
const namaDepan = ['Agus', 'Budi', 'Citra', 'Dian', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Indah', 'Joko', 'Kartika', 'Lina', 'Made', 'Nur', 'Omar', 'Putri', 'Qori', 'Rini', 'Siti', 'Tono', 'Umar', 'Vina', 'Wati', 'Xena', 'Yusuf', 'Zahra'];
const namaBelakang = ['Saputra', 'Wati', 'Kusuma', 'Permana', 'Santoso', 'Utomo', 'Wijaya', 'Pratama', 'Lestari', 'Hidayat', 'Kurniawan', 'Rahayu', 'Setiawan', 'Handayani', 'Nugroho', 'Maharani'];
const tempatLahir = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Bekasi', 'Bogor', 'Yogyakarta', 'Malang', 'Denpasar', 'Manado', 'Padang'];
const pangkat = ['Pengatur Muda (II/a)', 'Pengatur Muda Tk.I (II/b)', 'Pengatur (II/c)', 'Pengatur Tk.I (II/d)', 'Penata Muda (III/a)', 'Penata Muda Tk.I (III/b)', 'Penata (III/c)', 'Penata Tk.I (III/d)'];
const jabatan = ['Staf', 'Kabag', 'Kasubag', 'Kasi', 'Kasubbag', 'Sekretaris', 'Kabid', 'Kepala Dinas', 'Analis', 'Perencana'];
const pendidikan = ['SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
const instansi = ['Dinas Pendidikan', 'Dinas Kesehatan', 'Dinas PUPR', 'Bappeda', 'BKD', 'Dinas Sosial', 'Dinas Pertanian', 'Dinas Perhubungan'];
const provinsi = ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Sumatera Utara', 'Bali'];
const kabupatenMap: Record<string, string[]> = {
  'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat'],
  'Jawa Barat': ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cimahi'],
  'Jawa Tengah': ['Semarang', 'Solo', 'Magelang', 'Salatiga'],
  'Jawa Timur': ['Surabaya', 'Malang', 'Kediri', 'Blitar'],
  'Sumatera Utara': ['Medan', 'Binjai', 'Pematangsiantar'],
  'Bali': ['Denpasar', 'Badung', 'Gianyar', 'Tabanan']
};

// Generate signature WebP menggunakan canvas
async function generateSignatureWebP(nama: string): Promise<string> {
  try {
    const canvas = createCanvas(300, 150);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 300, 150);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'italic 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const signatureText = nama.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    ctx.fillText(signatureText, 150, 75);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 110);
    ctx.lineTo(250, 110);
    ctx.stroke();

    // Convert to buffer dengan type assertion (canvas types terbatas)
    const buffer = canvas.toBuffer('image/png');

    const filename = `ttd-${Date.now()}-${randomUUID()}.png`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'signatures');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return `/uploads/signatures/${filename}`;
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
}

// Helper functions
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateNIK(): string {
  let nik = '';
  for (let i = 0; i < 16; i++) {
    nik += Math.floor(Math.random() * 10);
  }
  return nik;
}

function generateTanggalLahir(): Date {
  const year = 1970 + Math.floor(Math.random() * 40);
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

function generateEmail(nama: string): string {
  const cleanNama = nama.toLowerCase().replace(/\s+/g, '.');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];
  return `${cleanNama}${Math.floor(Math.random() * 100)}@${randomItem(domains)}`;
}

function generatePhone(): string {
  return `08${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
}

async function generateDummyPeserta(kegiatanId: string, jumlah: number = 1000) {
  console.log(`🚀 Mulai generate ${jumlah} peserta dummy...`);
  
  const kegiatan = await prisma.kegiatan.findUnique({ where: { id: kegiatanId } });
  if (!kegiatan) {
    console.error(`❌ Kegiatan ${kegiatanId} tidak ditemukan!`);
    process.exit(1);
  }

  console.log(`📋 Kegiatan: ${kegiatan.nama}`);
  
  const start = new Date(kegiatan.tanggalMulai);
  const end = new Date(kegiatan.tanggalSelesai);
  const jumlahHari = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`📊 Jumlah hari: ${jumlahHari}\n`);

  const startTime = Date.now();
  let successCount = 0;

  for (let i = 0; i < jumlah; i++) {
    try {
      const nama = `${randomItem(namaDepan)} ${randomItem(namaBelakang)}`;
      const prov = randomItem(provinsi);
      const kab = randomItem(kabupatenMap[prov]);
      const hariKe = Math.floor(Math.random() * jumlahHari) + 1;
      const tandaTanganUrl = await generateSignatureWebP(nama);

      await prisma.absensi.create({
        data: {
          kegiatanId,
          nik: generateNIK(),
          nama,
          tempatLahir: randomItem(tempatLahir),
          tanggalLahir: generateTanggalLahir(),
          pangkatGolongan: randomItem(pangkat),
          jabatan: randomItem(jabatan),
          pendidikan: randomItem(pendidikan),
          instansi: randomItem(instansi),
          alamatKantor: `Jl. Sudirman No. ${Math.floor(Math.random() * 100) + 1}`,
          provinsi: prov,
          kabupatenKota: kab,
          email: generateEmail(nama),
          noTelp: generatePhone(),
          tandaTanganUrl,
          hariKe
        }
      });

      successCount++;
      if ((i + 1) % 50 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = ((i + 1) / parseFloat(elapsed)).toFixed(1);
        console.log(`✅ ${i + 1}/${jumlah} (${rate} peserta/detik)`);
      }
    } catch (error: any) {
      console.error(`❌ Error #${i + 1}:`, error.message);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 Selesai! ${successCount} peserta dalam ${totalTime} detik`);
  console.log(`💾 Storage: ~${(successCount * 7.5 / 1024).toFixed(2)} MB`);
  console.log(`\n🧪 Test: http://localhost:3000/dashboard/kegiatan/${kegiatanId}`);
}

const kegiatanId = process.argv[2];
if (!kegiatanId) {
  console.error('❌ Usage: npx tsx scripts/generate-dummy-peserta.ts <kegiatanId>');
  process.exit(1);
}

generateDummyPeserta(kegiatanId, 1000)
  .catch(console.error)
  .finally(() => prisma.$disconnect());

