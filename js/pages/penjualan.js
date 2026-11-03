/* ROVELO Finance — Penjualan: daftar, impor marketplace, input manual, pencairan */
(function () {
  const R = window.R;
  const esc = R.esc;
  const st = { tab: 'daftar', per: null, ch: '', status: '', cari: '', hal: 1 };

  R.halaman.penjualan = {
    judul: 'Penjualan', roles: R.PERAN.OAS,
    render(el, q, sub, nav) {
      const OA = R.isOA();
      const tabs = [{ id: 'daftar', label: 'Daftar penjualan' }, { id: 'manual', label: 'Input manual' }].concat(OA ? [{ id: 'impor', label: 'Impor marketplace' }, { id: 'pencairan', label: 'Pencairan dana' }, { id: 'riwayat', label: 'Riwayat impor' }] : []);
      if (q.tab && tabs.some((t) => t.id === q.tab)) st.tab = q.tab; else if (!tabs.some((t) => t.id === st.tab)) st.tab = 'daftar';
      el.innerHTML = '<div class="page-head"><div><h2>Penjualan</h2><p>Semua channel: Shopee, TikTok Shop, Lazada, Tokopedia, Reseller, dan Manual.</p></div>' + (OA ? '<div class="actions"><button class="btn" data-go="manual">' + R.ic('plus', 's18') + ' Input manual</button><button class="btn primary" data-go="impor">' + R.ic('upload', 's18') + ' Impor laporan</button></div>' : '') + '</div><div data-tabs></div><div data-isi></div>';
      const isi = el.querySelector('[data-isi]');
      const buka = (t) => { st.tab = t; R.ubahQuery({ tab: t }); R.tabs(el.querySelector('[data-tabs]'), tabs, t, buka); ({ daftar: daftar, manual: manual, impor: impor, pencairan: pencairan, riwayat: riwayat })[t](isi, nav); };
      R.on(el, 'click', '[data-go]', (e, b) => buka(b.dataset.go));
      buka(st.tab);
    }
  };

  // ============================================================
  // DAFTAR
  // ============================================================
  function daftar(el, nav) {
    st.per = st.per || R.rentang('bulan');
    const OA = R.isOA();
    const chs = (R.boot.channel || []).filter((c) => c.aktif);
    el.innerHTML = '<div class="card p0"><div style="padding:16px 16px 0"><div class="row wrap between" style="gap:10px"><div data-per></div><div class="inp-group"><span class="ic-in">' + R.ic('search', 's16') + '</span><input class="inp sm" data-cari placeholder="No. pesanan / SKU / produk" value="' + esc(st.cari) + '" style="width:240px"></div></div>' +
      '<div class="chips scroll mt" data-ch><button class="chip ' + (!st.ch ? 'on' : '') + '" data-c="">Semua channel</button>' + chs.map((c) => '<button class="chip ' + (st.ch === c.id ? 'on' : '') + '" data-c="' + c.id + '">' + R.chLogo(c.id, 18) + esc(c.nama) + '</button>').join('') + '</div>' +
      '<div class="grid g4 keep2 mt" data-ring style="gap:10px"></div><div data-tabs style="margin:12px 0 0"></div></div>' +
      '<div class="row wrap between hidden" data-aksi style="padding:10px 16px;background:var(--accent-tint);gap:8px"><b class="small" data-jml></b><div class="actions"><span class="small muted">Ubah status menjadi</span><button class="btn sm" data-s="Selesai">Selesai</button><button class="btn sm" data-s="RTS">RTS / Retur</button><button class="btn sm danger" data-s="Batal">Batal</button></div></div>' +
      '<div data-list>' + R.kerangka(8) + '</div><div data-pager></div></div>';
    R.periode(el.querySelector('[data-per]'), { nilai: st.per, preset: ['hari', '7hari', 'bulan', 'bulanlalu', 'kustom'], ubah: (v) => { if (R.selisihHari(v.dari, v.sampai) > 92) { R.toast('Rentang maksimal 3 bulan. Gunakan Laporan Penjualan untuk periode panjang.', 'info'); return; } st.per = v; st.hal = 1; muat(); } });
    R.on(el, 'click', '[data-c]', (e, b) => { st.ch = b.dataset.c; st.hal = 1; R.$$('[data-c]', el).forEach((x) => x.classList.toggle('on', x === b)); muat(); });
    el.querySelector('[data-cari]').oninput = R.tunda((e) => { st.cari = e.target.value.trim(); st.hal = 1; muat(); }, 350);
    const listEl = el.querySelector('[data-list]');
    let pilih = [];
    function gambar(d) {
      const r = d.ringkas;
      el.querySelector('[data-ring]').innerHTML = [['Omzet', R.rp(r.omzet)], ['Pesanan · Qty', R.angka(r.pesanan) + ' · ' + R.angka(r.qty)], ['Laba kotor', R.rp(r.laba)], ['RTS · Batal', R.angka(r.rts) + ' · ' + R.angka(r.batal)]]
        .map((x) => '<div class="sum-box"><div class="xs muted">' + x[0] + '</div><b class="num" style="font-size:16px">' + x[1] + '</b></div>').join('');
      R.tabs(el.querySelector('[data-tabs]'), [{ id: '', label: 'Semua', cnt: d.hitung.Semua }, { id: 'Selesai', label: 'Selesai', cnt: d.hitung.Selesai || 0 }, { id: 'RTS', label: 'RTS', cnt: d.hitung.RTS || 0 }, { id: 'Batal', label: 'Batal', cnt: d.hitung.Batal || 0 }], st.status, (s) => { st.status = s; st.hal = 1; muat(); });
      el.querySelector('[data-tabs]').style.marginBottom = '0';
      R.tabel(listEl, { mulai: ((d.halaman || 1) - 1) * (d.per || 0),
        baris: d.baris, kosong: 'Belum ada penjualan di periode ini', kosongPesan: 'Impor laporan marketplace atau catat penjualan manual.', kosongIkon: 'bag', pilih: OA,
        onPilih: (rows) => { pilih = rows; el.querySelector('[data-aksi]').classList.toggle('hidden', !rows.length); el.querySelector('[data-jml]').textContent = rows.length + ' baris dipilih'; },
        kolom: [
          { k: 'no_pesanan', label: 'Pesanan', lead: true, render: (p) => '<b>' + esc(p.no_pesanan) + '</b><span class="t2">' + R.chTag(p.id_channel) + ' · ' + R.tgl(p.tanggal) + '</span>' },
          { k: 'nama_produk', label: 'Produk', render: (p) => '<span class="ellipsis" style="max-width:240px;display:inline-block;vertical-align:bottom">' + esc(p.nama_produk) + '</span><span class="t2">' + esc(p.sku) + '</span>' },
          { k: 'qty', label: 'Qty', tipe: 'angka' },
          { k: 'harga_jual', label: 'Harga', tipe: 'rp', hideM: true },
          { k: 'potongan', label: 'Potongan', tipe: 'rp', hideM: true },
          { k: 'hpp', label: 'HPP', tipe: 'rp', hideM: true },
          { k: 'laba', label: 'Laba', tipe: 'rp', render: (p) => '<b class="' + (p.laba < 0 ? 'neg' : p.status === 'Selesai' ? 'pos' : 'faint') + '">' + R.rp(p.laba) + '</b>' },
          { k: 'status', label: 'Status', render: (p) => '<span class="badge ' + ({ Selesai: 'g', RTS: 'a', Batal: 'r' }[p.status] || '') + '">' + esc(p.status) + '</span>' }
        ]
      });
      R.pager(el.querySelector('[data-pager]'), d, (h) => { st.hal = h; muat(); });
    }
    function muat() {
      const p = { dari: st.per.dari, sampai: st.per.sampai, id_channel: st.ch, status: st.status, cari: st.cari, halaman: st.hal };
      R.api.swr('penjualan.list', p, (d) => { if (R.masihDi(nav)) gambar(d); }, { simpan: st.hal === 1 && !st.cari }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, listEl, muat); });
    }
    R.on(el, 'click', '[data-s]', async (e, b) => {
      const s = b.dataset.s;
      const ok = await R.konfirmasi({ judul: 'Ubah ' + pilih.length + ' baris menjadi ' + s + '?', pesan: s === 'Selesai' ? 'Penjualan dihitung kembali sebagai omzet.' : 'Omzet & HPP baris ini dikeluarkan dari laporan. Untuk Reseller/Manual, seluruh pesanan ikut berubah dan jurnalnya dibatalkan.', bahaya: s !== 'Selesai', ok: 'Ubah status' });
      if (!ok) return;
      const per = {}; pilih.forEach((p) => { (per[p.periode] = per[p.periode] || []).push(p.id); });
      b.classList.add('busy');
      try { for (const p of Object.keys(per)) { const r = await R.api.call('penjualan.ubahStatus', { periode: p, ids: per[p], status: s }); R.toast(r._pesan); } muat(); }
      catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
    });
    muat();
  }

  // ============================================================
  // POTONGAN DARI PROFIL BIAYA CHANNEL
  // ============================================================
  function potonganProfil(ch, tgl, base, pertama) {
    const out = { potongan_admin: 0, komisi_affiliate: 0, ongkir_penjual: 0, biaya_lain: 0 };
    (R.boot.biaya || []).filter((b) => b.ch === ch && (!b.mulai || b.mulai <= tgl)).forEach((b) => {
      let n = b.tipe === 'persen' ? base * b.nilai / 100 : (pertama ? b.nilai : 0);
      if (b.maks && n > b.maks) n = b.maks;
      out[b.ke] = (out[b.ke] || 0) + Math.round(n);
    });
    return out;
  }
  R.potonganProfil = potonganProfil;

  // ============================================================
  // INPUT MANUAL
  // ============================================================
  function manual(el) {
    const chs = (R.boot.channel || []).filter((c) => c.aktif);
    const v = { id_channel: (chs.find((c) => c.id === 'RSL') || chs[0] || {}).id, tanggal: R.hariIni(), items: [{ sku: '', qty: 1, harga: 0, pot: null }], metode: 'Tunai', akun_kas: (R.akunKas()[0] || {}).no };
    el.innerHTML = '<datalist id="dl-produk">' + (R.boot.produk || []).map((p) => '<option value="' + esc(p.sku) + '">' + esc(p.nama + (p.varian ? ' · ' + p.varian : '')) + ' — HPP ' + R.rp(p.hpp) + '</option>').join('') + '</datalist>' +
      '<div class="grid g-2-1"><form class="card" novalidate data-f><div class="fgrid"><div class="field"><label>Channel</label><select class="inp" name="id_channel">' + chs.map((c) => '<option value="' + c.id + '" ' + (c.id === v.id_channel ? 'selected' : '') + '>' + esc(c.nama) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>Tanggal</label><input type="date" class="inp" name="tanggal" value="' + v.tanggal + '" max="' + R.hariIni() + '"></div>' +
      '<div class="field"><label>No. pesanan <span class="faint">(opsional)</span></label><input class="inp" name="no_pesanan" maxlength="60" placeholder="otomatis bila kosong"></div>' +
      '<div class="field" data-kontak><label>Pembeli / reseller</label><select class="inp" name="id_kontak"><option value="">— umum —</option>' + (R.boot.kontak || []).map((k) => '<option value="' + k.id + '">' + esc(k.nama) + ' · ' + esc(k.tipe) + '</option>').join('') + '</select></div></div>' +
      '<div class="row between wrap mt-l" style="gap:8px"><div><h3 class="sec">Produk</h3><p class="sec-sub">Pilih dari katalog bergambar, atau ketik SKU. HPP & harga diambil dari menu Produk.</p></div><button type="button" class="btn primary sm" data-katalog>' + R.ic('grid', 's16') + ' Pilih dari katalog</button></div><div class="item-editor mt" data-items></div><button type="button" class="btn sm" data-tambah>' + R.ic('plus', 's16') + ' Tambah baris SKU</button>' +
      '<div data-bayar class="mt-l"></div><div class="alert r hidden mt" data-galat></div></form>' +
      '<div><div class="card" style="position:sticky;top:80px"><h3 class="sec">Ringkasan</h3><div class="sum-box mt" data-sum></div><button class="btn primary block mt" data-simpan>' + R.ic('check', 's18') + ' Simpan penjualan</button><p class="xs faint mt">Marketplace: masuk rekap harian & piutang marketplace. Reseller/Manual: langsung ke kas/bank atau piutang.</p></div></div></div>';
    const f = el.querySelector('[data-f]');
    const ch = () => R.mCh[f.id_channel.value] || {};
    function baris() {
      const box = el.querySelector('[data-items]'); const mp = ch().tipe === 'Marketplace';
      box.innerHTML = v.items.map((it, i) => {
        const p = R.mProd[it.sku];
        return '<div class="ie-row" data-i="' + i + '">' + R.thumbProduk(it.sku || '_', 42) + '<div class="field"><input class="inp" list="dl-produk" data-k="sku" placeholder="SKU / produk" value="' + esc(it.sku) + '" autocomplete="off"><span class="hint">' + (p ? esc(p.nama + (p.varian ? ' · ' + p.varian : '')) + ' · HPP ' + R.rp(p.hpp) : it.sku ? '<span class="neg">SKU tidak ada di Master Produk</span>' : '&nbsp;') + '</span></div>' +
          '<input class="inp" data-k="qty" type="number" min="1" value="' + it.qty + '" aria-label="Qty">' +
          '<input class="inp" data-k="harga" data-rp inputmode="numeric" placeholder="Harga" value="' + (it.harga ? R.angka(it.harga) : '') + '" aria-label="Harga satuan">' +
          '<input class="inp" data-k="pot" data-rp inputmode="numeric" placeholder="' + (mp ? 'Potongan' : 'Diskon') + '" value="' + (it.pot !== null && it.pot !== undefined ? R.angka(it.pot) : '') + '" aria-label="Potongan" title="' + (mp ? 'Potongan admin marketplace (otomatis dari profil biaya bila kosong)' : 'Diskon') + '">' +
          '<button type="button" class="btn ghost icon" data-hapus aria-label="Hapus" ' + (v.items.length < 2 ? 'disabled' : '') + '>' + R.ic('trash', 's18') + '</button></div>';
      }).join('');
      R.inpRpSemua(box); R.isiThumb(box);
      ringkas();
    }
    /** Katalog bergambar: ketuk produk untuk menambah (ketuk lagi = qty +1). */
    function katalog() {
      const semua = (R.boot.produk || []).slice().sort((a, b) => a.nama < b.nama ? -1 : 1);
      const kats = Array.from(new Set(semua.map((p) => p.kat).filter(Boolean))).sort();
      let kat = '', q = '';
      const dr = R.drawer({ judul: 'Pilih produk · ' + (ch().nama || ''), lebar: true, isi: '<div class="inp-group mb"><span class="ic-in">' + R.ic('search', 's16') + '</span><input class="inp" data-q placeholder="Cari nama, varian, atau SKU"></div>' +
        (kats.length ? '<div class="chips scroll mb"><button class="chip on" data-k="">Semua</button>' + kats.map((k) => '<button class="chip" data-k="' + esc(k) + '">' + esc(k) + '</button>').join('') + '</div>' : '') + '<div data-g></div>',
        kaki: '<span class="small muted grow" data-jml></span><button class="btn primary" data-x2>Selesai</button>' });
      const jml = () => { const n = v.items.filter((it) => it.sku).reduce((s2, it) => s2 + it.qty, 0); dr.foot.querySelector('[data-jml]').textContent = n ? n + ' pcs dipilih' : 'Belum ada produk dipilih'; };
      const gambarK = () => {
        const L = semua.filter((p) => (!kat || p.kat === kat) && (!q || (p.sku + ' ' + p.nama + ' ' + (p.varian || '')).toLowerCase().indexOf(q) >= 0));
        dr.body.querySelector('[data-g]').innerHTML = L.length ? '<div class="pk-grid">' + L.slice(0, 240).map((p) => { const it = v.items.find((x) => x.sku === p.sku); return '<button type="button" class="pk-item" data-sku="' + esc(p.sku) + '">' + (it ? '<span class="pk-n">' + it.qty + '</span>' : '') + R.thumbProduk(p.sku, 120) + '<b>' + esc(p.nama) + '</b><span class="xs muted">' + esc(p.varian || p.sku) + '</span><div class="small num" style="margin-top:4px;font-weight:700">' + R.rp(R.hargaProduk(p, ch().id)) + '</div></button>'; }).join('') + '</div>' : R.kosong('Produk tidak ditemukan', 'Tambahkan produk di menu Produk.', 'package');
        R.isiThumb(dr.body); jml();
      };
      dr.body.querySelector('[data-q]').oninput = R.tunda((e) => { q = e.target.value.trim().toLowerCase(); gambarK(); }, 150);
      R.on(dr.body, 'click', '[data-k]', (e, b) => { kat = b.dataset.k; R.$$('[data-k]', dr.body).forEach((x) => x.classList.toggle('on', x === b)); gambarK(); });
      R.on(dr.body, 'click', '[data-sku]', (e, b) => {
        const p = R.mProd[b.dataset.sku]; if (!p) return;
        let it = v.items.find((x) => x.sku === p.sku);
        if (it) it.qty++;
        else { const kosong = v.items.find((x) => !x.sku); it = kosong || { qty: 1, pot: null }; it.sku = p.sku; it.qty = it.qty || 1; it.harga = R.hargaProduk(p, ch().id); it._hargaOto = true; if (!kosong) v.items.push(it); }
        const n = b.querySelector('.pk-n'); if (n) n.textContent = it.qty; else b.insertAdjacentHTML('afterbegin', '<span class="pk-n">' + it.qty + '</span>');
        jml(); baris();
      });
      dr.foot.querySelector('[data-x2]').onclick = () => dr.tutup();
      R.fotoProduk(); gambarK();
    }
    function hitung() {
      const mp = ch().tipe === 'Marketplace';
      let omzet = 0, pot = 0, hpp = 0;
      v.items.forEach((it, i) => {
        const p = R.mProd[it.sku]; const bruto = it.qty * it.harga;
        let pt = it.pot;
        if ((pt === null || pt === undefined || pt === '') && mp) { const x = potonganProfil(ch().id, f.tanggal.value, bruto, i === 0); pt = x.potongan_admin + x.komisi_affiliate + x.ongkir_penjual + x.biaya_lain; it._auto = x; } else it._auto = null;
        omzet += bruto; pot += +pt || 0; hpp += p ? p.hpp * it.qty : 0;
      });
      return { omzet: omzet, pot: pot, dana: omzet - pot, hpp: hpp, laba: omzet - pot - hpp };
    }
    function ringkas() {
      const h = hitung();
      el.querySelector('[data-sum]').innerHTML = '<dl class="kv"><dt>Omzet (harga × qty)</dt><dd>' + R.rp(h.omzet) + '</dd><dt>Potongan / diskon</dt><dd class="neg">−' + R.rp(h.pot) + '</dd><dt>Dana diterima</dt><dd>' + R.rp(h.dana) + '</dd><dt>HPP barang</dt><dd>−' + R.rp(h.hpp) + '</dd></dl><div class="tot"><span>Laba kotor</span><span class="num ' + (h.laba < 0 ? 'neg' : 'pos') + '">' + R.rp(h.laba) + '</span></div><div class="xs muted right">margin ' + R.persen(h.omzet ? h.laba / h.omzet * 100 : 0) + '</div>';
    }
    function bayar() {
      const c = ch(); const box = el.querySelector('[data-bayar]');
      el.querySelector('[data-kontak] label').textContent = c.id === 'RSL' ? 'Reseller (wajib)' : 'Pembeli / reseller';
      if (c.tipe === 'Marketplace') { box.innerHTML = '<div class="alert">' + R.ic('info', 's18') + '<span>Dana penjualan ' + esc(c.nama) + ' dicatat sebagai <b>dana tertahan</b> (piutang marketplace) sampai Anda mencatat pencairan.</span></div>'; return; }
      box.innerHTML = '<h3 class="sec">Pembayaran</h3><div class="seg mt" data-met></div><div class="fgrid mt" data-metisi></div>';
      R.seg(box.querySelector('[data-met]'), [{ v: 'Tunai', l: 'Lunas (tunai/transfer)' }, { v: 'Tempo', l: 'Tempo (piutang)' }], v.metode, (m) => { v.metode = m; isiBayar(); });
      isiBayar();
    }
    function isiBayar() {
      const b = el.querySelector('[data-metisi]'); if (!b) return;
      b.innerHTML = v.metode === 'Tunai' ? '<div class="field"><label>Diterima di</label><select class="inp" name="akun_kas">' + R.opsiKas(v.akun_kas) + '</select></div>'
        : '<div class="field"><label>Jatuh tempo</label><input type="date" class="inp" name="jatuh_tempo" value="' + R.tambahHari(R.hariIni(), 14) + '"></div>';
    }
    f.addEventListener('input', (e) => {
      const r = e.target.closest('[data-i]');
      if (r) { const it = v.items[+r.dataset.i], k = e.target.dataset.k; if (k === 'sku') { it.sku = e.target.value.trim(); const p = R.mProd[it.sku]; if (p && (!it.harga || it._hargaOto)) { it.harga = R.hargaProduk(p, ch().id); it._hargaOto = true; r.querySelector('[data-k=harga]').value = R.angka(it.harga); } const th = r.querySelector('.p-thumb'); if (th) { th.dataset.thumb = it.sku; th.innerHTML = R.ic('package', 's18'); R.isiThumb(r); } const hint = r.querySelector('.hint'); hint.innerHTML = p ? esc(p.nama + (p.varian ? ' · ' + p.varian : '')) + ' · HPP ' + R.rp(p.hpp) : it.sku ? '<span class="neg">SKU tidak ada di Master Produk</span>' : '&nbsp;'; } else if (k === 'qty') it.qty = Math.max(1, +e.target.value || 1); else if (k === 'harga') { it.harga = R.nilai(e.target.value); it._hargaOto = false; } else if (k === 'pot') it.pot = e.target.value.trim() === '' ? null : R.nilai(e.target.value); }
      ringkas();
    });
    f.id_channel.onchange = () => { v.items.forEach((it) => { const p = R.mProd[it.sku]; if (p && it._hargaOto) it.harga = R.hargaProduk(p, ch().id); }); baris(); bayar(); };
    el.querySelector('[data-katalog]').onclick = katalog;
    R.fotoProduk();
    f.tanggal.onchange = ringkas;
    R.on(el, 'click', '[data-hapus]', (e, b) => { v.items.splice(+b.closest('[data-i]').dataset.i, 1); baris(); });
    el.querySelector('[data-tambah]').onclick = () => { v.items.push({ sku: '', qty: 1, harga: 0, pot: null }); baris(); const r = R.$$('[data-k=sku]', el).pop(); if (r) r.focus(); };
    el.querySelector('[data-simpan]').onclick = async (e) => {
      const c = ch(), g = el.querySelector('[data-galat]'), btn = e.currentTarget;
      const galat = (m) => { g.innerHTML = R.ic('alert', 's18') + '<span>' + esc(m) + '</span>'; g.classList.remove('hidden'); };
      g.classList.add('hidden');
      const items = v.items.filter((it) => it.sku);
      if (!items.length) return galat('Tambahkan minimal satu produk.');
      const tak = items.find((it) => !R.mProd[it.sku]); if (tak) return galat('SKU ' + tak.sku + ' belum ada di Master Produk.');
      const nol = items.find((it) => !R.mProd[it.sku].hpp); if (nol) return galat('SKU ' + nol.sku + ' belum punya HPP. Lengkapi di Master Data → Produk.');
      if (items.some((it) => !it.harga)) return galat('Isi harga jual setiap produk.');
      if (c.id === 'RSL' && !f.id_kontak.value) return galat('Pilih reseller.');
      if (c.tipe !== 'Marketplace' && v.metode === 'Tempo' && !f.id_kontak.value) return galat('Penjualan tempo wajib memilih pembeli/reseller.');
      if (R.terkunci(f.tanggal.value)) return galat('Periode ' + R.bln(f.tanggal.value.slice(0, 7)) + ' sudah dikunci.');
      hitung();
      const data = { tanggal: f.tanggal.value, id_channel: c.id, no_pesanan: f.no_pesanan.value.trim(), id_kontak: f.id_kontak.value,
        items: items.map((it) => { const o = { sku: it.sku, qty: it.qty, harga_jual: it.harga }; if (it._auto) Object.assign(o, it._auto); else if (c.tipe === 'Marketplace') o.potongan_admin = it.pot || 0; else o.diskon_penjual = it.pot || 0; return o; }),
        bayar: c.tipe === 'Marketplace' ? {} : { metode: v.metode, akun_kas: f.akun_kas ? f.akun_kas.value : '', jatuh_tempo: f.jatuh_tempo ? f.jatuh_tempo.value : '' } };
      btn.classList.add('busy');
      try {
        const r = await R.api.call('penjualan.createManual', data);
        R.toast(r._pesan + (r.status_jurnal === 'Draft' ? ' Menunggu diposting Admin.' : ''));
        v.items = [{ sku: '', qty: 1, harga: 0, pot: null }]; f.no_pesanan.value = ''; baris();
      } catch (ex) { galat(ex.message); } finally { btn.classList.remove('busy'); }
    };
    baris(); bayar();
  }

  // ============================================================
  // IMPOR MARKETPLACE
  // ============================================================
  const FIELD = [
    { k: 'tanggal', l: 'Tanggal pesanan', wajib: true, kata: ['waktu pesanan dibuat', 'tanggal pesanan', 'created time', 'order creation', 'created at', 'order date', 'tanggal pembayaran', 'waktu pembayaran', 'tanggal', 'date'] },
    { k: 'no_pesanan', l: 'No. pesanan', wajib: true, kata: ['no. pesanan', 'no pesanan', 'nomor pesanan', 'order id', 'order number', 'order no', 'nomor invoice', 'invoice', 'no. order'] },
    { k: 'status', l: 'Status pesanan', kata: ['status pesanan', 'order status', 'status terakhir', 'status'] },
    { k: 'sku', l: 'SKU', wajib: true, kata: ['nomor referensi sku', 'seller sku', 'sku induk', 'sku penjual', 'nomor sku', 'sku'] },
    { k: 'nama_produk', l: 'Nama produk', kata: ['nama produk', 'product name', 'item name', 'nama barang', 'produk'] },
    { k: 'qty', l: 'Jumlah (qty)', wajib: true, kata: ['jumlah produk dibeli', 'jumlah', 'quantity', 'qty', 'kuantitas'] },
    { k: 'harga_jual', l: 'Harga jual', wajib: true, kata: ['harga setelah diskon', 'sku unit original price', 'unit price', 'harga jual (idr)', 'harga jual', 'harga awal', 'harga satuan', 'price', 'harga'] },
    { k: 'diskon_penjual', l: 'Diskon / voucher penjual', kata: ['voucher ditanggung penjual', 'sku seller discount', 'seller discount', 'diskon penjual', 'voucher penjual', 'seller voucher'] },
    { k: 'potongan_admin', l: 'Potongan admin / komisi', kata: ['biaya administrasi', 'biaya admin', 'platform commission', 'commission fee', 'komisi platform', 'biaya layanan', 'potongan admin'] },
    { k: 'komisi_affiliate', l: 'Komisi affiliate', kata: ['komisi affiliate', 'affiliate commission', 'komisi afiliasi'] },
    { k: 'ongkir_penjual', l: 'Ongkir ditanggung penjual', kata: ['ongkos kirim dibayar penjual', 'shipping fee paid by seller', 'ongkir penjual', 'seller shipping fee'] },
    { k: 'biaya_lain', l: 'Biaya lain', kata: ['biaya lain', 'other fee', 'biaya transaksi'] }
  ];
  function tebakStatus(s) {
    s = String(s || '').toLowerCase();
    if (!s) return 'Selesai';
    if (/batal|cancel|dibatalkan|gagal bayar|unpaid/.test(s)) return 'Batal';
    if (/retur|return|rts|dikembalikan|gagal kirim|failed delivery|pengembalian|refund/.test(s)) return 'RTS';
    if (/selesai|completed|delivered|diterima|terkirim|sampai|done|complete/.test(s)) return 'Selesai';
    return 'Lewati';
  }
  function angkaID(v) {
    if (typeof v === 'number') return v;
    let s = String(v || '').replace(/[^\d,.\-]/g, '');
    if (!s) return 0;
    const t = s.lastIndexOf('.'), k = s.lastIndexOf(',');
    if (t >= 0 && k >= 0) s = t > k ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.');
    else if (k >= 0) s = /,\d{3}(,|$)/.test(s) && !/,\d{1,2}$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
    else if (t >= 0 && /^\-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    const n = parseFloat(s); return isFinite(n) ? n : 0;
  }
  function tanggalID(v) {
    const p2 = (n) => String(n).padStart(2, '0');
    if (v instanceof Date && !isNaN(v)) return v.getFullYear() + '-' + p2(v.getMonth() + 1) + '-' + p2(v.getDate());
    if (typeof v === 'number' && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 864e5)); return d.toISOString().slice(0, 10); }
    const s = String(v || '').trim();
    let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(s); if (m) return m[1] + '-' + p2(m[2]) + '-' + p2(m[3]);
    m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(s); if (m) return m[3] + '-' + p2(m[2]) + '-' + p2(m[1]);
    m = /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/.exec(s);
    if (m) { const bl = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'], en = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']; const x = m[2].slice(0, 3).toLowerCase(); let i = bl.indexOf(x); if (i < 0) i = en.indexOf(x); if (i >= 0) return m[3] + '-' + p2(i + 1) + '-' + p2(m[1]); }
    return '';
  }
  R.imporUtil = { angkaID: angkaID, tanggalID: tanggalID, tebakStatus: tebakStatus };

  function impor(el, nav) {
    const S = { langkah: 1, ch: '', file: null, data: null, lembar: '', headerRow: 0, map: {}, modeHarga: 'unit', profil: true, statusMap: {}, siap: null };
    const mps = (R.boot.channel || []).filter((c) => c.aktif && c.tipe === 'Marketplace');
    S.ch = (mps[0] || {}).id;
    el.innerHTML = '<div class="steps" data-steps></div><div data-w></div>';
    const w = el.querySelector('[data-w]');
    const langkah = () => {
      el.querySelector('[data-steps]').innerHTML = ['Pilih file', 'Cocokkan kolom', 'Periksa', 'Simpan'].map((l, i) => '<span class="st ' + (S.langkah === i + 1 ? 'on' : S.langkah > i + 1 ? 'done' : '') + '"><i>' + (S.langkah > i + 1 ? '✓' : i + 1) + '</i>' + l + '</span>').join('');
      [l1, l2, l3, l4][S.langkah - 1]();
    };
    function l1() {
      w.innerHTML = '<div class="grid g-2-1"><div class="card"><h3 class="sec">1. Pilih channel</h3><div class="chips mt" data-chs>' + mps.map((c) => '<button class="chip ' + (c.id === S.ch ? 'on' : '') + '" data-c="' + c.id + '">' + R.chLogo(c.id, 18) + esc(c.nama) + '</button>').join('') + '</div>' +
        '<h3 class="sec mt-l">2. Pilih file laporan pesanan</h3><p class="sec-sub">Format .xlsx, .xls, atau .csv dari Seller Center. Satu file boleh berisi ribuan pesanan.</p><input type="file" hidden accept=".xlsx,.xls,.csv" data-in><div class="drop mt" data-drop>' + R.ic('upload', 's24') + '<div><b>Tarik file ke sini</b> atau klik untuk memilih</div><div class="small">Data dibaca di perangkat Anda dulu sebelum dikirim</div></div><div data-st class="mt"></div></div>' +
        '<div class="card lav"><h3 class="sec">' + R.ic('info', 's18') + ' Cara mengunduh laporan</h3><ul class="small muted" style="padding-left:18px;margin:10px 0 0;line-height:1.8"><li><b>Shopee</b>: Pesanan Saya → Ekspor → pilih rentang tanggal.</li><li><b>TikTok Shop</b>: Orders → Export orders.</li><li><b>Lazada</b>: Orders → Export → Order details.</li><li><b>Tokopedia</b>: Penjualan → Download laporan penjualan.</li></ul><p class="small muted">Pesanan yang sudah pernah diimpor otomatis dilewati (tidak dobel). Bila statusnya berubah (mis. jadi retur), status ikut diperbarui.</p></div></div>';
      R.on(w, 'click', '[data-c]', (e, b) => { S.ch = b.dataset.c; R.$$('[data-c]', w).forEach((x) => x.classList.toggle('on', x === b)); });
      const inp = w.querySelector('[data-in]'), drop = w.querySelector('[data-drop]');
      drop.onclick = () => inp.click();
      ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) baca(e.dataTransfer.files[0]); });
      inp.onchange = () => { if (inp.files[0]) baca(inp.files[0]); };
      async function baca(file) {
        const sEl = w.querySelector('[data-st]');
        if (!/\.(xlsx|xls|csv)$/i.test(file.name)) { sEl.innerHTML = '<div class="alert r">' + R.ic('alert', 's18') + '<span>Pilih file .xlsx, .xls, atau .csv.</span></div>'; return; }
        if (file.size > 40 * 1024 * 1024) { sEl.innerHTML = '<div class="alert r">' + R.ic('alert', 's18') + '<span>File terlalu besar (maks. 40 MB). Ekspor per minggu.</span></div>'; return; }
        sEl.innerHTML = '<span class="sync busy"><span class="sd"></span> Membaca ' + esc(file.name) + '…</span>';
        try {
          const d = await R.xlsx.baca(file);
          S.file = file; S.data = d;
          S.lembar = d.nama.slice().sort((a, b) => d.lembar[b].length - d.lembar[a].length)[0];
          siapkanHeader(); S.langkah = 2; langkah();
        } catch (e) { sEl.innerHTML = '<div class="alert r">' + R.ic('alert', 's18') + '<span>' + esc(e.message || 'File tidak bisa dibaca.') + '</span></div>'; }
      }
    }
    function siapkanHeader() {
      const rows = S.data.lembar[S.lembar] || [];
      let best = 0, skor = -1;
      for (let i = 0; i < Math.min(15, rows.length); i++) {
        const sel = rows[i].map((x) => String(x).toLowerCase());
        const n = FIELD.reduce((s, f) => s + (sel.some((h) => f.kata.some((k) => h.indexOf(k) >= 0)) ? 1 : 0), 0);
        if (n > skor) { skor = n; best = i; }
      }
      S.headerRow = best;
      const head = (rows[best] || []).map((h) => String(h).trim());
      let simpanan = {}; try { simpanan = JSON.parse((R.mCh[S.ch] || {}).pemetaan || '{}'); } catch (e) { simpanan = {}; }
      S.map = {};
      FIELD.forEach((f) => {
        if (simpanan[f.k] && head.indexOf(simpanan[f.k]) >= 0) { S.map[f.k] = simpanan[f.k]; return; }
        const low = head.map((h) => h.toLowerCase());
        for (const k of f.kata) { const i = low.findIndex((h) => h === k); if (i >= 0) { S.map[f.k] = head[i]; return; } }
        for (const k of f.kata) { const i = low.findIndex((h) => h.indexOf(k) >= 0 && !Object.values(S.map).includes(head[i])); if (i >= 0) { S.map[f.k] = head[i]; return; } }
      });
      if (simpanan._harga) S.modeHarga = simpanan._harga;
      S.profil = !S.map.potongan_admin;
    }
    function kol(h) { return (S.data.lembar[S.lembar][S.headerRow] || []).map((x) => String(x).trim()).indexOf(h); }
    function l2() {
      const rows = S.data.lembar[S.lembar];
      const head = (rows[S.headerRow] || []).map((x) => String(x).trim()).filter(Boolean);
      const isi = rows.slice(S.headerRow + 1).filter((r) => r.some((x) => x !== ''));
      w.innerHTML = '<div class="card"><div class="row wrap between"><div><h3 class="sec">Cocokkan kolom file dengan data ROVELO</h3><p class="sec-sub">' + esc(S.file.name) + ' · ' + R.angka(isi.length) + ' baris · channel ' + esc((R.mCh[S.ch] || {}).nama) + '</p></div>' +
        (S.data.nama.length > 1 ? '<select class="inp sm" data-lembar style="width:auto">' + S.data.nama.map((n) => '<option ' + (n === S.lembar ? 'selected' : '') + '>' + esc(n) + '</option>').join('') + '</select>' : '') + '</div>' +
        '<div class="fgrid mt">' + FIELD.map((f) => '<div class="field"><label>' + esc(f.l) + (f.wajib ? ' <span class="neg">*</span>' : '') + '</label><select class="inp" data-m="' + f.k + '"><option value="">— tidak ada —</option>' + head.map((h) => '<option ' + (S.map[f.k] === h ? 'selected' : '') + '>' + esc(h) + '</option>').join('') + '</select></div>').join('') + '</div>' +
        '<div class="fgrid mt"><div class="field"><label>Kolom harga berisi</label><select class="inp" data-mh><option value="unit" ' + (S.modeHarga === 'unit' ? 'selected' : '') + '>Harga per barang</option><option value="total" ' + (S.modeHarga === 'total' ? 'selected' : '') + '>Total per baris (harga × qty)</option></select></div>' +
        '<div class="field"><label>Potongan marketplace</label><label class="check" style="height:44px"><input type="checkbox" data-prof ' + (S.profil ? 'checked' : '') + '> Hitung dari profil biaya channel bila kolom kosong</label></div></div>' +
        '<div data-stat class="mt"></div><h3 class="sec mt-l">Pratinjau</h3><div class="card p0 mt" data-prev></div>' +
        '<div class="actions mt-l"><button class="btn" data-kembali>Kembali</button><button class="btn primary" data-lanjut>Lanjut periksa</button></div></div>';
      const lb = w.querySelector('[data-lembar]'); if (lb) lb.onchange = () => { S.lembar = lb.value; siapkanHeader(); l2(); };
      R.on(w, 'change', '[data-m]', (e, s) => { S.map[s.dataset.m] = s.value; if (s.dataset.m === 'potongan_admin') { S.profil = !s.value; w.querySelector('[data-prof]').checked = S.profil; } stat(); prev(); });
      w.querySelector('[data-mh]').onchange = (e) => { S.modeHarga = e.target.value; prev(); };
      w.querySelector('[data-prof]').onchange = (e) => { S.profil = e.target.checked; };
      w.querySelector('[data-kembali]').onclick = () => { S.langkah = 1; langkah(); };
      w.querySelector('[data-lanjut]').onclick = () => {
        const kurang = FIELD.filter((f) => f.wajib && !S.map[f.k]);
        if (kurang.length) return R.toast('Cocokkan kolom wajib: ' + kurang.map((f) => f.l).join(', '), 'err');
        S.langkah = 3; langkah();
      };
      function stat() {
        const box = w.querySelector('[data-stat]');
        if (!S.map.status) { box.innerHTML = '<div class="alert w">' + R.ic('info', 's18') + '<span>Tidak ada kolom status — semua baris dianggap <b>Selesai</b>.</span></div>'; return; }
        const i = kol(S.map.status); const uniq = {};
        isi.forEach((r) => { const s = String(r[i]).trim(); uniq[s] = (uniq[s] || 0) + 1; });
        Object.keys(uniq).forEach((s) => { if (!S.statusMap[s]) S.statusMap[s] = tebakStatus(s); });
        box.innerHTML = '<h3 class="sec">Arti status di file</h3><p class="sec-sub">Pesanan yang masih dikirim/diproses sebaiknya dilewati, impor lagi setelah selesai.</p><div class="fgrid mt">' + Object.keys(uniq).map((s) => '<div class="field"><label>' + esc(s || '(kosong)') + ' <span class="faint">· ' + R.angka(uniq[s]) + ' baris</span></label><select class="inp" data-sm="' + esc(s) + '">' + ['Selesai', 'RTS', 'Batal', 'Lewati'].map((o) => '<option ' + (S.statusMap[s] === o ? 'selected' : '') + '>' + o + '</option>').join('') + '</select></div>').join('') + '</div>';
        R.$$('[data-sm]', box).forEach((s) => { s.onchange = () => { S.statusMap[s.dataset.sm] = s.value; }; });
      }
      function prev() {
        const contoh = isi.slice(0, 5).map((r) => { const o = {}; FIELD.forEach((f) => { const i = S.map[f.k] ? kol(S.map[f.k]) : -1; o[f.k] = i >= 0 ? r[i] : ''; }); return o; });
        R.tabel(w.querySelector('[data-prev]'), { no: false, kartu: false, ringkas: true, baris: contoh, kolom: FIELD.filter((f) => S.map[f.k]).map((f) => ({ k: f.k, label: f.l, render: (r) => esc(r[f.k] instanceof Date ? tanggalID(r[f.k]) : r[f.k]) })) });
      }
      stat(); prev();
    }
    function bangunBaris() {
      const rows = S.data.lembar[S.lembar].slice(S.headerRow + 1);
      const idx = {}; FIELD.forEach((f) => { idx[f.k] = S.map[f.k] ? kol(S.map[f.k]) : -1; });
      const ambil = (r, k) => idx[k] >= 0 ? r[idx[k]] : '';
      const gabung = {}, urut = [], lewat = { status: 0, kosong: 0, tanggal: 0 };
      rows.forEach((r) => {
        if (!r.some((x) => x !== '')) return;
        const no = String(ambil(r, 'no_pesanan')).trim(), sku = String(ambil(r, 'sku')).trim().replace(/\s+/g, '');
        if (!no || !sku) { lewat.kosong++; return; }
        const stt = S.map.status ? (S.statusMap[String(ambil(r, 'status')).trim()] || 'Lewati') : 'Selesai';
        if (stt === 'Lewati') { lewat.status++; return; }
        const tgl = tanggalID(ambil(r, 'tanggal'));
        if (!tgl) { lewat.tanggal++; return; }
        const qty = Math.max(0, Math.round(angkaID(ambil(r, 'qty'))));
        let harga = angkaID(ambil(r, 'harga_jual')); if (S.modeHarga === 'total' && qty) harga = harga / qty;
        const k = no + '|' + sku;
        const g = gabung[k] || (gabung[k] = { tanggal: tgl, no_pesanan: no, sku: sku, nama_produk: String(ambil(r, 'nama_produk')).slice(0, 120), qty: 0, nilai: 0, diskon_penjual: 0, potongan_admin: 0, komisi_affiliate: 0, ongkir_penjual: 0, biaya_lain: 0, status: stt, _ada: { pot: false } });
        if (g.qty === 0) urut.push(g);
        g.qty += qty; g.nilai += harga * qty;
        ['diskon_penjual', 'potongan_admin', 'komisi_affiliate', 'ongkir_penjual', 'biaya_lain'].forEach((f) => { const v = Math.abs(angkaID(ambil(r, f))); g[f] += v; if (f === 'potongan_admin' && v) g._ada.pot = true; });
      });
      const pesananPertama = {};
      urut.forEach((g) => {
        g.harga_jual = g.qty ? Math.round(g.nilai / g.qty) : 0;
        // kolom ongkir/biaya order-level biasanya berulang per baris barang → ambil sekali per pesanan
        const pertama = !pesananPertama[g.no_pesanan]; pesananPertama[g.no_pesanan] = true;
        if (!pertama) { g.ongkir_penjual = 0; }
        if (S.profil && !g._ada.pot && g.status === 'Selesai') { const x = potonganProfil(S.ch, g.tanggal, g.qty * g.harga_jual - g.diskon_penjual, pertama); Object.keys(x).forEach((f) => { if (!g[f]) g[f] = x[f]; }); }
        ['diskon_penjual', 'potongan_admin', 'komisi_affiliate', 'ongkir_penjual', 'biaya_lain'].forEach((f) => { g[f] = Math.round(g[f]); });
        delete g.nilai; delete g._ada;
      });
      return { baris: urut, lewat: lewat };
    }
    function l3() {
      const b = bangunBaris();
      const tak = {}, nol = {}, kunci = [], ok = [];
      b.baris.forEach((r) => {
        const p = R.mProd[r.sku];
        if (!p) { (tak[r.sku] = tak[r.sku] || { sku: r.sku, nama: r.nama_produk, n: 0 }).n++; return; }
        if (!p.hpp) { (nol[r.sku] = nol[r.sku] || { sku: r.sku, nama: p.nama, n: 0 }).n++; return; }
        if (R.terkunci(r.tanggal)) { kunci.push(r); return; }
        if (r.qty < 1) return;
        ok.push(r);
      });
      S.siap = ok;
      const omzet = ok.filter((r) => r.status === 'Selesai').reduce((s, r) => s + r.qty * r.harga_jual, 0);
      const tglMin = ok.reduce((m, r) => !m || r.tanggal < m ? r.tanggal : m, ''), tglMax = ok.reduce((m, r) => r.tanggal > m ? r.tanggal : m, '');
      const takL = Object.values(tak), nolL = Object.values(nol);
      w.innerHTML = '<div class="grid g4 keep2">' + [['Siap diimpor', R.angka(ok.length) + ' baris', 'g'], ['Omzet (Selesai)', R.rpK(omzet), 'o'], ['SKU belum dikenal', R.angka(takL.length), takL.length ? 'r' : ''], ['Dilewati', R.angka(b.lewat.status + b.lewat.kosong + b.lewat.tanggal + kunci.length) + ' baris', '']].map((x) => '<div class="card kpi"><div class="lbl">' + x[0] + '</div><div class="val ' + (x[2] === 'r' ? 'neg' : x[2] === 'g' ? 'pos' : '') + '" style="font-size:22px">' + x[1] + '</div></div>').join('') + '</div>' +
        '<div class="card mt"><div class="kv"><dt>Rentang tanggal</dt><dd>' + (tglMin ? R.tgl(tglMin) + ' – ' + R.tgl(tglMax) : '–') + '</dd><dt>Status Selesai / RTS / Batal</dt><dd>' + ['Selesai', 'RTS', 'Batal'].map((s) => R.angka(ok.filter((r) => r.status === s).length)).join(' / ') + '</dd><dt>Dilewati: status diproses / tanpa tanggal / kosong</dt><dd>' + b.lewat.status + ' / ' + b.lewat.tanggal + ' / ' + b.lewat.kosong + '</dd>' + (kunci.length ? '<dt>Periode sudah dikunci</dt><dd class="neg">' + kunci.length + '</dd>' : '') + '</div></div>' +
        (takL.length || nolL.length ? '<div class="card mt"><div class="card-head"><div><h3 class="sec">Produk perlu dilengkapi</h3><p class="sec-sub">Baris dengan SKU di bawah tidak diimpor sampai SKU & HPP ada di Master Produk.</p></div><button class="btn sm primary" data-tbh>' + R.ic('plus', 's16') + ' Tambah ke master produk</button></div><div data-tak></div></div>' : '') +
        '<div class="actions mt-l"><button class="btn" data-kembali>Kembali</button><button class="btn primary" data-lanjut ' + (ok.length ? '' : 'disabled') + '>' + R.ic('upload', 's18') + ' Impor ' + R.angka(ok.length) + ' baris</button></div>';
      if (takL.length || nolL.length) {
        R.tabel(w.querySelector('[data-tak]'), { ringkas: true, baris: takL.map((x) => Object.assign({ ket: 'Belum ada' }, x)).concat(nolL.map((x) => Object.assign({ ket: 'HPP kosong' }, x))), kolom: [{ k: 'sku', label: 'SKU', lead: true }, { k: 'nama', label: 'Nama di file' }, { k: 'n', label: 'Baris', tipe: 'angka' }, { k: 'ket', label: 'Masalah', render: (r) => '<span class="badge ' + (r.ket === 'Belum ada' ? 'r' : 'a') + '">' + r.ket + '</span>' }] });
        w.querySelector('[data-tbh]').onclick = () => formProdukCepat(takL.concat(nolL), () => l3());
      }
      w.querySelector('[data-kembali]').onclick = () => { S.langkah = 2; langkah(); };
      w.querySelector('[data-lanjut]').onclick = () => { S.langkah = 4; langkah(); };
    }
    async function l4() {
      const rows = S.siap, total = rows.length;
      w.innerHTML = '<div class="card"><h3 class="sec" data-jd>Mengimpor ' + R.angka(total) + ' baris…</h3><p class="sec-sub">Jangan tutup halaman ini sampai selesai.</p><div class="progress mt"><i data-bar></i></div><div class="grid g4 keep2 mt" data-cnt></div><div data-hasil class="mt"></div></div>';
      const bar = w.querySelector('[data-bar]'); const c = { baru: 0, duplikat: 0, status: 0, error: 0, err: [] };
      const tulis = (n) => { bar.style.width = Math.round(n / total * 100) + '%'; w.querySelector('[data-cnt]').innerHTML = [['Baru', c.baru, 'pos'], ['Sudah ada', c.duplikat, ''], ['Status diperbarui', c.status, ''], ['Gagal', c.error, c.error ? 'neg' : '']].map((x) => '<div class="sum-box"><div class="xs muted">' + x[0] + '</div><b class="num ' + x[2] + '" style="font-size:18px">' + R.angka(x[1]) + '</b></div>').join(''); };
      tulis(0);
      try {
        if (R.isOA()) { const pm = {}; FIELD.forEach((f) => { if (S.map[f.k]) pm[f.k] = S.map[f.k]; }); pm._harga = S.modeHarga; R.api.call('master.save', { jenis: 'channel', data: { id_channel: S.ch, pemetaan_kolom: JSON.stringify(pm) } }, { tulis: false }).then(() => { if (R.mCh[S.ch]) R.mCh[S.ch].pemetaan = JSON.stringify(pm); }).catch(() => {}); }
        const imp = await R.api.call('penjualan.importStart', { id_channel: S.ch, nama_file: S.file.name, jumlah_baris: total });
        const PAKET = 500;
        for (let i = 0; i < total; i += PAKET) {
          const r = await R.api.call('penjualan.importChunk', { id_import: imp.id_import, offset: i, rows: rows.slice(i, i + PAKET) }, { timeout: 300000 });
          c.baru += r.baru; c.duplikat += r.duplikat; c.status += r.status_diperbarui; c.error += r.jumlah_error; c.err = c.err.concat(r.error || []);
          tulis(Math.min(total, i + PAKET));
        }
        await R.api.call('penjualan.importFinish', { id_import: imp.id_import });
        w.querySelector('[data-jd]').textContent = 'Impor selesai';
        w.querySelector('[data-hasil]').innerHTML = '<div class="alert g">' + R.ic('check', 's18') + '<span>' + R.angka(c.baru) + ' baris baru tersimpan. Jurnal rekap harian, piutang marketplace, dan HPP sudah diperbarui otomatis.</span></div>' +
          (c.err.length ? '<div class="alert r mt">' + R.ic('alert', 's18') + '<div><b>' + c.error + ' baris gagal</b><ul style="margin:6px 0 0;padding-left:18px">' + c.err.slice(0, 15).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div></div>' : '') +
          '<div class="actions mt"><a class="btn primary" href="#/penjualan?tab=daftar">Lihat daftar penjualan</a><button class="btn" data-lagi>Impor file lain</button></div>';
        w.querySelector('[data-lagi]').onclick = () => { S.langkah = 1; S.file = null; langkah(); };
        R.app.muatNotif();
      } catch (e) {
        w.querySelector('[data-jd]').textContent = 'Impor terhenti';
        w.querySelector('[data-hasil]').innerHTML = '<div class="alert r">' + R.ic('alert', 's18') + '<span>' + esc(e.message) + ' — baris yang sudah terkirim tetap tersimpan. Impor ulang file yang sama aman (tidak dobel).</span></div><div class="actions mt"><button class="btn primary" data-ulang>Coba lagi</button></div>';
        w.querySelector('[data-ulang]').onclick = () => l4();
      }
    }
    langkah();
  }
  /** Form tambah cepat SKU baru + HPP saat impor. */
  function formProdukCepat(list, selesai) {
    const d = R.drawer({ judul: 'Tambah produk ke master', lebar: true, isi: '<p class="muted small" style="margin-top:0">Isi nama dan HPP (harga pokok/modal per barang). Harga jual normal opsional.</p><div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>SKU</th><th>Nama produk</th><th>Varian</th><th class="n">HPP</th><th class="n">Harga jual</th></tr></thead><tbody>' +
      list.map((x, i) => { const p = R.mProd[x.sku] || {}; return '<tr data-i="' + i + '"><td><b>' + esc(x.sku) + '</b></td><td><input class="inp sm" data-k="nama_produk" value="' + esc(p.nama || x.nama || '') + '"></td><td><input class="inp sm" data-k="varian" value="' + esc(p.varian || '') + '" style="width:110px"></td><td><input class="inline-in" data-k="hpp" data-rp inputmode="numeric" value="' + (p.hpp ? R.angka(p.hpp) : '') + '"></td><td><input class="inline-in" data-k="harga_jual_normal" data-rp inputmode="numeric" value="' + (p.harga ? R.angka(p.harga) : '') + '"></td></tr>'; }).join('') + '</tbody></table></div>',
      kaki: '<button class="btn ghost" data-x2>Batal</button><button class="btn primary" data-ok>Simpan produk</button>' });
    d.foot.querySelector('[data-x2]').onclick = () => d.tutup();
    d.foot.querySelector('[data-ok]').onclick = async (e) => {
      const rows = R.$$('tbody tr', d.body).map((tr) => { const x = list[+tr.dataset.i]; const g = (k) => tr.querySelector('[data-k=' + k + ']').value; return { sku: x.sku, nama_produk: g('nama_produk').trim(), varian: g('varian').trim(), hpp: R.nilai(g('hpp')), harga_jual_normal: R.nilai(g('harga_jual_normal')) }; }).filter((r) => r.nama_produk && r.hpp > 0);
      if (!rows.length) return R.toast('Isi nama & HPP minimal satu produk.', 'err');
      const b = e.currentTarget; b.classList.add('busy');
      try { const r = await R.api.call('master.save', { jenis: 'produk', rows: rows }); R.toast(r._pesan); await R.app.muatUlangBoot(); d.tutup(); selesai(); }
      catch (ex) { R.galat(ex); b.classList.remove('busy'); }
    };
  }
  R.formProdukCepat = formProdukCepat;

  // ============================================================
  // PENCAIRAN DANA MARKETPLACE
  // ============================================================
  function pencairan(el, nav) {
    const mps = (R.boot.channel || []).filter((c) => c.aktif && c.tipe === 'Marketplace');
    const bank = R.akunKas().find((a) => /Bank/.test(a.nama)) || R.akunKas()[0] || {};
    el.innerHTML = '<div class="grid g-1-2"><form class="card" novalidate data-f><h3 class="sec">Catat pencairan</h3><p class="sec-sub">Saat saldo penjual ditarik ke rekening bank.</p><div class="stack mt">' +
      '<div class="field"><label>Channel</label><select class="inp" name="id_channel">' + mps.map((c) => '<option value="' + c.id + '">' + esc(c.nama) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>Tanggal masuk rekening</label><input type="date" class="inp" name="tanggal" value="' + R.hariIni() + '" max="' + R.hariIni() + '"></div>' +
      '<div class="field"><label>Nominal ditarik</label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="nominal" data-rp inputmode="numeric" placeholder="0"></div></div>' +
      '<div class="field"><label>Biaya penarikan <span class="faint">(bila ada)</span></label><div class="inp-group"><span class="pre">Rp</span><input class="inp" name="biaya_admin" data-rp inputmode="numeric" placeholder="0"></div></div>' +
      '<div class="field"><label>Masuk ke rekening</label><select class="inp" name="akun_bank">' + R.opsiKas(bank.no) + '</select></div>' +
      '<div class="field"><label>Catatan</label><input class="inp" name="catatan" maxlength="200" placeholder="mis. Penarikan saldo 1–7 Nov"></div>' +
      '<button class="btn primary">' + R.ic('check', 's18') + ' Simpan pencairan</button></div></form>' +
      '<div><div class="card"><div class="card-head"><div><h3 class="sec">Dana tertahan per channel</h3><p class="sec-sub">Penjualan yang sudah selesai tapi belum ditarik ke bank.</p></div></div><div class="grid g2" data-dana>' + R.loaderMini('Menghitung dana') + '</div></div>' +
      '<div class="card p0 mt"><div class="card-head"><h3 class="sec">Riwayat pencairan</h3></div><div data-list>' + R.kerangka(4) + '</div></div></div></div>';
    R.inpRpSemua(el);
    const f = el.querySelector('[data-f]');
    function muat() {
      R.api.swr('pencairan.list', {}, (d) => {
        if (!R.masihDi(nav)) return;
        el.querySelector('[data-dana]').innerHTML = d.dana.map((x) => '<div class="ch-card"><div class="ch-top">' + R.chTag(x.id_channel) + '</div><div class="num" style="font-size:20px;font-weight:700">' + R.rp(x.saldo) + '</div><div class="xs ' + (x.umur > 14 && x.saldo > 0 ? 'warn' : 'faint') + '">' + (x.saldo > 0 ? 'Tertahan ' + x.umur + ' hari' : 'Tidak ada dana tertahan') + '</div></div>').join('');
        R.tabel(el.querySelector('[data-list]'), { baris: d.baris, kosong: 'Belum ada pencairan', kolom: [{ k: 'tanggal', label: 'Tanggal', tipe: 'tgl', lead: true, render: (r) => '<b>' + R.tgl(r.tanggal) + '</b><span class="t2">' + esc(r.no_bukti || '') + '</span>' }, { k: 'id_channel', label: 'Channel', render: (r) => R.chTag(r.id_channel) }, { k: 'nama_bank', label: 'Rekening' }, { k: 'biaya_admin', label: 'Biaya', tipe: 'rp', hideM: true }, { k: 'nominal', label: 'Nominal', tipe: 'rp', render: (r) => '<b class="' + (r.status === 'Dibatalkan' ? 'faint' : 'pos') + '">' + R.rp(r.nominal) + '</b>' }] });
      }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, el.querySelector('[data-list]'), muat); });
    }
    f.onsubmit = async (e) => {
      e.preventDefault();
      const n = R.nilai(f.nominal.value); if (n <= 0) return R.toast('Isi nominal pencairan.', 'err');
      const b = f.querySelector('.btn.primary'); b.classList.add('busy');
      try { const r = await R.api.call('pencairan.create', { id_channel: f.id_channel.value, tanggal: f.tanggal.value, nominal: n, biaya_admin: R.nilai(f.biaya_admin.value), akun_bank: f.akun_bank.value, catatan: f.catatan.value }); R.toast(r._pesan); f.nominal.value = ''; f.biaya_admin.value = ''; f.catatan.value = ''; muat(); }
      catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
    };
    muat();
  }

  function riwayat(el, nav) {
    el.innerHTML = '<div class="card p0" data-list>' + R.kerangka(5) + '</div>';
    R.api.swr('penjualan.importList', {}, (d) => {
      if (!R.masihDi(nav)) return;
      R.tabel(el.querySelector('[data-list]'), { baris: d, kosong: 'Belum ada riwayat impor', kosongIkon: 'upload', kolom: [
        { k: 'waktu', label: 'Waktu', lead: true, render: (r) => '<b>' + R.waktu(r.waktu) + '</b><span class="t2">' + esc(r.nama_file) + '</span>' },
        { k: 'id_channel', label: 'Channel', render: (r) => R.chTag(r.id_channel) },
        { k: 'tanggal_awal', label: 'Rentang data', render: (r) => r.tanggal_awal ? R.tgl(r.tanggal_awal) + ' – ' + R.tgl(r.tanggal_akhir) : '–' },
        { k: 'baris_baru', label: 'Baru', tipe: 'angka' }, { k: 'baris_duplikat', label: 'Lewati/ubah', tipe: 'angka', hideM: true }, { k: 'baris_error', label: 'Gagal', tipe: 'angka' },
        { k: 'total_omzet', label: 'Omzet', tipe: 'rp' }, { k: 'diimport_oleh', label: 'Oleh', hideM: true },
        { k: 'status', label: 'Status', render: (r) => '<span class="badge ' + (r.status === 'Selesai' ? 'g' : 'a') + '">' + esc(r.status) + '</span>' }] });
    }).catch((e) => R.gagalMuat(e, el.querySelector('[data-list]')));
  }
})();
