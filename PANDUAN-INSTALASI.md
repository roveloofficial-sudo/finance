# Panduan Instalasi ROVELO Finance

ROVELO Finance terdiri dari dua bagian:

| Bagian | Isi | Tempatnya |
|---|---|---|
| **Backend (server)** | `Kode.gs`, `Setup.gs`, `Akuntansi.gs`, `Modul.gs`, `Lainnya.gs`, `appsscript.json` | Google Apps Script (akun Google Owner) |
| **Frontend (tampilan)** | Isi `finance.zip`: `index.html`, `css/`, `js/` | GitHub Pages → `management-rovelo.my.id/finance/` |

Waktu yang dibutuhkan: ± 30 menit. Kerjakan berurutan.

---

## Bagian A — Pasang backend di Google Apps Script

### A1. Buat proyek
1. Login ke Google dengan **akun Owner ROVELO** (akun ini yang akan menyimpan semua data).
2. Buka **https://script.google.com** → klik **New project**.
3. Klik judul "Untitled project" di kiri atas → ganti menjadi **ROVELO Finance API**.

### A2. Tempel file manifest
1. Klik ikon **⚙ Project Settings** (kiri).
2. Centang **Show "appsscript.json" manifest file in editor**.
3. Kembali ke **‹› Editor**, buka `appsscript.json`, hapus semua isinya, tempel isi file `appsscript.json` yang diberikan. Simpan (Ctrl+S).

### A3. Tempel 5 file kode
1. File `Code.gs` bawaan: ganti namanya menjadi **Kode** (klik ⋮ → Rename), hapus isinya, tempel isi `Kode.gs`.
2. Klik **+ → Script** untuk membuat file baru, beri nama **Setup**, tempel isi `Setup.gs`.
3. Ulangi untuk **Akuntansi**, **Modul**, dan **Lainnya**.
4. Simpan semua (Ctrl+S). Pastikan ada 5 file `.gs` + `appsscript.json`.

> Nama file tidak boleh ada `.gs` dobel. Ketik `Setup`, editor otomatis menambah `.gs`.

### A4. Jalankan setup sekali
1. Buka file **Setup.gs**. Di toolbar atas pilih fungsi **setupAppEnvironment** → klik **▶ Run**.
2. Muncul jendela izin → **Review permissions** → pilih akun Owner → **Advanced** → **Go to ROVELO Finance API (unsafe)** → **Allow**.
   (Peringatan "unsafe" muncul karena aplikasi buatan sendiri belum diverifikasi Google — normal.)
3. Tunggu sampai log menampilkan **✅ Setup selesai**.
4. **Catat** baris berikut dari *Execution log* — hanya tampil sekali:
   ```
   🔐 AKUN OWNER PERTAMA
      Username   : owner
      Kata sandi : xxxxxxxxxxxx
   ```
5. Setup membuat di Google Drive: folder **ROVELO Finance** berisi spreadsheet `ROVELO_Finance_DB`, folder `Lampiran`, `Penjualan per Bulan`, dan `Export`. Semua ID & rahasia otomatis tersimpan di **Script Properties** (bukan di kode).

### A5. Pasang penyesuaian otomatis harian
Pilih fungsi **pasangPemicuHarian** → **▶ Run**. Ini menjalankan penyusutan aset & amortisasi sewa setiap malam pukul 01.00 WIB.

### A6. Deploy sebagai Web App
1. Klik **Deploy → New deployment**.
2. Klik ⚙ di samping "Select type" → pilih **Web app**.
3. Isi:
   - Description: `ROVELO Finance v1`
   - Execute as: **Me (email Owner)**
   - Who has access: **Anyone**
4. Klik **Deploy** → salin **Web app URL** (berakhiran `/exec`). Simpan di Notepad.

> "Anyone" diperlukan agar halaman di GitHub Pages bisa memanggil API. Data tetap aman: setiap permintaan wajib membawa token login yang ditandatangani, dan spreadsheet tidak dibagikan ke siapa pun.

### A7. (Opsional) Hubungkan ke ROVELO Inventory
Agar tombol **Sinkron Inventory** bisa mengambil daftar SKU & HPP:
1. Buka spreadsheet ROVELO Inventory, salin ID-nya dari URL (bagian di antara `/d/` dan `/edit`).
2. Di Apps Script: **⚙ Project Settings → Script Properties → Add script property**:
   - `INVENTORY_SS_ID` = ID spreadsheet Inventory
   - `INVENTORY_SHEET` = nama sheet produk (mis. `Produk`)
