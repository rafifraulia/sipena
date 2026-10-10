"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getPengaturan() {
  try {
    let pengaturan = await prisma.pengaturan.findUnique({
      where: { id: 1 },
    });

    // Jika belum ada data, buat data default
    if (!pengaturan) {
      pengaturan = await prisma.pengaturan.create({
        data: {
          id: 1,
          runningText: "Selamat datang di Portal SIPENA - Sistem Informasi Pengelola Kegiatan & Absensi.",
        },
      });
    }

    return pengaturan;
  } catch (error) {
    console.error("Error getting pengaturan:", error);
    throw error;
  }
}

export async function updatePengaturan(runningText: string) {
  try {
    const pengaturan = await prisma.pengaturan.upsert({
      where: { id: 1 },
      update: {
        runningText,
      },
      create: {
        id: 1,
        runningText,
      },
    });

    // Revalidate pages yang menggunakan pengaturan
    revalidatePath("/");
    revalidatePath("/dashboard/pengaturan");

    return { success: true, data: pengaturan };
  } catch (error) {
    console.error("Error updating pengaturan:", error);
    return { success: false, error: "Gagal menyimpan pengaturan" };
  }
}
