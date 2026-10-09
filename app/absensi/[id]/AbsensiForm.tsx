"use client";

import { useRef, useState, FormEvent, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { getPesertaByNik } from "@/app/actions/absensi";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface AbsensiFormProps {
  kegiatanId: string;
  kegiatanNama: string;
}

interface Provinsi {
  id: string;
  name: string;
}

interface Kabupaten {
  id: string;
  name: string;
}

export default function AbsensiForm({ kegiatanId, kegiatanNama }: AbsensiFormProps) {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [pangkatGolongan, setPangkatGolongan] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [pendidikan, setPendidikan] = useState("");
  const [instansi, setInstansi] = useState("");
  const [alamatKantor, setAlamatKantor] = useState("");
  const [email, setEmail] = useState("");
  const [noTelp, setNoTelp] = useState("");
  
  const [provinsiList, setProvinsiList] = useState<Provinsi[]>([]);
  const [kabupatenList, setKabupatenList] = useState<Kabupaten[]>([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKabupaten, setSelectedKabupaten] = useState("");
  const [isLoadingProvinsi, setIsLoadingProvinsi] = useState(false);
  const [isLoadingKabupaten, setIsLoadingKabupaten] = useState(false);
  const [isLoadingAutofill, setIsLoadingAutofill] = useState(false);

  useEffect(() => {
    const loadProvinsi = async () => {
      setIsLoadingProvinsi(true);
      try {
        const response = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        const data = await response.json();
        setProvinsiList(data);
      } catch (error) {
        console.error("Error loading provinsi:", error);
      } finally {
        setIsLoadingProvinsi(false);
      }
    };
    loadProvinsi();
  }, []);

  useEffect(() => {
    const loadKabupaten = async () => {
      if (!selectedProvinsi) {
        setKabupatenList([]);
        setSelectedKabupaten("");
        return;
      }
      setIsLoadingKabupaten(true);
      try {
        const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvinsi}.json`);
        const data = await response.json();
        setKabupatenList(data);
      } catch (error) {
        console.error("Error loading kabupaten:", error);
        setKabupatenList([]);
      } finally {
        setIsLoadingKabupaten(false);
      }
    };
    loadKabupaten();
  }, [selectedProvinsi]);



  useEffect(() => {
    const timer = setTimeout(async () => {
      if (nik.length >= 16) {
        setIsLoadingAutofill(true);
        try {
          const data = await getPesertaByNik(nik);
          if (data) {
            setNama(data.nama);
            setTempatLahir(data.tempatLahir);
            setTanggalLahir(data.tanggalLahir.toISOString().split('T')[0]);
            setPangkatGolongan(data.pangkatGolongan);
            setJabatan(data.jabatan);
            setPendidikan(data.pendidikan);
            setInstansi(data.instansi);
            setAlamatKantor(data.alamatKantor);
            setEmail(data.email);
            setNoTelp(data.noTelp);
            
            // Set provinsi
            const prov = provinsiList.find(p => p.name === data.provinsi);
            if (prov) {
              setSelectedProvinsi(prov.id);
              
              // Load kabupaten untuk provinsi ini, lalu set kabupaten
              try {
                const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${prov.id}.json`);
                const kabData = await response.json();
                setKabupatenList(kabData);
                
                // Set kabupaten setelah list ter-load
                const kab = kabData.find((k: Kabupaten) => k.name === data.kabupatenKota);
                if (kab) {
                  setSelectedKabupaten(kab.id);
                }
              } catch (error) {
                console.error("Error loading kabupaten for autofill:", error);
              }
            }
          }
        } catch (error) {
          console.error("Error autofill:", error);
        } finally {
          setIsLoadingAutofill(false);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [nik, provinsiList]);

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (sigCanvas.current?.isEmpty()) {
      setError("Mohon tanda tangan terlebih dahulu");
      return;
    }
    if (!selectedProvinsi || !selectedKabupaten) {
      setError("Mohon pilih provinsi dan kabupaten/kota");
      return;
    }
    setIsSubmitting(true);
    try {
      const signatureDataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/webp", 0.6);
      const provinsiName = provinsiList.find(p => p.id === selectedProvinsi)?.name || "";
      const kabupatenName = kabupatenList.find(k => k.id === selectedKabupaten)?.name || "";
      const data = {
        kegiatanId, nik, nama, tempatLahir, tanggalLahir, pangkatGolongan,
        jabatan, pendidikan, instansi, alamatKantor,
        provinsi: provinsiName, kabupatenKota: kabupatenName,
        email, noTelp, tandaTanganUrl: signatureDataUrl,
      };
      const response = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan absensi");
      }
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Absensi Berhasil Disimpan!</h2>
        <p className="text-slate-600 mb-6">
          Terima kasih sudah melakukan absensi untuk kegiatan <span className="font-semibold">{kegiatanNama}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            Isi Absensi Lagi
          </button>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">© 2026 SIPENA. Sistem Pengelola Kegiatan & Absensi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
      {isLoadingAutofill && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Memuat data sebelumnya...</p>
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nik" className="block text-sm font-medium text-slate-700 mb-2">
            NIK/NIP <span className="text-red-500">*</span>
          </label>
          <input type="text" id="nik" value={nik} onChange={(e) => setNik(e.target.value.slice(0, 18))}
            maxLength={18} required disabled={isSubmitting} placeholder="Masukkan NIK/NIP (max 18 karakter)"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>
        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-slate-700 mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input type="text" id="nama" value={nama} onChange={(e) => setNama(e.target.value)}
            required disabled={isSubmitting} placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tempatLahir" className="block text-sm font-medium text-slate-700 mb-2">
              Tempat Lahir <span className="text-red-500">*</span>
            </label>
            <input type="text" id="tempatLahir" value={tempatLahir} onChange={(e) => setTempatLahir(e.target.value)}
              required disabled={isSubmitting} placeholder="Kota kelahiran"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="tanggalLahir" className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <input type="date" id="tanggalLahir" value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)}
              required disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
        <div>
          <label htmlFor="pangkatGolongan" className="block text-sm font-medium text-slate-700 mb-2">
            Pangkat/Golongan <span className="text-red-500">*</span>
          </label>
          <select id="pangkatGolongan" value={pangkatGolongan} onChange={(e) => setPangkatGolongan(e.target.value)}
            required disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          >
            <option value="">-- Pilih Pangkat/Golongan --</option>
            <option value="NON PNS">NON PNS</option>
            <option value="I-A">I-A</option>
            <option value="I-B">I-B</option>
            <option value="I-C">I-C</option>
            <option value="I-D">I-D</option>
            <option value="II-A">II-A</option>
            <option value="II-B">II-B</option>
            <option value="II-C">II-C</option>
            <option value="II-D">II-D</option>
            <option value="III-A">III-A</option>
            <option value="III-B">III-B</option>
            <option value="III-C">III-C</option>
            <option value="III-D">III-D</option>
            <option value="IV-A">IV-A</option>
            <option value="IV-B">IV-B</option>
            <option value="IV-C">IV-C</option>
            <option value="IV-D">IV-D</option>
            <option value="IV-E">IV-E</option>
          </select>
        </div>
        <div>
          <label htmlFor="jabatan" className="block text-sm font-medium text-slate-700 mb-2">
            Jabatan <span className="text-red-500">*</span>
          </label>
          <input type="text" id="jabatan" value={jabatan} onChange={(e) => setJabatan(e.target.value)}
            required disabled={isSubmitting} placeholder="Contoh: Kepala Bagian SDM"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>
        <div>
          <label htmlFor="pendidikan" className="block text-sm font-medium text-slate-700 mb-2">
            Pendidikan Terakhir <span className="text-red-500">*</span>
          </label>
          <select id="pendidikan" value={pendidikan} onChange={(e) => setPendidikan(e.target.value)}
            required disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          >
            <option value="">-- Pilih Pendidikan --</option>
            <option value="SMA">SMA</option>
            <option value="S-1">S-1</option>
            <option value="S-2">S-2</option>
            <option value="S-3">S-3</option>
          </select>
        </div>
        <div>
          <label htmlFor="instansi" className="block text-sm font-medium text-slate-700 mb-2">
            Instansi <span className="text-red-500">*</span>
          </label>
          <input type="text" id="instansi" value={instansi} onChange={(e) => setInstansi(e.target.value)}
            required disabled={isSubmitting} placeholder="Nama instansi/organisasi"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>
        <div>
          <label htmlFor="alamatKantor" className="block text-sm font-medium text-slate-700 mb-2">
            Alamat Kantor <span className="text-red-500">*</span>
          </label>
          <textarea id="alamatKantor" value={alamatKantor} onChange={(e) => setAlamatKantor(e.target.value)}
            required disabled={isSubmitting} rows={3} placeholder="Alamat lengkap kantor"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="provinsi" className="block text-sm font-medium text-slate-700 mb-2">
              Provinsi Kantor <span className="text-red-500">*</span>
            </label>
            <select id="provinsi" value={selectedProvinsi} onChange={(e) => setSelectedProvinsi(e.target.value)}
              required disabled={isSubmitting || isLoadingProvinsi}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            >
              <option value="">-- Pilih Provinsi --</option>
              {provinsiList.map((prov) => (
                <option key={prov.id} value={prov.id}>{prov.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="kabupaten" className="block text-sm font-medium text-slate-700 mb-2">
              Kabupaten/Kota Kantor <span className="text-red-500">*</span>
            </label>
            <select id="kabupaten" value={selectedKabupaten} onChange={(e) => setSelectedKabupaten(e.target.value)}
              required disabled={isSubmitting || isLoadingKabupaten || !selectedProvinsi}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            >
              <option value="">-- Pilih Kabupaten/Kota --</option>
              {kabupatenList.map((kab) => (
                <option key={kab.id} value={kab.id}>{kab.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required disabled={isSubmitting} placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="telp" className="block text-sm font-medium text-slate-700 mb-2">
              No. Telp / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input type="tel" id="telp" value={noTelp} onChange={(e) => setNoTelp(e.target.value)}
              required disabled={isSubmitting} placeholder="08xxxxxxxxxx"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tanda Tangan Digital <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 w-full h-40 overflow-hidden">
            <SignatureCanvas ref={sigCanvas} canvasProps={{ className: "w-full h-full cursor-crosshair" }}
              backgroundColor="rgb(248 250 252)"
            />
          </div>
          <button type="button" onClick={clearSignature} disabled={isSubmitting}
            className="text-red-500 hover:text-red-700 text-sm mt-2 font-medium disabled:opacity-50"
          >
            Hapus / Ulangi Tanda Tangan
          </button>
        </div>
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Formulir"}
        </button>
      </form>
      <div className="mt-6 pt-6 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">© 2026 SIPENA. Sistem Pengelola Kegiatan & Absensi</p>
      </div>
    </div>
  );
}
