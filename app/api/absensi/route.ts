import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Helper function to save base64 image to file
async function saveBase64Image(base64Data: string): Promise<string> {
  try {
    // Remove data:image/png;base64, prefix
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Generate unique filename
    const filename = `ttd-${Date.now()}-${randomUUID()}.png`;
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

    // Cek duplikasi NIK untuk kegiatan yang sama
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        kegiatanId,
        nik
      }
    });

    if (existingAbsensi) {
      return NextResponse.json(
        { error: 'Anda sudah melakukan absensi untuk kegiatan ini' },
        { status: 409 }
      );
    }

    // Save signature image to file system
    const signatureFilePath = await saveBase64Image(tandaTanganUrl);

    // Simpan absensi dengan path file, bukan base64
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