3. Sheet tersebut harus punya baris judul dengan kolom **SKU** dan **Nama**; kolom **HPP/Modal**, **Harga Jual**, **Varian**, dan **Stok** dibaca bila ada.
4. Akun Owner harus punya akses baca ke spreadsheet Inventory.

> [ASUMSI] Struktur sheet Inventory belum dilihat langsung — pembacaan kolom dibuat fleksibel. Bila sinkron gagal, produk tetap bisa diimpor dari Excel di **Master Data → Produk → Impor Excel**.

---

## Bagian B — Pasang frontend di GitHub Pages

### B1. Isi alamat server
1. Ekstrak `finance.zip`. Hasilnya folder **`finance`** yang langsung berisi `index.html`, `css`, `js`, `README.md`, dan panduan ini.
2. Buka `finance/js/config.js` dengan Notepad, ganti `https://script.google.com/macros/s/GANTI_DENGAN_ID_DEPLOYMENT/exec` dengan URL dari langkah A6. Simpan.

### B2. Tentukan cara yang sesuai dengan ROVELO Inventory
Buka **https://github.com/NAMA-AKUN-ANDA** dan lihat daftar repository.

**Cara 1 — Inventory adalah repository sendiri bernama `inventory`** (paling umum bila domain dipasang di repo `NAMA-AKUN.github.io`):

Buat repository baru bernama persis **`finance`** (Public, tanpa README). Folder kerja Anda adalah folder **`finance`** hasil ekstrak — di folder inilah `git init` dijalankan.

1. Buka folder `finance` di File Explorer → klik address bar → ketik `powershell` → Enter.
2. Pastikan Anda di folder yang benar:
   ```powershell
   dir
   ```
   **`index.html` wajib terlihat langsung**, bersama folder `css` dan `js`. Kalau yang terlihat folder lain, jangan lanjut.
3. Jalankan satu per satu:
   ```powershell
   git init
   git add .
   git commit -m "ROVELO Finance v1"
   git branch -M main
   git remote add origin https://github.com/NAMA-AKUN-ANDA/finance.git
   git push -u origin main
   ```
   Saat diminta password, tempel **Personal Access Token** (bukan password GitHub). Layar memang kosong saat menempel — itu normal.
4. Di repo `finance` di github.com: **Settings → Pages** → Source **Deploy from a branch** → Branch **main** / **(root)** → **Save**.
5. Tunggu 1–2 menit, buka **https://management-rovelo.my.id/finance/**.

**Cara 2 — Inventory adalah folder `inventory` di dalam satu repository portal**:

Folder kerja Anda adalah **folder repository portal** yang sudah ada (yang berisi folder `inventory` dan file `CNAME`), bukan folder `finance`. Jangan `git init` lagi.

1. Salin folder `finance` hasil ekstrak ke dalam folder repository portal, sejajar dengan `inventory`:
   ```
   repo-portal\
   ├── CNAME
   ├── inventory\
   └── finance\        ← index.html ada langsung di sini
   ```
2. Buka PowerShell di folder **repo-portal**, lalu:
   ```powershell
   git add .
   git commit -m "Tambah ROVELO Finance"
   git push
   ```
3. Tunggu 1–2 menit, buka **https://management-rovelo.my.id/finance/**.

### B3. Cek hasil
- Halaman login ROVELO Finance tampil dengan warna oranye dan font rapi.
- Kalau muncul "Alamat server belum diatur", `js/config.js` belum diisi — perbaiki lalu push ulang.
- Kalau tampilan polos tanpa warna, folder `css`/`js` tidak ikut terunggah atau salah tempat — cek struktur repo di github.com.

### B4. Update frontend di kemudian hari
Dari folder kerja yang sama (Cara 1: folder `finance`; Cara 2: folder repo portal):
```powershell
git add .
git commit -m "Perbarui ROVELO Finance"
git push
```
Tekan **Ctrl+Shift+R** di browser bila masih tampil versi lama.

---

## Bagian C — Login pertama & pengaturan awal

