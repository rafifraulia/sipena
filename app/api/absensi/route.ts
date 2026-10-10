import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Helper function to save base64 image to file
async function saveBase64Image(base64Data: string): Promise<string> {
  try {
    // Detect MIME type (WebP or PNG)
    const isWebP = base64Data.startsWith('data:image/webp');
    const isPNG = base64Data.startsWith('data:image/png');
    
    // Remove data URL prefix
    const base64Image = base64Data.replace(/^data:image\/(webp|png);base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Generate unique filename with correct extension
    const ext = isWebP ? '.webp' : '.png';
    const filename = `ttd-${Date.now()}-${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'signatures');
    const filepath = path.join(uploadDir, filename);
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    // Write file
    await writeFile(filepath, buffer);
    
    // Return relative path for database storage
    return `/uploads/signatures/${filename}`;
  } catch (error) {
    console.error('Error saving signature image:', error);
    throw new Error('Failed to save signature image');
  }
}

// Helper function to calculate hariKe
function calculateHariKe(tanggalMulai: Date): number {
  const now = new Date();
  const start = new Date(tanggalMulai);
  
  // Reset time to midnight for accurate day comparison
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Hari ke-1 dimulai dari tanggal mulai (diffDays = 0)
  return diffDays + 1;
}

// POST - Simpan absensi baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      kegiatanId,
      nik,
      nama,
      tempatLahir,
      tanggalLahir,
      pangkatGolongan,
      jabatan,
      pendidikan,
      instansi,
      alamatKantor,
      provinsi,
      kabupatenKota,
      email,
      noTelp,
      tandaTanganUrl,
    } = body;

    // Validasi input required berdasarkan schema
    const requiredFields = {
      kegiatanId, nik, nama, tempatLahir, tanggalLahir,
      pangkatGolongan, jabatan, pendidikan, instansi,
      alamatKantor, provinsi, kabupatenKota, email, noTelp, tandaTanganUrl
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Data wajib belum lengkap', missingFields },
        { status: 400 }
      );
    }

    // Cek apakah kegiatan ada
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId }
    });

    if (!kegiatan) {
      return NextResponse.json(
        { error: 'Kegiatan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hitung hariKe secara dinamis
    const hariKe = calculateHariKe(kegiatan.tanggalMulai);

    // Validasi: Cek apakah sudah absen untuk hari ini
    const existingAbsensiToday = await prisma.absensi.findFirst({
      where: {
        kegiatanId,
        nik,
        hariKe
      }
    });

    if (existingAbsensiToday) {
      return NextResponse.json(
        { error: 'Anda sudah melakukan absensi untuk hari ini' },
        { status: 409 }
      );
    }

    // Save signature image to file system
    const signatureFilePath = await saveBase64Image(tandaTanganUrl);

    // Simpan absensi dengan hariKe
    const absensi = await prisma.absensi.create({
      data: {
        kegiatanId,
        nik,
        nama,
        tempatLahir,
        tanggalLahir: new Date(tanggalLahir),
        pangkatGolongan,
        jabatan,
        pendidikan,
        instansi,
        alamatKantor,
        provinsi,
        kabupatenKota,
        email,
        noTelp,
        tandaTanganUrl: signatureFilePath,
        hariKe,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Absensi berhasil disimpan',
      data: {
        ...absensi,
        signatureUrl: signatureFilePath
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error saving absensi:', error);
    return NextResponse.json({
      error: 'Gagal menyimpan absensi',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Hapus absensi berdasarkan ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID absensi tidak ditemukan' },
        { status: 400 }
      );
    }

    // Cek apakah absensi ada
    const absensi = await prisma.absensi.findUnique({
      where: { id }
    });

    if (!absensi) {
      return NextResponse.json(
        { error: 'Data absensi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hapus file tanda tangan dari filesystem (optional, untuk cleanup)
    if (absensi.tandaTanganUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', absensi.tandaTanganUrl);
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
      } catch (error) {
        console.warn('Failed to delete signature file:', error);
        // Continue dengan delete DB meskipun file gagal dihapus
      }
    }

    // Hapus dari database
    await prisma.absensi.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Data absensi berhasil dihapus'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting absensi:', error);
    return NextResponse.json({
      error: 'Gagal menghapus data absensi',
      details: error.message
    }, { status: 500 });
  }
}
