/* ROVELO Finance — Laporan Keuangan (SAK EMKM) & Laporan Penjualan */
(function () {
  const R = window.R;
  const esc = R.esc;
  const sl = { tab: 'lr', per: null, tglNeraca: null, rekapMode: '12bulan', rekapTh: null, gb: null, bagian: 'pengeluaran', rinci: false };

  /** Tabel laporan keuangan (rows {k,label,no,n,p,tampil}). */
  function stmt(baris, kolom, pemb) {
    const ada = pemb !== undefined && pemb !== null;
    return '<div class="tbl-wrap"><table class="stmt"><thead><tr><td></td><td class="n xs muted">' + esc(kolom) + '</td>' + (ada ? '<td class="n xs muted">' + esc(pemb) + '</td><td class="d xs muted">Δ</td>' : '') + '</tr></thead><tbody>' +
      baris.filter((r) => !(r.k === 'a' && !r.n && !r.p && !r.tampil)).map((r) => {
        if (r.k === 'h') return '<tr class="h"><td colspan="' + (ada ? 4 : 2) + '">' + esc(r.label) + '</td></tr>';
        const d = ada && r.p ? (r.n - r.p) / Math.abs(r.p) * 100 : null;
        return '<tr class="' + r.k + '"><td>' + (r.no ? '<span class="no">' + esc(r.no) + '</span>' : '') + esc(r.label) + '</td><td class="n ' + (r.n < 0 && r.k !== 'a' ? 'neg' : '') + '">' + R.rp(r.n) + '</td>' +
          (ada ? '<td class="n faint">' + (r.p === null || r.p === undefined ? '' : R.rp(r.p)) + '</td><td class="d ' + (d === null ? '' : d >= 0 ? 'pos' : 'neg') + '">' + (d === null ? '' : (d >= 0 ? '+' : '') + R.persen(d)) + '</td>' : '') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }
  const aoaStmt = (baris, kolom, pemb) => [['No. Akun', 'Keterangan', kolom].concat(pemb ? [pemb] : [])].concat(baris.filter((r) => !(r.k === 'a' && !r.n && !r.p && !r.tampil)).map((r) => [r.no || '', (r.k === 'a' ? '   ' : '') + r.label, r.k === 'h' ? '' : r.n].concat(pemb ? [r.k === 'h' || r.p === null || r.p === undefined ? '' : r.p] : [])));
  const namaFile = (j, l) => j + ' ' + (R.boot.usaha.nama_usaha || 'ROVELO') + ' ' + l;
  const tombolEkspor = '<div class="actions no-print"><button class="btn sm" data-pdf>' + R.ic('printer', 's16') + ' PDF</button><button class="btn sm" data-xls>' + R.ic('download', 's16') + ' Excel</button></div>';

  R.halaman.laporan = {
    judul: 'Laporan Keuangan', roles: R.PERAN.OAV,
    render(el, q, sub, nav) {
      sl.per = sl.per || R.rentang('bulan');
      if (q.tab) sl.tab = q.tab;
      const TABS = [{ id: 'lr', label: 'Laba rugi' }, { id: 'neraca', label: 'Neraca' }, { id: 'ak', label: 'Arus kas' }, { id: 'modal', label: 'Perubahan ekuitas' }, { id: 'rekap', label: 'Rekap tahunan' }, { id: 'general', label: 'General bulanan' }, { id: 'bagian', label: 'Per bagian' }, { id: 'calk', label: 'Catatan (CALK)' }];
      el.innerHTML = '<div class="page-head"><div><h2>Laporan keuangan</h2><p>Disusun otomatis sesuai SAK EMKM dari jurnal yang sudah diposting.</p></div></div><div data-tabs></div><div class="card mb" data-filter style="padding:12px 16px"></div><div data-isi></div>';
      const isi = el.querySelector('[data-isi]'), fil = el.querySelector('[data-filter]');
      const buka = (t) => { sl.tab = t; R.ubahQuery({ tab: t }); R.tabs(el.querySelector('[data-tabs]'), TABS, t, buka); filter(); muat(); };
      function filter() {
        const t = sl.tab;
        fil.classList.toggle('hidden', t === 'calk' && false);
        if (t === 'neraca') {
          sl.tglNeraca = sl.tglNeraca || R.hariIni();
          fil.innerHTML = '<div class="row wrap"><label class="lbl-f">Posisi per tanggal</label><input type="date" class="inp sm" data-tn value="' + sl.tglNeraca + '" style="width:auto"><div class="chips">' + [['Hari ini', R.hariIni()], ['Akhir bulan lalu', R.akhirBulan(R.tambahBulan(R.hariIni().slice(0, 7), -1))], ['Akhir tahun lalu', (+R.hariIni().slice(0, 4) - 1) + '-12-31']].map((x) => '<button class="chip" data-tg="' + x[1] + '">' + x[0] + '</button>').join('') + '</div></div>';
          fil.querySelector('[data-tn]').onchange = (e) => { sl.tglNeraca = e.target.value; muat(); };
          R.on(fil, 'click', '[data-tg]', (e, b) => { sl.tglNeraca = b.dataset.tg; fil.querySelector('[data-tn]').value = sl.tglNeraca; muat(); });
        } else if (t === 'rekap') {
          sl.rekapTh = sl.rekapTh || +R.hariIni().slice(0, 4);
          const ini = +R.hariIni().slice(0, 4);
          fil.innerHTML = '<div class="row wrap"><div data-m></div><select class="inp sm" data-th style="width:auto">' + Array.from({ length: 11 }, (_, i) => ini - 5 + i).map((y) => '<option ' + (y === sl.rekapTh ? 'selected' : '') + '>' + y + '</option>').join('') + '</select></div>';
          R.seg(fil.querySelector('[data-m]'), [{ v: '12bulan', l: 'Per bulan (Jan–Des)' }, { v: '5tahun', l: 'Per tahun (5 tahun)' }], sl.rekapMode, (v) => { sl.rekapMode = v; muat(); });
          fil.querySelector('[data-th]').onchange = (e) => { sl.rekapTh = +e.target.value; muat(); };
        } else if (t === 'general') {
          sl.gb = sl.gb || R.tambahBulan(R.hariIni().slice(0, 7), -1);
          fil.innerHTML = '<div class="row wrap"><label class="lbl-f">Bulan</label><input type="month" class="inp sm" data-gb value="' + sl.gb + '" style="width:auto"><span class="small muted">Paket lengkap 1 bulan: ringkasan, laba rugi, neraca, arus kas, penjualan, pengeluaran, gaji, aset, pajak.</span></div>';
          fil.querySelector('[data-gb]').onchange = (e) => { if (e.target.value) { sl.gb = e.target.value; muat(); } };
        } else {
          fil.innerHTML = '<div class="row wrap between">' + (t === 'bagian' ? '<select class="inp sm" data-bg style="width:auto">' + [['pengeluaran', 'Pengeluaran'], ['pemasukan', 'Pemasukan'], ['kas', 'Kas & bank'], ['channel', 'Penjualan per channel'], ['gaji', 'Gaji'], ['karyawan', 'Data karyawan'], ['aset', 'Aset tetap'], ['pajak', 'Pajak'], ['piutang', 'Piutang'], ['utang', 'Utang'], ['jurnal', 'Jurnal umum']].map((x) => '<option value="' + x[0] + '" ' + (x[0] === sl.bagian ? 'selected' : '') + '>' + x[1] + '</option>').join('') + '</select>' : '') + '<div data-per></div>' +
            (t === 'ak' ? '<label class="check small"><input type="checkbox" data-rinci ' + (sl.rinci ? 'checked' : '') + '> Tampilkan rincian per transaksi</label>' : '') + '</div>';
          R.periode(fil.querySelector('[data-per]'), { nilai: sl.per, preset: ['hari', 'minggu', 'bulan', 'bulanlalu', '6bulan', 'tahun', '5tahun', 'kustom'], ubah: (v) => { sl.per = v; muat(); } });
          const bg = fil.querySelector('[data-bg]'); if (bg) bg.onchange = (e) => { sl.bagian = e.target.value; muat(); };
          const rc = fil.querySelector('[data-rinci]'); if (rc) rc.onchange = (e) => { sl.rinci = e.target.checked; muat(); };
        }
      }
      function muat() {
        isi.innerHTML = '<div class="card"><div class="sk t"></div>' + '<div class="sk l"></div>'.repeat(10) + '</div>';
        const t = sl.tab, P = { dari: sl.per.dari, sampai: sl.per.sampai };
        const jalan = (action, data, fn) => R.api.swr(action, data, (d) => { if (R.masihDi(nav) && sl.tab === t) fn(d); }, { simpan: true }).catch((e) => { if (R.masihDi(nav)) R.gagalMuat(e, isi, muat); });
        if (t === 'lr') jalan('laporan.labaRugi', P, lr);
        else if (t === 'neraca') jalan('laporan.neraca', { tanggal: sl.tglNeraca }, neraca);
        else if (t === 'ak') jalan('laporan.arusKas', Object.assign({ rinci: sl.rinci }, P), ak);
        else if (t === 'modal') jalan('laporan.perubahanModal', P, modal);
        else if (t === 'rekap') jalan('laporan.rekap', { mode: sl.rekapMode, tahun: sl.rekapTh }, rekap);
        else if (t === 'general') jalan('laporan.generalBulanan', { periode: sl.gb }, general);
        else if (t === 'bagian') jalan('laporan.bagian', Object.assign({ bagian: sl.bagian }, P), bagian);
        else if (t === 'calk') jalan('laporan.calk', P, calk);
      }
      function kepala(judul, sub2, extra) { return '<div class="card-head"><div><h3 class="sec">' + esc(judul) + '</h3><div class="sec-sub">' + esc(sub2) + '</div></div>' + (extra || '') + tombolEkspor + '</div>'; }
      function pasangEkspor(pdf, xls) { isi.querySelector('[data-pdf]').onclick = (e) => { const b = e.currentTarget; b.classList.add('busy'); Promise.resolve(pdf()).catch(R.galat).finally(() => b.classList.remove('busy')); }; isi.querySelector('[data-xls]').onclick = (e) => { const b = e.currentTarget; b.classList.add('busy'); Promise.resolve(xls()).catch(R.galat).finally(() => b.classList.remove('busy')); }; }

      function lr(d) {
        const r = d.ringkas, pb = d.pembanding;
        isi.innerHTML = '<div class="grid g4 keep2 mb">' + [['Pendapatan bersih', r.pendapatan_bersih, d.ringkasPembanding && d.ringkasPembanding.pendapatan_bersih], ['Laba kotor', r.laba_kotor, d.ringkasPembanding && d.ringkasPembanding.laba_kotor], ['Laba usaha', r.laba_usaha, d.ringkasPembanding && d.ringkasPembanding.laba_usaha], ['Laba bersih', r.laba_bersih, d.ringkasPembanding && d.ringkasPembanding.laba_bersih]]
          .map((x, i) => '<div class="card kpi ' + (i === 3 ? 'hero' : '') + '"><div class="lbl">' + x[0] + '</div><div class="val ' + (i < 3 && x[1] < 0 ? 'neg' : '') + '">' + R.rp(x[1]) + '</div><div class="foot">' + R.delta(x[1], x[2]) + '<span>' + (i === 3 ? 'margin ' + R.persen(r.margin) : '') + '</span></div></div>').join('') + '</div>' +
          '<div class="card">' + kepala('Laporan Laba Rugi', d.periode.label + (pb ? ' · dibandingkan ' + pb.label : '')) + stmt(d.baris, d.periode.label, pb ? pb.label : null) + '</div>';
        pasangEkspor(() => R.pdf.laporan({ judul: 'LAPORAN LABA RUGI', sub: 'Periode ' + d.periode.label, file: namaFile('Laba Rugi', d.periode.label), ringkas: [['Pendapatan bersih', R.rp(r.pendapatan_bersih)], ['Laba kotor', R.rp(r.laba_kotor)], ['Laba bersih', R.rp(r.laba_bersih)], ['Margin', R.persen(r.margin)]], bagian: [R.pdf.statement(d.baris, d.periode.label, pb ? pb.label : null)] }),
          () => R.xlsx.unduh(namaFile('Laba Rugi', d.periode.label), [{ nama: 'Laba Rugi', aoa: aoaStmt(d.baris, d.periode.label, pb ? pb.label : null) }]));
      }
      function neraca(d) {
        const r = d.ringkas;
        isi.innerHTML = (d.seimbang ? '' : '<div class="alert r mb">' + R.ic('alert', 's18') + '<span>Neraca tidak seimbang (selisih ' + R.rp(r.selisih) + '). Periksa saldo awal di Pembukuan.</span></div>') +
          '<div class="grid g3 mb">' + [['Total aset', r.total_aset, 'building'], ['Total liabilitas', r.total_liab, 'up'], ['Total ekuitas', r.total_ekuitas, 'user']].map((x) => '<div class="card kpi"><div class="lbl"><span class="ic-wrap">' + R.ic(x[2], 's18') + '</span>' + x[0] + '</div><div class="val">' + R.rp(x[1]) + '</div></div>').join('') + '</div>' +
          '<div class="card">' + kepala('Laporan Posisi Keuangan (Neraca)', d.label + (d.pembanding ? ' · dibandingkan ' + d.pembanding.label : ''), d.seimbang ? '<span class="badge g">' + R.ic('check', 's16') + ' Seimbang</span>' : '<span class="badge r">Tidak seimbang</span>') + stmt(d.baris, d.label.replace('Per ', ''), d.pembanding ? d.pembanding.label.replace('Per ', '') : null) + '</div>';
        pasangEkspor(() => R.pdf.laporan({ judul: 'LAPORAN POSISI KEUANGAN', sub: d.label, file: namaFile('Neraca', d.tanggal), bagian: [R.pdf.statement(d.baris, d.label.replace('Per ', ''), d.pembanding ? d.pembanding.label.replace('Per ', '') : null)] }),
          () => R.xlsx.unduh(namaFile('Neraca', d.tanggal), [{ nama: 'Neraca', aoa: aoaStmt(d.baris, d.label, d.pembanding ? d.pembanding.label : null) }]));
      }
      function ak(d) {
        isi.innerHTML = (d.cocok ? '' : '<div class="alert w mb">' + R.ic('alert', 's18') + '<span>Saldo kas di arus kas berbeda ' + R.rp(d.selisih) + ' dari neraca. Biasanya karena saldo awal kas belum diisi.</span></div>') +
          '<div class="grid g4 keep2 mb">' + [['Kas awal', d.kasAwal], ['Operasi', d.total.Operasi], ['Investasi', d.total.Investasi], ['Pendanaan', d.total.Pendanaan]].map((x, i) => '<div class="card kpi"><div class="lbl">' + x[0] + '</div><div class="val ' + (i && x[1] < 0 ? 'neg' : i ? 'pos' : '') + '">' + R.rp(x[1]) + '</div></div>').join('') + '</div>' +
          '<div class="grid g-2-1"><div class="card">' + kepala('Laporan Arus Kas — metode langsung', d.periode.label, d.cocok ? '<span class="badge g">' + R.ic('check', 's16') + ' Cocok dengan neraca</span>' : '') + stmt(d.baris, d.periode.label) + '</div>' +
          '<div class="card"><h3 class="sec">Saldo per akun kas</h3><table class="tbl compact mt"><thead><tr><th>Akun</th><th class="n">Awal</th><th class="n">Akhir</th></tr></thead><tbody>' + d.perAkun.filter((a) => a.awal || a.akhir).map((a) => '<tr><td>' + esc(a.nama) + '<span class="t2">' + a.no + '</span></td><td class="n">' + R.rp(a.awal) + '</td><td class="n"><b>' + R.rp(a.akhir) + '</b></td></tr>').join('') + '</tbody></table></div></div>' +
          (d.rinci ? '<div class="card p0 mt"><div class="card-head"><div><h3 class="sec">Rincian arus kas per transaksi</h3><p class="sec-sub">Nomor akun, nama akun, kategori, dan aktivitas arus kas tiap penerimaan/pengeluaran.</p></div></div><div data-rinci></div></div>' : '');
        if (d.rinci) R.tabel(isi.querySelector('[data-rinci]'), { baris: d.rinci, ringkas: true, kolom: [{ k: 'tanggal', label: 'Tanggal', tipe: 'tgl' }, { k: 'no_bukti', label: 'No. bukti', lead: true }, { k: 'akun_kas', label: 'Kas/bank' }, { k: 'no_akun', label: 'No. akun' }, { k: 'nama_akun', label: 'Nama akun' }, { k: 'kategori', label: 'Kategori', hideM: true }, { k: 'aktivitas', label: 'Aktivitas' }, { k: 'masuk', label: 'Masuk', tipe: 'rp' }, { k: 'keluar', label: 'Keluar', tipe: 'rp' }], total: { masuk: d.rinci.reduce((s, x) => s + x.masuk, 0), keluar: d.rinci.reduce((s, x) => s + x.keluar, 0) } });
        pasangEkspor(() => R.pdf.laporan({ judul: 'LAPORAN ARUS KAS', sub: 'Metode langsung · Periode ' + d.periode.label, file: namaFile('Arus Kas', d.periode.label), bagian: [R.pdf.statement(d.baris, d.periode.label)].concat(d.rinci ? [{ judul: 'Rincian per transaksi', head: [['Tanggal', 'No. bukti', 'No. akun', 'Nama akun', 'Aktivitas', 'Masuk', 'Keluar']], body: d.rinci.map((x) => [R.tgl(x.tanggal), x.no_bukti, x.no_akun, x.nama_akun, x.aktivitas, x.masuk ? R.rp(x.masuk) : '', x.keluar ? R.rp(x.keluar) : '']), angka: [5, 6] }] : []), orientasi: d.rinci ? 'l' : 'p' }),
          () => R.xlsx.unduh(namaFile('Arus Kas', d.periode.label), [{ nama: 'Arus Kas', aoa: aoaStmt(d.baris, d.periode.label) }].concat(d.rinci ? [{ nama: 'Rincian', baris: d.rinci.map((x) => ({ Tanggal: x.tanggal, 'No. Bukti': x.no_bukti, 'Kas/Bank': x.akun_kas, 'No. Akun': x.no_akun, 'Nama Akun': x.nama_akun, Kategori: x.kategori, Aktivitas: x.aktivitas, Keterangan: x.deskripsi, Masuk: x.masuk, Keluar: x.keluar })) }] : [])));
      }
      function modal(d) {
        isi.innerHTML = '<div class="card">' + kepala('Laporan Perubahan Ekuitas', d.periode.label, d.cocok ? '<span class="badge g">' + R.ic('check', 's16') + ' Sama dengan neraca</span>' : '<span class="badge a">Selisih dengan neraca</span>') +
          '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Keterangan</th><th class="n">Modal</th><th class="n">Saldo laba</th><th class="n">Total ekuitas</th></tr></thead><tbody>' + d.baris.map((r) => '<tr style="' + (r.total_baris ? 'font-weight:800;background:var(--accent-tint)' : '') + '"><td>' + esc(r.label) + '</td><td class="n">' + R.rp(r.modal) + '</td><td class="n">' + R.rp(r.laba) + '</td><td class="n"><b>' + R.rp(r.total) + '</b></td></tr>').join('') + '</tbody></table></div><p class="xs faint mt">Disajikan sebagai informasi tambahan mengikuti format SAK EP.</p></div>';
        pasangEkspor(() => R.pdf.laporan({ judul: 'LAPORAN PERUBAHAN EKUITAS', sub: 'Periode ' + d.periode.label, file: namaFile('Perubahan Ekuitas', d.periode.label), bagian: [{ head: [['Keterangan', 'Modal', 'Saldo laba', 'Total']], body: d.baris.map((r) => [r.label, R.rp(r.modal), R.rp(r.laba), R.rp(r.total)]), angka: [1, 2, 3], gaya: (i) => d.baris[i].total_baris ? { fontStyle: 'bold', fillColor: [255, 241, 230] } : null }] }),
          () => R.xlsx.unduh(namaFile('Perubahan Ekuitas', d.periode.label), [{ nama: 'Perubahan Ekuitas', baris: d.baris.map((r) => ({ Keterangan: r.label, Modal: r.modal, 'Saldo Laba': r.laba, Total: r.total })) }]));
      }
      function rekap(d) {
        const M = [['omzet', 'Omzet'], ['hpp', 'HPP'], ['laba_kotor', 'Laba kotor'], ['pengeluaran', 'Pengeluaran (termasuk HPP)'], ['laba_bersih', 'Laba bersih'], ['margin', 'Margin %'], ['qty', 'Qty terjual']];
        isi.innerHTML = '<div class="card">' + kepala(d.mode === '12bulan' ? 'Rekap bulanan ' + d.tahun : 'Rekap 5 tahun ' + (d.tahun - 4) + '–' + d.tahun, 'Omzet, pengeluaran, dan laba bersih') + '<div class="chart-box lg"><canvas data-g></canvas></div></div>' +
          '<div class="card p0 mt"><div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Uraian</th>' + d.kolom.map((k) => '<th class="n">' + esc(k.label) + '</th>').join('') + '<th class="n">Total</th></tr></thead><tbody>' +
          M.map((m) => '<tr><td><b>' + m[1] + '</b></td>' + d.kolom.map((k) => '<td class="n ' + (m[0] === 'laba_bersih' ? (k[m[0]] < 0 ? 'neg' : 'pos') : '') + '">' + (m[0] === 'margin' ? R.persen(k.margin) : m[0] === 'qty' ? R.angka(k.qty) : R.rpK(k[m[0]])) + '</td>').join('') + '<td class="n"><b>' + (m[0] === 'margin' ? R.persen(d.total.margin) : m[0] === 'qty' ? R.angka(d.total.qty) : R.rp(d.total[m[0]])) + '</b></td></tr>').join('') + '</tbody></table></div></div>';
        R.grafik(isi.querySelector('[data-g]'), { type: 'bar', data: { labels: d.kolom.map((k) => k.label), datasets: [
          { type: 'line', label: 'Laba bersih', data: d.kolom.map((k) => k.laba_bersih), borderColor: '#16A34A', backgroundColor: '#16A34A', tension: .35, borderWidth: 2.2, pointRadius: 3, order: 0 },
          { label: 'Omzet', data: d.kolom.map((k) => k.omzet), backgroundColor: (c) => R.gradien(c.chart.ctx, c.chart.chartArea, '#FB923C', 'D9'), borderRadius: 8, maxBarThickness: 34, order: 1 },
          { label: 'Pengeluaran', data: d.kolom.map((k) => k.pengeluaran), backgroundColor: '#E5E7EB', borderRadius: 8, maxBarThickness: 34, order: 2 }] }, options: { plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } } } }).catch(() => {});
        const judul = d.mode === '12bulan' ? 'Rekap Bulanan ' + d.tahun : 'Rekap 5 Tahun ' + (d.tahun - 4) + '-' + d.tahun;
        pasangEkspor(() => R.pdf.laporan({ judul: judul.toUpperCase(), sub: R.boot.usaha.nama_usaha, file: namaFile('Rekap', d.tahun), orientasi: d.mode === '12bulan' ? 'l' : 'p', bagian: [{ head: [['Uraian'].concat(d.kolom.map((k) => k.label)).concat(['Total'])], body: M.map((m) => [m[1]].concat(d.kolom.map((k) => m[0] === 'margin' ? R.persen(k.margin) : m[0] === 'qty' ? R.angka(k.qty) : R.angka(k[m[0]]))).concat([m[0] === 'margin' ? R.persen(d.total.margin) : m[0] === 'qty' ? R.angka(d.total.qty) : R.angka(d.total[m[0]])])), angka: d.kolom.map((_, i) => i + 1).concat([d.kolom.length + 1]) }] }),
          () => R.xlsx.unduh(namaFile('Rekap', d.tahun), [{ nama: judul, aoa: [['Uraian'].concat(d.kolom.map((k) => k.label)).concat(['Total'])].concat(M.map((m) => [m[1]].concat(d.kolom.map((k) => k[m[0]])).concat([d.total[m[0]]]))) }]));
      }
      function general(d) {
        const r = d.ringkas, kp = d.kop;
        const sec = (j, h) => '<h4 style="margin:22px 0 8px;font-size:14px;letter-spacing:.02em">' + esc(j) + '</h4>' + h;
        const mini = (rows, cols) => '<table class="tbl compact"><thead><tr>' + cols.map((c) => '<th class="' + (c[2] ? 'n' : '') + '">' + c[1] + '</th>').join('') + '</tr></thead><tbody>' + rows.map((x) => '<tr>' + cols.map((c) => '<td class="' + (c[2] ? 'n' : '') + '">' + (c[2] === 'rp' ? R.rp(x[c[0]]) : c[2] === 'p' ? R.persen(x[c[0]]) : c[2] === 'a' ? R.angka(x[c[0]]) : esc(x[c[0]])) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
        isi.innerHTML = '<div class="row between mb"><div class="small muted">' + (d.berjalan ? 'Bulan berjalan — data sampai ' + R.tglP(d.sampai) : 'Bulan penuh') + (d.terkunci ? ' · <span class="badge g">periode terkunci</span>' : ' · <span class="badge a">periode belum dikunci</span>') + '</div>' + tombolEkspor + '</div><div class="doc-prev"><div class="doc-paper">' +
          '<div class="kop">' + (kp.logo ? '<img alt="" src="' + esc(kp.logo) + '">' : '<div class="brand-mark" style="width:56px;height:56px;font-size:22px">R</div>') + '<div><h4>' + esc(kp.nama) + '</h4><small>' + esc([kp.alamat, kp.no_hp, kp.email].filter(Boolean).join(' · ')) + '</small></div></div>' +
          '<h3 style="text-align:center;margin:0">LAPORAN KEUANGAN GENERAL BULANAN</h3><p class="center muted" style="margin:4px 0 18px">' + esc(d.label) + '</p>' +
          '<div class="grid g4 keep2">' + [['Omzet', r.omzet], ['Laba kotor', r.laba_kotor], ['Pengeluaran', r.pengeluaran], ['Laba bersih', r.laba_bersih]].map((x) => '<div class="sum-box"><div class="xs muted">' + x[0] + '</div><b class="num">' + R.rp(x[1]) + '</b></div>').join('') + '</div>' +
          (r.target_omzet ? '<div class="mt"><div class="row between small"><span>Target omzet ' + R.rp(r.target_omzet) + '</span><b>' + R.persen(r.omzet / r.target_omzet * 100) + '</b></div><div class="bar mt" style="margin-top:6px"><i style="width:' + Math.min(100, r.omzet / r.target_omzet * 100) + '%"></i></div></div>' : '') +
          (d.sorot.length ? sec('Sorotan', '<ul class="small" style="margin:0;padding-left:18px;line-height:1.8">' + d.sorot.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>') : '') +
          sec('1. Laba rugi', stmt(d.labaRugi.baris, d.label, d.labaRugi.pembanding ? R.bln(d.labaRugi.pembanding.dari.slice(0, 7)) : null)) +
          sec('2. Neraca', stmt(d.neraca.baris, d.neraca.label.replace('Per ', ''), d.neraca.pembanding ? d.neraca.pembanding.label.replace('Per ', '') : null)) +
          sec('3. Arus kas', stmt(d.arusKas.baris, d.label)) +
          sec('4. Penjualan per channel', mini(d.penjualan.channel.filter((c) => c.omzet || c.rts), [['nama', 'Channel'], ['pesanan', 'Pesanan', 'a'], ['qty', 'Qty', 'a'], ['omzet', 'Omzet', 'rp'], ['potongan', 'Potongan', 'rp'], ['laba_kotor', 'Laba kotor', 'rp'], ['rts_rate', 'RTS', 'p']])) +
          sec('5. Produk terlaris', mini(d.penjualan.produk, [['sku', 'SKU'], ['nama', 'Produk'], ['qty', 'Qty', 'a'], ['omzet', 'Omzet', 'rp'], ['laba', 'Laba kotor', 'rp']])) +
          sec('6. Pengeluaran per kategori', mini(d.pengeluaran.baris, [['kategori', 'Kategori'], ['kelompok', 'Kelompok'], ['jumlah', 'Transaksi', 'a'], ['nilai', 'Nilai', 'rp'], ['persen', '%', 'p']])) +
          sec('7. Gaji, aset, pajak & posisi', '<dl class="kv">' + [['Gaji dibayar', d.gaji ? R.rp(d.gaji.total_bersih) + ' · ' + d.gaji.jumlah + ' orang (' + d.gaji.status + ')' : 'belum diproses'], ['Aset tetap aktif', d.aset.jumlah + ' aset · nilai buku ' + R.rp(d.aset.nilai_buku)], ['PPh Final bulan ini', d.pajak ? R.rp(d.pajak.pph_final) + ' · ' + d.pajak.status : '–'], ['Piutang / utang aktif', R.rp(d.piutangUtang.piutang) + ' / ' + R.rp(d.piutangUtang.utang)], ['Dana marketplace tertahan', R.rp(d.dana.reduce((s, x) => s + Math.max(0, x.saldo), 0))], ['Kas & bank akhir bulan', R.rp(r.kas_akhir)]].map((x) => '<dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl>') +
          '<div class="row between mt-l" style="align-items:flex-end"><span class="xs faint">Disusun otomatis oleh ROVELO Finance</span><div class="center small" style="min-width:180px">Disetujui oleh,<div style="height:52px"></div><b>' + esc(kp.penandatangan) + '</b></div></div></div></div>';
        pasangEkspor(() => R.pdf.laporan({ judul: 'LAPORAN KEUANGAN GENERAL BULANAN', sub: d.label, file: namaFile('Laporan General', d.periode), ringkas: [['Omzet', R.rp(r.omzet)], ['Laba kotor', R.rp(r.laba_kotor)], ['Pengeluaran', R.rp(r.pengeluaran)], ['Laba bersih', R.rp(r.laba_bersih)]], bagian: [
          Object.assign({ judul: 'Sorotan' }, { head: [['Catatan']], body: d.sorot.map((s) => [s]) }),
          Object.assign({ judul: '1. Laba rugi' }, R.pdf.statement(d.labaRugi.baris, d.label)),
          Object.assign({ judul: '2. Neraca' }, R.pdf.statement(d.neraca.baris, d.neraca.label.replace('Per ', ''))),
          Object.assign({ judul: '3. Arus kas' }, R.pdf.statement(d.arusKas.baris, d.label)),
          { judul: '4. Penjualan per channel', head: [['Channel', 'Pesanan', 'Qty', 'Omzet', 'Potongan', 'Laba kotor', 'RTS']], body: d.penjualan.channel.filter((c) => c.omzet || c.rts).map((c) => [c.nama, R.angka(c.pesanan), R.angka(c.qty), R.rp(c.omzet), R.rp(c.potongan), R.rp(c.laba_kotor), R.persen(c.rts_rate)]), angka: [1, 2, 3, 4, 5, 6] },
          { judul: '5. Produk terlaris', head: [['SKU', 'Produk', 'Qty', 'Omzet', 'Laba kotor']], body: d.penjualan.produk.map((p) => [p.sku, p.nama, R.angka(p.qty), R.rp(p.omzet), R.rp(p.laba)]), angka: [2, 3, 4] },
          { judul: '6. Pengeluaran per kategori', head: [['Kategori', 'Kelompok', 'Transaksi', 'Nilai', '%']], body: d.pengeluaran.baris.map((x) => [x.kategori, x.kelompok, R.angka(x.jumlah), R.rp(x.nilai), R.persen(x.persen)]), angka: [2, 3, 4] },
          { judul: '7. Gaji, aset, pajak & posisi', head: [['Uraian', 'Nilai']], body: [['Gaji dibayar', d.gaji ? R.rp(d.gaji.total_bersih) + ' (' + d.gaji.jumlah + ' orang)' : 'belum diproses'], ['Nilai buku aset tetap', R.rp(d.aset.nilai_buku)], ['PPh Final', d.pajak ? R.rp(d.pajak.pph_final) + ' · ' + d.pajak.status : '–'], ['Piutang aktif', R.rp(d.piutangUtang.piutang)], ['Utang aktif', R.rp(d.piutangUtang.utang)], ['Kas & bank akhir', R.rp(r.kas_akhir)]], angka: [1] }] }),
          () => R.xlsx.unduh(namaFile('Laporan General', d.periode), [
            { nama: 'Ringkasan', baris: [{ Uraian: 'Omzet', Nilai: r.omzet }, { Uraian: 'Laba kotor', Nilai: r.laba_kotor }, { Uraian: 'Pengeluaran', Nilai: r.pengeluaran }, { Uraian: 'Laba bersih', Nilai: r.laba_bersih }, { Uraian: 'Qty terjual', Nilai: r.qty }, { Uraian: 'Kas & bank akhir', Nilai: r.kas_akhir }].concat(d.sorot.map((s) => ({ Uraian: 'Sorotan', Nilai: s }))) },
            { nama: 'Laba Rugi', aoa: aoaStmt(d.labaRugi.baris, d.label) }, { nama: 'Neraca', aoa: aoaStmt(d.neraca.baris, d.neraca.label) }, { nama: 'Arus Kas', aoa: aoaStmt(d.arusKas.baris, d.label) },
            { nama: 'Perubahan Ekuitas', baris: d.modal.baris.map((x) => ({ Keterangan: x.label, Modal: x.modal, 'Saldo Laba': x.laba, Total: x.total })) },
            { nama: 'Penjualan per Channel', baris: d.penjualan.channel.map((c) => ({ Channel: c.nama, Pesanan: c.pesanan, Qty: c.qty, Omzet: c.omzet, Potongan: c.potongan, 'Dana Diterima': c.dana, HPP: c.hpp, 'Laba Kotor': c.laba_kotor, RTS: c.rts, 'RTS %': c.rts_rate })) },
            { nama: 'Produk Terlaris', baris: d.penjualan.produk.map((p) => ({ SKU: p.sku, Produk: p.nama, Qty: p.qty, Omzet: p.omzet, HPP: p.hpp, 'Laba Kotor': p.laba })) },
            { nama: 'Pengeluaran', baris: d.pengeluaran.baris.map((x) => ({ Kategori: x.kategori, Kelompok: x.kelompok, Akun: x.akun, Transaksi: x.jumlah, Nilai: x.nilai, Persen: x.persen })) }]));
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
        '<div class="card mb" style="padding:12px 16px"><div class="row wrap between"><div data-per></div><select class="inp sm" data-gr style="width:auto"><option value="">Kelompok otomatis</option><option value="hari">Per hari</option><option value="minggu">Per minggu</option><option value="bulan">Per bulan</option></select></div><div class="chips scroll mt" style="margin-top:10px"><button class="chip ' + (!sp.ch ? 'on' : '') + '" data-c="">Semua channel</button>' + chs.map((c) => '<button class="chip ' + (sp.ch === c.id ? 'on' : '') + '" data-c="' + c.id + '"><span class="sw" style="background:' + esc(c.warna) + '"></span>' + esc(c.nama) + '</button>').join('') + '</div></div><div data-isi>' + R.kerangka(4, 'kartu') + '</div>';
      R.periode(el.querySelector('[data-per]'), { nilai: sp.per, preset: ['7hari', 'bulan', 'bulanlalu', '6bulan', 'tahun', '5tahun', 'kustom'], ubah: (v) => { sp.per = v; muat(); } });
      el.querySelector('[data-gr]').value = sp.grup; el.querySelector('[data-gr]').onchange = (e) => { sp.grup = e.target.value; muat(); };
      R.on(el, 'click', '[data-c]', (e, b) => { sp.ch = b.dataset.c; R.$$('[data-c]', el).forEach((x) => x.classList.toggle('on', x === b)); muat(); });
      const isi = el.querySelector('[data-isi]');
      let data = null;
      function gambar(d) {
        data = d; const t = d.total;
        isi.innerHTML = '<div class="grid g4 keep2">' + [['Omzet', R.rp(t.omzet), R.delta(t.omzet, d.omzet_b), 'hero'], ['Pesanan · Qty', R.angka(t.pesanan) + ' · ' + R.angka(t.qty), 'AOV ' + R.rpK(t.aov)], ['Laba kotor', R.rp(t.laba_kotor), 'margin ' + R.persen(t.margin)], ['RTS', R.persen(t.rts_rate), R.angka(t.rts) + ' pesanan · ongkir ' + R.rpK(t.ongkir_rts)]]
          .map((x) => '<div class="card kpi ' + (x[3] || '') + '"><div class="lbl">' + x[0] + '</div><div class="val">' + x[1] + '</div><div class="foot">' + x[2] + '</div></div>').join('') + '</div>' +
          '<div class="grid g-2-1 mt"><div class="card"><div class="card-head"><div><h3 class="sec">Tren omzet</h3><div class="sec-sub">Per ' + d.grup + ' · ' + esc(d.periode.label) + '</div></div></div><div class="chart-box"><canvas data-tren></canvas></div></div>' +
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
        const lbl = (x) => d.grup === 'bulan' ? R.BULAN[+x.label.slice(5, 7) - 1].slice(0, 3) + ' ' + x.label.slice(2, 4) : +x.label.slice(8) + ' ' + R.BULAN[+x.label.slice(5, 7) - 1].slice(0, 3);
        const ids = d.channel.filter((c) => c.omzet).map((c) => c.id);
        R.grafik(isi.querySelector('[data-tren]'), { type: 'bar', data: { labels: d.tren.map(lbl), datasets: ids.map((id) => ({ label: R.mCh[id] ? R.mCh[id].nama : id, data: d.tren.map((x) => x.ch[id] || 0), backgroundColor: (R.mCh[id] || {}).warna || '#94A3B8', borderRadius: 4, maxBarThickness: 26, stack: 's' })) },
          options: { scales: { x: { stacked: true, grid: { display: false }, border: { display: false } }, y: { stacked: true, grid: { color: '#EEF0F3' }, border: { display: false }, ticks: { callback: (v) => R.rpK(v).replace('Rp', '') } } }, plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } } } }).catch(() => {});
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
