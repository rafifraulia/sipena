import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { generateShortlink } from '@/lib/utils';

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
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Build where clause
    const where: any = {};

    // Filter by search (nama kegiatan)
    if (search) {
      where.nama = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter by month and/or year
    if (month || year) {
      if (year && month) {
        // Filter by both month and year
        const yearNum = parseInt(year);
        const monthNum = parseInt(month) - 1; // JS months are 0-indexed
        const startOfMonth = new Date(yearNum, monthNum, 1);
        const endOfMonth = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);
        
        where.tanggalMulai = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      } else if (year) {
        // Filter by year only
        const yearNum = parseInt(year);
        const startOfYear = new Date(yearNum, 0, 1);
        const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);
        
        where.tanggalMulai = {
          gte: startOfYear,
          lte: endOfYear,
        };
      }
      // Note: Month-only filter will be applied after fetch (in memory)
      // karena Prisma tidak support extract month dari date dengan mudah
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

    // Filter by month only (in memory) jika hanya bulan yang dipilih tanpa tahun
    let filteredKegiatan = kegiatan;
    if (month && !year) {
      const monthNum = parseInt(month);
      filteredKegiatan = kegiatan.filter(k => {
        const tanggal = new Date(k.tanggalMulai);
        return tanggal.getMonth() + 1 === monthNum; // getMonth() is 0-indexed
      });
    }

    return NextResponse.json(filteredKegiatan);
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
    const { nama, subKegiatan, penanggungJawab, tanggalMulai, tanggalSelesai, flyerUrl } = body;

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
        flyerUrl: flyerUrl || null,
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
