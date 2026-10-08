// Script helper untuk mendapatkan list kegiatan dan ID-nya
// Cara menjalankan: npx tsx scripts/list-kegiatan.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listKegiatan() {
  console.log('📋 Daftar Kegiatan:\n');
  
  const kegiatanList = await prisma.kegiatan.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      _count: {
        select: { absensi: true }
      }
    }
  });

  if (kegiatanList.length === 0) {
    console.log('❌ Belum ada kegiatan. Buat kegiatan baru di dashboard terlebih dahulu.\n');
    return;
  }

  kegiatanList.forEach((k, i) => {
    console.log(`${i + 1}. ${k.nama}`);
    console.log(`   ID: ${k.id}`);
    console.log(`   Peserta: ${k._count.absensi} orang`);
    console.log(`   Tanggal: ${k.tanggalMulai.toLocaleDateString('id-ID')} - ${k.tanggalSelesai.toLocaleDateString('id-ID')}`);
    console.log('');
  });

  console.log('💡 Untuk generate 1000 peserta dummy, jalankan:');
  console.log(`   npx tsx scripts/generate-dummy-peserta.ts ${kegiatanList[0].id}`);
  console.log('');
}

listKegiatan()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
