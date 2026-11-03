# ROVELO Finance — frontend

Aplikasi keuangan ROVELO (SPA HTML/CSS/JS) untuk **management-rovelo.my.id/finance/**.
Backend: Google Apps Script (REST JSON). Panduan lengkap: `PANDUAN-INSTALASI.md`.

## Struktur
```
index.html          halaman tunggal (SPA, navigasi #/...)
css/style.css       sistem desain (oranye ROVELO, Plus Jakarta Sans)
js/config.js        ← isi GAS_URL (alamat Web App /exec) — satu-satunya pengaturan
js/api.js           komunikasi server, cache instan (SWR), gabung permintaan, idempoten
js/ui.js            ikon, format Rupiah/tanggal, drawer, tabel, grafik, PDF & Excel umum
js/akuntan.js       laporan format akuntan: tampilan, PDF (Inconsolata), Excel (Consolas + rumus)
fonts/              Inconsolata & Inter (lisensi SIL OFL) — dipakai saat ekspor PDF
js/app.js           login, menu per peran, router
js/pages/*.js       Dashboard, Transaksi, Penjualan, Piutang/Utang, Gaji, Aset, Pajak,
                    Produk, Simulasi Harga, Laporan, Pembukuan, Master Data, Pengaturan, Panduan
```

## Pustaka (CDN jsDelivr, versi terkunci)
Chart.js 4.4.4 · SheetJS 0.18.5 (baca file impor) · ExcelJS 4.4.0 (ekspor Excel) · jsPDF 2.5.1 · jsPDF-AutoTable 3.8.2 (dimuat hanya saat dibutuhkan).

## Update
```
git add .
git commit -m "Perbarui ROVELO Finance"
git push
```
