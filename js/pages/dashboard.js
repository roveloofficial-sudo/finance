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
      el.innerHTML = '<div class="page-head"><div><h2>' + salam + ', ' + esc(u.nama.split(' ')[0]) + '</h2><p data-lbl>' + esc(pilihan.label) + '</p></div><div data-per></div></div><div data-isi><div class="card">' + R.loaderMini('Menyiapkan dashboard') + '</div></div>';
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
      '<div class="grid g-2-1 mt"><div class="card"><div class="card-head"><div><h3 class="sec">Omzet & laba bersih per ' + d.tren.satuan + '</h3><div class="sec-sub">' + esc(d.periode.label) + ' · batang = omzet, garis = laba bersih</div></div></div><p class="chart-cap" data-cap></p><div class="chart-box"><canvas data-tren aria-label="Grafik omzet dan laba"></canvas></div></div>' +
      '<div class="card"><div class="card-head"><div><h3 class="sec">Dari setiap Rp100.000 omzet</h3><div class="sec-sub">Dipakai untuk apa saja, dan berapa yang jadi laba</div></div></div>' + uang100(d.per100) + '</div></div>' +
      '<div class="card mt"><div class="card-head"><div><h3 class="sec">Kinerja per channel</h3><div class="sec-sub">Omzet, qty, laba setelah potongan & iklan, tingkat RTS</div></div><a class="small" href="#/laporan-penjualan">Laporan penjualan</a></div><div class="grid g3" data-ch></div></div>' +
      '<div class="grid g-1-2 mt"><div class="card"><div class="card-head"><h3 class="sec">Produk terlaris</h3><div data-tp></div></div><div data-tpl></div></div>' +
      '<div class="grid g2"><div class="card"><div class="card-head"><h3 class="sec">Kas & bank</h3><b class="num">' + R.rp(totKas) + '</b></div>' + (d.kas || []).filter((x) => x.saldo).map((x) => '<div class="list-row"><span class="lr-ic">' + R.ic(/Bank/.test(x.nama) ? 'landmark' : 'wallet', 's18') + '</span><span class="lr-main"><b>' + esc(x.nama) + '</b><small>' + x.no + '</small></span><span class="num" style="font-weight:600">' + R.rp(x.saldo) + '</span></div>').join('') + (!(d.kas || []).some((x) => x.saldo) ? R.kosong('Belum ada saldo', 'Isi saldo awal di Pembukuan.', 'wallet') : '') + '</div>' +
      '<div class="card"><div class="card-head"><h3 class="sec">Dana marketplace tertahan</h3><b class="num">' + R.rp(totDana) + '</b></div>' + (d.danaTertahan || []).map((x) => '<div class="list-row"><span class="lr-main">' + R.chTag(x.id_channel) + '<small style="display:block">' + (x.saldo > 0 ? 'tertahan ' + x.umur + ' hari' : 'tidak ada dana tertahan') + '</small></span><span class="num ' + (x.umur > 14 && x.saldo > 0 ? 'warn' : '') + '" style="font-weight:600">' + R.rp(x.saldo) + '</span></div>').join('') +
      '<hr class="divider"><div class="kv"><dt>Piutang belum dibayar</dt><dd>' + R.rp(pu.piutang) + '</dd><dt>Utang belum dibayar</dt><dd class="' + (pu.utang_lewat ? 'neg' : '') + '">' + R.rp(pu.utang) + '</dd></div><a class="btn sm block mt" href="#/piutang">Kelola piutang & utang</a></div></div></div>' +
      '<div class="grid g-2-1 mt"><div class="card"><div class="card-head"><div><h3 class="sec">Omzet & laba bersih per bulan</h3><div class="sec-sub">Januari – Desember · angka di atas batang hijau = laba bersih</div></div><select class="inp sm" data-th style="width:auto" aria-label="Tahun rekap"></select></div><p class="chart-cap" data-cap2></p><div class="chart-box"><canvas data-rekap aria-label="Grafik omzet dan laba per bulan"></canvas></div></div>' +
      '<div class="card"><div class="card-head"><div><h3 class="sec">Pengeluaran per kelompok</h3><div class="sec-sub">' + esc(d.periode.label) + '</div></div></div>' + kelompok(d.pengeluaranKelompok) + '</div></div>' +
      '<div class="card mt"><div class="card-head"><h3 class="sec">Transaksi terbaru</h3><a class="small" href="#/transaksi">Lihat semua</a></div>' + terbaru(d) + '</div>';

    // channel
    const aktif = (d.channel || []).filter((c) => c.omzet || c.qty || c.iklan);
    el.querySelector('[data-ch]').innerHTML = aktif.length ? aktif.map((c) => '<div class="ch-card"><div class="ch-top">' + R.chLogo(c.id, 24) + esc(c.nama) + '<span class="grow"></span>' + R.delta(c.omzet, c.omzet_b) + '</div><div style="font-size:20px;font-weight:700" class="num">' + R.rp(c.omzet) + '</div>' +
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

    // grafik tren: batang omzet + garis laba (satu sumbu Rupiah)
    const bulanan = d.tren.satuan !== 'hari';
    const labels = d.tren.data.map((x) => bulanan ? R.BULAN[+x.label.slice(5, 7) - 1].slice(0, 3) + ' ' + x.label.slice(0, 4) : +x.label.slice(8) + ' ' + R.BULAN[+x.label.slice(5, 7) - 1].slice(0, 3));
    const terbaik = d.tren.data.reduce((m, x, i) => x.omzet > (m ? m.x.omzet : -1) ? { x: x, i: i } : m, null);
    el.querySelector('[data-cap]').innerHTML = 'Omzet <b>' + R.rp(k.omzet) + '</b>, laba bersih <b class="' + (k.laba < 0 ? 'neg' : '') + '">' + R.rp(k.laba) + '</b> (margin ' + R.persen(margin) + ').' + (terbaik && terbaik.x.omzet ? ' Omzet tertinggi pada <b>' + labels[terbaik.i] + '</b>: ' + R.rp(terbaik.x.omzet) + '.' : '');
    R.grafik(el.querySelector('[data-tren]'), {
      type: 'bar', data: { labels: labels, datasets: [
        { type: 'line', label: 'Laba bersih', data: d.tren.data.map((x) => x.laba), borderColor: '#16A34A', backgroundColor: '#16A34A', borderWidth: 2, pointRadius: d.tren.data.length > 20 ? 0 : 3, pointHoverRadius: 5, order: 0 },
        { label: 'Omzet', data: d.tren.data.map((x) => x.omzet), backgroundColor: '#FB923C', hoverBackgroundColor: '#F97316', maxBarThickness: 26, order: 1 }
      ] }, labelNilai: d.tren.data.length <= 8 ? [1] : []
    }).catch(() => {});

    // rekap tahunan
    const thIni = +R.hariIni().slice(0, 4), sel = el.querySelector('[data-th]');
    sel.innerHTML = Array.from({ length: 11 }, (_, i) => thIni - 5 + i).map((y) => '<option ' + (y === +d.periode.sampai.slice(0, 4) ? 'selected' : '') + '>' + y + '</option>').join('');
    const rekap = () => R.api.swr('laporan.rekap', { mode: '12bulan', tahun: +sel.value }, (r) => {
      if (!R.masihDi(nav)) return;
      const isi2 = r.kolom.filter((x) => x.omzet);
      const top = isi2.slice().sort((a, b) => b.omzet - a.omzet)[0];
      el.querySelector('[data-cap2]').innerHTML = isi2.length ? 'Tahun ' + r.tahun + ': omzet <b>' + R.rp(r.total.omzet) + '</b>, laba bersih <b class="' + (r.total.laba_bersih < 0 ? 'neg' : '') + '">' + R.rp(r.total.laba_bersih) + '</b> (margin ' + R.persen(r.total.margin) + '). Bulan terbaik: <b>' + R.BULAN[+top.kunci.slice(5) - 1] + '</b>.' : 'Belum ada data di tahun ' + r.tahun + '.';
      R.grafik(el.querySelector('[data-rekap]'), {
        type: 'bar', data: { labels: r.kolom.map((x) => x.label), datasets: [
          { label: 'Omzet', data: r.kolom.map((x) => x.omzet), backgroundColor: '#FB923C', hoverBackgroundColor: '#F97316', maxBarThickness: 22 },
          { label: 'Laba bersih', data: r.kolom.map((x) => x.laba_bersih), backgroundColor: '#16A34A', maxBarThickness: 22 }
        ] }, labelNilai: [1], options: { datasets: { bar: { categoryPercentage: 0.7, barPercentage: 0.9 } } }
      }).catch(() => {});
    }, { simpan: true }).catch(() => {});
    sel.onchange = rekap; rekap();
  }

  function uang100(list) {
    if (!list || !list.length) return R.kosong('Belum ada omzet', 'Rincian muncul setelah ada penjualan.', 'pie');
    return R.batangList(list.map((x) => ({ label: x.laba ? (x.n < 0 ? 'Rugi bersih' : 'Laba bersih (sisa untuk Anda)') : x.label, n: x.n, warna: x.laba ? (x.n < 0 ? '#DC2626' : '#16A34A') : '#94A3B8', sorot: x.laba })), { total: 100000 });
  }
  function kelompok(list) {
    if (!list || !list.length) return R.kosong('Belum ada pengeluaran', '', 'receipt');
    return R.batangList(list.slice().sort((a, b) => b.n - a.n).map((x) => ({ label: x.label, n: x.n, warna: '#FB923C' })));
  }
})();
