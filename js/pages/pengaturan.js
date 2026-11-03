/* ROVELO Finance — Pengaturan (profil, aturan pajak, pengguna, export, log audit) & Panduan */
(function () {
  const R = window.R;
  const esc = R.esc;
  const sp = { tab: 'profil', audit: { cari: '', username: '', aksi: '', hal: 1 } };
  function sandiAcak() {
    const h = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', a = new Uint32Array(12); crypto.getRandomValues(a);
    let s = Array.from(a, (x) => h[x % h.length]).join('');
    if (!/[A-Z]/.test(s) || !/[a-z]/.test(s) || !/\d/.test(s)) return sandiAcak();
    return s;
  }

  R.halaman.pengaturan = {
    judul: 'Pengaturan', roles: R.PERAN.OA,
    render(el, q, sub, nav) {
      const O = R.peran() === R.PERAN.O;
      if (q.tab) sp.tab = q.tab;
      const T = [{ id: 'profil', label: 'Profil usaha' }, { id: 'aturan', label: 'Pajak & aturan' }].concat(O ? [{ id: 'pengguna', label: 'Pengguna' }, { id: 'export', label: 'Export data' }, { id: 'audit', label: 'Log audit' }] : []);
      if (!T.some((t) => t.id === sp.tab)) sp.tab = 'profil';
      el.innerHTML = '<div class="page-head"><div><h2>Pengaturan</h2><p>' + (O ? 'Owner mengatur profil usaha, aturan, dan akses pengguna.' : 'Hanya Owner yang dapat mengubah pengaturan.') + '</p></div></div><div data-tabs></div><div data-isi></div>';
      const isi = el.querySelector('[data-isi]');
      const buka = (t) => { sp.tab = t; R.ubahQuery({ tab: t }); R.tabs(el.querySelector('[data-tabs]'), T, t, buka); ({ profil: profil, aturan: aturan, pengguna: pengguna, export: ekspor, audit: audit })[t](isi, nav, O); };
      buka(sp.tab);
    }
  };

  function formNilai(el, nav, O, render, kunci) {
    el.innerHTML = R.kerangka(6);
    R.api.get('pengaturan.get', {}).then((d) => {
      if (!R.masihDi(nav)) return;
      el.innerHTML = '<form class="card" novalidate>' + render(d.nilai, d) + (O ? '<div class="actions mt-l"><button class="btn primary">' + R.ic('check', 's18') + ' Simpan pengaturan</button></div>' : '') + '</form>';
      const f = el.querySelector('form');
      R.inpRpSemua(f);
      if (!O) R.$$('input,select,textarea,button', f).forEach((i) => { i.disabled = true; });
      f.onsubmit = async (e) => {
        e.preventDefault(); const b = f.querySelector('.btn.primary'); b.classList.add('busy');
        const n = {}; kunci.forEach((k) => { const i = f.elements[k]; if (i) n[k] = i.dataset.rp !== undefined ? String(R.nilai(i.value)) : i.value; });
        if (f._logo !== undefined) n.logo_data = f._logo;
        R.$$('.field.bad', f).forEach((x) => x.classList.remove('bad'));
        try { const r = await R.api.call('pengaturan.save', { nilai: n }); R.toast(r._pesan); await R.app.muatUlangBoot(); }
        catch (ex) { R.galat(ex); if (ex.fields) Object.keys(ex.fields).forEach((k) => { const i = f.elements[k]; if (i) { const fl = i.closest('.field'); fl.classList.add('bad'); const er = fl.querySelector('.err'); if (er) er.textContent = ex.fields[k]; } }); }
        finally { b.classList.remove('busy'); }
      };
      if (f.querySelector('[data-logo]')) logo(f);
    }).catch((e) => R.gagalMuat(e, el, () => formNilai(el, nav, O, render, kunci)));
  }
  const fld = (n, l, v, t, x, hint) => '<div class="field ' + (x || '') + '"><label>' + l + '</label>' + (t === 'area' ? '<textarea class="inp" name="' + n + '">' + esc(v || '') + '</textarea>' : '<input class="inp" name="' + n + '" ' + (t === 'rp' ? 'data-rp inputmode="numeric"' : 'type="' + (t || 'text') + '"') + ' value="' + esc(t === 'rp' ? (v ? R.angka(v) : '') : (v || '')) + '">') + (hint ? '<span class="hint">' + hint + '</span>' : '') + '<div class="err"></div></div>';

  function profil(el, nav, O) {
    formNilai(el, nav, O, (v) => '<div class="grid g-2-1"><div class="fgrid">' + fld('nama_usaha', 'Nama usaha', v.nama_usaha, 'text', 'full') + fld('alamat', 'Alamat', v.alamat, 'area', 'full') + fld('no_hp', 'No. WhatsApp', v.no_hp) + fld('email', 'Email usaha', v.email, 'email') + fld('npwp', 'NPWP', v.npwp, 'text', '', 'Opsional, tampil di kop laporan') + fld('pembuat_laporan', 'Dibuat oleh', v.pembuat_laporan, 'text', '', 'Nama di kolom tanda tangan "Dibuat oleh"') + fld('pemeriksa_laporan', 'Diperiksa oleh', v.pemeriksa_laporan, 'text', '', 'Nama di kolom "Diperiksa oleh"') + fld('penandatangan', 'Disetujui oleh', v.penandatangan, 'text', '', 'Nama di kolom "Disetujui oleh" (biasanya pemilik)') +
      '<div class="field"><label>Warna aksen</label><input type="color" class="inp" name="warna_aksen" value="' + esc(v.warna_aksen || '#F97316') + '" style="padding:4px;width:80px"></div></div>' +
      '<div><div class="field"><label>Logo</label><div class="drop" data-logo style="padding:16px">' + (v.logo_data ? '<img alt="Logo" src="' + esc(v.logo_data) + '" style="max-height:110px;margin:0 auto 8px">' : R.ic('image', 's24')) + '<div class="small">Klik untuk ' + (v.logo_data ? 'mengganti' : 'mengunggah') + ' logo (PNG/JPG)</div><div class="xs faint">Dipakai di kop laporan PDF & slip gaji</div></div><input type="file" accept="image/png,image/jpeg,image/webp" hidden data-lf>' + (v.logo_data && O ? '<button type="button" class="btn sm ghost mt" data-hl>' + R.ic('trash', 's16') + ' Hapus logo</button>' : '') + '<div class="err"></div></div></div></div>',
    ['nama_usaha', 'alamat', 'no_hp', 'email', 'npwp', 'pembuat_laporan', 'pemeriksa_laporan', 'penandatangan', 'warna_aksen']);
  }
  function logo(f) {
    const drop = f.querySelector('[data-logo]'), inp = f.querySelector('[data-lf]');
    drop.onclick = () => { if (!inp.disabled) inp.click(); };
    inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      try {
        let k = await R.kompres(file, 240, 0.92, 'image/png');
        if (k.url.length > 48000) k = await R.kompres(file, 200, 0.85, 'image/jpeg');
        if (k.url.length > 48000) k = await R.kompres(file, 140, 0.8, 'image/jpeg');
        if (k.url.length > 48000) throw new Error('Logo terlalu detail. Gunakan gambar yang lebih sederhana.');
        f._logo = k.url;
        drop.innerHTML = '<img alt="Logo" src="' + k.url + '" style="max-height:110px;margin:0 auto 8px"><div class="small pos">Logo baru — klik Simpan pengaturan</div>';
      } catch (e) { R.galat(e); }
    };
    const h = f.querySelector('[data-hl]'); if (h) h.onclick = () => { f._logo = ''; drop.innerHTML = R.ic('image', 's24') + '<div class="small">Logo akan dihapus — klik Simpan pengaturan</div>'; };
  }

  function aturan(el, nav, O) {
    formNilai(el, nav, O, (v, d) => '<div class="grid g2"><div><h3 class="sec">Pajak UMKM</h3><div class="stack mt">' +
      '<div class="field"><label>Bentuk usaha</label><select class="inp" name="bentuk_usaha">' + d.bentuk.map((b) => '<option ' + (b === v.bentuk_usaha ? 'selected' : '') + '>' + b + '</option>').join('') + '</select><span class="hint">Perorangan: bebas pajak untuk omzet Rp500 juta pertama/tahun. PT Perorangan: tarif final tanpa batas bebas. CV/PT: tidak memakai PPh Final UMKM di aplikasi ini.</span></div>' +
      fld('tarif_pph_final', 'Tarif PPh Final (%)', v.tarif_pph_final, 'number') + fld('bebas_omzet_op', 'Omzet bebas pajak per tahun (orang pribadi)', v.bebas_omzet_op, 'rp') + fld('batas_omzet_umkm', 'Batas omzet UMKM per tahun', v.batas_omzet_umkm, 'rp') +
      fld('tgl_batas_setor', 'Batas tanggal setor (bulan berikutnya)', v.tgl_batas_setor, 'number') + fld('akun_omzet', 'Akun yang dihitung sebagai omzet pajak', v.akun_omzet, 'text', '', 'Pisahkan dengan koma, mis. 4-1101,4-1102') + '</div></div>' +
      '<div><h3 class="sec">Aturan aplikasi</h3><div class="stack mt">' + fld('batas_lampiran', 'Pengeluaran wajib foto bukti mulai', v.batas_lampiran, 'rp') + fld('ambang_dana_tertahan_hari', 'Peringatan dana marketplace tertahan (hari)', v.ambang_dana_tertahan_hari, 'number') +
      fld('tanggal_mulai', 'Tanggal mulai memakai aplikasi', v.tanggal_mulai, 'date', '', 'Terisi otomatis saat saldo awal disimpan') + fld('calk_catatan', 'Catatan tambahan untuk CALK', v.calk_catatan, 'area') +
      '<div class="alert ' + (d.pemicu ? 'g' : 'w') + '">' + R.ic(d.pemicu ? 'check' : 'alert', 's18') + '<span>' + (d.pemicu ? 'Penyesuaian otomatis harian aktif (penyusutan & amortisasi tiap malam).' : 'Pemicu harian belum terpasang. Jalankan fungsi <b>pasangPemicuHarian</b> sekali di editor Apps Script.') + '</span></div>' +
      '<div class="alert ' + (d.inventory_terhubung ? 'g' : '') + '">' + R.ic(d.inventory_terhubung ? 'link' : 'info', 's18') + '<span>' + (d.inventory_terhubung ? 'Terhubung ke ROVELO Inventory untuk sinkron produk & HPP.' : 'Belum terhubung ke ROVELO Inventory. Isi Script Property INVENTORY_SS_ID (lihat panduan instalasi).') + '</span></div></div></div></div>',
    ['bentuk_usaha', 'tarif_pph_final', 'bebas_omzet_op', 'batas_omzet_umkm', 'tgl_batas_setor', 'akun_omzet', 'batas_lampiran', 'ambang_dana_tertahan_hari', 'tanggal_mulai', 'calk_catatan']);
  }

  function pengguna(el, nav) {
    const P = R.PERAN;
    el.innerHTML = '<div class="grid g-2-1"><div class="card p0"><div class="card-head"><h3 class="sec">Pengguna</h3><button class="btn sm primary" data-tbh>' + R.ic('plus', 's16') + ' Pengguna</button></div><div data-list>' + R.kerangka(4) + '</div></div>' +
      '<div class="card lav"><h3 class="sec">Hak akses peran</h3><table class="tbl compact mt" style="background:transparent"><tbody>' + [['Owner', 'Semua fitur, pengguna, export, log audit, buka kunci periode'], ['Admin Keuangan', 'Input, posting, impor, gaji, aset, pembukuan, laporan'], ['Staf Input', 'Catat transaksi & penjualan manual (jadi Draft), lihat data sendiri'], ['Viewer', 'Hanya melihat dashboard & laporan']].map((x) => '<tr><td><b>' + x[0] + '</b><span class="t2">' + x[1] + '</span></td></tr>').join('') + '</tbody></table></div></div>';
    const muat = () => R.api.get('pengguna.list', {}).then((d) => {
      if (!R.masihDi(nav)) return;
      R.tabel(el.querySelector('[data-list]'), { baris: d, klik: form, kolom: [
        { k: 'nama', label: 'Nama', lead: true, render: (u) => '<span class="row" style="gap:10px;display:inline-flex;align-items:center">' + R.avatar(u, 34) + '<span><b>' + esc(u.nama) + '</b><span class="t2">@' + esc(u.username) + '</span></span></span>' }, { k: 'peran', label: 'Peran', render: (u) => '<span class="badge ' + (u.peran === P.O ? 'k' : u.peran === P.A ? 'o' : u.peran === P.S ? 'b' : '') + '">' + esc(u.peran) + '</span>' },
        { k: 'login_terakhir', label: 'Login terakhir', render: (u) => u.login_terakhir ? R.waktu(u.login_terakhir) : '–' },
        { k: 'aktif', label: 'Status', render: (u) => !u.aktif ? '<span class="badge">Nonaktif</span>' : u.terkunci ? '<span class="badge r">' + R.ic('lock', 's16') + ' Terkunci</span>' : u.wajib_ganti_sandi ? '<span class="badge a">Belum ganti sandi</span>' : '<span class="badge g">Aktif</span>' }] });
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    function tampilSandi(judul, nama, sandi) {
      const d = R.drawer({ judul: judul, isi: '<div class="alert g">' + R.ic('check', 's18') + '<span>Berikan kata sandi sementara ini langsung kepada <b>' + esc(nama) + '</b> (jangan lewat grup). Sandi wajib diganti saat login pertama.</span></div><div class="card flat mt center"><div class="xs muted">Kata sandi sementara</div><div class="num" style="font-size:26px;font-weight:800;letter-spacing:.06em" data-s>' + esc(sandi) + '</div><button class="btn sm mt" data-cp>' + R.ic('file', 's16') + ' Salin</button></div><p class="xs faint mt">Sandi ini tidak disimpan dan tidak bisa dilihat lagi setelah jendela ditutup.</p>' });
      d.body.querySelector('[data-cp]').onclick = () => { try { navigator.clipboard.writeText(sandi); R.toast('Disalin.'); } catch (e) { R.toast('Salin manual.', 'info'); } };
    }
    function form(u) {
      const baru = !u; u = u || { peran: P.S, aktif: true };
      const sendiri = !baru && u.username === R.boot.user.username;
      const d = R.drawer({ judul: baru ? 'Pengguna baru' : 'Ubah ' + u.nama, isi: (!baru ? '<div class="row mb" style="gap:12px"><div class="foto-edit" data-foto>' + R.avatar(u, 56) + '<span class="fe-ic">' + R.ic('camera', 's16') + '</span></div><div class="small muted">Ketuk foto untuk mengganti foto profil ' + esc(u.nama) + '.</div></div>' : '') + '<form class="stack" novalidate>' + (baru ? '<div class="field"><label>Username</label><input class="inp" name="username" autocapitalize="none" placeholder="huruf kecil, angka, titik"></div>' : '<div class="kv"><dt>Username</dt><dd>@' + esc(u.username) + '</dd></div>') +
        '<div class="field"><label>Nama</label><input class="inp" name="nama" value="' + esc(u.nama || '') + '"></div><div class="field"><label>Peran</label><select class="inp" name="peran" ' + (sendiri ? 'disabled' : '') + '>' + [P.O, P.A, P.S, P.V].map((p) => '<option ' + (p === u.peran ? 'selected' : '') + '>' + p + '</option>').join('') + '</select></div>' +
        (!baru ? '<label class="check"><input type="checkbox" name="aktif" ' + (u.aktif ? 'checked' : '') + ' ' + (sendiri ? 'disabled' : '') + '> Akun aktif</label>' : '<div class="alert">' + R.ic('key', 's18') + '<span>Kata sandi sementara dibuat otomatis setelah disimpan.</span></div>') + '</form>' +
        (!baru && !sendiri ? '<hr class="divider"><button class="btn block" data-reset>' + R.ic('key', 's18') + ' Reset kata sandi & buka kunci</button>' : ''),
        kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan</button>' });
      d.foot.querySelector('[data-x2]').onclick = () => d.tutup();
      d.foot.querySelector('[data-ok]').onclick = async (e) => {
        const f = d.body.querySelector('form'), b = e.currentTarget; b.classList.add('busy');
        const sandi = baru ? sandiAcak() : '';
        try {
          const r = await R.api.call('pengguna.save', { baru: baru, username: baru ? f.username.value.trim().toLowerCase() : u.username, nama: f.nama.value, peran: f.peran.value, aktif: baru ? true : f.aktif.checked, sandi_awal: sandi });
          d.tutup(); R.toast(r._pesan); muat();
          if (baru) tampilSandi('Pengguna dibuat', f.nama.value, sandi);
        } catch (ex) { R.galat(ex); b.classList.remove('busy'); }
      };
      const fe = d.body.querySelector('[data-foto]');
      if (fe) fe.onclick = () => R.gantiFoto(u.username, (foto) => { u.foto = foto; fe.querySelector('.avatar').outerHTML = R.avatar(u, 56); muat(); });
      const rs = d.body.querySelector('[data-reset]');
      if (rs) rs.onclick = async () => {
        if (!await R.konfirmasi({ judul: 'Reset kata sandi ' + u.nama + '?', pesan: 'Semua sesi ' + u.nama + ' akan keluar. Sandi sementara baru dibuat.', ok: 'Reset', ikon: 'key' })) return;
        const s = sandiAcak();
        try { await R.api.call('pengguna.resetSandi', { username: u.username, sandi_baru: s }); d.tutup(); muat(); tampilSandi('Kata sandi direset', u.nama, s); } catch (ex) { R.galat(ex); }
      };
    }
    el.querySelector('[data-tbh]').onclick = () => form(null);
    muat();
  }

  function ekspor(el) {
    const ini = +R.hariIni().slice(0, 4);
    el.innerHTML = '<div class="grid g2"><div class="card"><h3 class="sec">Export semua data</h3><p class="sec-sub">Satu file Excel berisi seluruh laporan & data per tahun: ringkasan bulanan, laba rugi, neraca, arus kas, perubahan ekuitas, jurnal umum, pengeluaran, pemasukan, kas, penjualan per channel & produk, gaji, karyawan, aset, pajak, piutang, utang, COA, kategori, kontak, produk, pencairan.</p>' +
      '<div class="row mt"><select class="inp" data-th style="width:auto">' + Array.from({ length: 6 }, (_, i) => ini - i).map((y) => '<option>' + y + '</option>').join('') + '</select><button class="btn primary" data-go>' + R.ic('download', 's18') + ' Unduh Excel</button></div><div data-st class="mt"></div></div>' +
      '<div class="card"><h3 class="sec">File detail penjualan per bulan</h3><p class="sec-sub">Detail pesanan disimpan di Google Sheets terpisah per bulan (agar cepat untuk 2.500 pesanan/hari). Buka langsung untuk arsip lengkap.</p><div data-files class="mt">' + R.kosong('Pilih tahun lalu klik Unduh', '', 'file') + '</div></div></div>';
    el.querySelector('[data-go]').onclick = async (e) => {
      const b = e.currentTarget, th = +el.querySelector('[data-th]').value, st = el.querySelector('[data-st]');
      b.classList.add('busy'); st.innerHTML = '<span class="sync busy"><span class="sd"></span> Menyusun data ' + th + '… (bisa sampai 1 menit)</span>';
      try {
        const d = await R.api.call('export.semua', { tahun: th }, { idem: false, tulis: false, timeout: 300000 });
        const ak = d.akuntan ? [d.akuntan.lr, d.akuntan.neraca, d.akuntan.ak, d.akuntan.modal] : [];
        await R.akt.xlsx(ak, 'ROVELO Finance - Semua Data ' + th, d.lembar.map((l) => ({ nama: l.nama, baris: l.baris })));
        st.innerHTML = '<div class="alert g">' + R.ic('check', 's18') + '<span>' + (d.lembar.length + ak.length) + ' lembar diunduh.</span></div>';
        el.querySelector('[data-files]').innerHTML = d.filePenjualan.length ? d.filePenjualan.map((f) => '<a class="list-row" href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit"><span class="lr-ic">' + R.ic('file', 's18') + '</span><span class="lr-main"><b>Penjualan ' + esc(f.label) + '</b><small>Google Sheets</small></span>' + R.ic('chevR', 's18') + '</a>').join('') : R.kosong('Belum ada file penjualan di ' + th, '', 'file');
      } catch (ex) { st.innerHTML = '<div class="alert r">' + R.ic('alert', 's18') + '<span>' + esc(ex.message) + '</span></div>'; } finally { b.classList.remove('busy'); }
    };
  }

  function audit(el, nav) {
    const a = sp.audit;
    el.innerHTML = '<div class="card p0"><div class="row wrap" style="padding:14px 16px;gap:8px"><div class="inp-group"><span class="ic-in">' + R.ic('search', 's16') + '</span><input class="inp sm" data-c placeholder="Cari aktivitas" value="' + esc(a.cari) + '" style="width:220px"></div><select class="inp sm" data-a style="width:auto"><option value="">Semua aksi</option>' + [['auth', 'Login/keamanan'], ['transaksi', 'Transaksi'], ['penjualan', 'Penjualan'], ['pencairan', 'Pencairan'], ['gaji', 'Gaji'], ['aset', 'Aset'], ['pajak', 'Pajak'], ['pembukuan', 'Pembukuan'], ['periode', 'Periode'], ['master', 'Master'], ['pengaturan', 'Pengaturan'], ['pengguna', 'Pengguna'], ['export', 'Export']].map((x) => '<option value="' + x[0] + '" ' + (a.aksi === x[0] ? 'selected' : '') + '>' + x[1] + '</option>').join('') + '</select><input type="date" class="inp sm" data-d style="width:auto" aria-label="Dari"><input type="date" class="inp sm" data-s style="width:auto" aria-label="Sampai"></div><div data-list>' + R.kerangka(8) + '</div><div data-pager></div></div>';
    const muat = () => R.api.get('audit.list', { cari: a.cari, aksi: a.aksi, dari: el.querySelector('[data-d]').value, sampai: el.querySelector('[data-s]').value, halaman: a.hal }).then((d) => {
      if (!R.masihDi(nav)) return;
      R.tabel(el.querySelector('[data-list]'), { baris: d.baris, mulai: (d.halaman - 1) * d.per, ringkas: true, kosong: 'Tidak ada aktivitas', kosongIkon: 'history', klik: (r) => R.drawer({ judul: r.aksi, isi: '<dl class="kv"><dt>Waktu</dt><dd>' + R.waktu(r.waktu) + '</dd><dt>Pengguna</dt><dd>' + esc(r.username) + '</dd><dt>Objek</dt><dd>' + esc(r.objek) + ' · ' + esc(r.id_objek) + '</dd></dl><h3 class="sec mt">Ringkasan</h3><p class="small" style="word-break:break-word">' + esc(r.ringkasan) + '</p>' + (r.nilai_sebelum ? '<h3 class="sec mt">Sebelum</h3><pre class="small" style="white-space:pre-wrap;background:var(--canvas);padding:10px;border-radius:10px">' + esc(r.nilai_sebelum) + '</pre>' : '') + (r.nilai_sesudah ? '<h3 class="sec mt">Sesudah</h3><pre class="small" style="white-space:pre-wrap;background:var(--canvas);padding:10px;border-radius:10px">' + esc(r.nilai_sesudah) + '</pre>' : '') }),
        kolom: [{ k: 'waktu', label: 'Waktu', render: (r) => R.waktu(r.waktu) }, { k: 'username', label: 'Pengguna', lead: true, render: (r) => '<span class="row" style="gap:8px;display:inline-flex">' + R.avatar(r.username, 26) + '<b>' + esc(r.username) + '</b></span>' }, { k: 'aksi', label: 'Aksi', render: (r) => '<span class="badge ' + (/gagal/.test(r.aksi) ? 'r' : /batal|buka|reset|hapus/.test(r.aksi) ? 'a' : '') + '">' + esc(r.aksi) + '</span>' }, { k: 'id_objek', label: 'Objek', hideM: true, render: (r) => esc(r.objek) + '<span class="t2">' + esc(r.id_objek) + '</span>' }, { k: 'ringkasan', label: 'Ringkasan', render: (r) => '<span class="ellipsis" style="max-width:360px;display:inline-block;vertical-align:bottom">' + esc(r.ringkasan) + '</span>' }] });
      R.pager(el.querySelector('[data-pager]'), d, (h) => { a.hal = h; muat(); });
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    el.querySelector('[data-c]').oninput = R.tunda((e) => { a.cari = e.target.value.trim(); a.hal = 1; muat(); }, 350);
    el.querySelector('[data-a]').onchange = (e) => { a.aksi = e.target.value; a.hal = 1; muat(); };
    el.querySelector('[data-d]').onchange = () => { a.hal = 1; muat(); }; el.querySelector('[data-s]').onchange = () => { a.hal = 1; muat(); };
    muat();
  }

  // ============================================================
  // PANDUAN
  // ============================================================
  R.halaman.panduan = {
    judul: 'Panduan', roles: R.PERAN.SEMUA,
    render(el) {
      const kat = (R.boot.kategori || []);
      el.innerHTML = '<div class="page-head"><div><h2>Panduan ROVELO Finance</h2><p>Cara pakai harian, arti istilah, dan peta kategori ke akun.</p></div></div><div class="grid g-2-1"><div class="card help">' +
        '<h4>Rutinitas harian (± 5 menit)</h4><ol><li><b>Catat pengeluaran & pemasukan</b> lewat tombol <b>+</b> — pilih kategori (iklan, listrik, gaji, dll.), isi nominal, foto nota bila ≥ ' + R.rpK((R.boot.usaha || {}).batas_lampiran || 500000) + '.</li><li><b>Impor penjualan marketplace</b> (Shopee, TikTok Shop, Lazada, Tokopedia) dari file ekspor Seller Center. Impor ulang file yang sama aman — tidak dobel.</li><li><b>Penjualan reseller/offline</b> dicatat di Penjualan → Input manual.</li><li>Saat saldo marketplace ditarik ke bank, catat di <b>Penjualan → Pencairan dana</b>.</li></ol>' +
        '<h4>Rutinitas akhir bulan</h4><ol><li>Admin memposting semua transaksi <b>Draft</b>.</li><li>Pembukuan → <b>Penyesuaian</b> (penyusutan aset, sewa dibayar di muka, PPh Final). Isi nilai stok dari ROVELO Inventory bila opname.</li><li>Gaji → proses & bayar gaji, unduh slip.</li><li>Pajak → setor PPh Final sebelum tanggal ' + esc((R.boot.usaha || {}).tgl_batas_setor || 15) + ' bulan berikutnya, catat NTPN.</li><li>Pembukuan → <b>Tutup buku</b> → kunci periode.</li><li>Laporan → <b>General bulanan</b> → unduh PDF/Excel.</li></ol>' +
        '<h4>Arti istilah</h4><ul><li><b>Omzet</b>: harga jual × jumlah barang, sebelum potongan.</li><li><b>HPP</b>: harga pokok/modal barang yang terjual (qty × HPP produk di Master Produk).</li><li><b>Laba kotor</b>: dana diterima − HPP. <b>Laba bersih</b>: setelah semua beban (iklan, gaji, operasional, penyusutan, pajak).</li><li><b>Piutang marketplace / dana tertahan</b>: hasil penjualan yang sudah selesai tetapi masih di saldo penjual marketplace.</li><li><b>RTS</b> (return to sender): paket gagal kirim/diretur; omzet & HPP-nya dikeluarkan, ongkir RTS jadi beban.</li><li><b>Draft</b>: catatan Staf yang belum masuk pembukuan sampai diposting Admin.</li><li><b>Jurnal pembalik (JB)</b>: cara membatalkan tanpa menghapus — riwayat tetap ada.</li><li><b>Kunci periode</b>: bulan yang sudah ditutup tidak bisa diubah lagi.</li></ul>' +
        '<h4>Nomor bukti</h4><p><code>KK</code> kas keluar · <code>KM</code> kas masuk · <code>TF</code> transfer · <code>JU</code> jurnal umum/rekap penjualan · <code>JP</code> penyesuaian · <code>JB</code> pembalik · <code>SA</code> saldo awal · <code>JT</code> penutup tahun. Format: KODE/TTBB/urut, mis. KK/2611/0007.</p>' +
        '<h4>Standar yang dipakai</h4><p>Laporan disusun mengikuti SAK EMKM (laporan posisi keuangan, laba rugi, CALK) dengan tambahan laporan arus kas metode langsung dan perubahan ekuitas. Pajak memakai PPh Final UMKM 0,5% (PP 55/2022 jo. PP 20/2026) — untuk orang pribadi, omzet Rp500 juta pertama per tahun tidak dikenai pajak.</p></div>' +
        '<div class="card p0"><div class="card-head"><div><h3 class="sec">Peta kategori → akun</h3><p class="sec-sub">Pilihan kategori di form otomatis dicatat ke akun berikut.</p></div></div><div style="max-height:720px;overflow:auto" data-peta></div></div></div>';
      R.tabel(el.querySelector('[data-peta]'), { baris: kat, ringkas: true, kartu: false, kolom: [{ k: 'nama', label: 'Kategori', render: (k) => '<b>' + esc(k.nama) + '</b><span class="t2">' + esc(k.jenis) + ' · ' + esc(k.kelompok) + '</span>' }, { k: 'akun', label: 'Akun', render: (k) => '<span class="faint xs">' + esc(k.akun) + '</span> ' + esc(R.namaAkun(k.akun)) }] });
    }
  };
})();
