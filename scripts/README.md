# Generate 1000 Peserta Dummy untuk Testing PDF Export

Script ini akan membuat 1000 data peserta dummy lengkap dengan file tanda tangan WebP (~5-10 KB per file) untuk testing performa PDF export.

## 📋 Persiapan

### 1. Install Dependencies

```bash
npm install --save-dev tsx @types/node
npm install canvas
```

### 2. Dapatkan ID Kegiatan

Buka dashboard dan buat kegiatan baru, atau gunakan kegiatan yang sudah ada. Copy ID kegiatan dari URL:

```
http://localhost:3000/dashboard/kegiatan/[ID_KEGIATAN]
                                        ^^^^^^^^^^^^
                                        Copy ID ini
```

## 🚀 Cara Menjalankan

```bash
npx tsx scripts/generate-dummy-peserta.ts <ID_KEGIATAN>
```

**Contoh:**
```bash
npx tsx scripts/generate-dummy-peserta.ts cm3abc123xyz456
```

## ⏱️ Estimasi Waktu

- **1000 peserta**: ~3-5 menit
- **Generate signature WebP**: ~0.1 detik per file
- **Insert database**: ~0.3 detik per record
- **Total**: ~4-5 peserta/detik

## 📊 Output

Script akan menghasilkan:

- ✅ **1000 peserta** di database (tabel `Absensi`)
- ✅ **1000 file WebP** di `public/uploads/signatures/`
- ✅ **Total storage**: ~7.5 MB (rata-rata 7.5 KB per file)
- ✅ **Data realistis**: Nama, NIK, email, no telp, instansi, dll

## 📁 Struktur File Generated

```
public/
└── uploads/
    └── signatures/
        ├── ttd-1728402468123-abc123.webp  (~7 KB)
        ├── ttd-1728402468456-def456.webp  (~7 KB)
        ├── ttd-1728402468789-ghi789.webp  (~7 KB)
        └── ... (1000 files)
```

## 🧪 Testing PDF Export

Setelah script selesai:

1. **Buka halaman detail kegiatan:**
   ```
   http://localhost:3000/dashboard/kegiatan/<ID_KEGIATAN>
   ```

2. **Klik tombol "Cetak PDF"**

3. **Verifikasi:**
   - ✅ PDF ter-generate tanpa timeout
   - ✅ Preview muncul di tab baru
   - ✅ Ukuran file PDF: ~4-5 MB (untuk 1000 peserta)
   - ✅ Waktu generate: ~3-5 detik
   - ✅ Semua tanda tangan muncul dengan jelas

## 📈 Perbandingan Performa

### Sebelum WebP (PNG):
- Ukuran per file: ~20 KB
- Total storage (1000): ~20 MB
- PDF size: ~12 MB
- Generate time: **TIMEOUT** ❌

### Sesudah WebP:
- Ukuran per file: ~7 KB
- Total storage (1000): ~7 MB
- PDF size: ~4-5 MB
- Generate time: **3-5 detik** ✅

**Penghematan: 65%** 🎉

## 🧹 Cleanup (Hapus Data Dummy)

Jika ingin menghapus semua data dummy:

```sql
-- Hapus absensi untuk kegiatan tertentu
DELETE FROM "Absensi" WHERE "kegiatanId" = 'cm3abc123xyz456';
```

Dan hapus file WebP:
```bash
# Windows
Remove-Item -Path "public\uploads\signatures\ttd-*" -Force

# Linux/Mac
rm -f public/uploads/signatures/ttd-*
```

## ⚠️ Catatan

- Script ini untuk **testing/development only**
- Data yang di-generate adalah **dummy** (nama, NIK, email, dll acak)
- Tanda tangan WebP adalah simple text signature (bukan gambar asli)
- Pastikan database sudah terkoneksi dengan benar
- Jangan jalankan di production!

## 🐛 Troubleshooting

### Error: "Cannot find module 'canvas'"
```bash
npm install canvas
```

### Error: "Kegiatan tidak ditemukan"
Pastikan ID kegiatan benar dan sudah ada di database.

### Error: "ENOENT: no such file or directory"
Script akan otomatis membuat folder `public/uploads/signatures/` jika belum ada.

## 📝 Contoh Output Console

```
🚀 Mulai generate 1000 peserta dummy...
📋 Kegiatan: Pelatihan Digitalisasi Pemerintahan
📊 Jumlah hari: 3

✅ 50/1000 (4.2 peserta/detik)
✅ 100/1000 (4.5 peserta/detik)
✅ 150/1000 (4.3 peserta/detik)
...
✅ 1000/1000 (4.4 peserta/detik)

🎉 Selesai! 1000 peserta dalam 227.45 detik
💾 Storage: ~7.32 MB

🧪 Test: http://localhost:3000/dashboard/kegiatan/cm3abc123xyz456
```
