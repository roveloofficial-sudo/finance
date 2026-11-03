/* ROVELO Finance — Pemasukan, Pengeluaran & Transfer */
(function () {
  const R = window.R;
  const esc = R.esc;
  const st = { per: null, jenis: '', kas: '', cari: '', status: '', hal: 1 };
  const LS_KAS = 'rf_kas_terakhir';

  // ============================================================
  // FORM CATAT (dipakai dari mana saja: R.catat('Pengeluaran'))
  // ============================================================
  R.catat = function (jenis, opsi) {
    opsi = opsi || {};
    if (!R.boleh(R.PERAN.OAS)) return R.toast('Peran Anda hanya bisa melihat data.', 'info');
    const v = Object.assign({ jenis: jenis || 'Pengeluaran', tanggal: R.hariIni(), akun_kas: R.LS.get(LS_KAS) || (R.akunKas()[0] || {}).no }, opsi.nilai || {});
    const d = R.drawer({
      judul: 'Catat transaksi',
      isi: '<form novalidate data-f><div class="seg full mb" data-jenis></div><div data-body></div></form>',
      kaki: '<button class="btn ghost" data-batal>Batal</button><button class="btn" data-lagi>Simpan & catat lagi</button><button class="btn primary" data-simpan>Simpan</button>',
      onTutup: () => { R.ubahQuery({ baru: '' }); }
    });
    const f = d.body.querySelector('[data-f]');
    let kat = v.id_kategori ? R.mKat[v.id_kategori] : null;
    R.seg(f.querySelector('[data-jenis]'), [{ v: 'Pengeluaran', l: 'Pengeluaran' }, { v: 'Pemasukan', l: 'Pemasukan' }, { v: 'Transfer', l: 'Transfer' }], v.jenis, (j) => { simpanNilai(); v.jenis = j; kat = null; v.id_kategori = ''; gambar(); }, 'dark');
    d.foot.querySelector('[data-batal]').onclick = () => d.tutup();
    d.foot.querySelector('[data-simpan]').onclick = () => kirim(false);
    d.foot.querySelector('[data-lagi]').onclick = () => kirim(true);
    f.onsubmit = (e) => { e.preventDefault(); kirim(false); };

    function simpanNilai() { R.$$('[name]', f).forEach((i) => { v[i.name] = i.value; }); }
    function gambar() {
      const b = f.querySelector('[data-body]');
      const tf = v.jenis === 'Transfer';
      b.innerHTML = (tf ? '' : '<div class="field"><label>Kategori</label><div data-katpilih></div></div>') +
        '<div class="field mt"><label for="nm">Nominal</label><div class="inp-group"><span class="pre big">Rp</span><input id="nm" class="inp big" name="nominal" data-rp inputmode="numeric" autocomplete="off" placeholder="0" value="' + esc(v.nominal || '') + '" autofocus></div><div class="chips mt" style="margin-top:8px">' + [50000, 100000, 250000, 500000, 1000000].map((n) => '<button type="button" class="chip" data-cepat="' + n + '">' + R.rpK(n) + '</button>').join('') + '</div><div class="err">Isi nominal</div></div>' +
        '<div class="fgrid mt"><div class="field"><label>Tanggal</label><input type="date" class="inp" name="tanggal" value="' + esc(v.tanggal) + '" max="' + R.hariIni() + '"><div class="err"></div></div>' +
        (tf ? '<div class="field"><label>Dari akun</label><select class="inp" name="akun_kas">' + R.opsiKas(v.akun_kas) + '</select></div><div class="field"><label>Ke akun</label><select class="inp" name="akun_tujuan">' + R.opsiKas(v.akun_tujuan || (R.akunKas()[1] || {}).no) + '</select></div>'
          : '<div class="field" data-kasbox><label>' + (v.jenis === 'Pemasukan' ? 'Masuk ke' : 'Dibayar dari') + '</label><select class="inp" name="akun_kas">' + R.opsiKas(v.akun_kas) + '</select></div>') +
        '<div data-ekstra class="full fgrid" style="display:contents"></div>' +
        '<div class="field full"><label>Catatan <span class="faint">(opsional)</span></label><input class="inp" name="catatan" maxlength="200" placeholder="mis. Iklan GMV Max 1–7 Nov" value="' + esc(v.catatan || '') + '"><div class="err"></div></div></div>' +
        '<div class="field mt" data-lampbox><label>Lampiran <span class="faint" data-lampket>(opsional)</span></label><div data-lamp></div><div class="err">Lampirkan foto bukti</div></div>' +
        (R.peran() === R.PERAN.S ? '<div class="alert mt">' + R.ic('info', 's18') + '<span>Catatan Anda tersimpan sebagai <b>Draft</b> dan akan diperiksa Admin sebelum masuk pembukuan.</span></div>' : '') +
        '<div class="alert g mt hidden" data-galat></div>';
      R.inpRpSemua(b);
      R.kotakLampiran(b.querySelector('[data-lamp]'));
      if (v.lampiran_url) b.querySelector('[data-lamp]').dataset.id = v.lampiran_url;
      R.on(b, 'click', '[data-cepat]', (e, c) => { const i = b.querySelector('[name=nominal]'); i.value = R.angka(c.dataset.cepat); i.dispatchEvent(new Event('input')); cekLampiran(); });
      b.querySelector('[name=nominal]').addEventListener('input', cekLampiran);
      if (!tf) pemilihKategori(b.querySelector('[data-katpilih]'));
      ekstra();
      cekLampiran();
      if (opsi.galat) { tampilGalat(opsi.galat); opsi.galat = null; }
    }
    function cekLampiran() {
      const n = R.nilai((f.querySelector('[name=nominal]') || {}).value);
      const wajib = v.jenis === 'Pengeluaran' && n >= ((R.boot.usaha || {}).batas_lampiran || 500000);
      const ket = f.querySelector('[data-lampket]'); if (ket) ket.innerHTML = wajib ? '<span class="badge a">wajib untuk ≥ ' + R.rpK((R.boot.usaha || {}).batas_lampiran || 500000) + '</span>' : '(opsional)';
      return wajib;
    }
    function pemilihKategori(el) {
      const semua = (R.boot.kategori || []).filter((k) => k.jenis === v.jenis);
      const fav = semua.filter((k) => k.favorit);
      let cari = '';
      const isi = () => {
        if (kat) {
          el.innerHTML = '<div class="row" style="padding:10px 12px;border:1px solid var(--accent);border-radius:12px;background:var(--accent-tint)"><span class="ci" style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:#fff;color:var(--accent-600)">' + R.ic(kat.ikon, 's18') + '</span><div class="grow"><b>' + esc(kat.nama) + '</b><div class="xs muted">' + esc(kat.kelompok) + '</div></div><button type="button" class="btn sm ghost" data-ganti>Ganti</button></div>' +
            '<div class="akun-hint mt" style="margin-top:8px">' + R.ic('book', 's16') + '<span>Dicatat ke akun <b>' + esc(kat.akun) + ' ' + esc(R.namaAkun(kat.akun)) + '</b>' + (kat.mode === 'utang' ? ' · lawan: Utang Usaha' : kat.mode === 'dimuka' ? ' · dibebankan bertahap tiap bulan' : '') + '</span></div>';
          el.querySelector('[data-ganti]').onclick = () => { kat = null; v.id_kategori = ''; isi(); ekstra(); };
          return;
        }
        const daftar = semua.filter((k) => !cari || (k.nama + ' ' + k.kelompok).toLowerCase().indexOf(cari) >= 0);
        const grup = {}; daftar.forEach((k) => { (grup[k.kelompok] = grup[k.kelompok] || []).push(k); });
        el.innerHTML = '<div class="inp-group"><span class="ic-in">' + R.ic('search', 's18') + '</span><input class="inp" data-cari placeholder="Cari kategori… (iklan, listrik, gaji)" value="' + esc(cari) + '"></div>' +
          (!cari && fav.length ? '<div class="kat-group">Sering dipakai</div><div class="chips">' + fav.map((k) => '<button type="button" class="chip" data-k="' + k.id + '">' + R.ic(k.ikon, 's16') + esc(k.nama) + '</button>').join('') + '</div>' : '') +
          Object.keys(grup).map((g) => '<div class="kat-group">' + esc(g) + '</div><div class="cat-grid">' + grup[g].map((k) => '<button type="button" class="cat" data-k="' + k.id + '"><span class="ci">' + R.ic(k.ikon, 's18') + '</span>' + esc(k.nama) + '</button>').join('') + '</div>').join('') +
          (!daftar.length ? R.kosong('Kategori tidak ditemukan', 'Coba kata lain, atau minta Admin menambah kategori di Master Data.', 'search') : '') + '<div class="err">Pilih kategori</div>';
        const ci = el.querySelector('[data-cari]');
        ci.oninput = R.tunda(() => { cari = ci.value.trim().toLowerCase(); isi(); const c2 = el.querySelector('[data-cari]'); c2.focus(); c2.setSelectionRange(c2.value.length, c2.value.length); }, 150);
      };
      R.on(el, 'click', '[data-k]', (e, b) => { kat = R.mKat[b.dataset.k]; v.id_kategori = kat.id; if (kat.channel_default && !v.id_channel) v.id_channel = kat.channel_default; isi(); ekstra(); const n = f.querySelector('[name=nominal]'); if (n && window.innerWidth > 960) n.focus(); });
      isi();
    }
    function ekstra() {
      const x = f.querySelector('[data-ekstra]'); if (!x) return;
      const kasBox = f.querySelector('[data-kasbox]');
      let h = '';
      if (kat && kat.butuh_channel) h += '<div class="field"><label>Channel</label><select class="inp" name="id_channel"><option value="">— pilih —</option>' + R.opsiChannel(v.id_channel) + '</select><div class="err">Pilih channel</div></div>';
      if (kat && kat.butuh_kontak === 'Karyawan') h += '<div class="field"><label>Karyawan</label><select class="inp" name="id_kontak"><option value="">— pilih —</option>' + (R.boot.karyawan || []).map((k) => '<option value="' + k.id + '" ' + (k.id === v.id_kontak ? 'selected' : '') + '>' + esc(k.nama) + ' · ' + esc(k.jabatan) + '</option>').join('') + '</select><div class="err">Pilih karyawan</div></div>';
      if (kat && kat.butuh_kontak === 'Kontak') h += '<div class="field"><label>Kontak (supplier/pelanggan)</label><select class="inp" name="id_kontak"><option value="">— pilih —</option>' + (R.boot.kontak || []).map((k) => '<option value="' + k.id + '" ' + (k.id === v.id_kontak ? 'selected' : '') + '>' + esc(k.nama) + ' · ' + esc(k.tipe) + '</option>').join('') + '</select><div class="err">Pilih kontak</div></div>';
      if (kat && kat.mode === 'utang') h += '<div class="field"><label>Jatuh tempo</label><input type="date" class="inp" name="jatuh_tempo" value="' + esc(v.jatuh_tempo || R.tambahHari(R.hariIni(), 30)) + '"><div class="err">Isi jatuh tempo</div></div>';
      if (kat && kat.mode === 'dimuka') h += '<div class="field"><label>Masa manfaat (bulan)</label><input type="number" min="1" max="120" class="inp" name="jumlah_bulan" value="' + esc(v.jumlah_bulan || 12) + '"><span class="hint">Beban dicatat otomatis tiap akhir bulan.</span><div class="err">Isi 1–120</div></div>';
      x.innerHTML = h;
      if (kasBox) kasBox.classList.toggle('hidden', !!(kat && kat.mode === 'utang'));
    }
    function tampilGalat(e) {
      const g = f.querySelector('[data-galat]'); if (!g) return;
      g.className = 'alert r mt'; g.innerHTML = R.ic('alert', 's18') + '<span>' + esc(e.message) + '</span>';
      R.$$('.field.bad', f).forEach((x) => x.classList.remove('bad'));
      if (e.fields) Object.keys(e.fields).forEach((k) => { const i = f.querySelector('[name=' + k + ']') || (k === 'lampiran' ? f.querySelector('[data-lamp]') : k === 'id_kategori' ? f.querySelector('[data-katpilih]') : null); if (i) { const fl = i.closest('.field'); if (fl) { fl.classList.add('bad'); const er = fl.querySelector('.err'); if (er) er.textContent = e.fields[k]; } } });
      g.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    function kirim(lagi) {
      simpanNilai();
      const lamp = f.querySelector('[data-lamp]');
      if (lamp && lamp.dataset.proses) return R.toast('Tunggu, lampiran masih diunggah…', 'info');
      const data = { jenis: v.jenis, tanggal: v.tanggal, nominal: R.nilai(v.nominal), akun_kas: v.akun_kas, akun_tujuan: v.akun_tujuan, id_kategori: v.jenis === 'Transfer' ? '' : v.id_kategori,
        id_channel: v.id_channel || '', id_kontak: v.id_kontak || '', jatuh_tempo: v.jatuh_tempo || '', jumlah_bulan: v.jumlah_bulan || '', catatan: (v.catatan || '').trim(), lampiran_url: lamp ? lamp.dataset.id || '' : '', client_id: v.client_id || R.api.uid() };
      // validasi cepat di perangkat
      const salah = {};
      if (data.nominal <= 0) salah.nominal = 'Isi nominal';
      if (v.jenis !== 'Transfer' && !kat) salah.id_kategori = 'Pilih kategori';
      if (kat && kat.butuh_channel && !data.id_channel) salah.id_channel = 'Pilih channel';
      if (kat && kat.butuh_kontak && !data.id_kontak) salah.id_kontak = 'Wajib dipilih';
      if (kat && kat.mode === 'utang' && !data.jatuh_tempo) salah.jatuh_tempo = 'Isi jatuh tempo';
      if (v.jenis === 'Transfer' && data.akun_kas === data.akun_tujuan) salah.akun_tujuan = 'Harus berbeda';
      if (cekLampiran() && !data.lampiran_url) salah.lampiran = 'Lampirkan foto bukti';
      if (kat && kat.akun === '6-2299' && !data.catatan) salah.catatan = 'Jelaskan pengeluaran ini';
      if (R.terkunci(data.tanggal)) salah.tanggal = 'Periode ' + R.bln(data.tanggal.slice(0, 7)) + ' sudah dikunci';
      if (Object.keys(salah).length) return tampilGalat({ message: 'Lengkapi isian yang ditandai.', fields: salah });
      R.LS.set(LS_KAS, data.akun_kas);
      // UI optimis: tutup form dulu, simpan di belakang
      const sementara = { id: 'tmp-' + data.client_id, no_bukti: 'menyimpan…', tanggal: data.tanggal, sumber: data.jenis, deskripsi: data.catatan || (kat ? kat.nama : 'Transfer'), total: data.nominal, status: 'Menyimpan', akun_kas: data.akun_kas, id_kategori: data.id_kategori, _pending: true };
      R.emit('trx:pending', sementara);
      d.tutup();
      R.api.call('transaksi.create', data).then((r) => {
        R.toast(r._pesan || 'Tersimpan.');
        R.emit('trx:simpan', r.transaksi); R.app.muatNotif();
      }).catch((e) => {
        R.emit('trx:gagal', sementara);
        R.catat(v.jenis, { nilai: Object.assign({}, v, { client_id: data.client_id, lampiran_url: data.lampiran_url }), galat: e });
      });
      if (lagi) setTimeout(() => R.catat(v.jenis, { nilai: { tanggal: v.tanggal, akun_kas: v.akun_kas, id_kategori: v.id_kategori, id_channel: v.id_channel } }), 300);
    }
    gambar();
    return d;
  };

  // ============================================================
  // DETAIL TRANSAKSI
  // ============================================================
  R.detailTransaksi = async function (id) {
    const d = R.drawer({ judul: 'Detail transaksi', isi: R.loaderMini('Memuat transaksi') });
    try {
      const t = await R.api.get('transaksi.get', { id: id });
      const st = { Draft: 'a', Diposting: 'g', Dibatalkan: 'r' }[t.status] || '';
      d.judul = t.no_bukti;
      d.body.innerHTML = '<div class="card tint flat"><div class="row between"><span class="badge ' + st + '"><span class="bd"></span>' + esc(t.status) + '</span><span class="small muted">' + esc(t.sumber) + '</span></div><div style="font-size:28px;font-weight:800;margin-top:10px" class="num">' + R.rp(t.total) + '</div><div class="muted">' + esc(t.deskripsi) + '</div></div>' +
        '<dl class="kv mt">' + [['Tanggal', R.tglP(t.tanggal)], ['Kategori', t.kategori || '–'], ['Kas / bank', (t.akun_kas || '').split('>').map(R.namaAkun).join(' → ') || '–'], ['Channel', t.id_channel ? (R.mCh[t.id_channel] || {}).nama : '–'], ['Kontak', t.kontak || '–'], ['Dibuat', esc(t.dibuat_oleh) + ' · ' + R.waktu(t.dibuat_pada)], ['Diposting', t.diposting_oleh ? esc(t.diposting_oleh) + ' · ' + R.waktu(t.diposting_pada) : '–']]
          .map((x) => '<dt>' + x[0] + '</dt><dd>' + (x[0] === 'Dibuat' || x[0] === 'Diposting' ? x[1] : esc(x[1])) + '</dd>').join('') + '</dl>' +
        (t.catatan_batal ? '<div class="alert r mt">' + R.ic('alert', 's18') + '<span>Dibatalkan: ' + esc(t.catatan_batal) + '</span></div>' : '') +
        '<h3 class="sec mt-l">Jurnal otomatis</h3><p class="sec-sub">Begini transaksi ini dicatat dalam pembukuan berpasangan.</p><div class="card p0 mt"><table class="tbl compact"><thead><tr><th>Akun</th><th class="n">Debit</th><th class="n">Kredit</th></tr></thead><tbody>' +
        t.lines.map((l) => '<tr><td><span class="faint xs">' + esc(l.no_akun) + '</span> ' + esc(l.nama_akun) + (l.id_channel ? ' <span class="badge">' + esc(l.id_channel) + '</span>' : '') + '</td><td class="n">' + (l.debit ? R.rp(l.debit) : '') + '</td><td class="n">' + (l.kredit ? R.rp(l.kredit) : '') + '</td></tr>').join('') + '</tbody></table></div>' +
        (t.lampiran_url ? '<button class="btn block mt" data-lamp>' + R.ic('clip', 's18') + ' Lihat lampiran</button>' : '');
      const lb = d.body.querySelector('[data-lamp]'); if (lb) lb.onclick = () => R.lihatLampiran(t.lampiran_url);
      if (R.isOA() && t.status !== 'Dibatalkan') {
        d.el.insertAdjacentHTML('beforeend', '<div class="dr-foot">' + (t.status === 'Draft' ? '<button class="btn" data-batal>' + R.ic('x', 's16') + ' Tolak</button><button class="btn primary" data-post>' + R.ic('check', 's16') + ' Posting</button>' : '<button class="btn" data-batal>' + R.ic('undo', 's16') + ' Batalkan transaksi</button>') + '</div>');
        const foot = d.el.querySelector('.dr-foot');
        const p = foot.querySelector('[data-post]');
        if (p) p.onclick = async () => { p.classList.add('busy'); try { const r = await R.api.call('transaksi.posting', { ids: [t.id] }); R.toast(r._pesan); d.tutup(); R.emit('trx:simpan'); R.app.muatNotif(); } catch (e) { R.galat(e); p.classList.remove('busy'); } };
        foot.querySelector('[data-batal]').onclick = async () => {
          const alasan = await R.konfirmasi({ judul: t.status === 'Draft' ? 'Tolak draft ini?' : 'Batalkan transaksi ' + t.no_bukti + '?', pesan: t.status === 'Draft' ? 'Draft tidak akan masuk pembukuan.' : 'Data tidak dihapus. Sistem membuat jurnal pembalik (JB) agar riwayat tetap tercatat.', bahaya: true, ok: 'Batalkan', input: { label: 'Alasan', wajib: true, placeholder: 'mis. salah nominal' } });
          if (!alasan) return;
          try { const r = await R.api.call('transaksi.batal', { id: t.id, alasan: alasan }); R.toast(r._pesan); d.tutup(); R.emit('trx:simpan'); } catch (e) { R.galat(e); }
        };
      }
    } catch (e) { d.body.innerHTML = R.kosong('Tidak bisa dibuka', e.message, 'alert'); }
  };

  // ============================================================
  // HALAMAN DAFTAR
  // ============================================================
  R.halaman.transaksi = {
    judul: 'Pemasukan & Pengeluaran',
    render(el, q, sub, nav) {
      st.per = st.per || R.rentang('bulan');
      if (q.status !== undefined) st.status = q.status;
      const OA = R.isOA();
      el.innerHTML = '<div class="page-head"><div><h2>Pemasukan & pengeluaran</h2><p>Pilih kategori dengan bahasa sehari-hari — akun pembukuannya otomatis.</p></div><div class="actions">' +
        '<button class="btn primary" data-c="Pengeluaran">' + R.ic('up', 's18') + ' Pengeluaran</button><button class="btn" data-c="Pemasukan">' + R.ic('down', 's18') + ' Pemasukan</button><button class="btn" data-c="Transfer">' + R.ic('repeat', 's18') + ' Transfer</button></div></div>' +
        '<div class="grid g3 mb" data-ring></div>' +
        '<div class="card p0"><div style="padding:16px 16px 0"><div class="row wrap between" style="gap:10px"><div data-per></div><div class="row wrap" style="gap:8px"><select class="inp sm" data-jenis style="width:auto" aria-label="Jenis"><option value="">Semua jenis</option>' + ['Pengeluaran', 'Pemasukan', 'Transfer', 'Penjualan', 'Pencairan', 'Pelunasan Piutang', 'Pembayaran Utang', 'Gaji', 'Aset', 'Pajak', 'Pembatalan'].map((j) => '<option ' + (j === st.jenis ? 'selected' : '') + '>' + j + '</option>').join('') + '</select>' +
        '<select class="inp sm" data-kas style="width:auto" aria-label="Akun kas"><option value="">Semua kas & bank</option>' + R.opsiKas(st.kas) + '</select><div class="inp-group"><span class="ic-in">' + R.ic('search', 's16') + '</span><input class="inp sm" data-cari placeholder="Cari no. bukti / keterangan" value="' + esc(st.cari) + '" style="width:230px"></div></div></div>' +
        '<div data-tabs style="margin:12px 0 0"></div></div>' +
        '<div class="row between hidden" data-aksi style="padding:10px 16px;background:var(--accent-tint)"><b class="small" data-jml></b><button class="btn sm primary" data-posting>' + R.ic('check', 's16') + ' Posting terpilih</button></div>' +
        '<div data-list>' + R.kerangka(6) + '</div><div data-pager></div></div>';
      R.on(el, 'click', '[data-c]', (e, b) => R.catat(b.dataset.c));
      R.periode(el.querySelector('[data-per]'), { nilai: st.per, preset: ['hari', '7hari', 'bulan', 'bulanlalu', 'tahun', 'kustom'], ubah: (v) => { st.per = v; st.hal = 1; muat(); } });
      el.querySelector('[data-jenis]').onchange = (e) => { st.jenis = e.target.value; st.hal = 1; muat(); };
      el.querySelector('[data-kas]').onchange = (e) => { st.kas = e.target.value; st.hal = 1; muat(); };
      el.querySelector('[data-cari]').oninput = R.tunda((e) => { st.cari = e.target.value.trim(); st.hal = 1; muat(); }, 350);
      let pending = [], data = null, terpilih = [];
      const listEl = el.querySelector('[data-list]');
      function gambar(d) {
        data = d;
        const r = d.ringkas;
        el.querySelector('[data-ring]').innerHTML = [['Pemasukan', r.pemasukan, 'down', 'g'], ['Pengeluaran', r.pengeluaran, 'up', 'r'], ['Transfer antar akun', r.transfer, 'repeat', 'b']].map((x) => '<div class="card kpi"><div class="lbl"><span class="ic-wrap ' + x[3] + '">' + R.ic(x[2], 's18') + '</span>' + x[0] + '</div><div class="val">' + R.rp(x[1]) + '</div><div class="foot">' + esc(st.per.label) + '</div></div>').join('');
        R.tabs(el.querySelector('[data-tabs]'), [{ id: '', label: 'Semua', cnt: d.hitung.Semua }, { id: 'Draft', label: 'Draft', cnt: d.hitung.Draft || 0 }, { id: 'Diposting', label: 'Diposting', cnt: d.hitung.Diposting || 0 }, { id: 'Dibatalkan', label: 'Dibatalkan', cnt: d.hitung.Dibatalkan || 0 }], st.status, (s) => { st.status = s; st.hal = 1; R.ubahQuery({ status: s }); muat(); });
        el.querySelector('[data-tabs]').style.marginBottom = '0';
        const baris = pending.concat(d.baris);
        R.tabel(listEl, { mulai: ((d.halaman || 1) - 1) * (d.per || 0),
          baris: baris, kosong: 'Belum ada transaksi', kosongPesan: 'Catat pemasukan atau pengeluaran pertama Anda.', kosongIkon: 'receipt',
          pilih: OA && st.status === 'Draft', bisaPilih: (t) => t.status === 'Draft',
          onPilih: (rows) => { terpilih = rows; el.querySelector('[data-aksi]').classList.toggle('hidden', !rows.length); el.querySelector('[data-jml]').textContent = rows.length + ' draft dipilih'; },
          klik: (t) => { if (!t._pending) R.detailTransaksi(t.id); },
          kolom: [
            { k: 'tanggal', label: 'Tanggal', tipe: 'tgl', hideM: true },
            { k: 'deskripsi', label: 'Keterangan', lead: true, render: (t) => { const k = R.mKat[t.id_kategori]; return '<b>' + esc(t.deskripsi) + '</b><span class="t2">' + esc(t.no_bukti) + (k ? ' · ' + esc(k.nama) : '') + ' <span class="mobile-only">· ' + R.tgl(t.tanggal) + '</span>' + (t.lampiran ? ' · ' + R.ic('clip', 's16') : '') + '</span>'; } },
            { k: 'akun_kas', label: 'Kas / bank', hideM: true, render: (t) => esc(String(t.akun_kas || '').split('>').map(R.namaAkun).join(' → ') || '–') },
            { k: 'status', label: 'Status', render: (t) => '<span class="badge ' + ({ Draft: 'a', Diposting: 'g', Dibatalkan: 'r', Menyimpan: 'o' }[t.status] || '') + '"><span class="bd"></span>' + esc(t.status) + '</span>' },
            { k: 'total', label: 'Nominal', tipe: 'rp', render: (t) => { const m = /Pemasukan|Penjualan|Pelunasan|Pencairan/.test(t.sumber); const k = /Pengeluaran|Gaji|Pembayaran|Pajak/.test(t.sumber); return '<b class="' + (t.status === 'Dibatalkan' ? 'faint' : m ? 'pos' : '') + '" style="' + (t.status === 'Dibatalkan' ? 'text-decoration:line-through' : '') + '">' + (m ? '+' : k ? '−' : '') + R.rp(t.total) + '</b>'; } }
          ]
        });
        R.pager(el.querySelector('[data-pager]'), d, (h) => { st.hal = h; muat(); });
      }
      function muat() {
        const p = { dari: st.per.dari, sampai: st.per.sampai, jenis: st.jenis, akun_kas: st.kas, cari: st.cari, status: st.status, halaman: st.hal };
        R.api.swr('transaksi.list', p, (d) => { if (R.masihDi(nav)) gambar(d); }, { simpan: !st.cari && st.hal === 1 }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, listEl, muat); });
      }
      el.querySelector('[data-posting]').onclick = async (e) => {
        const b = e.currentTarget; b.classList.add('busy');
        try { const r = await R.api.call('transaksi.posting', { ids: terpilih.map((t) => t.id) }); R.toast(r._pesan); if (r.gagal && r.gagal.length) R.toast(r.gagal.join('; '), 'err'); R.app.muatNotif(); muat(); }
        catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
      };
      const lepas = [
        R.dengar('trx:pending', (t) => { pending.unshift(t); if (data) gambar(data); }),
        R.dengar('trx:gagal', (t) => { pending = pending.filter((x) => x.id !== t.id); if (data) gambar(data); }),
        R.dengar('trx:simpan', () => { pending = []; muat(); })
      ];
      muat();
      if (q.id) setTimeout(() => R.detailTransaksi(q.id), 50);
      if (q.baru) setTimeout(() => R.catat(q.baru), 50);
      return () => lepas.forEach((f) => f());
    }
  };
})();
