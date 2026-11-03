/* ROVELO Finance — Produk: katalog (foto, kategori, HPP, harga per channel) + statistik terjual per channel. Tanpa stok. */
(function () {
  const R = window.R;
  const esc = R.esc;
  const sp = { rentang: 'bulan', cari: '', kat: '', urut: 'qty', tampil: 'kartu', dari: null, sampai: null };

  // ---------- foto produk (dimuat terpisah & disimpan di perangkat) ----------
  let fotoMap = null;
  R.fotoProduk = function (cb) {
    if (fotoMap && cb) cb(fotoMap);
    return R.api.swr('produk.foto', {}, (m) => { fotoMap = m || {}; if (cb) cb(fotoMap); }, { simpan: true }).catch(() => {});
  };
  R.thumbProduk = (sku, size, cls) => {
    const f = fotoMap && fotoMap[sku];
    return '<span class="p-thumb ' + (cls || '') + '" data-thumb="' + esc(sku) + '" style="width:' + size + 'px;height:' + size + 'px">' + (f ? '<img alt="" src="' + esc(f) + '">' : R.ic('package', size > 60 ? 's24' : 's18')) + '</span>';
  };
  /** Pasang foto ke semua [data-thumb] di elemen setelah foto selesai dimuat. */
  R.isiThumb = (el) => R.fotoProduk((m) => { R.$$('[data-thumb]', el).forEach((t) => { const f = m[t.dataset.thumb]; if (f && !t.querySelector('img')) t.innerHTML = '<img alt="" src="' + esc(f) + '">'; }); });
  /** Harga jual untuk channel tertentu (harga khusus channel bila diisi). */
  R.hargaProduk = (p, ch) => (p && p.hc && ch && +p.hc[ch]) || (p ? p.harga : 0);

  function rentang(id) {
    const ini = R.hariIni().slice(0, 7);
    if (id === 'bulanlalu') { const p = R.tambahBulan(ini, -1); return { dari: p, sampai: p, label: R.bln(p) }; }
    if (id === '3bulan') return { dari: R.tambahBulan(ini, -2), sampai: ini, label: R.bln(R.tambahBulan(ini, -2)) + ' – ' + R.bln(ini) };
    if (id === 'tahun') return { dari: ini.slice(0, 4) + '-01', sampai: ini, label: 'Tahun ' + ini.slice(0, 4) };
    if (id === 'pilih' && sp.dari) return { dari: sp.dari, sampai: sp.sampai, label: sp.dari === sp.sampai ? R.bln(sp.dari) : R.bln(sp.dari) + ' – ' + R.bln(sp.sampai) };
    return { dari: ini, sampai: ini, label: R.bln(ini) };
  }

  R.halaman.produk = {
    judul: 'Produk', roles: R.PERAN.OAV,
    render(el, q, sub, nav) {
      const OA = R.isOA();
      el.innerHTML = '<div class="page-head"><div><h2>Produk</h2><p>Daftar produk, HPP, harga per channel, dan berapa yang terjual di tiap channel. Tidak menghitung stok.</p></div>' +
        '<div class="actions">' + (OA ? '<button class="btn primary" data-baru>' + R.ic('plus', 's18') + ' Produk baru</button>' : '') + '<button class="btn" data-xls>' + R.ic('download', 's16') + ' Excel</button></div></div>' +
        '<div class="card mb" style="padding:12px 16px"><div class="row wrap between" style="gap:10px"><div data-r></div><div class="row wrap" style="gap:8px"><input type="month" class="inp sm hidden" data-d style="width:auto" aria-label="Dari bulan"><input type="month" class="inp sm hidden" data-s style="width:auto" aria-label="Sampai bulan"></div></div></div>' +
        '<div data-isi><div class="card">' + R.loaderMini('Menghitung penjualan produk') + '</div></div>';
      const isi = el.querySelector('[data-isi]');
      let data = null;
      R.seg(el.querySelector('[data-r]'), [{ v: 'bulan', l: 'Bulan ini' }, { v: 'bulanlalu', l: 'Bulan lalu' }, { v: '3bulan', l: '3 bulan' }, { v: 'tahun', l: 'Tahun ini' }, { v: 'pilih', l: 'Pilih bulan' }], sp.rentang, (v) => { sp.rentang = v; pilihBulan(); if (v !== 'pilih' || sp.dari) muat(); });
      const dI = el.querySelector('[data-d]'), sI = el.querySelector('[data-s]');
      function pilihBulan() {
        const on = sp.rentang === 'pilih';
        dI.classList.toggle('hidden', !on); sI.classList.toggle('hidden', !on);
        if (on && !sp.dari) { sp.dari = sp.sampai = R.hariIni().slice(0, 7); }
        dI.value = sp.dari || ''; sI.value = sp.sampai || '';
      }
      dI.onchange = () => { if (!dI.value) return; sp.dari = dI.value; if (!sp.sampai || sp.sampai < sp.dari) sp.sampai = sp.dari; sI.value = sp.sampai; muat(); };
      sI.onchange = () => { if (!sI.value) return; sp.sampai = sI.value; if (sp.dari > sp.sampai) sp.dari = sp.sampai; dI.value = sp.dari; muat(); };
      pilihBulan();
      if (OA) el.querySelector('[data-baru]').onclick = () => formProduk(null, muat);
      el.querySelector('[data-xls]').onclick = (e) => {
        if (!data) return; const b = e.currentTarget; b.classList.add('busy');
        const chs = data.channel.map((c) => c.id);
        R.xlsx.unduh('Produk ROVELO ' + data.label, [{ nama: 'Produk', baris: data.produk.map((p, i) => Object.assign({ No: i + 1, SKU: p.sku, Produk: p.nama, Varian: p.varian || '', Kategori: p.kategori || '', HPP: p.hpp_satuan, 'Harga jual': p.harga, 'Qty terjual': p.qty },
          chs.reduce((o, c) => { o['Qty ' + ((R.mCh[c] || {}).nama || c)] = (p.ch[c] || {}).qty || 0; return o; }, {}), { Omzet: p.omzet, 'Laba kotor': p.laba, 'Margin %': p.margin, 'Qty RTS': p.qty_rts })) },
        { nama: 'Per channel', baris: data.channel.map((c, i) => ({ No: i + 1, Channel: (R.mCh[c.id] || {}).nama || c.id, Qty: c.qty, Omzet: c.omzet, 'Laba kotor': c.laba })) },
        { nama: 'Per kategori', baris: data.kategori.map((k, i) => ({ No: i + 1, Kategori: k.kategori, Produk: k.produk, Qty: k.qty, Omzet: k.omzet, 'Laba kotor': k.laba })) }]).catch(R.galat).finally(() => b.classList.remove('busy'));
      };

      function muat() {
        const r = rentang(sp.rentang);
        R.api.swr('produk.statistik', { dari: r.dari, sampai: r.sampai }, (d) => { if (R.masihDi(nav)) gambar(d); }, { simpan: true }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, isi, muat); });
      }
      function gambar(d) {
        data = d; const t = d.total;
        const kats = Array.from(new Set(d.produk.map((p) => p.kategori).filter(Boolean))).sort();
        isi.innerHTML = '<div class="grid g4 keep2">' +
          [['Produk terjual', R.angka(t.terjual) + ' <small class="muted">dari ' + R.angka(t.produk) + '</small>', 'Produk yang laku minimal 1 pcs'], ['Qty terjual', R.angka(t.qty) + ' pcs', esc(d.label)], ['Omzet produk', R.rp(t.omzet), 'Harga jual × qty'], ['Laba kotor', R.rp(t.laba), 'margin ' + R.persen(t.margin)]]
            .map((x, i) => '<div class="card kpi' + (i === 1 ? ' hero' : '') + '"><div class="lbl">' + x[0] + '</div><div class="val">' + x[1] + '</div><div class="foot"><span>' + x[2] + '</span></div></div>').join('') + '</div>' +
          '<div class="grid g2 mt"><div class="card"><div class="card-head"><div><h3 class="sec">Terjual per channel</h3><div class="sec-sub">Jumlah pcs · ' + esc(d.label) + '</div></div></div>' +
          R.batangList(d.channel.map((c) => ({ label: (R.mCh[c.id] || {}).nama || c.id || 'Lainnya', ikon: R.chLogo(c.id, 18), n: c.qty, warna: R.warnaCh(c.id), sub: R.rp(c.omzet) + ' omzet' })), { angka: true, satuan: ' pcs', kosong: 'Belum ada penjualan' }) + '</div>' +
          '<div class="card"><div class="card-head"><div><h3 class="sec">Omzet per kategori</h3><div class="sec-sub">' + esc(d.label) + '</div></div></div>' +
          R.batangList(d.kategori.filter((k) => k.omzet).map((k) => ({ label: k.kategori, n: k.omzet, warna: '#FB923C', sub: R.angka(k.qty) + ' pcs · ' + k.produk + ' produk' })), { kosong: 'Belum ada penjualan' }) + '</div></div>' +
          '<div class="card p0 mt"><div class="card-head" style="flex-wrap:wrap;gap:10px"><div><h3 class="sec">Daftar produk</h3><div class="sec-sub">Ketuk produk untuk melihat rincian per channel & grafik 12 bulan</div></div>' +
          '<div class="row wrap" style="gap:8px"><div class="inp-group"><span class="ic-in">' + R.ic('search', 's16') + '</span><input class="inp sm" data-cari placeholder="Cari nama / SKU" value="' + esc(sp.cari) + '" style="width:190px"></div>' +
          '<select class="inp sm" data-urut style="width:auto" aria-label="Urutkan">' + [['qty', 'Paling laku'], ['omzet', 'Omzet terbesar'], ['laba', 'Laba terbesar'], ['nama', 'Nama A–Z']].map((x) => '<option value="' + x[0] + '" ' + (sp.urut === x[0] ? 'selected' : '') + '>' + x[1] + '</option>').join('') + '</select><div data-tampil></div></div></div>' +
          (kats.length ? '<div class="chips scroll" style="padding:0 16px 12px"><button class="chip ' + (!sp.kat ? 'on' : '') + '" data-kat="">Semua kategori</button>' + kats.map((k) => '<button class="chip ' + (sp.kat === k ? 'on' : '') + '" data-kat="' + esc(k) + '">' + esc(k) + '</button>').join('') + '</div>' : '') +
          '<div data-daftar></div></div>';
        R.seg(isi.querySelector('[data-tampil]'), [{ v: 'kartu', l: 'Kartu' }, { v: 'tabel', l: 'Tabel' }], sp.tampil, (v) => { sp.tampil = v; daftar(); }, 'sm');
        isi.querySelector('[data-cari]').oninput = R.tunda((e) => { sp.cari = e.target.value.trim().toLowerCase(); daftar(); }, 200);
        isi.querySelector('[data-urut]').onchange = (e) => { sp.urut = e.target.value; daftar(); };
        R.on(isi, 'click', '[data-kat]', (e, b) => { sp.kat = b.dataset.kat; R.$$('[data-kat]', isi).forEach((x) => x.classList.toggle('on', x === b)); daftar(); });
        daftar();
      }
      function daftar() {
        const d = data, box = isi.querySelector('[data-daftar]');
        let L = d.produk.filter((p) => (!sp.kat || p.kategori === sp.kat) && (!sp.cari || (p.sku + ' ' + p.nama + ' ' + (p.varian || '')).toLowerCase().indexOf(sp.cari) >= 0));
        L = L.slice().sort((a, b) => sp.urut === 'nama' ? (a.nama < b.nama ? -1 : 1) : (b[sp.urut] - a[sp.urut]) || (a.nama < b.nama ? -1 : 1));
        const chs = d.channel.map((c) => c.id);
        if (!L.length) { box.innerHTML = R.kosong('Produk tidak ditemukan', 'Ubah kata pencarian atau kategori.', 'package'); return; }
        if (sp.tampil === 'tabel') {
          R.tabel(box, { baris: L.slice(0, 500), ringkas: true, klik: (p) => detail(p, muat), kolom: [
            { k: 'nama', label: 'Produk', lead: true, render: (p) => '<span class="row" style="gap:10px;display:flex;align-items:center">' + R.thumbProduk(p.sku, 36) + '<span><b>' + esc(p.nama) + '</b><span class="t2">' + esc([p.varian, p.sku].filter(Boolean).join(' · ')) + '</span></span></span>' },
            { k: 'kategori', label: 'Kategori', hideM: true, render: (p) => esc(p.kategori || '–') },
            { k: 'hpp_satuan', label: 'HPP', tipe: 'rp', hideM: true }, { k: 'harga', label: 'Harga', tipe: 'rp', hideM: true },
            { k: 'qty', label: 'Terjual', tipe: 'angka', render: (p) => '<b>' + R.angka(p.qty) + '</b> pcs' }]
            .concat(chs.map((c) => ({ k: 'c' + c, label: (R.mCh[c] || {}).nama || c, tipe: 'angka', hideM: true, render: (p) => R.angka((p.ch[c] || {}).qty || 0) })))
            .concat([{ k: 'omzet', label: 'Omzet', tipe: 'rp' }, { k: 'laba', label: 'Laba kotor', tipe: 'rp', render: (p) => '<b class="' + (p.laba < 0 ? 'neg' : '') + '">' + R.rp(p.laba) + '</b><span class="t2">' + R.persen(p.margin) + '</span>' }]) });
        } else {
          box.innerHTML = '<div class="p-grid">' + L.slice(0, 300).map((p, i) => {
            const tot = p.qty || 1;
            return '<button class="p-card" data-i="' + i + '">' + R.thumbProduk(p.sku, 64) + '<div class="pc-body"><div class="pc-nama">' + esc(p.nama) + '</div><div class="xs muted ellipsis">' + esc([p.varian, p.sku].filter(Boolean).join(' · ')) + '</div>' +
              '<div class="pc-angka"><span><b class="num">' + R.angka(p.qty) + '</b> <small>pcs terjual</small></span><span class="num small">' + R.rpK(p.omzet) + '</span></div>' +
              '<div class="pc-split" title="Porsi qty per channel">' + (p.qty ? Object.keys(p.ch).filter((c) => p.ch[c].qty).sort((a, b) => p.ch[b].qty - p.ch[a].qty).map((c) => '<i style="width:' + (p.ch[c].qty / tot * 100) + '%;background:' + R.warnaCh(c) + '"></i>').join('') : '<i style="width:100%;background:#EEF0F3"></i>') + '</div>' +
              '<div class="pc-ch">' + (p.qty ? Object.keys(p.ch).filter((c) => p.ch[c].qty).sort((a, b) => p.ch[b].qty - p.ch[a].qty).slice(0, 4).map((c) => '<span>' + R.chLogo(c, 14) + R.angka(p.ch[c].qty) + '</span>').join('') : '<span class="faint">Belum terjual</span>') + '</div>' +
              '<div class="xs muted mt" style="margin-top:6px">HPP ' + R.rpK(p.hpp_satuan) + ' · Jual ' + R.rpK(p.harga) + (p.kategori ? ' · ' + esc(p.kategori) : '') + '</div></div></button>';
          }).join('') + '</div>';
          box.querySelector('.p-grid').onclick = (e) => { const b = e.target.closest('[data-i]'); if (b) detail(L[+b.dataset.i], muat); };
        }
        R.isiThumb(box);
      }
      muat();
    }
  };

  // ---------- detail produk ----------
  function detail(p, selesai) {
    const OA = R.isOA();
    const m = R.mProd && R.mProd[p.sku];
    const dr = R.drawer({ judul: p.nama, lebar: true, isi: '<div class="row" style="gap:14px;align-items:flex-start">' + R.thumbProduk(p.sku, 96, 'besar') + '<div class="grow"><b style="font-size:17px">' + esc(p.nama) + '</b><div class="muted small">' + esc([p.varian, 'SKU ' + p.sku, p.kategori].filter(Boolean).join(' · ')) + '</div>' +
      '<dl class="kv mt"><dt>HPP / pcs</dt><dd>' + R.rp(p.hpp_satuan) + '</dd><dt>Harga jual normal</dt><dd>' + R.rp(p.harga) + '</dd><dt>Laba / pcs (sebelum potongan)</dt><dd>' + R.rp(p.harga - p.hpp_satuan) + '</dd></dl>' +
      (m && m.hc && Object.keys(m.hc).length ? '<div class="small mt"><b>Harga khusus channel:</b> ' + Object.keys(m.hc).map((c) => R.chLogo(c, 14) + ' ' + esc((R.mCh[c] || {}).nama || c) + ' ' + R.rp(m.hc[c])).join(' · ') + '</div>' : '') +
      '</div></div>' + (OA ? '<button class="btn sm mt" data-ubah>' + R.ic('edit', 's16') + ' Ubah produk</button>' : '') +
      '<h3 class="sec mt-l">Terjual per channel <span class="faint small">(periode yang dipilih)</span></h3><div data-ch></div>' +
      '<h3 class="sec mt-l">Qty terjual 12 bulan terakhir</h3><p class="chart-cap" data-cap>Memuat…</p><div class="chart-box"><canvas data-g aria-label="Grafik qty terjual per bulan"></canvas></div>' });
    dr.body.querySelector('[data-ch]').innerHTML = p.qty ? R.batangList(Object.keys(p.ch).filter((c) => p.ch[c].qty).sort((a, b) => p.ch[b].qty - p.ch[a].qty).map((c) => ({ label: (R.mCh[c] || {}).nama || c, ikon: R.chLogo(c, 18), n: p.ch[c].qty, warna: R.warnaCh(c), sub: R.rp(p.ch[c].omzet) + ' omzet' })), { angka: true, satuan: ' pcs' }) : R.kosong('Belum terjual di periode ini', '', 'package');
    const ub = dr.body.querySelector('[data-ubah]'); if (ub) ub.onclick = () => { dr.tutup(); formProduk(m || { sku: p.sku, nama: p.nama, varian: p.varian, hpp: p.hpp_satuan, harga: p.harga, kat: p.kategori, hc: {} }, selesai); };
    R.isiThumb(dr.body);
    const sampai = R.hariIni().slice(0, 7);
    R.api.get('produk.statistik', { dari: sampai, sampai: sampai, sku: p.sku }).then((d) => {
      const tr = d.tren || [];
      const lbl = tr.map((x) => R.BULAN[+x.periode.slice(5) - 1].slice(0, 3) + ' ' + x.periode.slice(0, 4));
      const tot = tr.reduce((s, x) => s + x.qty, 0), top = tr.slice().sort((a, b) => b.qty - a.qty)[0];
      dr.body.querySelector('[data-cap]').innerHTML = tot ? 'Total <b>' + R.angka(tot) + ' pcs</b> dalam 12 bulan. Paling laku di <b>' + R.bln(top.periode) + '</b> (' + R.angka(top.qty) + ' pcs).' : 'Belum ada penjualan dalam 12 bulan terakhir.';
      R.grafik(dr.body.querySelector('[data-g]'), { type: 'bar', angka: true, judulY: 'pcs', labelNilai: [0], data: { labels: lbl, datasets: [{ label: 'Qty terjual', data: tr.map((x) => x.qty), backgroundColor: '#FB923C', hoverBackgroundColor: '#F97316', maxBarThickness: 26 }] } }).catch(() => {});
    }).catch((e) => { dr.body.querySelector('[data-cap]').textContent = e.message; });
  }

  // ---------- form produk (tambah / ubah) ----------
  function formProduk(p, selesai) {
    const baru = !p; p = p || { hc: {} };
    const chs = ((R.boot && R.boot.channel) || []).filter((c) => c.aktif);
    const kats = Array.from(new Set(((R.boot && R.boot.produk) || []).map((x) => x.kat).filter(Boolean))).sort();
    let foto;
    const dr = R.drawer({ judul: baru ? 'Produk baru' : 'Ubah ' + p.nama, isi: '<form class="stack" novalidate>' +
      '<div class="row" style="gap:14px"><div class="foto-edit" data-foto>' + R.thumbProduk(p.sku || '_', 84, 'besar') + '<span class="fe-ic">' + R.ic('camera', 's16') + '</span></div><div class="small muted">Foto produk (opsional). Ketuk untuk memilih; otomatis diperkecil.<div class="mt" style="margin-top:6px"><button type="button" class="btn sm ghost" data-hapusfoto>Hapus foto</button></div></div></div>' +
      '<div class="fgrid"><div class="field"><label>SKU</label><input class="inp" name="sku" value="' + esc(p.sku || '') + '" ' + (baru ? '' : 'readonly') + ' autocapitalize="characters" placeholder="mis. RVL-KMJ-01"></div>' +
      '<div class="field"><label>Kategori</label><input class="inp" name="kategori" list="dl-kat" value="' + esc(p.kat || '') + '" placeholder="mis. Kemeja"><datalist id="dl-kat">' + kats.map((k) => '<option value="' + esc(k) + '">').join('') + '</datalist></div>' +
      '<div class="field full"><label>Nama produk</label><input class="inp" name="nama_produk" value="' + esc(p.nama || '') + '"></div>' +
      '<div class="field"><label>Varian</label><input class="inp" name="varian" value="' + esc(p.varian || '') + '" placeholder="mis. Navy L"></div><div></div>' +
      '<div class="field"><label>HPP / modal per pcs</label><input class="inp" name="hpp" data-rp inputmode="numeric" value="' + (p.hpp ? R.angka(p.hpp) : '') + '"></div>' +
      '<div class="field"><label>Harga jual normal</label><input class="inp" name="harga_jual_normal" data-rp inputmode="numeric" value="' + (p.harga ? R.angka(p.harga) : '') + '"></div></div>' +
      '<h3 class="sec mt">Harga khusus per channel <span class="faint small">(opsional)</span></h3><p class="sec-sub">Kosongkan bila sama dengan harga normal. Dipakai otomatis saat mencatat penjualan manual.</p><div class="fgrid mt">' +
      chs.map((c) => '<div class="field"><label>' + R.chLogo(c.id, 16) + ' ' + esc(c.nama) + '</label><input class="inp" data-hc="' + c.id + '" data-rp inputmode="numeric" value="' + (p.hc && p.hc[c.id] ? R.angka(p.hc[c.id]) : '') + '" placeholder="sama dengan normal"></div>').join('') + '</div>' +
      (!baru ? '<label class="check mt"><input type="checkbox" name="aktif" checked> Produk aktif</label>' : '') + '</form>',
      kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan</button>' });
    R.inpRpSemua(dr.body);
    const f = dr.body.querySelector('form');
    R.isiThumb(dr.body);
    const pasangFoto = (src) => { const t = dr.body.querySelector('[data-foto] .p-thumb'); t.innerHTML = src ? '<img alt="" src="' + src + '">' : R.ic('package', 's24'); };
    dr.body.querySelector('[data-foto]').onclick = () => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = async () => { if (!inp.files[0]) return; try { let k = await R.kompres(inp.files[0], 360, 0.78); if (k.url.length > 44000) k = await R.kompres(inp.files[0], 260, 0.7); foto = k.url; pasangFoto(foto); } catch (e) { R.galat(e); } };
      inp.click();
    };
    dr.body.querySelector('[data-hapusfoto]').onclick = () => { foto = ''; pasangFoto(''); };
    dr.foot.querySelector('[data-x2]').onclick = () => dr.tutup();
    dr.foot.querySelector('[data-ok]').onclick = async (e) => {
      const b = e.currentTarget;
      const hc = {}; R.$$('[data-hc]', dr.body).forEach((i) => { const v = R.nilai(i.value); if (v) hc[i.dataset.hc] = v; });
      const data = { sku: f.sku.value.trim(), nama_produk: f.nama_produk.value.trim(), varian: f.varian.value.trim(), kategori: f.kategori.value.trim(), hpp: R.nilai(f.hpp.value), harga_jual_normal: R.nilai(f.harga_jual_normal.value), harga_channel: hc };
      if (!data.sku || !data.nama_produk) return R.toast('Isi SKU dan nama produk.', 'err');
      if (!data.hpp) return R.toast('Isi HPP (modal) produk supaya laba bisa dihitung.', 'err');
      if (foto !== undefined) data.foto = foto;
      if (!baru) data.aktif = f.aktif.checked;
      b.classList.add('busy');
      try {
        const r = await R.api.call('master.save', { jenis: 'produk', data: data });
        dr.tutup(); R.toast(r._pesan || 'Produk tersimpan.');
        if (foto !== undefined) { fotoMap = null; R.api.hapusCache('produk.foto'); }
        await R.app.muatUlangBoot(); if (selesai) selesai();
      } catch (ex) { R.galat(ex); b.classList.remove('busy'); }
    };
  }
  R.formProduk = formProduk;

  // ambil lebih dulu statistik produk bulan ini (dipakai halaman Produk)
  (R.ambilDulu = R.ambilDulu || []).push({ fn: () => { if (R.boleh(R.PERAN.OAV)) { const p = R.hariIni().slice(0, 7); R.api.swr('produk.statistik', { dari: p, sampai: p }, () => {}, { simpan: true }).catch(() => {}); } } });
})();
