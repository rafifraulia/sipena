import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { generateShortlink } from '@/lib/utils';

const prisma = new PrismaClient();

// GET - Ambil semua kegiatan
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const date = searchParams.get('date');

    // Build where clause
    const where: any = {};

    // Filter by search (nama kegiatan)
    if (search) {
      where.nama = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter by date (tanggal mulai atau selesai mencakup tanggal tersebut)
    if (date) {
      const filterDate = new Date(date);
      where.OR = [
        {
          tanggalMulai: {
            lte: filterDate,
          },
          tanggalSelesai: {
            gte: filterDate,
          },
        },
        {
          tanggalMulai: {
            equals: filterDate,
          },
        },
        {
          tanggalSelesai: {
            equals: filterDate,
          },
        },
      ];
    }

    const kegiatan = await prisma.kegiatan.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { absensi: true }
        }
      }
    });

    return NextResponse.json(kegiatan);
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Buat kegiatan baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, subKegiatan, penanggungJawab, tanggalMulai, tanggalSelesai } = body;

    // Validasi input
    if (!nama || !penanggungJawab || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json(
        { error: 'Nama kegiatan, penanggung jawab, dan tanggal harus diisi' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    try {
      // Check uniqueness and regenerate if needed
      while (!isUnique && attempts < maxAttempts) {
        slug = generateShortlink();
        const existing = await prisma.kegiatan.findUnique({
          where: { slug }
        });
        
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique slug after ' + maxAttempts + ' attempts');
      }
    } catch (slugError: any) {
      console.error('Error generating slug:', slugError);
      // Fallback: use timestamp-based slug
      slug = Date.now().toString(36).substring(0, 6);
    }

    console.log('Generated slug:', slug);

    // Buat kegiatan baru
    const kegiatan = await prisma.kegiatan.create({
      data: {
        slug: slug!,
        nama,
        subKegiatan: subKegiatan || null,
        penanggungJawab,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
      },
    });

    return NextResponse.json(kegiatan, { status: 201 });
  } catch (error: any) {
    console.error('Error creating kegiatan:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
