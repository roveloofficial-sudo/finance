/* ROVELO Finance — Dashboard */
(function () {
  const R = window.R;
  const esc = R.esc;
  let pilihan = null;

  R.halaman.dashboard = {
    judul: 'Dashboard',
    render(el, q, sub, nav) {
      const u = R.boot.user;
      const staf = u.peran === R.PERAN.S;
      pilihan = pilihan || R.rentang('bulan');
      const jam = +new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jakarta' });
      const salam = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam';
      el.innerHTML = '<div class="page-head"><div><h2>' + salam + ', ' + esc(u.nama.split(' ')[0]) + '</h2><p data-lbl>' + esc(pilihan.label) + '</p></div><div data-per></div></div><div data-isi>' + R.kerangka(4, 'kartu') + '<div class="grid g-2-1 mt"><div class="card"><div class="sk b"></div></div><div class="card"><div class="sk b"></div></div></div></div>';
      const isi = el.querySelector('[data-isi]');
      const muat = () => {
        el.querySelector('[data-lbl]').textContent = pilihan.label;
        R.api.swr('dashboard.get', { dari: pilihan.dari, sampai: pilihan.sampai }, (d) => { if (R.masihDi(nav)) (staf ? gambarStaf : gambar)(isi, d, nav); }, { simpan: true })
          .catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, isi, muat); });
      };
      R.periode(el.querySelector('[data-per]'), { nilai: pilihan, preset: ['hari', '7hari', 'bulan', '6bulan', 'tahun', 'kustom'], ubah: (v) => { pilihan = v; muat(); } });
      muat();
    }
  };

  function kartu(o) {
    return '<div class="card kpi ' + (o.hero ? 'hero' : '') + '"><div class="lbl"><span class="ic-wrap ' + (o.w || '') + '">' + R.ic(o.ic, 's18') + '</span>' + esc(o.l) + '</div><div class="val" title="' + esc(o.v) + '">' + esc(o.v) + '</div><div class="foot">' + (o.d || '') + '<span>' + esc(o.f || '') + '</span></div></div>';
  }
  function terbaru(d) {
    if (!d.terbaru || !d.terbaru.length) return R.kosong('Belum ada transaksi', 'Catatan terbaru akan muncul di sini.', 'receipt');
    return d.terbaru.slice(0, 8).map((t) => {
      const masuk = t.sumber === 'Pemasukan' || t.sumber === 'Penjualan' || t.sumber === 'Pelunasan Piutang' || t.sumber === 'Pencairan';
      const cls = t.sumber === 'Transfer' ? 'tf' : masuk ? 'in' : (t.sumber === 'Pengeluaran' || t.sumber === 'Gaji' || t.sumber === 'Pembayaran Utang') ? 'out' : '';
      return '<a class="list-row" href="#/transaksi?id=' + esc(t.id) + '" style="text-decoration:none;color:inherit"><span class="lr-ic ' + cls + '">' + R.ic(cls === 'in' ? 'down' : cls === 'out' ? 'up' : cls === 'tf' ? 'repeat' : 'file', 's18') + '</span><span class="lr-main"><b>' + esc(t.deskripsi) + '</b><small>' + R.tgl(t.tanggal) + ' · ' + esc(t.no_bukti) + (t.status !== 'Diposting' ? ' · ' + esc(t.status) : '') + '</small></span><span class="num ' + (cls === 'in' ? 'pos' : '') + '" style="font-weight:600">' + R.rp(t.total) + '</span></a>';
    }).join('');
  }

  function gambarStaf(el, d) {
    el.innerHTML = '<div class="grid g2 keep2">' + kartu({ l: 'Omzet', v: R.rp(d.kartu.omzet), ic: 'bag', hero: true, d: R.delta(d.kartu.omzet, d.kartu.omzet_b), f: 'vs ' + d.pembanding.label }) +
      kartu({ l: 'Barang terjual', v: R.angka(d.kartu.qty) + ' pcs', ic: 'package', w: 'l', d: R.delta(d.kartu.qty, d.kartu.qty_b), f: R.angka(d.kartu.pesanan) + ' pesanan' }) + '</div>' +
      '<div class="card mt"><div class="card-head"><h3 class="sec">Catat cepat</h3></div><div class="sheet-menu">' +
      [['Pengeluaran', 'up', 'var(--red-tint);color:var(--red)', 'P'], ['Pemasukan', 'down', 'var(--green-tint);color:var(--green)', 'M'], ['Transfer', 'repeat', 'var(--blue-tint);color:var(--blue)', 'T']].map((x) => '<button data-catat="' + x[0] + '"><span class="si" style="background:' + x[2] + '">' + R.ic(x[1]) + '</span>' + x[0] + '</button>').join('') +
      '<a href="#/penjualan?tab=manual"><span class="si" style="background:var(--accent-tint);color:var(--accent-600)">' + R.ic('bag') + '</span>Penjualan</a></div></div>' +
      '<div class="card mt"><div class="card-head"><h3 class="sec">Catatan terbaru saya</h3><a href="#/transaksi" class="small">Lihat semua</a></div>' + terbaru(d) + '</div>';
    R.on(el, 'click', '[data-catat]', (e, b) => R.catat(b.dataset.catat));
  }

  function gambar(el, d, nav) {
    const k = d.kartu;
    const margin = k.omzet ? Math.round(k.laba / k.omzet * 1000) / 10 : 0;
    const pu = d.piutangUtang || {};
    const totDana = (d.danaTertahan || []).reduce((s, x) => s + Math.max(0, x.saldo), 0);
    const totKas = (d.kas || []).reduce((s, x) => s + x.saldo, 0);
    el.innerHTML =
      '<div class="grid g4">' +
      kartu({ l: 'Omzet', v: R.rp(k.omzet), ic: 'bag', hero: true, d: R.delta(k.omzet, k.omzet_b), f: 'vs ' + d.pembanding.label }) +
      kartu({ l: 'Pengeluaran', v: R.rp(k.pengeluaran), ic: 'up', w: 'r', d: R.delta(k.pengeluaran, k.pengeluaran_b, true), f: 'termasuk HPP & potongan' }) +
      kartu({ l: 'Laba bersih', v: R.rp(k.laba), ic: 'trend', w: 'g', d: R.delta(k.laba, k.laba_b), f: 'margin ' + R.persen(margin) }) +
      kartu({ l: 'Barang terjual', v: R.angka(k.qty) + ' pcs', ic: 'package', w: 'l', d: R.delta(k.qty, k.qty_b), f: R.angka(k.pesanan) + ' pesanan' }) + '</div>' +
      (d.pengingat && d.pengingat.length ? '<div class="card mt" style="padding:12px 16px"><div class="row wrap" style="gap:8px">' + R.ic('bell', 's18') + '<b class="small">Perlu perhatian</b>' + d.pengingat.slice(0, 4).map((p) => '<a class="badge ' + (p.tipe === 'bahaya' ? 'r' : p.tipe === 'peringatan' ? 'a' : 'b') + '" href="' + esc(p.tautan) + '">' + esc(p.judul) + '</a>').join('') + '</div></div>' : '') +
      '<div class="grid g-2-1 mt"><div class="card"><div class="card-head"><div><h3 class="sec">Tren omzet, pengeluaran & laba</h3><div class="sec-sub">Per ' + d.tren.satuan + ' · ' + esc(d.periode.label) + '</div></div><div class="legend"><span><i class="ch-dot" style="background:#F97316"></i>Omzet</span><span><i class="ch-dot" style="background:#DC2626"></i>Pengeluaran</span><span><i class="ch-dot" style="background:#16A34A"></i>Laba</span></div></div><div class="chart-box"><canvas data-tren aria-label="Grafik tren"></canvas></div></div>' +
      '<div class="card"><div class="card-head"><div><h3 class="sec">Ke mana Rp100.000 omzet pergi</h3><div class="sec-sub">Dari setiap Rp100.000 penjualan</div></div></div>' + uang100(d.per100) + '</div></div>' +
      '<div class="card mt"><div class="card-head"><div><h3 class="sec">Kinerja per channel</h3><div class="sec-sub">Omzet, qty, laba setelah potongan & iklan, tingkat RTS</div></div><a class="small" href="#/laporan-penjualan">Laporan penjualan</a></div><div class="grid g3" data-ch></div></div>' +
      '<div class="grid g-1-2 mt"><div class="card"><div class="card-head"><h3 class="sec">Produk terlaris</h3><div data-tp></div></div><div data-tpl></div></div>' +
      '<div class="grid g2"><div class="card"><div class="card-head"><h3 class="sec">Kas & bank</h3><b class="num">' + R.rp(totKas) + '</b></div>' + (d.kas || []).filter((x) => x.saldo).map((x) => '<div class="list-row"><span class="lr-ic">' + R.ic(/Bank/.test(x.nama) ? 'landmark' : 'wallet', 's18') + '</span><span class="lr-main"><b>' + esc(x.nama) + '</b><small>' + x.no + '</small></span><span class="num" style="font-weight:600">' + R.rp(x.saldo) + '</span></div>').join('') + (!(d.kas || []).some((x) => x.saldo) ? R.kosong('Belum ada saldo', 'Isi saldo awal di Pembukuan.', 'wallet') : '') + '</div>' +
      '<div class="card"><div class="card-head"><h3 class="sec">Dana marketplace tertahan</h3><b class="num">' + R.rp(totDana) + '</b></div>' + (d.danaTertahan || []).map((x) => '<div class="list-row"><span class="lr-main">' + R.chTag(x.id_channel) + '<small style="display:block">' + (x.saldo > 0 ? 'tertahan ' + x.umur + ' hari' : 'tidak ada dana tertahan') + '</small></span><span class="num ' + (x.umur > 14 && x.saldo > 0 ? 'warn' : '') + '" style="font-weight:600">' + R.rp(x.saldo) + '</span></div>').join('') +
      '<hr class="divider"><div class="kv"><dt>Piutang belum dibayar</dt><dd>' + R.rp(pu.piutang) + '</dd><dt>Utang belum dibayar</dt><dd class="' + (pu.utang_lewat ? 'neg' : '') + '">' + R.rp(pu.utang) + '</dd></div><a class="btn sm block mt" href="#/piutang">Kelola piutang & utang</a></div></div></div>' +
      '<div class="grid g-2-1 mt"><div class="card"><div class="card-head"><div><h3 class="sec">Rekap keuangan tahunan</h3><div class="sec-sub">Januari – Desember</div></div><select class="inp sm" data-th style="width:auto" aria-label="Tahun rekap"></select></div><div class="chart-box"><canvas data-rekap aria-label="Grafik rekap tahunan"></canvas></div></div>' +
      '<div class="card"><div class="card-head"><h3 class="sec">Pengeluaran per kelompok</h3></div>' + kelompok(d.pengeluaranKelompok) + '</div></div>' +
      '<div class="card mt"><div class="card-head"><h3 class="sec">Transaksi terbaru</h3><a class="small" href="#/transaksi">Lihat semua</a></div>' + terbaru(d) + '</div>';

    // channel
    const aktif = (d.channel || []).filter((c) => c.omzet || c.qty || c.iklan);
    el.querySelector('[data-ch]').innerHTML = aktif.length ? aktif.map((c) => '<div class="ch-card"><div class="ch-top"><span class="ch-dot" style="background:' + esc(c.warna) + '"></span>' + esc(c.nama) + '<span class="grow"></span>' + R.delta(c.omzet, c.omzet_b) + '</div><div style="font-size:20px;font-weight:700" class="num">' + R.rp(c.omzet) + '</div>' +
      '<div class="kv mt" style="margin-top:10px"><dt>Qty / pesanan</dt><dd>' + R.angka(c.qty) + ' / ' + R.angka(c.pesanan) + '</dd><dt>Laba (stl. iklan)</dt><dd class="' + (c.laba < 0 ? 'neg' : 'pos') + '">' + R.rp(c.laba) + '</dd><dt>Biaya iklan</dt><dd>' + R.rp(c.iklan) + '</dd><dt>RTS</dt><dd class="' + (c.rts > 5 ? 'warn' : '') + '">' + R.persen(c.rts) + '</dd></div></div>').join('')
      : '<div style="grid-column:1/-1">' + R.kosong('Belum ada penjualan', 'Impor laporan marketplace atau catat penjualan manual.', 'bag', R.boleh(R.PERAN.OAS) ? '<a class="btn sm primary" href="#/penjualan?tab=impor">Impor penjualan</a>' : '') + '</div>';

    // top produk
    let mode = 'qty';
    const tp = () => {
      const list = (d.topProduk && d.topProduk[mode]) || [];
      const maks = Math.max(1, ...list.map((p) => p[mode]));
      el.querySelector('[data-tpl]').innerHTML = list.length ? list.map((p, i) => '<div class="list-row"><span class="lr-ic" style="font-weight:800">' + (i + 1) + '</span><span class="lr-main"><b>' + esc(p.nama || p.sku) + '</b><div class="bar mt" style="margin-top:6px"><i style="width:' + (p[mode] / maks * 100) + '%"></i></div></span><span class="right"><b class="num">' + (mode === 'qty' ? R.angka(p.qty) + ' pcs' : R.rpK(p.omzet)) + '</b><small class="xs faint" style="display:block">margin ' + R.persen(p.margin) + '</small></span></div>').join('')
        + (d.topProduk.bulanan ? '<p class="xs faint" style="margin:8px 0 0">Data produk dihitung per bulan penuh.</p>' : '') : R.kosong('Belum ada data produk', '', 'package');
    };
    R.seg(el.querySelector('[data-tp]'), [{ v: 'qty', l: 'Qty' }, { v: 'omzet', l: 'Omzet' }], mode, (v) => { mode = v; tp(); });
    tp();

    // grafik tren
    const labels = d.tren.data.map((x) => d.tren.satuan === 'hari' ? +x.label.slice(8) + ' ' + R.BULAN[+x.label.slice(5, 7) - 1].slice(0, 3) : R.BULAN[+x.label.slice(5, 7) - 1].slice(0, 3) + ' ' + x.label.slice(2, 4));
    R.grafik(el.querySelector('[data-tren]'), {
      type: 'line', data: { labels: labels, datasets: [
        { label: 'Omzet', data: d.tren.data.map((x) => x.omzet), borderColor: '#F97316', borderWidth: 2.4, tension: .38, pointRadius: 0, pointHoverRadius: 4, fill: true, backgroundColor: (c) => R.gradien(c.chart.ctx, c.chart.chartArea, '#F97316') },
        { label: 'Pengeluaran', data: d.tren.data.map((x) => x.pengeluaran), borderColor: '#DC2626', borderWidth: 1.8, tension: .38, pointRadius: 0, borderDash: [4, 4] },
        { label: 'Laba', data: d.tren.data.map((x) => x.laba), borderColor: '#16A34A', borderWidth: 2, tension: .38, pointRadius: 0, fill: true, backgroundColor: (c) => R.gradien(c.chart.ctx, c.chart.chartArea, '#16A34A', '22') }
      ] }
    }).catch(() => {});

    // rekap tahunan
    const thIni = +R.hariIni().slice(0, 4), sel = el.querySelector('[data-th]');
    sel.innerHTML = Array.from({ length: 11 }, (_, i) => thIni - 5 + i).map((y) => '<option ' + (y === +d.periode.sampai.slice(0, 4) ? 'selected' : '') + '>' + y + '</option>').join('');
    const rekap = () => R.api.swr('laporan.rekap', { mode: '12bulan', tahun: +sel.value }, (r) => {
      if (!R.masihDi(nav)) return;
      R.grafik(el.querySelector('[data-rekap]'), {
        type: 'bar', data: { labels: r.kolom.map((k) => k.label), datasets: [
          { type: 'line', label: 'Laba bersih', data: r.kolom.map((k) => k.laba_bersih), borderColor: '#16A34A', backgroundColor: '#16A34A', borderWidth: 2, tension: .35, pointRadius: 2.5, order: 0 },
          { label: 'Omzet', data: r.kolom.map((k) => k.omzet), backgroundColor: (c) => R.gradien(c.chart.ctx, c.chart.chartArea, '#FB923C', 'CC'), borderRadius: 8, maxBarThickness: 28, order: 1 },
          { label: 'Pengeluaran', data: r.kolom.map((k) => k.pengeluaran), backgroundColor: '#E5E7EB', borderRadius: 8, maxBarThickness: 28, order: 2 }
        ] }
      }).catch(() => {});
    }, { simpan: true }).catch(() => {});
    sel.onchange = rekap; rekap();
  }

  function uang100(list) {
    if (!list || !list.length) return R.kosong('Belum ada omzet', 'Rincian muncul setelah ada penjualan.', 'pie');
    const warna = ['#94A3B8', '#FB923C', '#A79BFF', '#F97316', '#2563EB', '#CBD5E1', '#16A34A'];
    const pos = list.map((x) => Math.max(0, x.n));
    return '<div class="money-flow">' + list.map((x, i) => '<i style="width:' + (pos[i] / 1000) + '%;background:' + (x.laba ? (x.n < 0 ? '#DC2626' : '#16A34A') : warna[i % warna.length]) + '" title="' + esc(x.label) + '"></i>').join('') + '</div><div class="stack mt">' +
      list.map((x, i) => '<div class="row between small"><span class="row" style="gap:8px"><i class="ch-dot" style="background:' + (x.laba ? (x.n < 0 ? '#DC2626' : '#16A34A') : warna[i % warna.length]) + '"></i>' + esc(x.label) + '</span><b class="num ' + (x.laba ? (x.n < 0 ? 'neg' : 'pos') : '') + '">' + R.rp(x.n) + '</b></div>').join('') + '</div>';
  }
  function kelompok(list) {
    if (!list || !list.length) return R.kosong('Belum ada pengeluaran', '', 'receipt');
    const tot = list.reduce((s, x) => s + Math.max(0, x.n), 0) || 1;
    return list.slice().sort((a, b) => b.n - a.n).map((x) => '<div style="margin-bottom:12px"><div class="row between small"><span>' + esc(x.label) + '</span><b class="num">' + R.rpK(x.n) + ' <span class="faint">· ' + R.persen(x.n / tot * 100) + '</span></b></div><div class="bar mt" style="margin-top:6px"><i style="width:' + Math.max(2, x.n / tot * 100) + '%"></i></div></div>').join('');
  }
})();
