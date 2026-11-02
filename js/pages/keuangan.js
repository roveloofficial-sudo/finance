/* ROVELO Finance — Piutang & Utang, Gaji, Aset, Pajak UMKM, Simulasi Harga */
(function () {
  const R = window.R;
  const esc = R.esc;
  const kpi = (l, v, ic, w, f) => '<div class="card kpi"><div class="lbl"><span class="ic-wrap ' + (w || '') + '">' + R.ic(ic, 's18') + '</span>' + esc(l) + '</div><div class="val">' + v + '</div>' + (f ? '<div class="foot">' + f + '</div>' : '') + '</div>';

  // ============================================================
  // PIUTANG & UTANG
  // ============================================================
  const sp = { tab: 'Piutang', status: 'Aktif' };
  R.halaman.piutang = {
    judul: 'Piutang & Utang', roles: R.PERAN.OAV,
    render(el, q, sub, nav) {
      if (q.tab === 'utang') sp.tab = 'Utang'; else if (q.tab === 'dana') sp.tab = 'Dana'; else if (q.tab === 'piutang') sp.tab = 'Piutang';
      const OA = R.isOA();
      el.innerHTML = '<div class="page-head"><div><h2>Piutang & utang</h2><p>Siapa yang masih berutang ke ROVELO, dan tagihan yang harus dibayar.</p></div>' + (OA ? '<div class="actions"><button class="btn primary" data-tbh>' + R.ic('plus', 's18') + ' Tambah catatan</button></div>' : '') + '</div><div class="grid g4 keep2 mb" data-ring>' + R.kerangka(4, 'kartu').replace('<div class="grid g4">', '').slice(0, -6) + '</div><div data-tabs></div><div data-isi></div>';
      const isi = el.querySelector('[data-isi]');
      let data = null;
      const gambar = () => {
        const d = data, r = d.ringkas;
        el.querySelector('[data-ring]').innerHTML = kpi('Piutang aktif', R.rp(r.piutang), 'down', 'g', r.piutang_lewat ? '<span class="badge r">' + r.piutang_lewat + ' lewat tempo</span>' : 'semua belum jatuh tempo') + kpi('Utang aktif', R.rp(r.utang), 'up', 'r', r.utang_tempo7 ? '<span class="badge a">' + r.utang_tempo7 + ' jatuh tempo ≤ 7 hari</span>' : (r.utang_lewat ? '<span class="badge r">' + r.utang_lewat + ' lewat tempo</span>' : '')) +
          kpi('Dana marketplace tertahan', R.rp(d.dana.reduce((s, x) => s + Math.max(0, x.saldo), 0)), 'store', 'l', 'piutang marketplace') + kpi('Posisi bersih', R.rp(r.piutang - r.utang), 'wallet', '', 'piutang − utang');
        R.tabs(el.querySelector('[data-tabs]'), [{ id: 'Piutang', label: 'Piutang' }, { id: 'Utang', label: 'Utang' }, { id: 'Dana', label: 'Dana marketplace' }], sp.tab, (t) => { sp.tab = t; R.ubahQuery({ tab: t.toLowerCase() }); daftar(); });
        daftar();
      };
      function daftar() {
        if (sp.tab === 'Dana') {
          isi.innerHTML = '<div class="alert mb">' + R.ic('info', 's18') + '<span><b>Piutang marketplace</b> = uang hasil penjualan yang sudah selesai tetapi masih tertahan di saldo penjual Shopee/TikTok/Lazada/Tokopedia. Berkurang saat Anda mencatat pencairan ke bank.</span></div><div class="grid g4 keep2">' +
            data.dana.map((x) => '<div class="ch-card"><div class="ch-top">' + R.chTag(x.id_channel) + '</div><div class="num" style="font-size:20px;font-weight:700">' + R.rp(x.saldo) + '</div><div class="xs ' + (x.umur > 14 && x.saldo > 0 ? 'warn' : 'faint') + '">' + (x.saldo > 0 ? 'tertahan ' + x.umur + ' hari' : 'kosong') + ' · akun ' + esc(x.akun) + '</div></div>').join('') + '</div>' + (OA ? '<a class="btn primary mt" href="#/penjualan?tab=pencairan">' + R.ic('cash', 's18') + ' Catat pencairan</a>' : '');
          return;
        }
        const rows = data.baris.filter((x) => x.jenis === sp.tab && (sp.status === 'Semua' || (sp.status === 'Aktif' ? (x.status !== 'Lunas' && x.status !== 'Dibatalkan') : x.status === sp.status)));
        isi.innerHTML = '<div class="card p0"><div style="padding:14px 16px" data-seg></div><div data-list></div></div>';
        R.seg(isi.querySelector('[data-seg]'), [{ v: 'Aktif', l: 'Belum lunas' }, { v: 'Lunas', l: 'Lunas' }, { v: 'Semua', l: 'Semua' }], sp.status, (v) => { sp.status = v; muat(); });
        R.tabel(isi.querySelector('[data-list]'), {
          baris: rows, kosong: sp.tab === 'Piutang' ? 'Tidak ada piutang' : 'Tidak ada utang', kosongIkon: 'wallet', klik: OA ? bayar : null,
          kolom: [
            { k: 'nama_kontak', label: 'Kontak', lead: true, render: (r) => '<b>' + esc(r.nama_kontak) + '</b><span class="t2">' + esc(r.no_bukti) + ' · ' + esc(r.keterangan || '') + '</span>' },
            { k: 'tanggal', label: 'Tanggal', tipe: 'tgl', hideM: true },
            { k: 'jatuh_tempo', label: 'Jatuh tempo', render: (r) => r.jatuh_tempo ? R.tgl(r.jatuh_tempo) + (r.status === 'Lunas' ? '' : r.lewat ? ' <span class="badge r">lewat ' + Math.abs(r.hari_ke_tempo) + ' hr</span>' : r.hari_ke_tempo <= 7 ? ' <span class="badge a">' + r.hari_ke_tempo + ' hr lagi</span>' : '') : '–' },
            { k: 'nominal', label: 'Nominal', tipe: 'rp', hideM: true }, { k: 'terbayar', label: 'Terbayar', tipe: 'rp', hideM: true },
            { k: 'sisa', label: 'Sisa', tipe: 'rp', render: (r) => '<b>' + R.rp(r.sisa) + '</b>' },
            { k: 'status', label: 'Status', render: (r) => '<span class="badge ' + ({ Lunas: 'g', Sebagian: 'o', Belum: 'a', Dibatalkan: 'r' }[r.status] || '') + '">' + esc(r.status) + '</span>' }
          ]
        });
      }
      function bayar(r) {
        if (r.status === 'Lunas' || r.status === 'Dibatalkan') return;
        const piut = r.jenis === 'Piutang';
        const d = R.drawer({ judul: piut ? 'Terima pelunasan' : 'Bayar utang', isi: '<div class="card tint flat"><b>' + esc(r.nama_kontak) + '</b><div class="small muted">' + esc(r.no_bukti) + ' · sisa ' + R.rp(r.sisa) + '</div></div><form class="stack mt" novalidate>' +
          '<div class="field"><label>Tanggal</label><input type="date" class="inp" name="tanggal" value="' + R.hariIni() + '" max="' + R.hariIni() + '"></div>' +
          '<div class="field"><label>Nominal</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="nominal" data-rp inputmode="numeric" value="' + R.angka(r.sisa) + '"></div></div>' +
          '<div class="field"><label>' + (piut ? 'Diterima di' : 'Dibayar dari') + '</label><select class="inp" name="akun_kas">' + R.opsiKas() + '</select></div></form>',
          kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan</button>' });
        d.foot.querySelector('[data-x2]').onclick = () => d.tutup();
        d.foot.querySelector('[data-ok]').onclick = async (e) => {
          const f = d.body.querySelector('form'), b = e.currentTarget; b.classList.add('busy');
          try { const x = await R.api.call('piutangUtang.bayar', { id: r.id, tanggal: f.tanggal.value, nominal: R.nilai(f.nominal.value), akun_kas: f.akun_kas.value }); R.toast(x._pesan); d.tutup(); muat(); }
          catch (ex) { R.galat(ex); b.classList.remove('busy'); }
        };
      }
      function tambah() {
        const akun = (R.boot.akun || []).filter((a) => a.aktif && !a.kas && !/^(2-1101|1-1301|3-9)/.test(a.no));
        const d = R.drawer({ judul: 'Tambah piutang / utang', isi: '<form class="stack" novalidate><div class="seg full" data-j></div>' +
          '<div class="field"><label>Kontak</label><select class="inp" name="id_kontak"><option value="">— pilih —</option>' + (R.boot.kontak || []).map((k) => '<option value="' + k.id + '">' + esc(k.nama) + ' · ' + esc(k.tipe) + '</option>').join('') + '</select><span class="hint">Belum ada? Tambah di Master Data → Kontak.</span></div>' +
          '<div class="fgrid"><div class="field"><label>Tanggal</label><input type="date" class="inp" name="tanggal" value="' + R.hariIni() + '"></div><div class="field"><label>Jatuh tempo</label><input type="date" class="inp" name="jatuh_tempo" value="' + R.tambahHari(R.hariIni(), 30) + '"></div></div>' +
          '<div class="field"><label>Nominal</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="nominal" data-rp inputmode="numeric"></div></div>' +
          '<div class="field"><label data-ll>Asal piutang (akun lawan)</label><select class="inp" name="akun_lawan">' + akun.map((a) => '<option value="' + a.no + '">' + a.no + ' · ' + esc(a.nama) + '</option>').join('') + '</select><span class="hint">Untuk transaksi tunai gunakan menu Pemasukan & Pengeluaran.</span></div>' +
          '<div class="field"><label>Keterangan</label><input class="inp" name="keterangan" maxlength="100"></div></form>',
          kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan</button>' });
        const f = d.body.querySelector('form'); let jenis = sp.tab === 'Utang' ? 'Utang' : 'Piutang';
        const setJ = (j) => { jenis = j; d.body.querySelector('[data-ll]').textContent = j === 'Piutang' ? 'Asal piutang (akun pendapatan)' : 'Untuk apa (akun beban/aset)'; f.akun_lawan.value = j === 'Piutang' ? '4-1101' : '1-1401'; };
        R.seg(d.body.querySelector('[data-j]'), [{ v: 'Piutang', l: 'Piutang (orang berutang ke kita)' }, { v: 'Utang', l: 'Utang (kita berutang)' }], jenis, setJ); setJ(jenis);
        d.foot.querySelector('[data-x2]').onclick = () => d.tutup();
        d.foot.querySelector('[data-ok]').onclick = async (e) => {
          const b = e.currentTarget; b.classList.add('busy');
          try { const x = await R.api.call('piutangUtang.create', { jenis: jenis, id_kontak: f.id_kontak.value, tanggal: f.tanggal.value, jatuh_tempo: f.jatuh_tempo.value, nominal: R.nilai(f.nominal.value), akun_lawan: f.akun_lawan.value, keterangan: f.keterangan.value }); R.toast(x._pesan); d.tutup(); muat(); }
          catch (ex) { R.galat(ex); b.classList.remove('busy'); }
        };
      }
      const tb = el.querySelector('[data-tbh]'); if (tb) tb.onclick = tambah;
      function muat() { R.api.swr('piutangUtang.list', {}, (d) => { if (R.masihDi(nav)) { data = d; gambar(); } }, { simpan: true }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, isi, muat); }); }
      muat();
    }
  };

  // ============================================================
  // GAJI
  // ============================================================
  const sg = { tab: 'proses', periode: null };
  R.halaman.gaji = {
    judul: 'Gaji Karyawan', roles: R.PERAN.OA,
    render(el, q, sub, nav) {
      sg.periode = sg.periode || R.hariIni().slice(0, 7);
      if (q.tab) sg.tab = q.tab;
      el.innerHTML = '<div class="page-head"><div><h2>Gaji karyawan</h2><p>Proses gaji bulanan, potong kasbon otomatis, unduh slip PDF.</p></div><div class="actions"><button class="btn" data-kry>' + R.ic('plus', 's18') + ' Karyawan baru</button></div></div><div data-tabs></div><div data-isi></div>';
      const isi = el.querySelector('[data-isi]');
      const buka = (t) => { sg.tab = t; R.ubahQuery({ tab: t }); R.tabs(el.querySelector('[data-tabs]'), [{ id: 'proses', label: 'Proses gaji' }, { id: 'karyawan', label: 'Data karyawan' }, { id: 'riwayat', label: 'Riwayat' }], t, buka); ({ proses: proses, karyawan: karyawan, riwayat: riwayat })[t](isi, nav, buka); };
      el.querySelector('[data-kry]').onclick = () => formKaryawan(null, () => { if (sg.tab !== 'proses') buka(sg.tab); });
      buka(sg.tab);
    }
  };
  const FG = ['gaji_pokok', 'lembur', 'tunjangan', 'bonus', 'potongan_absensi', 'potongan_kasbon', 'potongan_bpjs', 'pph21'];
  const LG = { gaji_pokok: 'Gaji pokok', lembur: 'Lembur', tunjangan: 'Tunjangan', bonus: 'Bonus', potongan_absensi: 'Pot. absensi', potongan_kasbon: 'Kasbon', potongan_bpjs: 'BPJS', pph21: 'PPh 21' };
  function proses(el, nav) {
    el.innerHTML = '<div class="card"><div class="row wrap between"><div class="row wrap"><label class="lbl-f" for="pg">Periode</label><input id="pg" type="month" class="inp sm" style="width:auto" value="' + sg.periode + '"><span data-st></span></div><div class="actions" data-akt></div></div><div data-tbl class="mt">' + R.kerangka(5) + '</div></div>';
    el.querySelector('#pg').onchange = (e) => { if (e.target.value) { sg.periode = e.target.value; muat(); } };
    let d = null;
    const hitung = (x) => { FG.forEach((f) => { x[f] = Math.max(0, +x[f] || 0); }); x.total_pendapatan = x.gaji_pokok + x.lembur + x.tunjangan + x.bonus; x.total_potongan = x.potongan_absensi + x.potongan_kasbon + x.potongan_bpjs + x.pph21; x.gaji_bersih = x.total_pendapatan - x.total_potongan; return x; };
    function gambar() {
      const g = d.gaji, bisa = g.status !== 'Dibayar';
      el.querySelector('[data-st]').innerHTML = '<span class="badge ' + ({ Dibayar: 'g', Draft: 'a', Baru: 'b' }[g.status] || '') + '">' + esc(g.status === 'Baru' ? 'Belum diproses' : g.status) + '</span>' + (g.tanggal_bayar ? ' <span class="small muted">dibayar ' + R.tgl(g.tanggal_bayar) + '</span>' : '');
      el.querySelector('[data-akt]').innerHTML = bisa ? (d.tersimpan ? '<button class="btn ghost" data-batal>' + R.ic('trash', 's16') + ' Batalkan</button>' : '') + '<button class="btn" data-simpan>Simpan draft</button><button class="btn primary" data-bayar>' + R.ic('cash', 's18') + ' Bayar gaji</button>'
        : '<button class="btn" data-batal>' + R.ic('undo', 's16') + ' Batalkan pembayaran</button><button class="btn primary" data-slip>' + R.ic('download', 's18') + ' Unduh semua slip</button>';
      const box = el.querySelector('[data-tbl]');
      if (!d.detail.length) { box.innerHTML = R.kosong('Belum ada karyawan aktif', 'Tambahkan karyawan dulu.', 'users'); return; }
      d.detail.forEach(hitung);
      const tot = {}; FG.concat(['gaji_bersih']).forEach((f) => { tot[f] = d.detail.reduce((s, x) => s + x[f], 0); });
      box.innerHTML = '<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Karyawan</th>' + FG.map((f) => '<th class="n">' + LG[f] + '</th>').join('') + '<th class="n">Diterima</th><th></th></tr></thead><tbody>' +
        d.detail.map((x, i) => '<tr data-i="' + i + '"><td><b>' + esc(x.nama) + '</b><span class="t2">' + esc(x.jabatan) + (x.saldo_kasbon ? ' · kasbon ' + R.rp(x.saldo_kasbon) : '') + '</span></td>' +
          FG.map((f) => '<td class="n">' + (bisa ? '<input class="inline-in" data-f="' + f + '" data-rp inputmode="numeric" value="' + (x[f] ? R.angka(x[f]) : '') + '" placeholder="0" aria-label="' + LG[f] + ' ' + esc(x.nama) + '">' : R.rp(x[f])) + '</td>').join('') +
          '<td class="n"><b data-bersih>' + R.rp(x.gaji_bersih) + '</b></td><td>' + (!bisa ? '<button class="btn xs" data-slip1="' + i + '">' + R.ic('download', 's16') + ' Slip</button>' : '') + '</td></tr>').join('') +
        '</tbody><tfoot><tr><td>Total ' + d.detail.length + ' orang</td>' + FG.map((f) => '<td class="n" data-t="' + f + '">' + R.rp(tot[f]) + '</td>').join('') + '<td class="n" data-t="gaji_bersih">' + R.rp(tot.gaji_bersih) + '</td><td></td></tr></tfoot></table></div>' +
        '<p class="xs faint mt">Gaji pokok & tunjangan diambil dari data karyawan. Potongan kasbon maksimal sebesar sisa kasbon. Jurnal: Beban gaji (D) — Kas/Bank, Utang PPh 21, Utang BPJS, Piutang karyawan (K).</p>';
      R.inpRpSemua(box);
      box.oninput = (e) => {
        const tr = e.target.closest('[data-i]'); if (!tr) return;
        const x = d.detail[+tr.dataset.i]; x[e.target.dataset.f] = R.nilai(e.target.value); hitung(x);
        tr.querySelector('[data-bersih]').textContent = R.rp(x.gaji_bersih); tr.querySelector('[data-bersih]').classList.toggle('neg', x.gaji_bersih < 0);
        FG.concat(['gaji_bersih']).forEach((f) => { box.querySelector('[data-t=' + f + ']').textContent = R.rp(d.detail.reduce((s, y) => s + y[f], 0)); });
      };
    }
    async function simpan() { const r = await R.api.call('gaji.prosesSave', { periode: sg.periode, detail: d.detail }); d.tersimpan = true; d.gaji.status = 'Draft'; return r; }
    R.on(el, 'click', '[data-simpan]', async (e, b) => { b.classList.add('busy'); try { const r = await simpan(); R.toast(r._pesan); gambar(); } catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); } });
    R.on(el, 'click', '[data-bayar]', () => {
      const tot = d.detail.reduce((s, x) => s + x.gaji_bersih, 0);
      const dr = R.drawer({ judul: 'Bayar gaji ' + R.bln(sg.periode), isi: '<div class="card tint flat"><div class="small muted">Total gaji bersih dibayar</div><div class="num" style="font-size:26px;font-weight:800">' + R.rp(tot) + '</div><div class="small muted">' + d.detail.length + ' karyawan</div></div><form class="stack mt"><div class="field"><label>Tanggal bayar</label><input type="date" class="inp" name="tanggal" value="' + R.hariIni() + '"></div><div class="field"><label>Dibayar dari</label><select class="inp" name="akun_kas">' + R.opsiKas((R.akunKas().find((a) => /Bank/.test(a.nama)) || {}).no) + '</select></div></form>',
        kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Bayar & catat jurnal</button>' });
      dr.foot.querySelector('[data-x2]').onclick = () => dr.tutup();
      dr.foot.querySelector('[data-ok]').onclick = async (e) => {
        const f = dr.body.querySelector('form'), b = e.currentTarget; b.classList.add('busy');
        try { await simpan(); const r = await R.api.call('gaji.bayar', { periode: sg.periode, tanggal: f.tanggal.value, akun_kas: f.akun_kas.value }); R.toast(r._pesan); dr.tutup(); muat(); }
        catch (ex) { R.galat(ex); b.classList.remove('busy'); }
      };
    });
    R.on(el, 'click', '[data-batal]', async () => {
      const a = await R.konfirmasi({ judul: 'Batalkan proses gaji ' + R.bln(sg.periode) + '?', pesan: d.gaji.status === 'Dibayar' ? 'Jurnal pembayaran gaji akan dibalik (JB).' : 'Draft gaji dihapus.', bahaya: true, ok: 'Batalkan', input: { label: 'Alasan', wajib: true } });
      if (!a) return;
      try { const r = await R.api.call('gaji.batal', { periode: sg.periode, alasan: a }); R.toast(r._pesan); muat(); } catch (ex) { R.galat(ex); }
    });
    const slip = (list) => R.api.get('gaji.karyawanList', {}).then((ks) => {
      const m = {}; ks.forEach((k) => { m[k.id_karyawan] = k; });
      return R.pdf.slip({ periode: sg.periode, tanggal_bayar: d.gaji.tanggal_bayar, karyawan: list.map((x) => Object.assign({ bank: (m[x.id_karyawan] || {}).bank, no_rekening: (m[x.id_karyawan] || {}).no_rekening }, x)), file: list.length === 1 ? 'Slip Gaji ' + list[0].nama + ' ' + sg.periode : 'Slip Gaji ' + sg.periode });
    }).catch(R.galat);
    R.on(el, 'click', '[data-slip]', () => slip(d.detail.filter((x) => x.total_pendapatan > 0)));
    R.on(el, 'click', '[data-slip1]', (e, b) => slip([d.detail[+b.dataset.slip1]]));
    function muat() {
      el.querySelector('[data-tbl]').innerHTML = R.kerangka(5);
      R.api.get('gaji.prosesGet', { periode: sg.periode }).then((x) => { if (!R.masihDi(nav)) return; d = x; gambar(); }).catch((e) => R.gagalMuat(e, el.querySelector('[data-tbl]'), muat));
    }
    muat();
  }
  function karyawan(el, nav) {
    el.innerHTML = '<div class="card p0" data-list>' + R.kerangka(5) + '</div>';
    const muat = () => R.api.swr('gaji.karyawanList', {}, (d) => {
      if (!R.masihDi(nav)) return;
      R.tabel(el.querySelector('[data-list]'), { baris: d, kosong: 'Belum ada karyawan', kosongIkon: 'users', klik: (k) => formKaryawan(k, muat), kolom: [
        { k: 'nama_lengkap', label: 'Nama', lead: true, render: (k) => '<b>' + esc(k.nama_lengkap) + '</b><span class="t2">' + esc(k.id_karyawan) + ' · ' + esc(k.jabatan) + (k.divisi ? ' · ' + esc(k.divisi) : '') + '</span>' },
        { k: 'status_kerja', label: 'Status' }, { k: 'tanggal_masuk', label: 'Masuk', tipe: 'tgl', hideM: true },
        { k: 'gaji_pokok', label: 'Gaji pokok', tipe: 'rp' }, { k: 'tunjangan_tetap', label: 'Tunjangan', tipe: 'rp', hideM: true },
        { k: 'kasbon', label: 'Sisa kasbon', tipe: 'rp' },
        { k: 'aktif', label: 'Aktif', render: (k) => k.aktif ? '<span class="badge g">Aktif</span>' : '<span class="badge">Nonaktif</span>' }] });
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    muat();
  }
  function formKaryawan(k, selesai) {
    k = k || { aktif: true, status_kerja: 'Tetap', tanggal_masuk: R.hariIni() };
    const inp = (n, l, t, x) => '<div class="field ' + (x || '') + '"><label>' + l + '</label><input class="inp" name="' + n + '" ' + (t === 'rp' ? 'data-rp inputmode="numeric"' : 'type="' + (t || 'text') + '"') + ' value="' + esc(t === 'rp' ? (k[n] ? R.angka(k[n]) : '') : (k[n] || '')) + '"></div>';
    const d = R.drawer({ judul: k.id_karyawan ? 'Ubah data karyawan' : 'Karyawan baru', isi: '<form class="fgrid" novalidate>' + inp('nama_lengkap', 'Nama lengkap', 'text', 'full') + inp('jabatan', 'Jabatan') + inp('divisi', 'Divisi') +
      '<div class="field"><label>Status kerja</label><select class="inp" name="status_kerja">' + ['Tetap', 'Kontrak', 'Harian', 'Freelance'].map((s) => '<option ' + (s === k.status_kerja ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></div>' + inp('nik_ktp', 'NIK KTP (16 digit)') +
      inp('tanggal_masuk', 'Tanggal masuk', 'date') + inp('tanggal_keluar', 'Tanggal keluar', 'date') + inp('gaji_pokok', 'Gaji pokok / bulan', 'rp') + inp('tunjangan_tetap', 'Tunjangan tetap', 'rp') +
      '<div class="field"><label>BPJS</label><label class="check" style="height:44px"><input type="checkbox" name="ikut_bpjs" ' + (k.ikut_bpjs ? 'checked' : '') + '> Ikut BPJS</label></div>' + inp('potongan_bpjs', 'Potongan BPJS karyawan', 'rp') + inp('pph21_bulanan', 'PPh 21 / bulan', 'rp') + inp('no_hp', 'No. HP') +
      inp('bank', 'Bank') + inp('no_rekening', 'No. rekening') + inp('atas_nama', 'Atas nama', 'text', 'full') + '<div class="field full"><label>Alamat</label><textarea class="inp" name="alamat">' + esc(k.alamat || '') + '</textarea></div>' +
      '<div class="field full"><label class="check"><input type="checkbox" name="aktif" ' + (k.aktif !== false ? 'checked' : '') + '> Karyawan aktif (ikut proses gaji)</label></div></form><p class="xs faint mt">Data pribadi hanya bisa dilihat Owner & Admin Keuangan.</p>',
      kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan</button>' });
    d.foot.querySelector('[data-x2]').onclick = () => d.tutup();
    d.foot.querySelector('[data-ok]').onclick = async (e) => {
      const f = d.body.querySelector('form'), b = e.currentTarget; b.classList.add('busy');
      const v = { id_karyawan: k.id_karyawan || '' };
      R.$$('[name]', f).forEach((i) => { v[i.name] = i.type === 'checkbox' ? i.checked : i.dataset.rp !== undefined ? R.nilai(i.value) : i.value.trim(); });
      try { const r = await R.api.call('gaji.karyawanSave', v); R.toast(r._pesan); d.tutup(); R.app.muatUlangBoot(); selesai && selesai(); }
      catch (ex) { R.galat(ex); b.classList.remove('busy'); }
    };
  }
  function riwayat(el, nav, buka) {
    el.innerHTML = '<div class="card p0" data-list>' + R.kerangka(4) + '</div>';
    R.api.swr('gaji.riwayat', {}, (d) => {
      if (!R.masihDi(nav)) return;
      R.tabel(el.querySelector('[data-list]'), { baris: d, kosong: 'Belum ada riwayat gaji', kosongIkon: 'history', klik: (g) => { sg.periode = g.periode; buka('proses'); }, kolom: [
        { k: 'label', label: 'Periode', lead: true }, { k: 'status', label: 'Status', render: (g) => '<span class="badge ' + ({ Dibayar: 'g', Draft: 'a', Dibatalkan: 'r' }[g.status] || '') + '">' + esc(g.status) + '</span>' },
        { k: 'jumlah_karyawan', label: 'Karyawan', tipe: 'angka' }, { k: 'total_pendapatan', label: 'Pendapatan', tipe: 'rp', hideM: true }, { k: 'total_potongan', label: 'Potongan', tipe: 'rp', hideM: true },
        { k: 'total_bersih', label: 'Dibayar', tipe: 'rp' }, { k: 'tanggal_bayar', label: 'Tgl bayar', tipe: 'tgl' }] });
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]')));
  }

  // ============================================================
  // ASET TETAP
  // ============================================================
  R.halaman.aset = {
    judul: 'Aset Tetap', roles: R.PERAN.OAV,
    render(el, q, sub, nav) {
      const OA = R.isOA();
      el.innerHTML = '<div class="page-head"><div><h2>Aset tetap</h2><p>Peralatan, kendaraan, bangunan — penyusutan dihitung otomatis tiap bulan.</p></div>' + (OA ? '<div class="actions"><button class="btn primary" data-tbh>' + R.ic('plus', 's18') + ' Tambah aset</button></div>' : '') + '</div><div class="grid g3 mb" data-ring></div><div class="card p0" data-list>' + R.kerangka(5) + '</div>';
      let data = null;
      const muat = () => R.api.swr('aset.list', {}, (d) => {
        if (!R.masihDi(nav)) return; data = d;
        el.querySelector('[data-ring]').innerHTML = kpi('Harga perolehan', R.rp(d.ringkas.harga), 'building', '', 'aset aktif') + kpi('Akumulasi penyusutan', R.rp(d.ringkas.akumulasi), 'trend', 'r') + kpi('Nilai buku', R.rp(d.ringkas.nilai_buku), 'wallet', 'g', 'tercatat di neraca');
        R.tabel(el.querySelector('[data-list]'), { baris: d.baris, kosong: 'Belum ada aset', kosongPesan: 'Catat laptop, kamera, mesin jahit, kendaraan, dll.', kosongIkon: 'building', klik: detail, kolom: [
          { k: 'nama_aset', label: 'Aset', lead: true, render: (a) => '<b>' + esc(a.nama_aset) + '</b><span class="t2">' + esc(a.id_aset) + ' · ' + esc(a.jenis) + '</span>' },
          { k: 'tanggal_beli', label: 'Dibeli', tipe: 'tgl', hideM: true }, { k: 'harga_perolehan', label: 'Harga', tipe: 'rp' },
          { k: 'penyusutan_bulanan', label: 'Susut / bln', tipe: 'rp', hideM: true }, { k: 'akumulasi_penyusutan', label: 'Akumulasi', tipe: 'rp', hideM: true },
          { k: 'nilai_buku', label: 'Nilai buku', tipe: 'rp', render: (a) => '<b>' + R.rp(a.nilai_buku) + '</b>' },
          { k: 'status', label: 'Status', render: (a) => '<span class="badge ' + ({ Aktif: 'g', Dijual: 'b', Dihapus: '', Dibatalkan: 'r' }[a.status] || '') + '">' + esc(a.status) + '</span>' }] });
      }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, el.querySelector('[data-list]'), muat); });
      function detail(a) {
        const jadwal = [];
        if (a.umur_bulan && a.tanggal_pakai) { let akum = 0, p = a.tanggal_pakai.slice(0, 7); const dasar = a.harga_perolehan - a.nilai_sisa; for (let i = 0; i < Math.min(a.umur_bulan, 120) && akum < dasar; i++) { const n = Math.min(Math.round(dasar / a.umur_bulan), dasar - akum); akum += n; jadwal.push({ p: p, n: n, akum: akum, buku: a.harga_perolehan - akum, sudah: a.penyusutan_terakhir && p <= a.penyusutan_terakhir }); p = R.tambahBulan(p, 1); } }
        const d = R.drawer({ judul: a.nama_aset, lebar: true, isi: '<div class="grid g3">' + [['Harga perolehan', R.rp(a.harga_perolehan)], ['Akumulasi', R.rp(a.akumulasi_penyusutan)], ['Nilai buku', R.rp(a.nilai_buku)]].map((x) => '<div class="sum-box"><div class="xs muted">' + x[0] + '</div><b class="num" style="font-size:17px">' + x[1] + '</b></div>').join('') + '</div>' +
          '<dl class="kv mt"><dt>Jenis</dt><dd>' + esc(a.jenis) + '</dd><dt>Tanggal beli / pakai</dt><dd>' + R.tgl(a.tanggal_beli) + ' / ' + R.tgl(a.tanggal_pakai) + '</dd><dt>Umur manfaat</dt><dd>' + (a.umur_bulan ? a.umur_bulan + ' bulan (' + R.persen(a.umur_bulan / 12) + ' tahun)' : 'tidak disusutkan') + '</dd><dt>Nilai sisa</dt><dd>' + R.rp(a.nilai_sisa) + '</dd><dt>Sumber dana</dt><dd>' + esc(a.sumber_dana) + '</dd><dt>Disusutkan sampai</dt><dd>' + (a.penyusutan_terakhir ? R.bln(a.penyusutan_terakhir) : '–') + '</dd><dt>Akun</dt><dd>' + esc(a.akun_aset) + ' / ' + esc(a.akun_akumulasi || '–') + '</dd></dl>' +
          (jadwal.length ? '<h3 class="sec mt-l">Jadwal penyusutan (garis lurus)</h3><div class="card p0 mt" style="max-height:320px;overflow:auto"><table class="tbl compact"><thead><tr><th>Bulan</th><th class="n">Penyusutan</th><th class="n">Akumulasi</th><th class="n">Nilai buku</th></tr></thead><tbody>' + jadwal.map((j) => '<tr><td>' + R.bln(j.p) + (j.sudah ? ' <span class="badge g">tercatat</span>' : '') + '</td><td class="n">' + R.rp(j.n) + '</td><td class="n">' + R.rp(j.akum) + '</td><td class="n">' + R.rp(j.buku) + '</td></tr>').join('') + '</tbody></table></div>' : '') +
          (a.lampiran_url ? '<button class="btn mt" data-lamp>' + R.ic('clip', 's18') + ' Lihat bukti</button>' : ''),
          kaki: OA && a.status === 'Aktif' ? '<button class="btn" data-ubah>' + R.ic('edit', 's16') + ' Ubah nama</button><button class="btn" data-hapus>Hapus / rusak</button><button class="btn primary" data-jual>Jual aset</button>' : undefined });
        const lb = d.body.querySelector('[data-lamp]'); if (lb) lb.onclick = () => R.lihatLampiran(a.lampiran_url);
        if (!d.foot) return;
        d.foot.querySelector('[data-ubah]').onclick = async () => { const n = await R.konfirmasi({ judul: 'Ubah nama aset', input: { label: 'Nama aset', wajib: true }, ok: 'Simpan' }); if (!n) return; try { const r = await R.api.call('aset.save', { id_aset: a.id_aset, nama_aset: n }); R.toast(r._pesan); d.tutup(); muat(); } catch (e) { R.galat(e); } };
        const keluar = (mode) => {
          const d2 = R.drawer({ judul: mode === 'jual' ? 'Jual ' + a.nama_aset : 'Hapus ' + a.nama_aset, isi: '<form class="stack"><div class="field"><label>Tanggal</label><input type="date" class="inp" name="tanggal" value="' + R.hariIni() + '"></div>' + (mode === 'jual' ? '<div class="field"><label>Harga jual</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="harga_jual" data-rp inputmode="numeric"></div></div><div class="field"><label>Diterima di</label><select class="inp" name="akun_kas">' + R.opsiKas() + '</select></div>' : '<div class="alert w">' + R.ic('alert', 's18') + '<span>Nilai buku ' + R.rp(a.nilai_buku) + ' dicatat sebagai kerugian.</span></div>') + '<p class="xs faint">Penyusutan sampai bulan sebelumnya dicatat otomatis dulu. Selisih harga jual dengan nilai buku menjadi laba/rugi penjualan aset.</p></form>',
            kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn ' + (mode === 'jual' ? 'primary' : 'danger') + '" data-ok>' + (mode === 'jual' ? 'Catat penjualan' : 'Hapus aset') + '</button>' });
          d2.foot.querySelector('[data-x2]').onclick = () => d2.tutup();
          d2.foot.querySelector('[data-ok]').onclick = async (e) => {
            const f = d2.body.querySelector('form'), b = e.currentTarget; b.classList.add('busy');
            try { const r = await R.api.call('aset.jual', { id_aset: a.id_aset, mode: mode, tanggal: f.tanggal.value, harga_jual: f.harga_jual ? R.nilai(f.harga_jual.value) : 0, akun_kas: f.akun_kas ? f.akun_kas.value : '' }); R.toast(r._pesan); d2.tutup(); d.tutup(); muat(); }
            catch (ex) { R.galat(ex); b.classList.remove('busy'); }
          };
        };
        d.foot.querySelector('[data-jual]').onclick = () => keluar('jual');
        d.foot.querySelector('[data-hapus]').onclick = () => keluar('hapus');
      }
      function tambah() {
        const jenis = (data && data.jenis) || [];
        const d = R.drawer({ judul: 'Tambah aset tetap', isi: '<form class="fgrid" novalidate><div class="field full"><label>Nama aset</label><input class="inp" name="nama_aset" placeholder="mis. Laptop admin, Mesin jahit, Motor kurir"></div>' +
          '<div class="field"><label>Jenis</label><select class="inp" name="jenis">' + jenis.map((j) => '<option value="' + esc(j.jenis) + '" data-u="' + j.umur + '" ' + (j.jenis === 'Peralatan & Perabot' ? 'selected' : '') + '>' + esc(j.jenis) + '</option>').join('') + '</select></div>' +
          '<div class="field"><label>Umur manfaat (bulan)</label><input type="number" class="inp" name="umur_bulan" min="0" max="480" value="48"><span class="hint">Peralatan 48 · Kendaraan 96 · Bangunan 240</span></div>' +
          '<div class="field"><label>Tanggal beli</label><input type="date" class="inp" name="tanggal_beli" value="' + R.hariIni() + '"></div><div class="field"><label>Mulai dipakai</label><input type="date" class="inp" name="tanggal_pakai" value="' + R.hariIni() + '"></div>' +
          '<div class="field"><label>Harga perolehan</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="harga_perolehan" data-rp inputmode="numeric"></div></div><div class="field"><label>Nilai sisa <span class="faint">(akhir umur)</span></label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="nilai_sisa" data-rp inputmode="numeric" placeholder="0"></div></div>' +
          '<div class="field full"><label>Sumber dana</label><div class="seg" data-sd></div></div><div class="full fgrid" data-sdisi style="display:contents"></div>' +
          '<div class="field full"><label>Bukti pembelian</label><div data-lamp></div></div></form>',
          kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan aset</button>' });
        const f = d.body.querySelector('form'); let sumber = 'Kas';
        R.kotakLampiran(d.body.querySelector('[data-lamp]'));
        f.jenis.onchange = () => { f.umur_bulan.value = f.jenis.selectedOptions[0].dataset.u; };
        const sd = () => { d.body.querySelector('[data-sdisi]').innerHTML = sumber === 'Kas' ? '<div class="field"><label>Dibayar dari</label><select class="inp" name="akun_kas">' + R.opsiKas() + '</select></div>'
          : sumber === 'Leasing' ? '<div class="field"><label>Uang muka (DP)</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="dp" data-rp inputmode="numeric"></div></div><div class="field"><label>DP dibayar dari</label><select class="inp" name="akun_kas">' + R.opsiKas() + '</select></div>'
          : '<div class="field"><label>Akumulasi penyusutan s/d saldo awal</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="akumulasi_awal" data-rp inputmode="numeric"></div></div><div class="field"><label>Disusutkan sampai bulan</label><input type="month" class="inp" name="penyusutan_terakhir"></div><div class="alert full">' + R.ic('info', 's18') + '<span>Untuk aset yang sudah dimiliki sebelum memakai aplikasi. Pastikan nilainya sama dengan saldo awal di Pembukuan.</span></div>';
          R.inpRpSemua(d.body); };
        R.seg(d.body.querySelector('[data-sd]'), [{ v: 'Kas', l: 'Tunai / transfer' }, { v: 'Leasing', l: 'Kredit / leasing' }, { v: 'Saldo Awal', l: 'Sudah dimiliki' }], sumber, (v) => { sumber = v; sd(); }); sd();
        d.foot.querySelector('[data-x2]').onclick = () => d.tutup();
        d.foot.querySelector('[data-ok]').onclick = async (e) => {
          const lamp = d.body.querySelector('[data-lamp]'); if (lamp.dataset.proses) return R.toast('Tunggu unggahan selesai…', 'info');
          const v = { sumber_dana: sumber, lampiran_url: lamp.dataset.id || '' };
          R.$$('[name]', f).forEach((i) => { v[i.name] = i.dataset.rp !== undefined ? R.nilai(i.value) : i.value; });
          const b = e.currentTarget; b.classList.add('busy');
          try { const r = await R.api.call('aset.save', v); R.toast(r._pesan); d.tutup(); muat(); } catch (ex) { R.galat(ex); b.classList.remove('busy'); }
        };
      }
      const tb = el.querySelector('[data-tbh]'); if (tb) tb.onclick = () => { if (!data) return; tambah(); };
      muat();
    }
  };

  // ============================================================
  // PAJAK UMKM
  // ============================================================
  let thPajak = null;
  R.halaman.pajak = {
    judul: 'Pajak UMKM', roles: R.PERAN.OAV,
    render(el, q, sub, nav) {
      const ini = +R.hariIni().slice(0, 4); thPajak = thPajak || ini;
      const OA = R.isOA();
      el.innerHTML = '<div class="page-head"><div><h2>Pajak UMKM</h2><p>PPh Final 0,5% dari omzet bulanan (PP 55/2022 jo. PP 20/2026).</p></div><div class="actions"><select class="inp sm" data-th style="width:auto">' + Array.from({ length: 11 }, (_, i) => ini - 5 + i).map((y) => '<option ' + (y === thPajak ? 'selected' : '') + '>' + y + '</option>').join('') + '</select></div></div><div data-isi>' + R.kerangka(3, 'kartu') + '</div>';
      el.querySelector('[data-th]').onchange = (e) => { thPajak = +e.target.value; muat(); };
      const isi = el.querySelector('[data-isi]');
      const muat = () => R.api.swr('pajak.list', { tahun: thPajak }, (d) => { if (R.masihDi(nav)) gambar(d); }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, isi, muat); });
      function gambar(d) {
        const pBebas = d.bebas ? Math.min(100, d.omzet_kumulatif / d.bebas * 100) : 100, pUmkm = Math.min(100, d.omzet_kumulatif / d.batas_umkm * 100);
        isi.innerHTML = (!d.final ? '<div class="alert w mb">' + R.ic('alert', 's18') + '<span>Bentuk usaha <b>' + esc(d.bentuk_usaha) + '</b> tidak memakai PPh Final UMKM. Pajak penghasilan badan dihitung dari laba fiskal (tarif umum/fasilitas Pasal 31E) — konsultasikan ke konsultan pajak. Tabel di bawah hanya informasi omzet.</span></div>' : '') +
          '<div class="grid g4 keep2">' + kpi('Omzet ' + d.tahun, R.rp(d.omzet_kumulatif), 'bag', '', 'kumulatif sampai bulan terakhir') + kpi('PPh Final terutang', R.rp(d.total_pph), 'landmark', 'o', 'tarif ' + R.persen(d.tarif)) + kpi('Sudah disetor', R.rp(d.total_setor), 'check', 'g') + kpi('Belum disetor', R.rp(d.kurang_setor), 'alert', d.kurang_setor ? 'r' : '', d.kurang_setor ? 'segera setor sebelum tgl ' + esc(((R.boot.usaha || {}).tgl_batas_setor) || 15) : 'tidak ada') + '</div>' +
          '<div class="grid g2 mt"><div class="card"><h3 class="sec">Batas omzet bebas pajak</h3><p class="sec-sub">' + (d.bebas ? 'Wajib pajak orang pribadi: omzet ' + R.rp(d.bebas) + ' pertama per tahun tidak kena PPh Final.' : 'Tidak ada batas bebas untuk bentuk usaha ini.') + '</p><div class="bar g mt"><i style="width:' + pBebas + '%"></i></div><div class="row between xs muted mt" style="margin-top:6px"><span>' + R.rpK(d.omzet_kumulatif) + '</span><span>' + (d.bebas ? R.rpK(d.bebas) : '–') + '</span></div></div>' +
          '<div class="card"><h3 class="sec">Batas omzet UMKM</h3><p class="sec-sub">Omzet di atas ' + R.rp(d.batas_umkm) + '/tahun tidak lagi memakai tarif final tahun berikutnya.</p><div class="bar ' + (pUmkm > 85 ? 'r' : 'l') + ' mt"><i style="width:' + pUmkm + '%"></i></div><div class="row between xs muted mt" style="margin-top:6px"><span>' + R.persen(pUmkm) + ' terpakai</span><span>' + R.rpK(d.batas_umkm) + '</span></div></div></div>' +
          '<div class="card p0 mt"><div class="card-head"><div><h3 class="sec">Masa pajak ' + d.tahun + '</h3><p class="sec-sub">Beban PPh dicatat otomatis saat penyesuaian akhir bulan. Setor via e-Billing, lalu catat NTPN di sini.</p></div></div><div data-list></div></div>';
        R.tabel(isi.querySelector('[data-list]'), { baris: d.baris, kosong: 'Belum ada omzet di tahun ini', kosongIkon: 'landmark', total: { omzet: d.omzet_kumulatif, omzet_kena_pajak: d.baris.reduce((s, x) => s + x.omzet_kena_pajak, 0), pph_final: d.total_pph }, kolom: [
          { k: 'label', label: 'Masa pajak', lead: true, render: (b) => '<b>' + esc(b.label) + '</b>' + (b.berjalan ? ' <span class="badge b">berjalan</span>' : '') },
          { k: 'omzet', label: 'Omzet', tipe: 'rp' }, { k: 'omzet_kumulatif', label: 'Kumulatif', tipe: 'rp', hideM: true }, { k: 'omzet_kena_pajak', label: 'Kena pajak', tipe: 'rp', hideM: true },
          { k: 'pph_final', label: 'PPh final', tipe: 'rp', render: (b) => '<b>' + R.rp(b.pph_final) + '</b>' }, { k: 'batas_setor', label: 'Batas setor', tipe: 'tgl', hideM: true },
          { k: 'status', label: 'Status', render: (b) => '<span class="badge ' + ({ 'Sudah Setor': 'g', 'Belum Setor': b.batas_setor < R.hariIni() ? 'r' : 'a', Nihil: '' }[b.status] || '') + '">' + esc(b.status) + '</span>' + (b.ntpn ? '<span class="t2">NTPN ' + esc(b.ntpn) + '</span>' : '') },
          { k: 'aksi', label: '', render: (b) => OA && !b.berjalan && b.pph_final > 0 && b.status !== 'Sudah Setor' ? '<button class="btn xs primary" data-setor="' + b.periode + '">Catat setoran</button>' : OA && !b.id_jurnal_beban && b.omzet > 0 && !b.berjalan ? '<button class="btn xs" data-catat="' + b.periode + '">Hitung beban</button>' : '' }] });
        R.on(isi, 'click', '[data-catat]', async (e, b) => { b.classList.add('busy'); try { const r = await R.api.call('pajak.catat', { periode: b.dataset.catat }); R.toast(r._pesan); muat(); } catch (ex) { R.galat(ex); b.classList.remove('busy'); } });
        R.on(isi, 'click', '[data-setor]', (e, b) => {
          const x = d.baris.find((y) => y.periode === b.dataset.setor);
          const dr = R.drawer({ judul: 'Setor PPh Final ' + x.label, isi: '<div class="card tint flat"><div class="small muted">Jumlah disetor</div><div class="num" style="font-size:26px;font-weight:800">' + R.rp(x.pph_final) + '</div><div class="xs muted">Kode akun pajak 411128 · kode jenis setoran 420</div></div><form class="stack mt"><div class="field"><label>Tanggal setor</label><input type="date" class="inp" name="tanggal" value="' + R.hariIni() + '"></div><div class="field"><label>NTPN</label><input class="inp" name="ntpn" maxlength="40" placeholder="16 karakter dari bukti penerimaan negara" style="text-transform:uppercase"></div><div class="field"><label>Dibayar dari</label><select class="inp" name="akun_kas">' + R.opsiKas((R.akunKas().find((a) => /Bank/.test(a.nama)) || {}).no) + '</select></div><div class="field"><label>Bukti setor</label><div data-lamp></div></div></form>',
            kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan setoran</button>' });
          R.kotakLampiran(dr.body.querySelector('[data-lamp]'));
          dr.foot.querySelector('[data-x2]').onclick = () => dr.tutup();
          dr.foot.querySelector('[data-ok]').onclick = async (ev) => {
            const f = dr.body.querySelector('form'), bt = ev.currentTarget, lamp = dr.body.querySelector('[data-lamp]'); bt.classList.add('busy');
            try { const r = await R.api.call('pajak.setor', { periode: x.periode, tanggal: f.tanggal.value, ntpn: f.ntpn.value.trim().toUpperCase(), akun_kas: f.akun_kas.value, lampiran_url: lamp.dataset.id || '' }); R.toast(r._pesan); dr.tutup(); muat(); R.app.muatNotif(); }
            catch (ex) { R.galat(ex); bt.classList.remove('busy'); }
          };
        });
      }
      muat();
    }
  };

  // ============================================================
  // SIMULASI HARGA
  // ============================================================
  R.halaman.simulasi = {
    judul: 'Simulasi Harga', roles: R.PERAN.SEMUA,
    render(el) {
      const chs = (R.boot.channel || []).filter((c) => c.aktif);
      const prod = R.boot.produk || [];
      el.innerHTML = '<div class="page-head"><div><h2>Simulasi harga & laba</h2><p>Hitung laba per barang setelah potongan marketplace, iklan, dan ongkir — sebelum menentukan harga.</p></div></div>' +
        '<div class="grid g-1-2"><form class="card stack" novalidate>' + (prod.length ? '<div class="field"><label>Ambil dari produk <span class="faint">(opsional)</span></label><select class="inp" name="sku"><option value="">— isi manual —</option>' + prod.map((p) => '<option value="' + esc(p.sku) + '">' + esc(p.sku + ' · ' + p.nama) + '</option>').join('') + '</select></div>' : '') +
        '<div class="field"><label>HPP / modal per barang</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="hpp" data-rp inputmode="numeric" value="60.000"></div></div>' +
        '<div class="field"><label>Harga jual</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="harga" data-rp inputmode="numeric" value="150.000"></div></div>' +
        '<div class="field"><label>Diskon / voucher penjual per barang</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="diskon" data-rp inputmode="numeric" placeholder="0"></div></div>' +
        '<div class="field"><label>Biaya iklan per barang terjual</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="iklan" data-rp inputmode="numeric" placeholder="0"></div><span class="hint">Total biaya iklan ÷ jumlah terjual</span></div>' +
        '<div class="field"><label>Ongkir ditanggung penjual + kemasan</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="ongkir" data-rp inputmode="numeric" placeholder="0"></div></div>' +
        '<div class="field"><label>Target margin laba</label><div class="inp-group"><input class="inp" name="target" type="number" min="0" max="80" value="20" style="padding-right:40px"><span class="pre" style="left:auto;right:14px">%</span></div></div></form>' +
        '<div><div class="card p0"><div class="card-head"><div><h3 class="sec">Perbandingan per channel</h3><p class="sec-sub">Potongan dari profil biaya channel di Master Data.</p></div></div><div data-tbl></div></div><div class="alert mt">' + R.ic('info', 's18') + '<span><b>Harga minimal</b> = harga jual agar margin laba bersih per barang mencapai target. Angka simulasi, bukan jurnal.</span></div></div></div>';
      R.inpRpSemua(el);
      const f = el.querySelector('form');
      const hitung = () => {
        const v = (n) => R.nilai(f[n].value);
        const hpp = v('hpp'), harga = v('harga'), dis = v('diskon'), ik = v('iklan'), og = v('ongkir'), tgt = Math.min(80, Math.max(0, +f.target.value || 0)) / 100;
        const rows = chs.map((c) => {
          const pot = c.tipe === 'Marketplace' ? R.potonganProfil(c.id, R.hariIni(), harga - dis, true) : { potongan_admin: 0, komisi_affiliate: 0, ongkir_penjual: 0, biaya_lain: 0 };
          const tp = pot.potongan_admin + pot.komisi_affiliate + pot.ongkir_penjual + pot.biaya_lain;
          const laba = harga - dis - tp - hpp - ik - og;
          // harga minimal: cari dengan iterasi (potongan persen + batas maksimum)
          let lo = hpp, hi = Math.max(hpp * 5, 10000);
          for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const p = c.tipe === 'Marketplace' ? R.potonganProfil(c.id, R.hariIni(), m - dis, true) : { potongan_admin: 0, komisi_affiliate: 0, ongkir_penjual: 0, biaya_lain: 0 }; const l = m - dis - (p.potongan_admin + p.komisi_affiliate + p.ongkir_penjual + p.biaya_lain) - hpp - ik - og; if (l >= tgt * m) hi = m; else lo = m; }
          return { id: c.id, nama: c.nama, warna: c.warna, potongan: tp, persen: harga ? tp / harga * 100 : 0, dana: harga - dis - tp, laba: laba, margin: harga ? laba / harga * 100 : 0, minimal: Math.ceil(hi / 100) * 100 };
        });
        R.tabel(el.querySelector('[data-tbl]'), { baris: rows, kolom: [
          { k: 'nama', label: 'Channel', lead: true, render: (r) => R.chTag(r.id) },
          { k: 'potongan', label: 'Potongan', tipe: 'rp', render: (r) => R.rp(r.potongan) + '<span class="t2">' + R.persen(r.persen) + '</span>' },
          { k: 'dana', label: 'Dana diterima', tipe: 'rp' },
          { k: 'laba', label: 'Laba / barang', tipe: 'rp', render: (r) => '<b class="' + (r.laba < 0 ? 'neg' : 'pos') + '">' + R.rp(r.laba) + '</b><span class="t2">margin ' + R.persen(r.margin) + '</span>' },
          { k: 'minimal', label: 'Harga minimal', tipe: 'rp', render: (r) => '<b>' + R.rp(r.minimal) + '</b>' }] });
      };
      if (f.sku) f.sku.onchange = () => { const p = R.mProd[f.sku.value]; if (p) { f.hpp.value = R.angka(p.hpp); f.harga.value = R.angka(p.harga || p.hpp * 2); } hitung(); };
      f.addEventListener('input', R.tunda(hitung, 120));
      hitung();
    }
  };
})();