1. Buka **management-rovelo.my.id/finance/** → masuk dengan `owner` dan kata sandi dari langkah A4.
2. Anda wajib membuat kata sandi baru (min. 8 karakter, huruf besar, huruf kecil, angka).
3. Urutan pengaturan awal yang disarankan:
   1. **Pengaturan → Profil usaha**: nama, alamat, no. WA, NPWP (opsional), logo, penandatangan laporan.
   2. **Pengaturan → Pajak & aturan**: bentuk usaha (*Perorangan*), cek tarif PPh Final 0,5% dan batas bebas Rp500 juta.
   3. **Master Data → Produk & HPP**: impor dari Excel (unduh *Template* dulu) atau **Sinkron Inventory**.
   4. **Master Data → Channel & biaya**: sesuaikan persentase potongan Shopee/TikTok/Lazada/Tokopedia dengan tarif toko Anda.
   5. **Pembukuan → Saldo awal** (hanya Owner): saldo kas, bank, persediaan, piutang, utang pada tanggal mulai. Isi sekali saja.
   6. **Aset Tetap → Tambah aset** dengan sumber dana *Sudah dimiliki* untuk aset yang sudah ada.
   7. **Gaji → Karyawan baru** untuk setiap karyawan.
   8. **Pengaturan → Pengguna**: buat akun Admin Keuangan, Staf Input, atau Viewer. Kata sandi sementara tampil sekali — berikan langsung ke orangnya.

---

## Bagian D — Memperbarui backend (bila ada versi baru)

1. Tempel kode baru ke file `.gs` yang sesuai, simpan.
2. Jalankan **setupAppEnvironment** lagi bila diminta (aman diulang — tidak menghapus data, hanya menambah kolom/sheet baru).
3. **Deploy → Manage deployments** → klik ✏ pada deployment yang ada → Version: **New version** → **Deploy**.
   URL `/exec` tetap sama, jadi `config.js` tidak perlu diubah.

> Jangan membuat *New deployment* baru — URL akan berubah dan frontend harus diubah juga.

---

## Bagian E — Keamanan & pemeliharaan

| Hal | Keterangan |
|---|---|
| Rahasia | `SESSION_SECRET`, ID spreadsheet/folder, nomor bukti, ID file penjualan bulanan disimpan di **Script Properties**. Tidak ada rahasia di frontend, di sheet, atau di log. |
| Kata sandi | Disimpan sebagai hash + salt. 5 kali salah → akun terkunci 15 menit. Owner bisa reset & buka kunci di Pengaturan → Pengguna. |
| Lupa sandi Owner | Di Apps Script jalankan **resetSandiOwner** → kata sandi baru tampil di Execution log. |
| Paksa semua keluar | Jalankan **rotasiSecretSesi** (mis. bila perangkat hilang). |
| Lampiran | Tersimpan privat di Google Drive Owner, hanya bisa dibuka lewat aplikasi oleh pengguna yang login. |
| Spreadsheet | Jangan dibagikan ke siapa pun dan jangan diedit manual — semua perubahan lewat aplikasi agar jurnal tetap seimbang. |
| Log audit | Semua tambah/ubah/batal/login tercatat di Pengaturan → Log audit (Owner). |
| Data besar | Detail penjualan disimpan di spreadsheet terpisah per bulan (`ROVELO_Penjualan_YYYY-MM`) agar tetap cepat untuk ± 2.500 pesanan/hari. |

---

## Bagian F — Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| "Alamat server belum diatur" | `js/config.js` belum diisi | Isi URL `/exec`, push ulang |
| "Server mengirim balasan tidak terduga" | Web App bukan akses *Anyone*, atau URL salah | Cek A6; pastikan URL berakhiran `/exec` |
| "Tidak bisa terhubung" | Internet putus atau URL salah | Cek koneksi; coba buka URL `/exec` di browser — harus tampil teks JSON |
| "Database belum disiapkan" | `setupAppEnvironment` belum dijalankan | Jalankan A4 |
| Halaman 404 di GitHub Pages | `index.html` tidak berada langsung di folder `finance` | Cek struktur repo; `index.html` harus di root folder/repo `finance` |
| "Periode … sudah dikunci" | Bulan itu sudah ditutup buku | Owner membuka kunci di Pembukuan → Tutup buku (wajib isi alasan) |
| "Server sedang sibuk menyimpan data lain" | Ada impor besar berjalan bersamaan | Tunggu beberapa detik lalu ulangi — data tidak dobel |
| Impor penjualan: SKU belum dikenal | SKU di file belum ada di Master Produk | Klik **Tambah ke master produk** di langkah Periksa, isi HPP |
