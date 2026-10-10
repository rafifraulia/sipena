"use server";

import { prisma } from "@/lib/prisma";

export async function getPesertaByNik(nik: string) {
  try {
    if (!nik || nik.length < 10) {
      return null;
    }

    // Cari absensi terakhir berdasarkan NIK
    const lastAbsensi = await prisma.absensi.findFirst({
      where: { nik },
      orderBy: { createdAt: "desc" },
    });

    if (!lastAbsensi) {
      return null;
    }

    // Return data untuk autofill (tanpa tanda tangan)
    return {
      nama: lastAbsensi.nama,
      tempatLahir: lastAbsensi.tempatLahir,
      tanggalLahir: lastAbsensi.tanggalLahir,
      pangkatGolongan: lastAbsensi.pangkatGolongan,
      jabatan: lastAbsensi.jabatan,
      pendidikan: lastAbsensi.pendidikan,
      instansi: lastAbsensi.instansi,
      alamatKantor: lastAbsensi.alamatKantor,
      provinsi: lastAbsensi.provinsi,
      kabupatenKota: lastAbsensi.kabupatenKota,
      email: lastAbsensi.email,
      noTelp: lastAbsensi.noTelp,
    };
  } catch (error) {
    console.error("Error fetching peserta by NIK:", error);
    return null;
  }
}
