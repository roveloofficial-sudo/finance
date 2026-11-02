/* ROVELO Finance — Pembukuan (jurnal, buku besar, neraca saldo, penyesuaian, tutup buku, saldo awal) & Master Data */
(function () {
  const R = window.R;
  const esc = R.esc;
  const opsiAkun = (pilih, filter) => {
    const kel = {}; ((R.boot && R.boot.kelompok) || []).forEach((k) => { kel[k.kode] = k.nama; });
    const grup = {}; (R.boot.akun || []).filter((a) => a.aktif && (!filter || filter(a))).forEach((a) => { (grup[a.kel] = grup[a.kel] || []).push(a); });
    return '<option value="">— pilih akun —</option>' + Object.keys(grup).sort().map((g) => '<optgroup label="' + esc(g + ' ' + (kel[g] || '')) + '">' + grup[g].map((a) => '<option value="' + a.no + '" ' + (a.no === pilih ? 'selected' : '') + '>' + a.no + ' · ' + esc(a.nama) + '</option>').join('') + '</optgroup>').join('');
  };
  R.opsiAkun = opsiAkun;
  const sb = { tab: 'jurnal', per: null, jenis: '', status: '', cari: '', hal: 1, akun: '1-1201', tglNs: null, versi: 'sesudah', periodeP: null };

  R.halaman.pembukuan = {
    judul: 'Pembukuan', roles: R.PERAN.OA,
    render(el, q, sub, nav) {
      sb.per = sb.per || R.rentang('bulan');
      if (q.tab) sb.tab = q.tab;
      const T = [{ id: 'jurnal', label: 'Daftar jurnal' }, { id: 'umum', label: 'Jurnal umum' }, { id: 'bb', label: 'Buku besar' }, { id: 'ns', label: 'Neraca saldo' }, { id: 'penyesuaian', label: 'Penyesuaian' }, { id: 'tutup', label: 'Tutup buku' }].concat(R.peran() === R.PERAN.O ? [{ id: 'saldo', label: 'Saldo awal' }] : []);
      el.innerHTML = '<div class="page-head"><div><h2>Pembukuan</h2><p>Jurnal berpasangan, buku besar, dan penutupan periode — untuk Admin Keuangan & Owner.</p></div></div><div data-tabs></div><div data-isi></div>';
      const isi = el.querySelector('[data-isi]');
      const buka = (t) => { sb.tab = t; R.ubahQuery({ tab: t }); R.tabs(el.querySelector('[data-tabs]'), T, t, buka); ({ jurnal: jurnal, umum: umum, bb: bukuBesar, ns: neracaSaldo, penyesuaian: penyesuaian, tutup: tutup, saldo: saldoAwal })[t](isi, nav, buka); };
      buka(T.some((t) => t.id === sb.tab) ? sb.tab : 'jurnal');
    }
  };

  function jurnal(el, nav) {
    el.innerHTML = '<div class="card p0"><div style="padding:14px 16px" class="row wrap between"><div data-per></div><div class="row wrap" style="gap:8px"><select class="inp sm" data-j style="width:auto"><option value="">Semua jenis</option>' + [['KK', 'Kas keluar'], ['KM', 'Kas masuk'], ['TF', 'Transfer'], ['JU', 'Jurnal umum'], ['JP', 'Penyesuaian'], ['JB', 'Pembalik'], ['SA', 'Saldo awal'], ['JT', 'Penutup']].map((x) => '<option value="' + x[0] + '" ' + (sb.jenis === x[0] ? 'selected' : '') + '>' + x[0] + ' · ' + x[1] + '</option>').join('') + '</select><select class="inp sm" data-s style="width:auto"><option value="">Semua status</option><option>Diposting</option><option>Draft</option><option>Dibatalkan</option></select><input class="inp sm" data-c placeholder="Cari" value="' + esc(sb.cari) + '" style="width:160px"></div></div><div data-list>' + R.kerangka(6) + '</div><div data-pager></div></div>';
    el.querySelector('[data-s]').value = sb.status;
    R.periode(el.querySelector('[data-per]'), { nilai: sb.per, preset: ['hari', '7hari', 'bulan', 'bulanlalu', 'tahun', 'kustom'], ubah: (v) => { sb.per = v; sb.hal = 1; muat(); } });
    el.querySelector('[data-j]').onchange = (e) => { sb.jenis = e.target.value; sb.hal = 1; muat(); };
    el.querySelector('[data-s]').onchange = (e) => { sb.status = e.target.value; sb.hal = 1; muat(); };
    el.querySelector('[data-c]').oninput = R.tunda((e) => { sb.cari = e.target.value.trim(); sb.hal = 1; muat(); }, 350);
    function muat() {
      R.api.swr('pembukuan.jurnalList', { dari: sb.per.dari, sampai: sb.per.sampai, jenis: sb.jenis, status: sb.status, cari: sb.cari, halaman: sb.hal }, (d) => {
        if (!R.masihDi(nav)) return;
        const box = el.querySelector('[data-list]');
        box.innerHTML = d.baris.length ? '<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Tanggal</th><th>No. bukti / akun</th><th class="n">Debit</th><th class="n">Kredit</th></tr></thead><tbody>' + d.baris.map((j) =>
          '<tr style="background:#FAFBFC"><td class="nowrap"><b>' + R.tgl(j.tanggal) + '</b></td><td><b>' + esc(j.no_bukti) + '</b> · ' + esc(j.deskripsi) + ' <span class="badge ' + ({ Diposting: 'g', Draft: 'a', Dibatalkan: 'r' }[j.status] || '') + '">' + esc(j.status) + '</span>' + (j.catatan_batal ? '<span class="t2">' + esc(j.catatan_batal) + '</span>' : '') + '</td><td class="n"></td><td class="n"></td></tr>' +
          (j.lines || []).map((l) => '<tr><td></td><td style="padding-left:' + (l.kredit ? 36 : 16) + 'px"><span class="faint xs">' + esc(l.no_akun) + '</span> ' + esc(R.namaAkun(l.no_akun)) + (l.id_channel ? ' <span class="badge">' + esc(l.id_channel) + '</span>' : '') + (l.keterangan ? '<span class="t2">' + esc(l.keterangan) + '</span>' : '') + '</td><td class="n">' + (l.debit ? R.rp(l.debit) : '') + '</td><td class="n">' + (l.kredit ? R.rp(l.kredit) : '') + '</td></tr>').join('')).join('') + '</tbody></table></div>' : R.kosong('Tidak ada jurnal', 'Ubah filter periode atau jenis.', 'book');
        R.pager(el.querySelector('[data-pager]'), d, (h) => { sb.hal = h; muat(); });
      }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    }
    muat();
  }

  function umum(el) {
    const v = { lines: [{ no_akun: '', debit: 0, kredit: 0 }, { no_akun: '', debit: 0, kredit: 0 }] };
    el.innerHTML = '<div class="grid g-2-1"><form class="card" novalidate><div class="alert mb">' + R.ic('info', 's18') + '<span>Untuk koreksi atau transaksi yang tidak tersedia di menu lain. Total debit harus sama dengan total kredit.</span></div><div class="fgrid"><div class="field"><label>Tanggal</label><input type="date" class="inp" name="tanggal" value="' + R.hariIni() + '"></div><div class="field"><label>Jenis</label><select class="inp" name="jenis"><option value="JU">JU · Jurnal umum</option><option value="JP">JP · Penyesuaian</option></select></div><div class="field full"><label>Keterangan</label><input class="inp" name="deskripsi" maxlength="200" placeholder="mis. Koreksi salah akun KK/2611/0012"></div></div>' +
      '<h3 class="sec mt-l">Baris jurnal</h3><div class="line-editor mt" data-lines></div><button type="button" class="btn sm" data-tbh>' + R.ic('plus', 's16') + ' Tambah baris</button><div class="field mt"><label>Lampiran</label><div data-lamp></div></div></form>' +
      '<div><div class="card" style="position:sticky;top:80px"><h3 class="sec">Keseimbangan</h3><div class="sum-box mt" data-sum></div><button class="btn primary block mt" data-simpan>Simpan jurnal</button></div></div></div>';
    const f = el.querySelector('form');
    R.kotakLampiran(el.querySelector('[data-lamp]'));
    function baris() {
      el.querySelector('[data-lines]').innerHTML = v.lines.map((l, i) => '<div class="le-row" data-i="' + i + '"><select class="inp" data-k="no_akun">' + opsiAkun(l.no_akun) + '</select><input class="inp" data-k="debit" data-rp inputmode="numeric" placeholder="Debit" value="' + (l.debit ? R.angka(l.debit) : '') + '"><input class="inp" data-k="kredit" data-rp inputmode="numeric" placeholder="Kredit" value="' + (l.kredit ? R.angka(l.kredit) : '') + '"><button type="button" class="btn ghost icon" data-x ' + (v.lines.length < 3 ? 'disabled' : '') + ' aria-label="Hapus baris">' + R.ic('trash', 's18') + '</button></div>').join('');
      R.inpRpSemua(el); sum();
    }
    function sum() {
      const d = v.lines.reduce((s, l) => s + (l.debit || 0), 0), k = v.lines.reduce((s, l) => s + (l.kredit || 0), 0);
      el.querySelector('[data-sum]').innerHTML = '<dl class="kv"><dt>Total debit</dt><dd>' + R.rp(d) + '</dd><dt>Total kredit</dt><dd>' + R.rp(k) + '</dd></dl><div class="tot"><span>Selisih</span><span class="num ' + (d === k && d ? 'pos' : 'neg') + '">' + (d === k && d ? '✓ Seimbang' : R.rp(d - k)) + '</span></div>';
    }
    el.querySelector('[data-lines]').addEventListener('input', (e) => { const r = e.target.closest('[data-i]'); if (!r) return; const l = v.lines[+r.dataset.i], k = e.target.dataset.k; l[k] = k === 'no_akun' ? e.target.value : R.nilai(e.target.value); sum(); });
    el.querySelector('[data-lines]').addEventListener('change', (e) => { const r = e.target.closest('[data-i]'); if (r && e.target.dataset.k === 'no_akun') v.lines[+r.dataset.i].no_akun = e.target.value; });
    R.on(el, 'click', '[data-x]', (e, b) => { v.lines.splice(+b.closest('[data-i]').dataset.i, 1); baris(); });
    el.querySelector('[data-tbh]').onclick = () => { v.lines.push({ no_akun: '', debit: 0, kredit: 0 }); baris(); };
    el.querySelector('[data-simpan]').onclick = async (e) => {
      const b = e.currentTarget, lamp = el.querySelector('[data-lamp]');
      const lines = v.lines.filter((l) => l.no_akun && (l.debit || l.kredit));
      if (lines.length < 2) return R.toast('Isi minimal 2 baris dengan akun dan nominal.', 'err');
      if (!f.deskripsi.value.trim()) return R.toast('Isi keterangan jurnal.', 'err');
      b.classList.add('busy');
      try { const r = await R.api.call('pembukuan.jurnalUmum', { tanggal: f.tanggal.value, jenis: f.jenis.value, deskripsi: f.deskripsi.value.trim(), lines: lines, lampiran_url: lamp.dataset.id || '' }); R.toast(r._pesan); v.lines = [{ no_akun: '', debit: 0, kredit: 0 }, { no_akun: '', debit: 0, kredit: 0 }]; f.deskripsi.value = ''; baris(); }
      catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
    };
    baris();
  }

  function bukuBesar(el, nav) {
    el.innerHTML = '<div class="card mb" style="padding:12px 16px"><div class="row wrap between"><select class="inp sm" data-a style="width:auto;max-width:340px">' + opsiAkun(sb.akun) + '</select><div data-per></div><button class="btn sm" data-xls>' + R.ic('download', 's16') + ' Excel</button></div></div><div data-isi></div>';
    let data = null;
    R.periode(el.querySelector('[data-per]'), { nilai: sb.per, preset: ['bulan', 'bulanlalu', '6bulan', 'tahun', 'kustom'], ubah: (v) => { sb.per = v; muat(); } });
    el.querySelector('[data-a]').onchange = (e) => { sb.akun = e.target.value; muat(); };
    function muat() {
      if (!sb.akun) return;
      const isi = el.querySelector('[data-isi]'); isi.innerHTML = R.kerangka(6);
      R.api.swr('pembukuan.bukuBesar', { no_akun: sb.akun, dari: sb.per.dari, sampai: sb.per.sampai }, (d) => {
        if (!R.masihDi(nav)) return; data = d;
        isi.innerHTML = '<div class="grid g4 keep2 mb">' + [['Saldo awal', d.saldo_awal], ['Total debit', d.total_debit], ['Total kredit', d.total_kredit], ['Saldo akhir', d.saldo_akhir]].map((x) => '<div class="sum-box"><div class="xs muted">' + x[0] + '</div><b class="num">' + R.rp(x[1]) + '</b></div>').join('') + '</div><div class="card p0"><div class="card-head"><div><h3 class="sec">' + esc(d.akun.no + ' · ' + d.akun.nama) + '</h3><div class="sec-sub">Saldo normal ' + esc(d.akun.saldo_normal) + ' · ' + esc(sb.per.label) + '</div></div></div><div data-t></div></div>';
        R.tabel(isi.querySelector('[data-t]'), { baris: d.baris, ringkas: true, kosong: 'Tidak ada mutasi', kolom: [{ k: 'tanggal', label: 'Tanggal', tipe: 'tgl' }, { k: 'no_bukti', label: 'No. bukti', lead: true }, { k: 'keterangan', label: 'Keterangan' }, { k: 'debit', label: 'Debit', tipe: 'rp' }, { k: 'kredit', label: 'Kredit', tipe: 'rp' }, { k: 'saldo', label: 'Saldo', tipe: 'rp', render: (r) => '<b>' + R.rp(r.saldo) + '</b>' }] });
      }).catch((e) => R.gagalMuat(e, el.querySelector('[data-isi]'), muat));
    }
    el.querySelector('[data-xls]').onclick = () => { if (data) R.xlsx.unduh('Buku Besar ' + data.akun.no + ' ' + sb.per.label, [{ nama: 'Buku Besar ' + data.akun.no, baris: [{ Tanggal: '', 'No. Bukti': '', Keterangan: 'Saldo awal', Debit: '', Kredit: '', Saldo: data.saldo_awal }].concat(data.baris.map((r) => ({ Tanggal: r.tanggal, 'No. Bukti': r.no_bukti, Keterangan: r.keterangan, Debit: r.debit, Kredit: r.kredit, Saldo: r.saldo }))) }]).catch(R.galat); };
    muat();
  }

  function neracaSaldo(el, nav) {
    sb.tglNs = sb.tglNs || R.hariIni();
    el.innerHTML = '<div class="card mb" style="padding:12px 16px"><div class="row wrap between"><div class="row wrap"><label class="lbl-f">Per tanggal</label><input type="date" class="inp sm" data-t value="' + sb.tglNs + '" style="width:auto"><div data-v></div></div><button class="btn sm" data-xls>' + R.ic('download', 's16') + ' Excel</button></div></div><div class="card p0" data-isi>' + R.kerangka(8) + '</div>';
    let data = null;
    R.seg(el.querySelector('[data-v]'), [{ v: 'sesudah', l: 'Setelah penyesuaian' }, { v: 'sebelum', l: 'Sebelum penyesuaian' }], sb.versi, (v) => { sb.versi = v; muat(); });
    el.querySelector('[data-t]').onchange = (e) => { sb.tglNs = e.target.value; muat(); };
    function muat() {
      R.api.swr('pembukuan.neracaSaldo', { tanggal: sb.tglNs, versi: sb.versi }, (d) => {
        if (!R.masihDi(nav)) return; data = d;
        const box = el.querySelector('[data-isi]');
        box.innerHTML = '<div class="card-head"><div><h3 class="sec">Neraca saldo per ' + R.tglP(d.tanggal) + '</h3><div class="sec-sub">' + (d.versi === 'sebelum' ? 'Sebelum' : 'Setelah') + ' jurnal penyesuaian</div></div>' + (d.seimbang ? '<span class="badge g">' + R.ic('check', 's16') + ' Seimbang</span>' : '<span class="badge r">Tidak seimbang</span>') + '</div><div data-tb></div>';
        R.tabel(box.querySelector('[data-tb]'), { baris: d.baris, ringkas: true, total: { debit: d.total_debit, kredit: d.total_kredit }, kolom: [{ k: 'no', label: 'No. akun', lead: true }, { k: 'nama', label: 'Nama akun' }, { k: 'debit', label: 'Debit', tipe: 'rp' }, { k: 'kredit', label: 'Kredit', tipe: 'rp' }] });
      }).catch((e) => R.gagalMuat(e, el.querySelector('[data-isi]'), muat));
    }
    el.querySelector('[data-xls]').onclick = () => { if (data) R.xlsx.unduh('Neraca Saldo ' + data.tanggal, [{ nama: 'Neraca Saldo', baris: data.baris.map((r) => ({ 'No. Akun': r.no, 'Nama Akun': r.nama, Debit: r.debit, Kredit: r.kredit })).concat([{ 'No. Akun': '', 'Nama Akun': 'TOTAL', Debit: data.total_debit, Kredit: data.total_kredit }]) }]).catch(R.galat); };
    muat();
  }

  function penyesuaian(el) {
    sb.periodeP = sb.periodeP || R.tambahBulan(R.hariIni().slice(0, 7), -1);
    el.innerHTML = '<div class="grid g2"><div class="card"><h3 class="sec">Penyesuaian akhir bulan</h3><p class="sec-sub">Jalankan setelah semua transaksi bulan itu tercatat. Aman diulang.</p><ul class="small muted" style="padding-left:18px;line-height:1.8"><li>Penyusutan aset tetap (garis lurus)</li><li>Amortisasi sewa/asuransi dibayar di muka</li><li>Beban PPh Final UMKM bulan tersebut</li><li>Opsional: selisih nilai stok dengan ROVELO Inventory</li></ul>' +
      '<form class="stack mt" novalidate><div class="field"><label>Bulan</label><input type="month" class="inp" name="periode" value="' + sb.periodeP + '"></div><div class="field"><label>Nilai stok akhir bulan menurut Inventory <span class="faint">(opsional)</span></label><div class="row"><div class="inp-group grow"><span class="pre">Rp</span><input class="inp" name="nilai_stok" data-rp inputmode="numeric" placeholder="kosongkan bila tidak opname"></div><button type="button" class="btn" data-sync>' + R.ic('refresh', 's16') + ' Ambil</button></div><span class="hint">Selisih dengan saldo Persediaan dicatat ke akun Selisih Stok Opname (5-1103).</span></div><button class="btn primary" data-jalan>' + R.ic('check', 's18') + ' Jalankan penyesuaian</button></form></div>' +
      '<div class="card"><h3 class="sec">Hasil</h3><div data-hasil class="mt">' + R.kosong('Belum dijalankan', 'Hasil jurnal penyesuaian akan tampil di sini.', 'layers') + '</div></div></div>';
    R.inpRpSemua(el);
    const f = el.querySelector('form');
    f.periode.onchange = () => { sb.periodeP = f.periode.value; };
    el.querySelector('[data-sync]').onclick = async (e) => {
      const b = e.currentTarget; b.classList.add('busy');
      try { const r = await R.api.call('inventory.syncProduk', {}); R.toast(r._pesan); if (r.nilai_stok !== null && r.nilai_stok !== undefined) f.nilai_stok.value = R.angka(r.nilai_stok); R.app.muatUlangBoot(); }
      catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
    };
    el.querySelector('[data-jalan]').onclick = async (e) => {
      e.preventDefault(); const b = e.currentTarget; b.classList.add('busy');
      try {
        const r = await R.api.call('pembukuan.penyesuaian', { periode: f.periode.value, nilai_stok: f.nilai_stok.value.trim() === '' ? '' : R.nilai(f.nilai_stok.value) });
        R.toast(r._pesan);
        el.querySelector('[data-hasil]').innerHTML = r.hasil.length ? r.hasil.map((h) => '<div class="list-row"><span class="lr-ic">' + R.ic('layers', 's18') + '</span><span class="lr-main"><b>' + esc(h.jenis) + '</b><small>' + esc(h.no_bukti) + '</small></span><b class="num">' + R.rp(h.nilai) + '</b></div>').join('') : R.kosong('Tidak ada penyesuaian baru', 'Semua sudah tercatat untuk bulan ini.', 'check');
      } catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
    };
  }

  function tutup(el, nav) {
    const ini = +R.hariIni().slice(0, 4);
    el.innerHTML = '<div class="grid g-1-2"><div class="card p0"><div class="card-head"><h3 class="sec">Periode</h3></div><div data-list>' + R.kerangka(6) + '</div></div><div><div class="card" data-cek>' + R.kosong('Pilih periode', 'Klik salah satu bulan untuk memeriksa kesiapan tutup buku.', 'lock') + '</div>' +
      '<div class="card mt"><h3 class="sec">Tutup tahun buku</h3><p class="sec-sub">Membuat jurnal penutup: saldo pendapatan & beban dipindah ke Laba Ditahan, prive ke Modal. Laporan laba rugi tahun itu tetap utuh.</p><div class="row mt"><select class="inp" data-th style="width:auto">' + [ini - 2, ini - 1, ini].map((y) => '<option ' + (y === ini - 1 ? 'selected' : '') + '>' + y + '</option>').join('') + '</select><button class="btn dark" data-tt>' + R.ic('lock', 's16') + ' Tutup tahun</button></div></div></div></div>';
    const muat = () => R.api.swr('periode.list', {}, (d) => {
      if (!R.masihDi(nav)) return;
      R.tabel(el.querySelector('[data-list]'), { baris: d, ringkas: true, klik: (p) => cek(p.periode), kolom: [{ k: 'label', label: 'Bulan', lead: true }, { k: 'status', label: 'Status', render: (p) => '<span class="badge ' + (p.status === 'Terkunci' ? 'k' : 'a') + '">' + R.ic(p.status === 'Terkunci' ? 'lock' : 'unlock', 's16') + ' ' + esc(p.status) + '</span>' + (p.dikunci_oleh ? '<span class="t2">oleh ' + esc(p.dikunci_oleh) + '</span>' : '') }] });
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    async function cek(p) {
      const box = el.querySelector('[data-cek]'); box.innerHTML = '<div class="sk t"></div>' + '<div class="sk l"></div>'.repeat(5);
      try {
        const d = await R.api.get('periode.cek', { periode: p });
        box.innerHTML = '<div class="card-head"><div><h3 class="sec">Tutup buku ' + esc(d.label) + '</h3><div class="sec-sub">' + (d.terkunci ? 'Periode terkunci — transaksi bertanggal bulan ini tidak bisa ditambah/diubah.' : 'Kunci periode setelah semua pemeriksaan lulus.') + '</div></div>' + (d.terkunci ? '<span class="badge k">' + R.ic('lock', 's16') + ' Terkunci</span>' : '') + '</div>' +
          d.cek.map((c) => '<div class="list-row"><span class="lr-ic ' + (c.ok ? 'in' : 'out') + '">' + R.ic(c.ok ? 'check' : 'x', 's18') + '</span><span class="lr-main"><b>' + esc(c.label) + '</b>' + (c.info ? '<small>' + esc(c.info) + '</small>' : '') + '</span></div>').join('') +
          '<div class="actions mt">' + (d.terkunci ? (R.peran() === R.PERAN.O ? '<button class="btn" data-buka>' + R.ic('unlock', 's16') + ' Buka kunci</button>' : '<span class="small muted">Hanya Owner yang bisa membuka kunci.</span>') : (!d.siap ? '<a class="btn" href="#/pembukuan?tab=penyesuaian">Jalankan penyesuaian</a><a class="btn" href="#/transaksi?status=Draft">Lihat draft</a>' : '') + '<button class="btn dark" data-kunci ' + (d.siap ? '' : 'disabled') + '>' + R.ic('lock', 's16') + ' Kunci periode</button>') + '</div>';
        const k = box.querySelector('[data-kunci]'); if (k) k.onclick = async () => { if (!await R.konfirmasi({ judul: 'Kunci ' + d.label + '?', pesan: 'Setelah dikunci, transaksi bertanggal bulan ini tidak bisa ditambah atau diubah.', ok: 'Kunci', ikon: 'lock' })) return; k.classList.add('busy'); try { const r = await R.api.call('periode.kunci', { periode: p }); R.toast(r._pesan); R.app.muatUlangBoot(); muat(); cek(p); } catch (ex) { R.galat(ex); k.classList.remove('busy'); } };
        const bk = box.querySelector('[data-buka]'); if (bk) bk.onclick = async () => { const a = await R.konfirmasi({ judul: 'Buka kunci ' + d.label + '?', pesan: 'Laporan bulan ini bisa berubah setelah dibuka.', bahaya: true, ok: 'Buka kunci', input: { label: 'Alasan', wajib: true } }); if (!a) return; try { const r = await R.api.call('periode.buka', { periode: p, alasan: a }); R.toast(r._pesan); R.app.muatUlangBoot(); muat(); cek(p); } catch (ex) { R.galat(ex); } };
      } catch (e) { box.innerHTML = R.kosong('Gagal memeriksa', e.message, 'alert'); }
    }
    el.querySelector('[data-tt]').onclick = async (e) => {
      const th = el.querySelector('[data-th]').value;
      if (!await R.konfirmasi({ judul: 'Tutup tahun ' + th + '?', pesan: 'Jurnal penutup (JT) dibuat per 31 Desember ' + th + '. Lakukan setelah semua bulan di tahun itu selesai.', ok: 'Tutup tahun', ikon: 'lock' })) return;
      const b = e.currentTarget; b.classList.add('busy');
      try { const r = await R.api.call('periode.tutupTahun', { tahun: +th }); R.toast(r._pesan); } catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
    };
    muat();
  }

  function saldoAwal(el) {
    const akun = (R.boot.akun || []).filter((a) => a.aktif && +a.no.charAt(0) <= 3 && !/^3-9/.test(a.no) && a.no !== '3-2201');
    el.innerHTML = '<div class="alert w mb">' + R.ic('alert', 's18') + '<span>Isi <b>sekali</b> saat mulai memakai aplikasi: saldo setiap akun neraca per tanggal mulai. Selisih otomatis masuk akun Ekuitas Saldo Awal (3-9201). Aset tetap yang sudah dimiliki dicatat juga di menu Aset (sumber dana "Sudah dimiliki").</span></div>' +
      '<div class="grid g-2-1"><div class="card p0"><div class="card-head"><div class="row"><label class="lbl-f">Tanggal saldo awal</label><input type="date" class="inp sm" data-t value="' + (R.boot.usaha.tanggal_mulai || R.hariIni().slice(0, 7) + '-01') + '" style="width:auto"></div></div><div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Akun</th><th>Normal</th><th class="n">Saldo</th></tr></thead><tbody>' +
      akun.map((a) => '<tr><td><span class="faint xs">' + a.no + '</span> ' + esc(a.nama) + '</td><td class="small muted">' + esc(a.normal) + '</td><td class="n"><input class="inline-in" style="width:150px" data-no="' + a.no + '" data-n="' + a.normal + '" data-rp inputmode="numeric" placeholder="0"></td></tr>').join('') + '</tbody></table></div></div>' +
      '<div><div class="card" style="position:sticky;top:80px"><h3 class="sec">Ringkasan</h3><div class="sum-box mt" data-sum></div><button class="btn primary block mt" data-simpan>Simpan saldo awal</button></div></div></div>';
    R.inpRpSemua(el);
    const sum = () => { let d = 0, k = 0; R.$$('[data-no]', el).forEach((i) => { const n = R.nilai(i.value); if (i.dataset.n === 'Debit') d += n; else k += n; }); el.querySelector('[data-sum]').innerHTML = '<dl class="kv"><dt>Total aset (debit)</dt><dd>' + R.rp(d) + '</dd><dt>Liabilitas + modal (kredit)</dt><dd>' + R.rp(k) + '</dd></dl><div class="tot"><span>Ke Ekuitas Saldo Awal</span><span class="num">' + R.rp(d - k) + '</span></div>'; };
    el.addEventListener('input', R.tunda(sum, 100)); sum();
    el.querySelector('[data-simpan]').onclick = async (e) => {
      const baris = R.$$('[data-no]', el).map((i) => ({ no_akun: i.dataset.no, saldo: R.nilai(i.value) })).filter((x) => x.saldo);
      if (!baris.length) return R.toast('Isi minimal satu saldo.', 'err');
      if (!await R.konfirmasi({ judul: 'Simpan saldo awal?', pesan: 'Jurnal SA dibuat per ' + R.tglP(el.querySelector('[data-t]').value) + '. Untuk koreksi gunakan Jurnal Umum.', ok: 'Simpan' })) return;
      const b = e.currentTarget; b.classList.add('busy');
      try { const r = await R.api.call('pembukuan.saldoAwal', { tanggal: el.querySelector('[data-t]').value, baris: baris }); R.toast(r._pesan); R.app.muatUlangBoot(); } catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
    };
  }

  // ============================================================
  // MASTER DATA
  // ============================================================
  const sm = { tab: 'produk', cari: '', th: null };
  R.halaman.master = {
    judul: 'Master Data', roles: R.PERAN.OA,
    render(el, q, sub, nav) {
      if (q.tab) sm.tab = q.tab;
      const T = [{ id: 'produk', label: 'Produk & HPP' }, { id: 'kategori', label: 'Kategori transaksi' }, { id: 'kontak', label: 'Kontak' }, { id: 'channel', label: 'Channel & biaya' }, { id: 'akun', label: 'Daftar akun (COA)' }, { id: 'target', label: 'Target' }];
      el.innerHTML = '<div class="page-head"><div><h2>Master data</h2><p>Data acuan: produk & HPP, kategori, kontak, channel, potongan marketplace, dan bagan akun.</p></div></div><div data-tabs></div><div data-isi></div>';
      const isi = el.querySelector('[data-isi]');
      const buka = (t) => { sm.tab = t; R.ubahQuery({ tab: t }); R.tabs(el.querySelector('[data-tabs]'), T, t, buka); ({ produk: produk, kategori: kategori, kontak: kontak, channel: channel, akun: akunCoa, target: target })[t](isi, nav); };
      buka(sm.tab);
    }
  };
  function drawerForm(judul, isiHtml, simpan) {
    const d = R.drawer({ judul: judul, isi: '<form class="fgrid" novalidate>' + isiHtml + '</form>', kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan</button>' });
    d.foot.querySelector('[data-x2]').onclick = () => d.tutup();
    d.foot.querySelector('[data-ok]').onclick = async (e) => { const b = e.currentTarget; b.classList.add('busy'); try { await simpan(d.body.querySelector('form'), d); d.tutup(); } catch (ex) { R.galat(ex); b.classList.remove('busy'); } };
    return d;
  }
  const inp = (n, l, v, t, x) => '<div class="field ' + (x || '') + '"><label>' + l + '</label><input class="inp" name="' + n + '" ' + (t === 'rp' ? 'data-rp inputmode="numeric"' : 'type="' + (t || 'text') + '"') + ' value="' + esc(t === 'rp' ? (v ? R.angka(v) : '') : (v === undefined || v === null ? '' : v)) + '"></div>';

  function produk(el, nav) {
    el.innerHTML = '<div class="card p0"><div class="row wrap between" style="padding:14px 16px"><div class="inp-group"><span class="ic-in">' + R.ic('search', 's16') + '</span><input class="inp sm" data-c placeholder="Cari SKU / nama" value="' + esc(sm.cari) + '" style="width:240px"></div><div class="actions"><button class="btn sm" data-sync>' + R.ic('refresh', 's16') + ' Sinkron Inventory</button><button class="btn sm" data-tpl>' + R.ic('download', 's16') + ' Template</button><button class="btn sm" data-imp>' + R.ic('upload', 's16') + ' Impor Excel</button><button class="btn sm primary" data-tbh>' + R.ic('plus', 's16') + ' Produk</button><input type="file" hidden accept=".xlsx,.xls,.csv" data-f></div></div><div data-list>' + R.kerangka(6) + '</div></div>';
    const muat = () => R.api.get('master.list', { jenis: 'produk', cari: sm.cari }).then((d) => {
      if (!R.masihDi(nav)) return;
      R.tabel(el.querySelector('[data-list]'), { baris: d.slice(0, 500), ringkas: true, kosong: 'Belum ada produk', kosongPesan: 'Impor dari Excel atau sinkron dari ROVELO Inventory.', kosongIkon: 'package', klik: form, kolom: [
        { k: 'sku', label: 'SKU', lead: true, render: (p) => '<b>' + esc(p.sku) + '</b><span class="t2">' + esc(p.nama_produk) + (p.varian ? ' · ' + esc(p.varian) : '') + '</span>' },
        { k: 'hpp', label: 'HPP', tipe: 'rp', render: (p) => +p.hpp ? R.rp(p.hpp) : '<span class="badge r">belum ada</span>' }, { k: 'harga_jual_normal', label: 'Harga jual', tipe: 'rp' },
        { k: 'margin', label: 'Margin kotor', tipe: 'persen', render: (p) => +p.harga_jual_normal && +p.hpp ? R.persen((p.harga_jual_normal - p.hpp) / p.harga_jual_normal * 100) : '–' },
        { k: 'sumber', label: 'Sumber', hideM: true }, { k: 'aktif', label: 'Status', render: (p) => (p.aktif === true || p.aktif === 'TRUE') ? '<span class="badge g">Aktif</span>' : '<span class="badge">Nonaktif</span>' }] });
      if (d.length > 500) el.querySelector('[data-list]').insertAdjacentHTML('beforeend', '<p class="xs faint" style="padding:0 16px 12px">Menampilkan 500 dari ' + d.length + ' produk. Gunakan pencarian.</p>');
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    function form(p) {
      p = p || { aktif: true };
      drawerForm(p.sku ? 'Ubah produk ' + p.sku : 'Produk baru', inp('sku', 'SKU', p.sku, 'text', 'full') + inp('nama_produk', 'Nama produk', p.nama_produk, 'text', 'full') + inp('varian', 'Varian', p.varian) + inp('hpp', 'HPP / modal per barang', p.hpp, 'rp') + inp('harga_jual_normal', 'Harga jual normal', p.harga_jual_normal, 'rp') +
        '<div class="field"><label class="check" style="height:44px"><input type="checkbox" name="aktif" ' + (p.aktif === true || p.aktif === 'TRUE' ? 'checked' : '') + '> Aktif</label></div><div class="alert full">' + R.ic('info', 's18') + '<span>Perubahan HPP berlaku untuk penjualan yang dicatat setelahnya. Penjualan lama tidak berubah.</span></div>', async (f) => {
        if (p.sku && f.sku.value.trim() !== String(p.sku)) throw new Error('SKU tidak bisa diubah. Tambah produk baru dengan SKU lain.');
        const r = await R.api.call('master.save', { jenis: 'produk', rows: [{ sku: f.sku.value.trim(), nama_produk: f.nama_produk.value, varian: f.varian.value, hpp: R.nilai(f.hpp.value), harga_jual_normal: R.nilai(f.harga_jual_normal.value), aktif: f.aktif.checked }] });
        R.toast(r._pesan); R.app.muatUlangBoot(); muat();
      });
    }
    el.querySelector('[data-c]').oninput = R.tunda((e) => { sm.cari = e.target.value.trim(); muat(); }, 300);
    el.querySelector('[data-tbh]').onclick = () => form(null);
    el.querySelector('[data-tpl]').onclick = () => R.xlsx.unduh('Template Produk ROVELO', [{ nama: 'Produk', baris: [{ sku: 'RVL-KMJ-01', nama_produk: 'Kemeja Linen', varian: 'Navy L', hpp: 60000, harga_jual_normal: 150000 }] }]).catch(R.galat);
    el.querySelector('[data-imp]').onclick = () => el.querySelector('[data-f]').click();
    el.querySelector('[data-f]').onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const d = await R.xlsx.baca(file); const rows = d.lembar[d.nama[0]];
        const h = rows[0].map((x) => String(x).toLowerCase().trim());
        const ix = (re) => h.findIndex((x) => re.test(x));
        const iS = ix(/^sku|kode/), iN = ix(/nama/), iV = ix(/varian|variasi/), iH = ix(/hpp|modal|harga.?pokok/), iJ = ix(/harga.?jual|^harga$/);
        if (iS < 0 || iN < 0) throw new Error('Kolom "sku" dan "nama_produk" wajib ada (lihat Template).');
        const data = rows.slice(1).filter((r) => String(r[iS]).trim()).map((r) => ({ sku: String(r[iS]).trim(), nama_produk: String(r[iN]).trim(), varian: iV >= 0 ? String(r[iV]).trim() : undefined, hpp: iH >= 0 ? R.imporUtil.angkaID(r[iH]) : '', harga_jual_normal: iJ >= 0 ? R.imporUtil.angkaID(r[iJ]) : '' }));
        if (!await R.konfirmasi({ judul: 'Impor ' + data.length + ' produk?', pesan: 'SKU yang sudah ada akan diperbarui (nama, varian, HPP, harga).', ok: 'Impor' })) return;
        for (let i = 0; i < data.length; i += 2000) { const r = await R.api.call('master.save', { jenis: 'produk', rows: data.slice(i, i + 2000) }); R.toast(r._pesan); }
        R.app.muatUlangBoot(); muat();
      } catch (ex) { R.galat(ex); } finally { e.target.value = ''; }
    };
    el.querySelector('[data-sync]').onclick = async (e) => { const b = e.currentTarget; b.classList.add('busy'); try { const r = await R.api.call('inventory.syncProduk', {}); R.toast(r._pesan); R.app.muatUlangBoot(); muat(); } catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); } };
    muat();
  }

  const IKON = ['megaphone', 'users', 'star', 'camera', 'gift', 'tag', 'store', 'truck', 'undo', 'package', 'clock', 'award', 'coffee', 'shield', 'hand', 'home', 'zap', 'droplet', 'wifi', 'phone', 'pen', 'sparkles', 'tool', 'car', 'monitor', 'briefcase', 'file', 'cart', 'box', 'landmark', 'percent', 'user', 'more', 'plus', 'cash', 'wallet'];
  function kategori(el, nav) {
    el.innerHTML = '<div class="card p0"><div class="row wrap between" style="padding:14px 16px"><div data-j></div><button class="btn sm primary" data-tbh>' + R.ic('plus', 's16') + ' Kategori</button></div><div data-list>' + R.kerangka(6) + '</div></div>';
    let jenis = 'Pengeluaran', semua = [];
    R.seg(el.querySelector('[data-j]'), [{ v: 'Pengeluaran', l: 'Pengeluaran' }, { v: 'Pemasukan', l: 'Pemasukan' }], jenis, (v) => { jenis = v; gambar(); });
    function gambar() {
      R.tabel(el.querySelector('[data-list]'), { baris: semua.filter((k) => k.jenis === jenis).sort((a, b) => a.kelompok < b.kelompok ? -1 : a.kelompok > b.kelompok ? 1 : +a.urutan - +b.urutan), ringkas: true, klik: form, kolom: [
        { k: 'nama_kategori', label: 'Kategori', lead: true, render: (k) => '<span class="row" style="gap:10px"><span class="lr-ic" style="width:32px;height:32px">' + R.ic(k.ikon, 's16') + '</span><span><b>' + esc(k.nama_kategori) + '</b><span class="t2">' + esc(k.kelompok) + '</span></span></span>' },
        { k: 'no_akun', label: 'Akun', render: (k) => '<span class="faint xs">' + esc(k.no_akun) + '</span> ' + esc(R.namaAkun(k.no_akun)) },
        { k: 'mode', label: 'Khusus', hideM: true, render: (k) => [k.mode === 'utang' ? 'Utang' : k.mode === 'dimuka' ? 'Dibayar di muka' : '', (k.butuh_channel === true || k.butuh_channel === 'TRUE') ? 'Channel' : '', k.butuh_kontak].filter(Boolean).map((x) => '<span class="badge">' + esc(x) + '</span>').join(' ') || '–' },
        { k: 'aktif', label: 'Status', render: (k) => (k.aktif === true || k.aktif === 'TRUE') ? ((k.favorit === true || k.favorit === 'TRUE') ? '<span class="badge o">★ Favorit</span>' : '<span class="badge g">Aktif</span>') : '<span class="badge">Nonaktif</span>' }] });
    }
    const b = (v) => v === true || v === 'TRUE';
    function form(k) {
      k = k || { jenis: jenis, aktif: true, ikon: 'tag' };
      const kel = Array.from(new Set(semua.map((x) => x.kelompok)));
      const dk = drawerForm(k.id_kategori ? 'Ubah kategori' : 'Kategori baru', inp('nama_kategori', 'Nama kategori (bahasa sehari-hari)', k.nama_kategori, 'text', 'full') +
        '<div class="field"><label>Jenis</label><select class="inp" name="jenis"><option ' + (k.jenis === 'Pengeluaran' ? 'selected' : '') + '>Pengeluaran</option><option ' + (k.jenis === 'Pemasukan' ? 'selected' : '') + '>Pemasukan</option></select></div>' +
        '<div class="field"><label>Kelompok</label><input class="inp" name="kelompok" list="dl-kel" value="' + esc(k.kelompok || '') + '"><datalist id="dl-kel">' + kel.map((x) => '<option value="' + esc(x) + '">').join('') + '</datalist></div>' +
        '<div class="field full"><label>Dicatat ke akun</label><select class="inp" name="no_akun">' + opsiAkun(k.no_akun, (a) => !a.kas) + '</select><span class="hint">Pengguna cukup memilih nama kategori; akun ini yang dipakai di jurnal.</span></div>' +
        '<div class="field"><label>Perlakuan khusus</label><select class="inp" name="mode"><option value="">Tunai biasa</option><option value="utang" ' + (k.mode === 'utang' ? 'selected' : '') + '>Belum dibayar (jadi utang)</option><option value="dimuka" ' + (k.mode === 'dimuka' ? 'selected' : '') + '>Dibayar di muka (dibebankan bulanan)</option></select></div>' +
        '<div class="field"><label>Wajib pilih</label><select class="inp" name="butuh_kontak"><option value="">—</option><option ' + (k.butuh_kontak === 'Kontak' ? 'selected' : '') + '>Kontak</option><option ' + (k.butuh_kontak === 'Karyawan' ? 'selected' : '') + '>Karyawan</option></select></div>' +
        '<div class="field"><label class="check" style="height:44px"><input type="checkbox" name="butuh_channel" ' + (b(k.butuh_channel) ? 'checked' : '') + '> Wajib pilih channel</label></div>' +
        '<div class="field"><label>Channel bawaan</label><select class="inp" name="channel_default"><option value="">—</option>' + R.opsiChannel(k.channel_default) + '</select></div>' +
        '<div class="field full"><label>Ikon</label><div class="chips" data-ikon>' + IKON.map((i) => '<button type="button" class="chip ' + (i === k.ikon ? 'on' : '') + '" data-i="' + i + '" aria-label="' + i + '">' + R.ic(i, 's16') + '</button>').join('') + '</div><input type="hidden" name="ikon" value="' + esc(k.ikon) + '"></div>' +
        '<div class="field"><label class="check"><input type="checkbox" name="favorit" ' + (b(k.favorit) ? 'checked' : '') + '> Tampilkan di "sering dipakai"</label></div><div class="field"><label class="check"><input type="checkbox" name="aktif" ' + (b(k.aktif) ? 'checked' : '') + '> Aktif</label></div>', async (f) => {
        const r = await R.api.call('master.save', { jenis: 'kategori', data: { id_kategori: k.id_kategori || '', nama_kategori: f.nama_kategori.value, jenis: f.jenis.value, kelompok: f.kelompok.value, no_akun: f.no_akun.value, mode: f.mode.value, butuh_kontak: f.butuh_kontak.value, butuh_channel: f.butuh_channel.checked, channel_default: f.channel_default.value, ikon: f.ikon.value, favorit: f.favorit.checked, aktif: f.aktif.checked } });
        R.toast(r._pesan); R.app.muatUlangBoot(); muat();
      });
      R.on(dk.el, 'click', '[data-i]', (e, bt) => { R.$$('[data-i]', dk.el).forEach((x) => x.classList.toggle('on', x === bt)); dk.el.querySelector('[name=ikon]').value = bt.dataset.i; });
    }
    const muat = () => R.api.get('master.list', { jenis: 'kategori' }).then((d) => { if (R.masihDi(nav)) { semua = d; gambar(); } }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    el.querySelector('[data-tbh]').onclick = () => form(null);
    muat();
  }

  function kontak(el, nav) {
    el.innerHTML = '<div class="card p0"><div class="row between" style="padding:14px 16px"><span class="small muted">Supplier, reseller, dan pelanggan untuk piutang/utang.</span><button class="btn sm primary" data-tbh>' + R.ic('plus', 's16') + ' Kontak</button></div><div data-list>' + R.kerangka(5) + '</div></div>';
    const form = (k) => { k = k || { aktif: true, tipe: 'Supplier' }; drawerForm(k.id_kontak ? 'Ubah kontak' : 'Kontak baru', inp('nama', 'Nama', k.nama, 'text', 'full') + '<div class="field"><label>Tipe</label><select class="inp" name="tipe">' + ['Supplier', 'Reseller', 'Pelanggan', 'Lainnya'].map((t) => '<option ' + (t === k.tipe ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div>' + inp('no_hp', 'No. HP / WA', k.no_hp) + inp('tempo_hari', 'Tempo pembayaran (hari)', k.tempo_hari || 0, 'number') + '<div class="field"><label class="check" style="height:44px"><input type="checkbox" name="aktif" ' + (k.aktif === true || k.aktif === 'TRUE' ? 'checked' : '') + '> Aktif</label></div><div class="field full"><label>Alamat</label><textarea class="inp" name="alamat">' + esc(k.alamat || '') + '</textarea></div>', async (f) => {
      const r = await R.api.call('master.save', { jenis: 'kontak', data: { id_kontak: k.id_kontak || '', nama: f.nama.value, tipe: f.tipe.value, no_hp: f.no_hp.value, tempo_hari: f.tempo_hari.value, alamat: f.alamat.value, aktif: f.aktif.checked } }); R.toast(r._pesan); R.app.muatUlangBoot(); muat(); }); };
    const muat = () => R.api.get('master.list', { jenis: 'kontak' }).then((d) => { if (!R.masihDi(nav)) return; R.tabel(el.querySelector('[data-list]'), { baris: d, ringkas: true, kosong: 'Belum ada kontak', kosongIkon: 'users', klik: form, kolom: [{ k: 'nama', label: 'Nama', lead: true, render: (k) => '<b>' + esc(k.nama) + '</b><span class="t2">' + esc(k.id_kontak) + '</span>' }, { k: 'tipe', label: 'Tipe' }, { k: 'no_hp', label: 'No. HP' }, { k: 'tempo_hari', label: 'Tempo', render: (k) => +k.tempo_hari ? k.tempo_hari + ' hari' : '–' }, { k: 'aktif', label: 'Status', render: (k) => k.aktif === true || k.aktif === 'TRUE' ? '<span class="badge g">Aktif</span>' : '<span class="badge">Nonaktif</span>' }] }); }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    el.querySelector('[data-tbh]').onclick = () => form(null);
    muat();
  }

  function channel(el, nav) {
    el.innerHTML = '<div class="row between mb"><span class="small muted">Profil potongan dipakai untuk menghitung potongan saat input manual & impor tanpa kolom potongan.</span><button class="btn sm" data-ch>' + R.ic('plus', 's16') + ' Channel baru</button></div><div class="grid g2" data-list>' + '<div class="card"><div class="sk b"></div></div>'.repeat(2) + '</div>';
    const muat = () => Promise.all([R.api.get('master.list', { jenis: 'channel' }), R.api.get('master.list', { jenis: 'biaya' })]).then(([chs, by]) => {
      if (!R.masihDi(nav)) return;
      const hari = R.hariIni();
      el.querySelector('[data-list]').innerHTML = chs.map((c) => { const b = by.filter((x) => x.id_channel === c.id_channel && (!x.berlaku_sampai || x.berlaku_sampai >= hari)); const akt = c.aktif === true || c.aktif === 'TRUE';
        return '<div class="card"><div class="card-head"><div class="row"><input type="color" value="' + esc(c.warna) + '" data-warna="' + c.id_channel + '" style="width:34px;height:34px;border:0;background:none;padding:0;cursor:pointer" aria-label="Warna ' + esc(c.nama_channel) + '"><div><b>' + esc(c.nama_channel) + '</b><div class="xs muted">' + esc(c.id_channel) + ' · ' + esc(c.tipe) + (c.akun_piutang ? ' · akun ' + esc(c.akun_piutang) : '') + '</div></div></div><label class="check small"><input type="checkbox" data-aktif="' + c.id_channel + '" ' + (akt ? 'checked' : '') + '> Aktif</label></div>' +
          (c.tipe === 'Marketplace' ? '<table class="tbl compact"><tbody>' + (b.length ? b.map((x) => '<tr><td>' + esc(x.nama_komponen) + '<span class="t2">' + esc(x.masuk_ke.replace('_', ' ')) + ' · mulai ' + R.tgl(x.berlaku_mulai) + '</span></td><td class="n">' + (x.tipe === 'persen' ? R.persen(x.nilai) : R.rp(x.nilai)) + (+x.maksimal ? '<span class="t2">maks ' + R.rp(x.maksimal) + '</span>' : '') + '</td><td class="n"><button class="btn xs ghost" data-eb="' + x.id_biaya + '">' + R.ic('edit', 's16') + '</button><button class="btn xs ghost" data-hb="' + x.id_biaya + '" aria-label="Hentikan">' + R.ic('trash', 's16') + '</button></td></tr>').join('') : '<tr><td class="muted small">Belum ada komponen potongan.</td></tr>') + '</tbody></table><button class="btn sm mt" data-tb="' + c.id_channel + '">' + R.ic('plus', 's16') + ' Komponen potongan</button>' : '<p class="small muted">Channel langsung: pembayaran tunai/transfer atau tempo (piutang).</p>') + '</div>'; }).join('');
      const formB = (x, ch) => { x = x || { id_channel: ch, tipe: 'persen', masuk_ke: 'potongan_admin', berlaku_mulai: R.hariIni() };
        drawerForm(x.id_biaya ? 'Ubah komponen potongan' : 'Komponen potongan baru', inp('nama_komponen', 'Nama komponen', x.nama_komponen, 'text', 'full') + '<div class="field"><label>Tipe</label><select class="inp" name="tipe"><option value="persen" ' + (x.tipe === 'persen' ? 'selected' : '') + '>Persen dari harga</option><option value="nominal" ' + (x.tipe === 'nominal' ? 'selected' : '') + '>Nominal per pesanan</option></select></div>' + inp('nilai', 'Nilai (% atau Rp)', x.nilai, 'number') + inp('maksimal', 'Maksimal per baris (Rp, opsional)', x.maksimal, 'rp') +
          '<div class="field"><label>Masuk ke</label><select class="inp" name="masuk_ke">' + [['potongan_admin', 'Potongan admin'], ['komisi_affiliate', 'Komisi affiliate'], ['ongkir_penjual', 'Ongkir penjual'], ['biaya_lain', 'Biaya lain']].map((o) => '<option value="' + o[0] + '" ' + (x.masuk_ke === o[0] ? 'selected' : '') + '>' + o[1] + '</option>').join('') + '</select></div>' + inp('berlaku_mulai', 'Berlaku mulai', x.berlaku_mulai, 'date') + '<div class="alert full">' + R.ic('info', 's18') + '<span>Mengubah nilai membuat versi baru; tarif lama tetap tersimpan untuk riwayat.</span></div>', async (f) => {
          const r = await R.api.call('master.save', { jenis: 'biaya', data: { id_biaya: x.id_biaya || '', id_channel: x.id_channel, nama_komponen: f.nama_komponen.value, tipe: f.tipe.value, nilai: f.nilai.value, maksimal: R.nilai(f.maksimal.value), masuk_ke: f.masuk_ke.value, berlaku_mulai: f.berlaku_mulai.value } }); R.toast(r._pesan); R.app.muatUlangBoot(); muat(); }); };
      R.$$('[data-tb]', el).forEach((bt) => { bt.onclick = () => formB(null, bt.dataset.tb); });
      R.$$('[data-eb]', el).forEach((bt) => { bt.onclick = () => formB(by.find((x) => x.id_biaya === bt.dataset.eb)); });
      R.$$('[data-hb]', el).forEach((bt) => { bt.onclick = async () => { const x = by.find((y) => y.id_biaya === bt.dataset.hb); if (!await R.konfirmasi({ judul: 'Hentikan ' + x.nama_komponen + '?', pesan: 'Komponen tidak dipakai lagi mulai hari ini.', bahaya: true, ok: 'Hentikan' })) return; try { const r = await R.api.call('master.save', { jenis: 'biaya', data: { id_biaya: x.id_biaya, id_channel: x.id_channel, hapus: true } }); R.toast(r._pesan); R.app.muatUlangBoot(); muat(); } catch (e) { R.galat(e); } }; });
      const simpanCh = (id, data) => R.api.call('master.save', { jenis: 'channel', data: Object.assign({ id_channel: id }, data) }).then((r) => { R.toast(r._pesan); R.app.muatUlangBoot(); }).catch(R.galat);
      R.$$('[data-warna]', el).forEach((i) => { i.onchange = () => simpanCh(i.dataset.warna, { warna: i.value.toUpperCase() }); });
      R.$$('[data-aktif]', el).forEach((i) => { i.onchange = () => simpanCh(i.dataset.aktif, { aktif: i.checked }); });
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    el.querySelector('[data-ch]').onclick = () => drawerForm('Channel baru', inp('id_channel', 'Kode (2–4 huruf, mis. BLB)', '', 'text') + inp('nama_channel', 'Nama channel', '') + '<div class="field"><label>Tipe</label><select class="inp" name="tipe"><option value="Marketplace">Marketplace (dana tertahan)</option><option value="Langsung">Langsung (tunai/tempo)</option></select></div><div class="field"><label>Warna</label><input type="color" class="inp" name="warna" value="#94A3B8"></div><p class="xs faint full">Marketplace baru otomatis dibuatkan akun piutang marketplace.</p>', async (f) => {
      const r = await R.api.call('master.save', { jenis: 'channel', data: { id_channel: f.id_channel.value.trim().toUpperCase(), nama_channel: f.nama_channel.value, tipe: f.tipe.value, warna: f.warna.value.toUpperCase() } }); R.toast(r._pesan); R.app.muatUlangBoot(); muat(); });
    muat();
  }

  function akunCoa(el, nav) {
    el.innerHTML = '<div class="card p0"><div class="row wrap between" style="padding:14px 16px"><span class="small muted">Bagan akun standar SAK EMKM. Akun yang sudah dipakai tidak bisa dihapus, hanya dinonaktifkan.</span><button class="btn sm primary" data-tbh>' + R.ic('plus', 's16') + ' Akun</button></div><div data-list>' + R.kerangka(8) + '</div></div>';
    const form = (a) => { const baru = !a; a = a || { aktivitas_arus_kas: 'Operasi', aktif: true };
      drawerForm(baru ? 'Akun baru' : 'Ubah akun ' + a.no_akun, inp('no_akun', 'Nomor akun (X-XXXX)', a.no_akun, 'text') + inp('nama_akun', 'Nama akun', a.nama_akun) +
        '<div class="field"><label>Aktivitas arus kas</label><select class="inp" name="aktivitas_arus_kas">' + ['Operasi', 'Investasi', 'Pendanaan', 'Non-kas', 'Akun Kas'].map((x) => '<option ' + (x === a.aktivitas_arus_kas ? 'selected' : '') + '>' + x + '</option>').join('') + '</select></div>' +
        (baru ? '<div class="field"><label class="check" style="height:44px"><input type="checkbox" name="is_kas"> Akun kas / bank</label></div>' : '<div class="field"><label class="check" style="height:44px"><input type="checkbox" name="aktif" ' + (a.aktif === true || a.aktif === 'TRUE' ? 'checked' : '') + '> Aktif</label></div>') +
        '<p class="xs faint full">Saldo normal ditentukan dari golongan: 1, 5, 6, 8, 9 = Debit; 2, 3, 4, 7 = Kredit. Akun kas hanya di kelompok 1-11/1-12.</p>', async (f) => {
        if (!baru && f.no_akun.value !== a.no_akun) throw new Error('Nomor akun tidak bisa diubah.');
        const r = await R.api.call('master.save', { jenis: 'akun', data: { no_akun: f.no_akun.value.trim(), nama_akun: f.nama_akun.value, aktivitas_arus_kas: f.aktivitas_arus_kas.value, is_kas: f.is_kas ? f.is_kas.checked : undefined, aktif: f.aktif ? f.aktif.checked : true } }); R.toast(r._pesan); R.app.muatUlangBoot(); muat(); }); };
    const muat = () => R.api.get('master.list', { jenis: 'akun' }).then((d) => { if (!R.masihDi(nav)) return; R.tabel(el.querySelector('[data-list]'), { baris: d.sort((x, y) => x.no_akun < y.no_akun ? -1 : 1), ringkas: true, klik: form, kolom: [
      { k: 'no_akun', label: 'No.', lead: true, render: (a) => '<b>' + esc(a.no_akun) + '</b> ' + esc(a.nama_akun) }, { k: 'saldo_normal', label: 'Normal' }, { k: 'aktivitas_arus_kas', label: 'Arus kas', hideM: true },
      { k: 'is_kas', label: 'Kas', render: (a) => a.is_kas === true || a.is_kas === 'TRUE' ? '<span class="badge b">Kas/bank</span>' : '' }, { k: 'dipakai', label: 'Dipakai', hideM: true, render: (a) => a.dipakai ? '✓' : '' },
      { k: 'aktif', label: 'Status', render: (a) => a.aktif === true || a.aktif === 'TRUE' ? '<span class="badge g">Aktif</span>' : '<span class="badge">Nonaktif</span>' }] }); }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    el.querySelector('[data-tbh]').onclick = () => form(null);
    muat();
  }

  function target(el, nav) {
    sm.th = sm.th || +R.hariIni().slice(0, 4);
    el.innerHTML = '<div class="card"><div class="card-head"><div><h3 class="sec">Target bulanan</h3><p class="sec-sub">Dibandingkan dengan realisasi di Laporan General Bulanan.</p></div><select class="inp sm" data-th style="width:auto">' + [sm.th - 1, sm.th, sm.th + 1].map((y) => '<option ' + (y === sm.th ? 'selected' : '') + '>' + y + '</option>').join('') + '</select></div><div data-list>' + R.kerangka(6) + '</div><button class="btn primary mt" data-simpan>Simpan target</button></div>';
    el.querySelector('[data-th]').onchange = (e) => { sm.th = +e.target.value; muat(); };
    let awal = {};
    const muat = () => R.api.get('master.list', { jenis: 'target' }).then((d) => {
      if (!R.masihDi(nav)) return; awal = {};
      d.filter((t) => +t.tahun === sm.th).forEach((t) => { awal[+t.bulan] = t; });
      el.querySelector('[data-list]').innerHTML = '<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Bulan</th><th class="n">Target omzet</th><th class="n">Target laba bersih</th></tr></thead><tbody>' + R.BULAN.map((b, i) => '<tr data-b="' + (i + 1) + '"><td>' + b + '</td><td class="n"><input class="inline-in" style="width:160px" data-k="target_omzet" data-rp inputmode="numeric" value="' + (awal[i + 1] && +awal[i + 1].target_omzet ? R.angka(awal[i + 1].target_omzet) : '') + '"></td><td class="n"><input class="inline-in" style="width:160px" data-k="target_laba" data-rp inputmode="numeric" value="' + (awal[i + 1] && +awal[i + 1].target_laba ? R.angka(awal[i + 1].target_laba) : '') + '"></td></tr>').join('') + '</tbody></table></div>';
      R.inpRpSemua(el);
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]'), muat));
    el.querySelector('[data-simpan]').onclick = async (e) => {
      const b = e.currentTarget; b.classList.add('busy');
      try {
        const ubah = R.$$('[data-b]', el).map((tr) => ({ bulan: +tr.dataset.b, o: R.nilai(tr.querySelector('[data-k=target_omzet]').value), l: R.nilai(tr.querySelector('[data-k=target_laba]').value) })).filter((x) => { const a = awal[x.bulan]; return (a ? +a.target_omzet !== x.o || +a.target_laba !== x.l : x.o || x.l); });
        for (const x of ubah) await R.api.call('master.save', { jenis: 'target', data: { tahun: sm.th, bulan: x.bulan, target_omzet: x.o, target_laba: x.l } });
        R.toast(ubah.length ? ubah.length + ' target tersimpan.' : 'Tidak ada perubahan.'); muat();
      } catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
    };
    muat();
  }
})();
