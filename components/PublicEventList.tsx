"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Calendar, Users, ChevronRight, X, Search, ImageIcon } from "lucide-react";

interface Kegiatan {
  id: string;
  slug: string;
  nama: string;
  subKegiatan: string | null;
  penanggungJawab: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  flyerUrl: string | null;
  _count: {
    absensi: number;
  };
}

interface PublicEventListProps {
  kegiatan: Kegiatan[];
}

export default function PublicEventList({ kegiatan }: PublicEventListProps) {
  const [selectedFlyer, setSelectedFlyer] = useState<string | null>(null);

  const getStatusKegiatan = (tanggalMulai: Date, tanggalSelesai: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const mulai = new Date(tanggalMulai);
    mulai.setHours(0, 0, 0, 0);
    const selesai = new Date(tanggalSelesai);
    selesai.setHours(0, 0, 0, 0);

    if (now >= mulai && now <= selesai) {
      return {
        label: "Sedang Berlangsung",
        color: "bg-green-100 text-green-800",
        canAbsen: true,
      };
    } else if (now < mulai) {
      return {
        label: "Akan Datang",
        color: "bg-blue-100 text-blue-800",
        canAbsen: false,
      };
    }
    return {
      label: "Selesai",
      color: "bg-gray-100 text-gray-800",
      canAbsen: false,
    };
  };

  const formatTanggal = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      {kegiatan.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Belum Ada Kegiatan
          </h3>
          <p className="text-slate-500">
            Saat ini tidak ada kegiatan yang tersedia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kegiatan.map((item) => {
            const status = getStatusKegiatan(
              item.tanggalMulai,
              item.tanggalSelesai
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Flyer Image */}
                {item.flyerUrl ? (
                  <div
                    className="relative w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 cursor-pointer group"
                    onClick={() => setSelectedFlyer(item.flyerUrl)}
                  >
                    <Image
                      src={item.flyerUrl}
                      alt={item.nama}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-90"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-slate-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-white/30" />
                  </div>
                )}

                {/* Card Content */}
                <div className="p-5">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {item._count.absensi}
                      </span>
                    </div>
                  </div>

                  {/* Nama Kegiatan */}
                  <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2">
                    {item.nama}
                  </h3>

                  {/* Dropdown Detail Kegiatan */}
                  <details className="group mb-4">
                    <summary className="cursor-pointer list-none text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-3 space-y-2 text-sm text-slate-600 pl-2">
                      {item.subKegiatan && (
                        <p>
                          <span className="font-medium text-slate-700">Sub Kegiatan:</span>
                          <br />
                          {item.subKegiatan}
                        </p>
                      )}
                      <p>
                        <span className="font-medium text-slate-700">Penanggung Jawab:</span>
                        <br />
                        {item.penanggungJawab}
                      </p>
                    </div>
                  </details>

                  {/* Tanggal */}
                  <div className="flex items-start gap-2 text-sm text-slate-600 mb-4">
                    <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p>{formatTanggal(item.tanggalMulai)}</p>
                      {item.tanggalMulai.toString() !==
                        item.tanggalSelesai.toString() && (
                        <p className="text-xs text-slate-500">
                          s/d {formatTanggal(item.tanggalSelesai)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tombol Isi Absensi */}
                  <Link href={`/absensi/${item.slug}`}>
                    <button
                      disabled={!status.canAbsen}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-500"
                    >
                      <span>Isi Absensi</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Lightbox for Flyer */}
      {selectedFlyer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedFlyer(null)}
        >
          <button
            onClick={() => setSelectedFlyer(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedFlyer}
              alt="Flyer Kegiatan"
              width={1200}
              height={1600}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
