/* ROVELO Finance — Laporan Keuangan (SAK EMKM) & Laporan Penjualan */
(function () {
  const R = window.R;
  const esc = R.esc;
  const sl = { tab: 'lr', per: null, tglNeraca: null, rekapMode: '12bulan', rekapTh: null, gb: null, bagian: 'pengeluaran', rinci: false, mode: 'periode', th: null, semua: false };

  const namaFile = (j, l) => j + ' ' + (R.boot.usaha.nama_usaha || 'ROVELO') + ' ' + l;
  const tombolEkspor = '<div class="actions no-print"><button class="btn sm" data-pdf>' + R.ic('printer', 's16') + ' PDF</button><button class="btn sm" data-xls>' + R.ic('download', 's16') + ' Excel</button></div>';
  const NAMA_LAP = { lr: 'Laba Rugi', neraca: 'Neraca', ak: 'Arus Kas', modal: 'Perubahan Ekuitas' };

  R.halaman.laporan = {
    judul: 'Laporan Keuangan', roles: R.PERAN.OAV,
    render(el, q, sub, nav) {
      sl.per = sl.per || R.rentang('bulan');
      if (q.tab) sl.tab = q.tab;
      const TABS = [{ id: 'lr', label: 'Laba rugi' }, { id: 'neraca', label: 'Neraca' }, { id: 'ak', label: 'Arus kas' }, { id: 'modal', label: 'Perubahan ekuitas' }, { id: 'rekap', label: 'Rekap tahunan' }, { id: 'general', label: 'General bulanan' }, { id: 'bagian', label: 'Per bagian' }, { id: 'calk', label: 'Catatan (CALK)' }];
      el.innerHTML = '<div class="page-head"><div><h2>Laporan keuangan</h2><p>Disusun otomatis sesuai SAK EMKM dari jurnal yang sudah diposting.</p></div></div><div data-tabs></div><div class="card mb" data-filter style="padding:12px 16px"></div><div data-isi></div>';
      const isi = el.querySelector('[data-isi]'), fil = el.querySelector('[data-filter]');
      const buka = (t) => { sl.tab = t; R.ubahQuery({ tab: t }); R.tabs(el.querySelector('[data-tabs]'), TABS, t, buka); filter(); muat(); };
      const AKT = { lr: 1, neraca: 1, ak: 1, modal: 1 };
      function filter() {
        const t = sl.tab;
        sl.th = sl.th || +R.hariIni().slice(0, 4);
        if (AKT[t]) {
          const tahunan = sl.mode === 'tahunan' && t !== 'modal';
          const ini = +R.hariIni().slice(0, 4);
          fil.innerHTML = '<div class="row wrap between">' + (t !== 'modal' ? '<div data-mode></div>' : '') +
            (tahunan ? '<div class="row" style="gap:8px"><label class="lbl-f">Tahun</label><select class="inp sm" data-th style="width:auto">' + Array.from({ length: 8 }, (_, i) => ini - 6 + i).map((y) => '<option ' + (y === sl.th ? 'selected' : '') + '>' + y + '</option>').join('') + '</select></div>'
              : t === 'neraca' ? '<div class="row wrap" style="gap:8px"><label class="lbl-f">Posisi per</label><input type="date" class="inp sm" data-tn value="' + (sl.tglNeraca = sl.tglNeraca || R.hariIni()) + '" style="width:auto"><div class="chips">' + [['Hari ini', R.hariIni()], ['Akhir bulan lalu', R.akhirBulan(R.tambahBulan(R.hariIni().slice(0, 7), -1))], ['Akhir tahun lalu', (ini - 1) + '-12-31']].map((x) => '<button class="chip" data-tg="' + x[1] + '">' + x[0] + '</button>').join('') + '</div></div>'
              : '<div data-per></div>') +
            (t === 'lr' || t === 'neraca' ? '<label class="check small"><input type="checkbox" data-semua ' + (sl.semua ? 'checked' : '') + '> Tampilkan akun bernilai 0</label>' : '') + '</div>';
          const md = fil.querySelector('[data-mode]');
          if (md) R.seg(md, [{ v: 'periode', l: 'Per periode' }, { v: 'tahunan', l: 'Tahunan (Jan–Des)' }], sl.mode, (v) => { sl.mode = v; filter(); muat(); });
          const th = fil.querySelector('[data-th]'); if (th) th.onchange = (e) => { sl.th = +e.target.value; muat(); };
          const tn = fil.querySelector('[data-tn]'); if (tn) tn.onchange = (e) => { if (e.target.value) { sl.tglNeraca = e.target.value; muat(); } };
          R.on(fil, 'click', '[data-tg]', (e, b) => { sl.tglNeraca = b.dataset.tg; fil.querySelector('[data-tn]').value = sl.tglNeraca; muat(); });
          const pr = fil.querySelector('[data-per]'); if (pr) R.periode(pr, { nilai: sl.per, preset: ['bulan', 'bulanlalu', '6bulan', 'tahun', 'kustom'], ubah: (v) => { sl.per = v; muat(); } });
          const sm = fil.querySelector('[data-semua]'); if (sm) sm.onchange = (e) => { sl.semua = e.target.checked; muat(); };
        } else if (t === 'rekap') {
          sl.rekapTh = sl.rekapTh || +R.hariIni().slice(0, 4);
          const ini = +R.hariIni().slice(0, 4);
          fil.innerHTML = '<div class="row wrap"><div data-m></div><select class="inp sm" data-th style="width:auto">' + Array.from({ length: 11 }, (_, i) => ini - 5 + i).map((y) => '<option ' + (y === sl.rekapTh ? 'selected' : '') + '>' + y + '</option>').join('') + '</select></div>';
          R.seg(fil.querySelector('[data-m]'), [{ v: '12bulan', l: 'Per bulan (Jan–Des)' }, { v: '5tahun', l: 'Per tahun (5 tahun)' }], sl.rekapMode, (v) => { sl.rekapMode = v; muat(); });
          fil.querySelector('[data-th]').onchange = (e) => { sl.rekapTh = +e.target.value; muat(); };
        } else if (t === 'general') {
          sl.gb = sl.gb || R.tambahBulan(R.hariIni().slice(0, 7), -1);
          fil.innerHTML = '<div class="row wrap"><label class="lbl-f">Bulan</label><input type="month" class="inp sm" data-gb value="' + sl.gb + '" style="width:auto"><span class="small muted">Paket lengkap 1 bulan: laba rugi, neraca, arus kas, perubahan ekuitas, penjualan, pengeluaran, gaji, aset, pajak.</span></div>';
          fil.querySelector('[data-gb]').onchange = (e) => { if (e.target.value) { sl.gb = e.target.value; muat(); } };
        } else {
          fil.innerHTML = '<div class="row wrap between">' + (t === 'bagian' ? '<select class="inp sm" data-bg style="width:auto">' + [['pengeluaran', 'Pengeluaran'], ['pemasukan', 'Pemasukan'], ['kas', 'Kas & bank'], ['channel', 'Penjualan per channel'], ['gaji', 'Gaji'], ['karyawan', 'Data karyawan'], ['aset', 'Aset tetap'], ['pajak', 'Pajak'], ['piutang', 'Piutang'], ['utang', 'Utang'], ['jurnal', 'Jurnal umum']].map((x) => '<option value="' + x[0] + '" ' + (x[0] === sl.bagian ? 'selected' : '') + '>' + x[1] + '</option>').join('') + '</select>' : '') + '<div data-per></div></div>';
          R.periode(fil.querySelector('[data-per]'), { nilai: sl.per, preset: ['hari', 'minggu', 'bulan', 'bulanlalu', '6bulan', 'tahun', '5tahun', 'kustom'], ubah: (v) => { sl.per = v; muat(); } });
          const bg = fil.querySelector('[data-bg]'); if (bg) bg.onchange = (e) => { sl.bagian = e.target.value; muat(); };
        }
      }
      function muat() {
        isi.innerHTML = '<div class="card">' + R.loaderMini('Menyusun laporan') + '</div>';
        const t = sl.tab, P = { dari: sl.per.dari, sampai: sl.per.sampai };
        const jalan = (action, data, fn) => R.api.swr(action, data, (d) => { if (R.masihDi(nav) && sl.tab === t) fn(d); }, { simpan: true }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, isi, muat); });
        if (AKT[t]) {
          const q = sl.mode === 'tahunan' && t !== 'modal' ? { jenis: t, mode: 'tahunan', tahun: sl.th, semua: sl.semua } : t === 'neraca' ? { jenis: t, tanggal: sl.tglNeraca, semua: sl.semua } : Object.assign({ jenis: t, semua: sl.semua }, P);
          jalan('laporan.akuntan', q, akuntan);
        }
        else if (t === 'rekap') jalan('laporan.rekap', { mode: sl.rekapMode, tahun: sl.rekapTh }, rekap);
        else if (t === 'general') jalan('laporan.generalBulanan', { periode: sl.gb }, general);
        else if (t === 'bagian') jalan('laporan.bagian', Object.assign({ bagian: sl.bagian }, P), bagian);
        else if (t === 'calk') jalan('laporan.calk', P, calk);
      }
      function kepala(judul, sub2, extra) { return '<div class="card-head"><div><h3 class="sec">' + esc(judul) + '</h3><div class="sec-sub">' + esc(sub2) + '</div></div>' + (extra || '') + tombolEkspor + '</div>'; }
      function pasangEkspor(pdf, xls) { isi.querySelector('[data-pdf]').onclick = (e) => { const b = e.currentTarget; b.classList.add('busy'); Promise.resolve(pdf()).catch(R.galat).finally(() => b.classList.remove('busy')); }; isi.querySelector('[data-xls]').onclick = (e) => { const b = e.currentTarget; b.classList.add('busy'); Promise.resolve(xls()).catch(R.galat).finally(() => b.classList.remove('busy')); }; }

      function akuntan(d) {
        const status = d.jenis === 'neraca' ? (d.seimbang ? '<span class="badge g">' + R.ic('check', 's16') + ' Neraca seimbang</span>' : '<span class="badge r">Tidak seimbang · periksa saldo awal</span>')
          : d.jenis === 'ak' ? (d.cocok ? '<span class="badge g">' + R.ic('check', 's16') + ' Saldo kas cocok dengan neraca</span>' : '<span class="badge a">Saldo kas berbeda dari neraca · periksa saldo awal kas</span>')
          : d.jenis === 'modal' ? (d.cocok ? '<span class="badge g">' + R.ic('check', 's16') + ' Sama dengan ekuitas di neraca</span>' : '<span class="badge a">Selisih dengan neraca</span>') : '';
        const bisaBB = R.peran() === R.PERAN.O || R.peran() === R.PERAN.A;
        isi.innerHTML = '<div class="row wrap between mb">' + '<div class="row wrap" style="gap:8px">' + status + (bisaBB && (d.jenis === 'lr' || d.jenis === 'neraca') ? '<span class="xs muted">Ketuk baris akun untuk melihat buku besarnya.</span>' : '') + '</div>' + tombolEkspor + '</div>' +
          '<div class="doc-prev">' + R.akt.html(d, { klikAkun: bisaBB }) + '</div>';
        if (bisaBB) R.on(isi, 'click', '[data-akun]', (e, b) => R.keBukuBesar(b.dataset.akun, d.jenis === 'lr' && sl.mode !== 'tahunan' ? sl.per : null));
        const fn = namaFile(NAMA_LAP[d.jenis], d.mode === 'tahunan' ? 'Tahunan ' + sl.th : d.jenis === 'neraca' ? sl.tglNeraca : sl.per.label);
        pasangEkspor(() => R.akt.pdf(d, fn), () => R.akt.xlsx(d, fn));
      }
      function rekap(d) {
        const M = [['omzet', 'Omzet'], ['hpp', 'HPP'], ['laba_kotor', 'Laba kotor'], ['pengeluaran', 'Pengeluaran (termasuk HPP)'], ['laba_bersih', 'Laba bersih'], ['margin', 'Margin %'], ['qty', 'Qty terjual']];
        isi.innerHTML = '<div class="card">' + kepala(d.mode === '12bulan' ? 'Omzet & laba bersih per bulan · ' + d.tahun : 'Omzet & laba bersih per tahun · ' + (d.tahun - 4) + '–' + d.tahun, 'Angka di atas batang hijau = laba bersih (dalam Rupiah, jt = juta)') + '<p class="chart-cap">Total omzet <b>' + R.rp(d.total.omzet) + '</b>, laba bersih <b>' + R.rp(d.total.laba_bersih) + '</b>, margin ' + R.persen(d.total.margin) + '.</p><div class="chart-box lg"><canvas data-g></canvas></div></div>' +
          '<div class="card p0 mt"><div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Uraian</th>' + d.kolom.map((k) => '<th class="n">' + esc(k.label) + '</th>').join('') + '<th class="n">Total</th></tr></thead><tbody>' +
          M.map((m) => '<tr><td><b>' + m[1] + '</b></td>' + d.kolom.map((k) => '<td class="n ' + (m[0] === 'laba_bersih' ? (k[m[0]] < 0 ? 'neg' : 'pos') : '') + '">' + (m[0] === 'margin' ? R.persen(k.margin) : m[0] === 'qty' ? R.angka(k.qty) : R.rpK(k[m[0]])) + '</td>').join('') + '<td class="n"><b>' + (m[0] === 'margin' ? R.persen(d.total.margin) : m[0] === 'qty' ? R.angka(d.total.qty) : R.rp(d.total[m[0]])) + '</b></td></tr>').join('') + '</tbody></table></div></div>';
        R.grafik(isi.querySelector('[data-g]'), { type: 'bar', data: { labels: d.kolom.map((k) => k.label), datasets: [
          { label: 'Omzet', data: d.kolom.map((k) => k.omzet), backgroundColor: '#FB923C', hoverBackgroundColor: '#F97316', maxBarThickness: 26 },
          { label: 'Laba bersih', data: d.kolom.map((k) => k.laba_bersih), backgroundColor: '#16A34A', maxBarThickness: 26 }] }, labelNilai: [1], options: { datasets: { bar: { categoryPercentage: 0.7, barPercentage: 0.9 } } } }).catch(() => {});
        const judul = d.mode === '12bulan' ? 'Rekap Bulanan ' + d.tahun : 'Rekap 5 Tahun ' + (d.tahun - 4) + '-' + d.tahun;
        pasangEkspor(() => R.pdf.laporan({ judul: judul.toUpperCase(), sub: R.boot.usaha.nama_usaha, file: namaFile('Rekap', d.tahun), orientasi: d.mode === '12bulan' ? 'l' : 'p', bagian: [{ head: [['Uraian'].concat(d.kolom.map((k) => k.label)).concat(['Total'])], body: M.map((m) => [m[1]].concat(d.kolom.map((k) => m[0] === 'margin' ? R.persen(k.margin) : m[0] === 'qty' ? R.angka(k.qty) : R.angka(k[m[0]]))).concat([m[0] === 'margin' ? R.persen(d.total.margin) : m[0] === 'qty' ? R.angka(d.total.qty) : R.angka(d.total[m[0]])])), angka: d.kolom.map((_, i) => i + 1).concat([d.kolom.length + 1]) }] }),
          () => R.xlsx.unduh(namaFile('Rekap', d.tahun), [{ nama: judul, aoa: [['Uraian'].concat(d.kolom.map((k) => k.label)).concat(['Total'])].concat(M.map((m) => [m[1]].concat(d.kolom.map((k) => k[m[0]])).concat([d.total[m[0]]]))) }]));
      }
      function general(d) {
        const r = d.ringkas, kp = d.kop, A = d.akuntan;
        const sec = (j, h) => '<h4 class="gb-sec">' + esc(j) + '</h4>' + h;
        const mini = (rows, cols) => '<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th class="no">No</th>' + cols.map((c) => '<th class="' + (c[2] ? 'n' : '') + '">' + c[1] + '</th>').join('') + '</tr></thead><tbody>' + (rows.length ? rows.map((x, i) => '<tr><td class="no">' + (i + 1) + '</td>' + cols.map((c) => '<td class="' + (c[2] ? 'n' : '') + '">' + (c[2] === 'rp' ? R.rp(x[c[0]]) : c[2] === 'p' ? R.persen(x[c[0]]) : c[2] === 'a' ? R.angka(x[c[0]]) : esc(x[c[0]])) + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + (cols.length + 1) + '" class="muted center">Tidak ada data</td></tr>') + '</tbody></table></div>';
        isi.innerHTML = '<div class="row between mb"><div class="small muted">' + (d.berjalan ? 'Bulan berjalan — data sampai ' + R.tglP(d.sampai) : 'Bulan penuh') + (d.terkunci ? ' · <span class="badge g">periode terkunci</span>' : ' · <span class="badge a">periode belum dikunci</span>') + '</div>' + tombolEkspor + '</div>' +
          '<div class="doc-prev">' + R.akt.html(A.lr, { ttd: false }) + '<div class="mt-l"></div>' + R.akt.html(A.neraca, { ttd: false }) + '<div class="mt-l"></div>' + R.akt.html(A.ak, { ttd: false }) + '<div class="mt-l"></div>' + R.akt.html(A.modal) +
          '<div class="lk-kertas mt-l"><div class="lk-judul">LAMPIRAN · ' + esc(d.label.toUpperCase()) + '</div><div class="lk-per">Informasi pendukung laporan keuangan</div>' +
          (d.sorot.length ? sec('Sorotan', '<ul class="small" style="margin:0;padding-left:18px;line-height:1.8">' + d.sorot.map((s2) => '<li>' + esc(s2) + '</li>').join('') + '</ul>') : '') +
          sec('A. Penjualan per channel', mini(d.penjualan.channel.filter((c) => c.omzet || c.rts), [['nama', 'Channel'], ['pesanan', 'Pesanan', 'a'], ['qty', 'Qty', 'a'], ['omzet', 'Omzet', 'rp'], ['potongan', 'Potongan', 'rp'], ['laba_kotor', 'Laba kotor', 'rp'], ['rts_rate', 'RTS', 'p']])) +
          sec('B. Produk terlaris', mini(d.penjualan.produk, [['sku', 'SKU'], ['nama', 'Produk'], ['qty', 'Qty', 'a'], ['omzet', 'Omzet', 'rp'], ['laba', 'Laba kotor', 'rp']])) +
          sec('C. Pengeluaran per kategori', mini(d.pengeluaran.baris, [['kategori', 'Kategori'], ['kelompok', 'Kelompok'], ['jumlah', 'Transaksi', 'a'], ['nilai', 'Nilai', 'rp'], ['persen', '%', 'p']])) +
          sec('D. Gaji, aset, pajak & posisi', '<dl class="kv">' + [['Gaji dibayar', d.gaji ? R.rp(d.gaji.total_bersih) + ' · ' + d.gaji.jumlah + ' orang (' + d.gaji.status + ')' : 'belum diproses'], ['Aset tetap aktif', d.aset.jumlah + ' aset · nilai buku ' + R.rp(d.aset.nilai_buku)], ['PPh Final bulan ini', d.pajak ? R.rp(d.pajak.pph_final) + ' · ' + d.pajak.status : '–'], ['Piutang / utang aktif', R.rp(d.piutangUtang.piutang) + ' / ' + R.rp(d.piutangUtang.utang)], ['Dana marketplace tertahan', R.rp(d.dana.reduce((s2, x) => s2 + Math.max(0, x.saldo), 0))], ['Kas & bank akhir bulan', R.rp(r.kas_akhir)]].map((x) => '<dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl>') + '</div></div>';
        void kp;
        const lampiran = [
          { judul: 'A. Penjualan per channel', head: [['No', 'Channel', 'Pesanan', 'Qty', 'Omzet', 'Potongan', 'Laba kotor', 'RTS']], body: d.penjualan.channel.filter((c) => c.omzet || c.rts).map((c, i) => [i + 1, c.nama, R.angka(c.pesanan), R.angka(c.qty), R.rp(c.omzet), R.rp(c.potongan), R.rp(c.laba_kotor), R.persen(c.rts_rate)]), angka: [2, 3, 4, 5, 6, 7] },
          { judul: 'B. Produk terlaris', head: [['No', 'SKU', 'Produk', 'Qty', 'Omzet', 'Laba kotor']], body: d.penjualan.produk.map((p, i) => [i + 1, p.sku, p.nama, R.angka(p.qty), R.rp(p.omzet), R.rp(p.laba)]), angka: [3, 4, 5] },
          { judul: 'C. Pengeluaran per kategori', head: [['No', 'Kategori', 'Kelompok', 'Transaksi', 'Nilai', '%']], body: d.pengeluaran.baris.map((x, i) => [i + 1, x.kategori, x.kelompok, R.angka(x.jumlah), R.rp(x.nilai), R.persen(x.persen)]), angka: [3, 4, 5] },
          { judul: 'D. Gaji, aset, pajak & posisi', head: [['Uraian', 'Nilai']], body: [['Gaji dibayar', d.gaji ? R.rp(d.gaji.total_bersih) + ' (' + d.gaji.jumlah + ' orang)' : 'belum diproses'], ['Nilai buku aset tetap', R.rp(d.aset.nilai_buku)], ['PPh Final', d.pajak ? R.rp(d.pajak.pph_final) + ' · ' + d.pajak.status : '–'], ['Piutang aktif', R.rp(d.piutangUtang.piutang)], ['Utang aktif', R.rp(d.piutangUtang.utang)], ['Kas & bank akhir', R.rp(r.kas_akhir)]], angka: [1] }];
        const fn = namaFile('Laporan Keuangan Bulanan', d.label);
        pasangEkspor(async () => { await R.akt.pdf([A.lr, A.neraca, A.ak, A.modal], fn); await R.pdf.laporan({ judul: 'LAMPIRAN LAPORAN KEUANGAN', sub: d.label, file: fn + ' - Lampiran', bagian: (d.sorot.length ? [{ judul: 'Sorotan', head: [['Catatan']], body: d.sorot.map((s2) => [s2]) }] : []).concat(lampiran) }); },
          () => R.akt.xlsx([A.lr, A.neraca, A.ak, A.modal], fn, [
            { nama: 'Penjualan per Channel', baris: d.penjualan.channel.map((c) => ({ Channel: c.nama, Pesanan: c.pesanan, Qty: c.qty, Omzet: c.omzet, Potongan: c.potongan, 'Dana Diterima': c.dana, HPP: c.hpp, 'Laba Kotor': c.laba_kotor, RTS: c.rts, 'RTS %': c.rts_rate })) },
            { nama: 'Produk Terlaris', baris: d.penjualan.produk.map((p, i) => ({ No: i + 1, SKU: p.sku, Produk: p.nama, Qty: p.qty, Omzet: p.omzet, HPP: p.hpp, 'Laba Kotor': p.laba })) },
            { nama: 'Pengeluaran', baris: d.pengeluaran.baris.map((x, i) => ({ No: i + 1, Kategori: x.kategori, Kelompok: x.kelompok, Akun: x.akun, Transaksi: x.jumlah, Nilai: x.nilai, Persen: x.persen })) }]));
      }
      function bagian(d) {
        isi.innerHTML = d.tabel.map((t, i) => '<div class="card p0 ' + (i ? 'mt' : '') + '"><div class="card-head"><div><h3 class="sec">' + esc(t.judul) + '</h3><div class="sec-sub">' + esc(d.periode.label) + (t.catatan ? ' · ' + esc(t.catatan) : '') + '</div></div>' + (i === 0 ? tombolEkspor : '') + '</div><div data-t="' + i + '"></div></div>').join('');
        d.tabel.forEach((t, i) => R.tabel(isi.querySelector('[data-t="' + i + '"]'), { baris: t.baris, kolom: t.kolom.map((c, j) => Object.assign({ lead: j === 0 }, c)), total: t.total && Object.keys(t.total).length ? t.total : null, ringkas: true }));
        const fmt = (v, tp) => tp === 'rp' ? R.rp(v) : tp === 'angka' ? R.angka(v) : tp === 'persen' ? R.persen(v) : tp === 'tgl' ? (v ? R.tgl(v) : '') : String(v === undefined || v === null ? '' : v);
        pasangEkspor(() => R.pdf.laporan({ judul: 'LAPORAN ' + d.tabel[0].judul.toUpperCase(), sub: 'Periode ' + d.periode.label, file: namaFile('Laporan ' + d.bagian, d.periode.label), orientasi: d.tabel.some((t) => t.kolom.length > 6) ? 'l' : 'p',
          bagian: d.tabel.map((t, i) => ({ judul: i ? t.judul : '', head: [t.kolom.map((c) => c.label)], body: t.baris.slice(0, 3000).map((r) => t.kolom.map((c) => fmt(r[c.k], c.tipe))), angka: t.kolom.map((c, j) => (c.tipe === 'rp' || c.tipe === 'angka' || c.tipe === 'persen') ? j : -1).filter((j) => j >= 0), foot: t.total && Object.keys(t.total).length ? [t.kolom.map((c, j) => j === 0 ? 'Total' : t.total[c.k] !== undefined ? fmt(t.total[c.k], c.tipe) : '')] : undefined })) }),
          () => R.xlsx.unduh(namaFile('Laporan ' + d.bagian, d.periode.label), d.tabel.map((t) => ({ nama: t.judul, baris: t.baris.map((r) => { const o = {}; t.kolom.forEach((c) => { o[c.label] = r[c.k] === undefined ? '' : r[c.k]; }); return o; }) }))));
      }
      function calk(d) {
        const daftar = (j, rows) => rows.length ? '<h4 style="margin:18px 0 6px">' + esc(j) + '</h4><table class="tbl compact"><tbody>' + rows.map((x) => '<tr><td>' + esc(x.no) + ' · ' + esc(x.nama) + '</td><td class="n">' + R.rp(x.n) + '</td></tr>').join('') + '</tbody></table>' : '';
        isi.innerHTML = '<div class="card">' + kepala('Catatan atas Laporan Keuangan', d.periode.label) + '<div class="help">' +
          '<h4>1. Informasi umum</h4><p>' + esc(d.umum.nama) + ' adalah usaha berbentuk ' + esc(d.umum.bentuk) + (d.umum.alamat ? ' beralamat di ' + esc(d.umum.alamat) : '') + '. Kegiatan usaha: ' + esc(d.umum.bidang) + (d.umum.npwp ? ' NPWP ' + esc(d.umum.npwp) + '.' : '') + '</p>' +
          '<h4>2. Kebijakan akuntansi</h4><ul>' + d.kebijakan.map((k) => '<li>' + esc(k) + '</li>').join('') + '</ul>' +
          '<h4>3. Rincian pos</h4>' + daftar('Kas dan setara kas', d.kas) + daftar('Piutang', d.piutang) + daftar('Persediaan', d.persediaan) + daftar('Liabilitas', d.utang) +
          (d.aset.length ? '<h4 style="margin:18px 0 6px">Aset tetap</h4><table class="tbl compact"><thead><tr><th>Aset</th><th>Jenis</th><th class="n">Harga</th><th class="n">Akumulasi</th><th class="n">Nilai buku</th></tr></thead><tbody>' + d.aset.map((a) => '<tr><td>' + esc(a.nama) + '</td><td>' + esc(a.jenis) + '</td><td class="n">' + R.rp(a.harga) + '</td><td class="n">' + R.rp(a.akumulasi) + '</td><td class="n">' + R.rp(a.nilai_buku) + '</td></tr>').join('') + '</tbody></table>' : '') +
          (d.nonKas.length ? '<h4>4. Transaksi investasi & pendanaan tanpa kas</h4><ul>' + d.nonKas.map((n) => '<li>' + R.tgl(n.tanggal) + ' · ' + esc(n.no_bukti) + ' · ' + esc(n.deskripsi) + ' — ' + R.rp(n.nilai) + '</li>').join('') + '</ul>' : '') +
          (d.catatan ? '<h4>Catatan lain</h4><p>' + esc(d.catatan) + '</p>' : '') + '</div></div>';
        pasangEkspor(() => R.pdf.laporan({ judul: 'CATATAN ATAS LAPORAN KEUANGAN', sub: 'Periode ' + d.periode.label, file: namaFile('CALK', d.periode.label), bagian: [
          { judul: '1. Informasi umum', head: [['Uraian']], body: [[d.umum.nama + ' — ' + d.umum.bentuk + '. ' + d.umum.bidang]] },
          { judul: '2. Kebijakan akuntansi', head: [['Kebijakan']], body: d.kebijakan.map((k) => [k]) },
          { judul: '3. Rincian pos neraca', head: [['Akun', 'Saldo']], body: d.kas.concat(d.piutang, d.persediaan, d.utang).map((x) => [x.no + ' ' + x.nama, R.rp(x.n)]), angka: [1] }].concat(d.aset.length ? [{ judul: 'Aset tetap', head: [['Aset', 'Harga', 'Akumulasi', 'Nilai buku']], body: d.aset.map((a) => [a.nama, R.rp(a.harga), R.rp(a.akumulasi), R.rp(a.nilai_buku)]), angka: [1, 2, 3] }] : []) }),
          () => R.xlsx.unduh(namaFile('CALK', d.periode.label), [{ nama: 'Kebijakan', baris: d.kebijakan.map((k) => ({ Kebijakan: k })) }, { nama: 'Rincian Pos', baris: d.kas.concat(d.piutang, d.persediaan, d.utang).map((x) => ({ 'No. Akun': x.no, Akun: x.nama, Saldo: x.n })) }, { nama: 'Aset Tetap', baris: d.aset }]));
      }
      buka(sl.tab);
    }
  };

  // ============================================================
  // LAPORAN PENJUALAN
  // ============================================================
  const sp = { per: null, ch: '', grup: '' };
  R.halaman['laporan-penjualan'] = {
    judul: 'Laporan Penjualan', roles: R.PERAN.OAV,
    render(el, q, sub, nav) {
      sp.per = sp.per || R.rentang('bulan');
      const chs = (R.boot.channel || []);
      el.innerHTML = '<div class="page-head"><div><h2>Laporan penjualan</h2><p>Omzet, potongan marketplace, laba kotor, dan RTS per channel & produk.</p></div>' + tombolEkspor + '</div>' +
        '<div class="card mb" style="padding:12px 16px"><div class="row wrap between"><div data-per></div><select class="inp sm" data-gr style="width:auto"><option value="">Kelompok otomatis</option><option value="hari">Per hari</option><option value="minggu">Per minggu</option><option value="bulan">Per bulan</option></select></div><div class="chips scroll mt" style="margin-top:10px"><button class="chip ' + (!sp.ch ? 'on' : '') + '" data-c="">Semua channel</button>' + chs.map((c) => '<button class="chip ' + (sp.ch === c.id ? 'on' : '') + '" data-c="' + c.id + '">' + R.chLogo(c.id, 18) + esc(c.nama) + '</button>').join('') + '</div></div><div data-isi>' + R.kerangka(4, 'kartu') + '</div>';
      R.periode(el.querySelector('[data-per]'), { nilai: sp.per, preset: ['7hari', 'bulan', 'bulanlalu', '6bulan', 'tahun', '5tahun', 'kustom'], ubah: (v) => { sp.per = v; muat(); } });
      el.querySelector('[data-gr]').value = sp.grup; el.querySelector('[data-gr]').onchange = (e) => { sp.grup = e.target.value; muat(); };
      R.on(el, 'click', '[data-c]', (e, b) => { sp.ch = b.dataset.c; R.$$('[data-c]', el).forEach((x) => x.classList.toggle('on', x === b)); muat(); });
      const isi = el.querySelector('[data-isi]');
      let data = null;
      function gambar(d) {
        data = d; const t = d.total;
        isi.innerHTML = '<div class="grid g4 keep2">' + [['Omzet', R.rp(t.omzet), R.delta(t.omzet, d.omzet_b), 'hero'], ['Pesanan · Qty', R.angka(t.pesanan) + ' · ' + R.angka(t.qty), 'AOV ' + R.rpK(t.aov)], ['Laba kotor', R.rp(t.laba_kotor), 'margin ' + R.persen(t.margin)], ['RTS', R.persen(t.rts_rate), R.angka(t.rts) + ' pesanan · ongkir ' + R.rpK(t.ongkir_rts)]]
          .map((x) => '<div class="card kpi ' + (x[3] || '') + '"><div class="lbl">' + x[0] + '</div><div class="val">' + x[1] + '</div><div class="foot">' + x[2] + '</div></div>').join('') + '</div>' +
          '<div class="grid g-2-1 mt"><div class="card"><div class="card-head"><div><h3 class="sec">Omzet per ' + d.grup + ', dirinci per channel</h3><div class="sec-sub">' + esc(d.periode.label) + ' · tinggi batang = total omzet</div></div></div><p class="chart-cap">Total omzet <b>' + R.rp(t.omzet) + '</b> dari ' + R.angka(t.pesanan) + ' pesanan. Channel terbesar: <b>' + esc((d.channel.slice().sort((a, b) => b.omzet - a.omzet)[0] || {}).nama || '–') + '</b>.</p><div class="chart-box"><canvas data-tren></canvas></div></div>' +
          '<div class="card"><div class="card-head"><h3 class="sec">Potongan dari omzet</h3><b class="num">' + R.persen(t.persen_potongan) + '</b></div><dl class="kv">' + [['Diskon/voucher penjual', t.diskon], ['Admin & layanan', t.admin + t.biaya_lain], ['Komisi affiliate', t.affiliate], ['Ongkir ditanggung', t.ongkir], ['Ongkir RTS', t.ongkir_rts], ['HPP barang', t.hpp]].map((x) => '<dt>' + x[0] + '</dt><dd>' + R.rp(x[1]) + '</dd>').join('') + '</dl><hr class="divider"><div class="row between"><b>Dana diterima</b><b class="num">' + R.rp(t.dana - t.ongkir_rts) + '</b></div></div></div>' +
          '<div class="card p0 mt"><div class="card-head"><h3 class="sec">Per channel</h3></div><div data-ch></div></div>' +
          '<div class="card p0 mt"><div class="card-head"><div><h3 class="sec">Produk</h3><div class="sec-sub">' + (d.produkBulanan ? 'Dihitung per bulan penuh' : esc(d.periode.label)) + '</div></div><div class="inp-group"><span class="ic-in">' + R.ic('search', 's16') + '</span><input class="inp sm" data-cp placeholder="Cari produk/SKU" style="width:200px"></div></div><div data-pr></div></div>';
        R.tabel(isi.querySelector('[data-ch]'), { baris: d.channel, ringkas: true, total: { pesanan: t.pesanan, qty: t.qty, omzet: t.omzet, potongan: t.potongan, dana: t.dana, hpp: t.hpp, laba_kotor: t.laba_kotor, rts: t.rts }, kolom: [
          { k: 'nama', label: 'Channel', lead: true, render: (c) => R.chTag(c.id) }, { k: 'pesanan', label: 'Pesanan', tipe: 'angka' }, { k: 'qty', label: 'Qty', tipe: 'angka' }, { k: 'omzet', label: 'Omzet', tipe: 'rp' },
          { k: 'potongan', label: 'Potongan', tipe: 'rp', render: (c) => R.rp(c.potongan) + '<span class="t2">' + R.persen(c.persen_potongan) + '</span>' }, { k: 'dana', label: 'Dana', tipe: 'rp', hideM: true }, { k: 'hpp', label: 'HPP', tipe: 'rp', hideM: true },
          { k: 'laba_kotor', label: 'Laba kotor', tipe: 'rp', render: (c) => '<b class="' + (c.laba_kotor < 0 ? 'neg' : '') + '">' + R.rp(c.laba_kotor) + '</b><span class="t2">' + R.persen(c.margin) + '</span>' },
          { k: 'rts', label: 'RTS', tipe: 'angka', render: (c) => R.angka(c.rts) + '<span class="t2">' + R.persen(c.rts_rate) + '</span>' }, { k: 'batal', label: 'Batal', tipe: 'angka', hideM: true }] });
        const pr = (qq) => R.tabel(isi.querySelector('[data-pr]'), { baris: d.produk.filter((p) => !qq || (p.sku + ' ' + p.nama).toLowerCase().indexOf(qq) >= 0).slice(0, 100), ringkas: true, kosong: 'Belum ada data produk', kolom: [
          { k: 'nama', label: 'Produk', lead: true, render: (p) => '<b>' + esc(p.nama) + '</b><span class="t2">' + esc(p.sku) + '</span>' }, { k: 'qty', label: 'Qty', tipe: 'angka' }, { k: 'omzet', label: 'Omzet', tipe: 'rp' },
          { k: 'hpp', label: 'HPP', tipe: 'rp', hideM: true }, { k: 'laba', label: 'Laba kotor', tipe: 'rp' }, { k: 'margin', label: 'Margin', tipe: 'persen' }, { k: 'qty_rts', label: 'Qty RTS', tipe: 'angka', render: (p) => R.angka(p.qty_rts) + (p.rts_rate > 10 ? ' <span class="badge a">' + R.persen(p.rts_rate) + '</span>' : '') }] });
        isi.querySelector('[data-cp]').oninput = R.tunda((e) => pr(e.target.value.trim().toLowerCase()), 200); pr('');
        const lbl = (x) => d.grup === 'bulan' ? R.BULAN[+x.label.slice(5, 7) - 1].slice(0, 3) + ' ' + x.label.slice(0, 4) : +x.label.slice(8) + ' ' + R.BULAN[+x.label.slice(5, 7) - 1].slice(0, 3);
        const ids = d.channel.filter((c) => c.omzet).map((c) => c.id);
        R.grafik(isi.querySelector('[data-tren]'), { type: 'bar', data: { labels: d.tren.map(lbl), datasets: ids.map((id) => ({ label: R.mCh[id] ? R.mCh[id].nama : id, data: d.tren.map((x) => x.ch[id] || 0), backgroundColor: R.warnaCh(id), borderColor: '#fff', borderWidth: { top: 2 }, borderRadius: 0, maxBarThickness: 26, stack: 's' })) },
          options: { scales: { x: { stacked: true, grid: { display: false }, border: { color: '#E3E6EB' }, ticks: { maxRotation: 0, autoSkipPadding: 14 } }, y: { stacked: true, beginAtZero: true, grid: { color: '#EEF0F3' }, border: { display: false }, title: { display: true, text: 'Rupiah', color: '#8A919E', font: { size: 11 } }, ticks: { maxTicksLimit: 6, callback: (v) => R.rpSumbu(v) } } } } }).catch(() => {});
      }
      function muat() { R.api.swr('laporan.penjualan', { dari: sp.per.dari, sampai: sp.per.sampai, id_channel: sp.ch, grup: sp.grup }, (d) => { if (R.masihDi(nav)) gambar(d); }, { simpan: true }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, isi, muat); }); }
      el.querySelector('[data-pdf]').onclick = () => { if (!data) return; const d = data, t = d.total; R.pdf.laporan({ judul: 'LAPORAN PENJUALAN', sub: 'Periode ' + d.periode.label + (sp.ch ? ' · ' + R.mCh[sp.ch].nama : ''), file: namaFile('Laporan Penjualan', d.periode.label), orientasi: 'l', ringkas: [['Omzet', R.rp(t.omzet)], ['Pesanan', R.angka(t.pesanan)], ['Laba kotor', R.rp(t.laba_kotor)], ['RTS', R.persen(t.rts_rate)]],
        bagian: [{ judul: 'Per channel', head: [['Channel', 'Pesanan', 'Qty', 'Omzet', 'Potongan', 'Dana', 'HPP', 'Laba kotor', 'RTS']], body: d.channel.map((c) => [c.nama, R.angka(c.pesanan), R.angka(c.qty), R.rp(c.omzet), R.rp(c.potongan), R.rp(c.dana), R.rp(c.hpp), R.rp(c.laba_kotor), R.angka(c.rts) + ' (' + R.persen(c.rts_rate) + ')']), angka: [1, 2, 3, 4, 5, 6, 7, 8] },
          { judul: 'Produk', head: [['SKU', 'Produk', 'Qty', 'Omzet', 'HPP', 'Laba kotor', 'Margin', 'Qty RTS']], body: d.produk.map((p) => [p.sku, p.nama, R.angka(p.qty), R.rp(p.omzet), R.rp(p.hpp), R.rp(p.laba), R.persen(p.margin), R.angka(p.qty_rts)]), angka: [2, 3, 4, 5, 6, 7] }] }).catch(R.galat); };
      el.querySelector('[data-xls]').onclick = () => { if (!data) return; const d = data; R.xlsx.unduh(namaFile('Laporan Penjualan', d.periode.label), [
        { nama: 'Per Channel', baris: d.channel.map((c) => ({ Channel: c.nama, Pesanan: c.pesanan, Qty: c.qty, Omzet: c.omzet, Diskon: c.diskon, Admin: c.admin, Affiliate: c.affiliate, Ongkir: c.ongkir, 'Ongkir RTS': c.ongkir_rts, 'Dana Diterima': c.dana, HPP: c.hpp, 'Laba Kotor': c.laba_kotor, RTS: c.rts, 'RTS %': c.rts_rate, Batal: c.batal })) },
        { nama: 'Tren', baris: d.tren.map((x) => Object.assign({ Periode: x.label, Omzet: x.omzet, Qty: x.qty, 'Laba Kotor': x.laba_kotor, RTS: x.rts }, x.ch)) },
        { nama: 'Produk', baris: d.produk.map((p) => ({ SKU: p.sku, Produk: p.nama, Qty: p.qty, Omzet: p.omzet, HPP: p.hpp, 'Laba Kotor': p.laba, 'Margin %': p.margin, 'Qty RTS': p.qty_rts })) }]).catch(R.galat); };
      muat();
    }
  };
})();
/* Ambil lebih dulu laporan yang paling sering dibuka (laba rugi & laporan penjualan bulan ini). */
(function () {
  const R = window.R;
  (R.ambilDulu = R.ambilDulu || []).push({ fn: () => {
    if (!R.boleh(R.PERAN.OAV)) return;
    const p = R.rentang('bulan');
    R.api.swr('laporan.akuntan', Object.assign({ jenis: 'lr', semua: false }, { dari: p.dari, sampai: p.sampai }), () => {}, { simpan: true }).catch(() => {});
    R.api.swr('laporan.penjualan', { dari: p.dari, sampai: p.sampai, id_channel: '', grup: '' }, () => {}, { simpan: true }).catch(() => {});
  } });
})();
