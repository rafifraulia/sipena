import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET - Ambil detail kegiatan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id },
      include: {
        absensi: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!kegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(kegiatan);
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Hapus kegiatan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Cek apakah kegiatan ada
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id }
    });

    if (!kegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }

    // Hapus kegiatan (cascade delete akan otomatis hapus absensi terkait)
    await prisma.kegiatan.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting kegiatan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update kegiatan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nama, subKegiatan, penanggungJawab, tanggalMulai, tanggalSelesai } = body;

    // Validasi input
    if (!nama || !penanggungJawab || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json(
        { error: 'Nama kegiatan, penanggung jawab, dan tanggal harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah kegiatan ada
    const existingKegiatan = await prisma.kegiatan.findUnique({
      where: { id }
    });

    if (!existingKegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }

    // Update kegiatan
    const kegiatan = await prisma.kegiatan.update({
      where: { id },
      data: {
        nama,
        subKegiatan: subKegiatan || null,
        penanggungJawab,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
      },
    });

    return NextResponse.json(kegiatan);
  } catch (error: any) {
    console.error('Error updating kegiatan:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}

