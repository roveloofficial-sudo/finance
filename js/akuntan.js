/* ROVELO Finance — Laporan format akuntan: tampilan layar, PDF (Inconsolata), dan Excel (ExcelJS, Consolas). */
(function () {
  const R = window.R;
  const esc = R.esc;
  const A = (R.akt = {});

  // ---------- angka gaya akuntan ----------
  const titik = (n) => Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  /** 1.234.567 · (1.234.567) · - · kosong untuk null. */
  A.angka = function (v, ribuan) {
    if (v === null || v === undefined || v === '') return '';
    let n = +v; if (ribuan) n = Math.round(n / 1000);
    if (!n) return '-';
    return n < 0 ? '(' + titik(n) + ')' : titik(n);
  };
  /** Versi rata kanan untuk huruf monospace: angka positif diberi spasi agar sejajar dengan ")". */
  const angkaPdf = (v, rb) => { const s = A.angka(v, rb); return s === '' ? '' : /\)$/.test(s) ? s : s + ' '; };

  const usaha = () => (R.boot && R.boot.usaha) || {};
  const pakaiWordmark = () => !usaha().logo_data && /^rovelo$/i.test(String(usaha().nama_usaha || 'ROVELO').trim());

  // ---------- tampilan layar ----------
  /** d: hasil laporan.akuntan {judul, periode, satuan, kolom, baris, catatan, ttd} */
  A.html = function (d, opt) {
    opt = opt || {};
    const u = usaha();
    const kop = '<div class="lk-kop">' + (u.logo_data ? '<img alt="" class="lk-logo" src="' + esc(u.logo_data) + '">' : '') +
      '<div>' + (pakaiWordmark() ? '<img alt="ROVELO" class="lk-word" src="img/rovelo-hitam.png">' : '<div class="lk-nama">' + esc(u.nama_usaha || 'ROVELO') + '</div>') +
      '<div class="lk-info">' + esc([u.alamat, [u.no_hp, u.email].filter(Boolean).join(' · '), u.npwp ? 'NPWP ' + u.npwp : ''].filter(Boolean).join(' · ')) + '</div></div></div>';
    const nk = d.kolom.length, adaKode = d.baris.some((b) => b.kode);
    const sel = (v) => v === null || v === undefined ? '' : A.angka(v) + (v < 0 ? '' : '<i class="gp">)</i>');
    const head = '<tr>' + (adaKode ? '<th class="kd">Kode</th>' : '') + '<th class="ket">Keterangan</th>' + d.kolom.map((k) => '<th class="n' + (k.utama ? ' ut' : '') + '">' + esc(k.label) + '</th>').join('') + '</tr>';
    const body = d.baris.map((b, i) => {
      if (b.t === 'h') return '<tr class="h h' + (b.lvl || 0) + '">' + (adaKode ? '<td class="kd"></td>' : '') + '<td class="ket" colspan="' + (nk + 1) + '"><span style="padding-left:' + (b.lvl || 0) * 14 + 'px">' + esc(b.label) + '</span></td></tr>';
      return '<tr class="' + b.t + (b.kuat ? ' kuat' : '') + (b.jarak ? ' jarak' : '') + (b.kode && opt.klikAkun ? ' klik' : '') + '"' + (b.kode && opt.klikAkun ? ' data-akun="' + esc(b.kode) + '"' : '') + '>' + (adaKode ? '<td class="kd">' + esc(b.kode || '') + '</td>' : '') + '<td class="ket"><span style="padding-left:' + (b.lvl || 0) * 14 + 'px">' + esc(b.label) + '</span></td>' +
        b.v.map((v, j) => '<td class="n' + (d.kolom[j].utama ? ' ut' : '') + (v < 0 ? ' min' : '') + (v === null ? ' kosong' : '') + '">' + sel(v) + '</td>').join('') + '</tr>';
    }).join('');
    const t = d.ttd || {};
    const ttd = '<div class="lk-ttd">' + [['Dibuat oleh', t.dibuat], ['Diperiksa oleh', t.diperiksa], ['Disetujui oleh', t.disetujui]].map((x) => '<div><span>' + x[0] + ',</span><b>' + esc(x[1] || '(....................)') + '</b></div>').join('') + '</div>';
    return '<div class="lk-kertas' + (nk > 4 ? ' lebar' : '') + (adaKode ? '' : ' tanpa-kode') + '">' + kop + '<div class="lk-judul">' + esc(d.judul) + '</div><div class="lk-per">' + esc(d.periode) + '</div><div class="lk-sat">' + esc(d.satuan) + '</div>' +
      '<div class="tbl-wrap lk-wrap"><table class="akt"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      (d.catatan && d.catatan.length ? '<div class="lk-cat">' + d.catatan.map(esc).join('<br>') + '</div>' : '') + (opt.ttd === false ? '' : ttd) + '</div>';
  };

  // ---------- font & logo untuk PDF ----------
  const cacheFont = {};
  async function ambilB64(url) {
    if (cacheFont[url]) return cacheFont[url];
    const r = await fetch(url);
    if (!r.ok) throw new Error('Font laporan tidak ditemukan (' + url + '). Pastikan folder "fonts" ikut diunggah ke GitHub.');
    const buf = new Uint8Array(await r.arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return (cacheFont[url] = btoa(s));
  }
  A.pasangFont = async function (doc, keluarga) {
    const F = keluarga === 'inter' ? [['Inter-Regular.ttf', 'Inter', 'normal'], ['Inter-SemiBold.ttf', 'Inter', 'bold']] : [['Inconsolata-Regular.ttf', 'Inconsolata', 'normal'], ['Inconsolata-Bold.ttf', 'Inconsolata', 'bold']];
    for (const f of F) { const b = await ambilB64('fonts/' + f[0]); doc.addFileToVFS(f[0], b); doc.addFont(f[0], f[1], f[2]); }
    return F[0][1];
  };
  let logoBawaan = null;
  async function logoDefault() {
    if (logoBawaan) return logoBawaan;
    const r = await fetch('img/rovelo-hitam.png'); const bl = await r.blob();
    logoBawaan = await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(bl); });
    return logoBawaan;
  }
  A.ukuranGambar = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => ok({ w: 1, h: 1 }); i.src = src; });

  /** Kop surat resmi. Mengembalikan posisi y setelah kop. */
  A.kopPdf = async function (doc, FONT, judul, periode, satuan) {
    const u = usaha(), W = doc.internal.pageSize.getWidth(), M = 16;
    let x = M, y = 12;
    try {
      if (u.logo_data) {
        const z = await A.ukuranGambar(u.logo_data); const h = 14, w = Math.min(34, h * z.w / z.h);
        doc.addImage(u.logo_data, /png/.test(u.logo_data.slice(0, 30)) ? 'PNG' : 'JPEG', M, y, w, h); x = M + w + 5;
      }
    } catch (e) { /* logo tidak valid → lewati */ }
    let ty = y + 4.5;
    if (pakaiWordmark()) { try { doc.addImage(await logoDefault(), 'PNG', x, y, 38, 38 * 106 / 676); ty = y + 10.5; } catch (e) { ty = y + 4.5; } }
    else { doc.setFont(FONT, 'bold'); doc.setFontSize(14); doc.setTextColor(17, 17, 17); doc.text(String(u.nama_usaha || 'ROVELO'), x, ty); ty += 5; }
    doc.setFont(FONT, 'normal'); doc.setFontSize(8.5); doc.setTextColor(90, 90, 90);
    const info = [u.alamat, u.no_hp, u.email, u.npwp ? 'NPWP ' + u.npwp : ''].filter(Boolean).join(' · ');
    if (info) doc.splitTextToSize(info, W - M - x).slice(0, 3).forEach((t) => { doc.text(t, x, ty); ty += 3.8; });
    const garis = Math.max(26, ty);
    doc.setDrawColor(249, 115, 22); doc.setLineWidth(0.5); doc.line(M, garis, W - M, garis);
    doc.setTextColor(17, 17, 17); doc.setFont(FONT, 'bold'); doc.setFontSize(13); doc.text(judul, W / 2, garis + 8, { align: 'center' });
    doc.setFont(FONT, 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 90);
    if (periode) doc.text(periode, W / 2, garis + 13, { align: 'center' });
    if (satuan) doc.text(satuan, W / 2, garis + 17, { align: 'center' });
    return garis + (satuan ? 21 : 18);
  };
  A.kakiPdf = function (doc, FONT, teks) {
    const n = doc.internal.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const cetak = 'Dicetak ' + R.waktu(new Date(Date.now() + 7 * 3600e3).toISOString()) + ' · ROVELO Finance';
    for (let i = 1; i <= n; i++) {
      doc.setPage(i); doc.setFont(FONT, 'normal'); doc.setFontSize(7.5); doc.setTextColor(140, 140, 140);
      doc.setDrawColor(225); doc.setLineWidth(0.2); doc.line(16, H - 12, W - 16, H - 12);
      doc.text(teks ? teks + ' · ' + cetak : cetak, 16, H - 8);
      doc.text('Halaman ' + i + ' dari ' + n, W - 16, H - 8, { align: 'right' });
    }
  };
  A.ttdPdf = function (doc, FONT, y, t) {
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 16;
    if (y + 24 > H - 13) { doc.addPage(); y = 22; }
    const kol = [['Dibuat oleh,', t.dibuat], ['Diperiksa oleh,', t.diperiksa], ['Disetujui oleh,', t.disetujui]];
    const w = (W - 2 * M) / 3;
    doc.setFont(FONT, 'normal'); doc.setFontSize(9); doc.setTextColor(17, 17, 17);
    kol.forEach((k, i) => {
      const cx = M + w * i + w / 2;
      doc.text(k[0], cx, y + 4, { align: 'center' });
      doc.setDrawColor(60); doc.setLineWidth(0.25); doc.line(cx - 24, y + 18, cx + 24, y + 18);
      doc.setFont(FONT, k[1] ? 'bold' : 'normal'); doc.text(k[1] || '(nama & tanda tangan)', cx, y + 22, { align: 'center' }); doc.setFont(FONT, 'normal');
    });
    return y + 26;
  };

  /** Tulis satu laporan akuntan ke dokumen (halaman baru bila perlu). */
  async function tulisLaporan(doc, FONT, d, pertama) {
    const tahunan = d.kolom.length > 4;
    if (!pertama) doc.addPage('a4', tahunan ? 'l' : 'p');
    void tahunan;
    const W = doc.internal.pageSize.getWidth(), M = 16;
    const rb = tahunan; // tahunan disajikan dalam ribuan Rupiah agar 13 kolom muat
    let y = await A.kopPdf(doc, FONT, d.judul, d.periode, rb ? '(Dinyatakan dalam ribuan Rupiah)' : d.satuan);
    const fs = tahunan ? 7 : 8.6;
    const nk = d.kolom.length, adaKode = d.baris.some((b) => b.kode), k0 = adaKode ? 1 : 0;
    const lebarAngka = tahunan ? 15.2 : nk <= 3 ? 27 : 25, lebarKode = tahunan ? 12 : 16;
    const PAD = { top: 0.55, bottom: 0.55, left: 1, right: 1 };
    const head = [(adaKode ? ['Kode'] : []).concat(['Keterangan']).concat(d.kolom.map((k) => k.label))];
    const body = d.baris.map((b) => (adaKode ? [b.kode || ''] : []).concat([b.label]).concat(b.t === 'h' ? d.kolom.map(() => '') : b.v.map((v) => angkaPdf(v, rb))));
    const colStyles = {}; if (adaKode) colStyles[0] = { cellWidth: lebarKode, textColor: [110, 110, 110] }; colStyles[k0] = { cellWidth: 'auto' };
    for (let i = 0; i < nk; i++) colStyles[i + k0 + 1] = { cellWidth: lebarAngka, halign: 'right' };
    doc.autoTable({
      startY: y, head: head, body: body, theme: 'plain', margin: { left: M, right: M, bottom: 18 },
      styles: { font: FONT, fontSize: fs, textColor: [17, 17, 17], cellPadding: PAD, overflow: 'ellipsize', valign: 'middle' },
      headStyles: { font: FONT, fontStyle: 'bold', fontSize: fs, textColor: [17, 17, 17], halign: 'right', cellPadding: { top: 1, bottom: 1.2, left: 1, right: 1 } },
      columnStyles: colStyles,
      didParseCell: (c) => {
        if (c.section === 'head') { if (c.column.index <= k0) c.cell.styles.halign = 'left'; return; }
        const b = d.baris[c.row.index];
        const pad = Object.assign({}, PAD);
        if (c.column.index === k0) pad.left = 1 + (b.lvl || 0) * 3.5;
        if (b.t === 'h') { c.cell.styles.fontStyle = 'bold'; pad.top = b.lvl ? 1.2 : 2.4; }
        if (b.t === 't' || (b.t === 's' && (b.kuat || !b.lvl))) c.cell.styles.fontStyle = 'bold';
        if (b.t === 's') { pad.top = 1.1; pad.bottom = 0.9; }
        if (b.t === 't') { pad.top = 1.2; pad.bottom = 1.8; }
        if (b.jarak) pad.top = 2.6;
        c.cell.styles.cellPadding = pad;
      },
      didDrawCell: (c) => {
        const x1 = c.cell.x + 1, x2 = c.cell.x + c.cell.width - 0.5;
        if (c.section === 'head') { doc.setDrawColor(17); doc.setLineWidth(0.3); doc.line(c.cell.x, c.cell.y + c.cell.height, c.cell.x + c.cell.width, c.cell.y + c.cell.height); return; }
        if (c.column.index <= k0) return;
        const b = d.baris[c.row.index];
        if (!b.v || b.v[c.column.index - k0 - 1] === null) return;
        if (b.t === 's' || b.t === 't') { doc.setDrawColor(40); doc.setLineWidth(0.2); doc.line(x1 + 2, c.cell.y + 0.3, x2, c.cell.y + 0.3); }
        if (b.t === 't') { const yb = c.cell.y + c.cell.height - 0.7; doc.setLineWidth(0.25); doc.line(x1 + 2, yb, x2, yb); doc.line(x1 + 2, yb + 0.7, x2, yb + 0.7); }
      }
    });
    y = doc.lastAutoTable.finalY + 4;
    if (d.catatan && d.catatan.length) { doc.setFont(FONT, 'normal'); doc.setFontSize(7.5); doc.setTextColor(110, 110, 110); d.catatan.forEach((c) => { doc.text(c, M, y + 2); y += 3.6; }); }
    void W;
    return A.ttdPdf(doc, FONT, y + 2, d.ttd || {});
  }

  /** Unduh PDF satu atau beberapa laporan akuntan. */
  A.pdf = async function (daftar, file) {
    daftar = [].concat(daftar);
    await R.lib('pdf');
    const tahunan = daftar[0].kolom.length > 4;
    const doc = new window.jspdf.jsPDF({ orientation: tahunan ? 'l' : 'p', unit: 'mm', format: 'a4' });
    const FONT = await A.pasangFont(doc, 'mono');
    for (let i = 0; i < daftar.length; i++) await tulisLaporan(doc, FONT, daftar[i], i === 0);
    A.kakiPdf(doc, FONT, (usaha().nama_usaha || 'ROVELO') + (daftar.length === 1 ? ' · ' + daftar[0].judul : ''));
    doc.save(nama(file) + '.pdf');
  };
  const nama = (f) => String(f).replace(/[^\w\-. ]/g, '_');

  // ---------- Excel (ExcelJS) ----------
  const FMT = '#,##0_);(#,##0);"-"_);@_)';
  const huruf = (i) => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  A.huruf = huruf;
  function lembarLaporan(wb, d, namaLembar) {
    const u = usaha();
    const nk = d.kolom.length, kolAkhir = huruf(nk + 1);
    const ws = wb.addWorksheet(namaLembar.slice(0, 31), { views: [{ state: 'frozen', xSplit: 2, ySplit: 8, showGridLines: false }],
      pageSetup: { paperSize: 9, orientation: nk > 4 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } },
      headerFooter: { oddFooter: '&L&8' + (u.nama_usaha || 'ROVELO') + ' · ' + d.judul + '&R&8Halaman &P dari &N' } });
    const F = (o) => Object.assign({ name: 'Consolas', size: 10, color: { argb: 'FF111111' } }, o || {});
    ws.columns = [{ width: 10 }, { width: 48 }].concat(d.kolom.map(() => ({ width: nk > 4 ? 15 : 18 })));
    const set = (r, c, v, f, al) => { const cell = ws.getCell(r, c); cell.value = v; cell.font = F(f); if (al) cell.alignment = al; return cell; };
    set(1, 1, u.nama_usaha || 'ROVELO', { bold: true, size: 14 });
    set(2, 1, [u.alamat, [u.no_hp, u.email].filter(Boolean).join(' · '), u.npwp ? 'NPWP ' + u.npwp : ''].filter(Boolean).join(' · '), { size: 9, color: { argb: 'FF5A5A5A' } });
    for (let c = 1; c <= nk + 2; c++) ws.getCell(2, c).border = { bottom: { style: 'medium', color: { argb: 'FFF97316' } } };
    [[4, d.judul, { bold: true, size: 13 }], [5, d.periode, { size: 10, color: { argb: 'FF5A5A5A' } }], [6, d.satuan, { size: 9, color: { argb: 'FF5A5A5A' } }]].forEach((x) => {
      ws.mergeCells('A' + x[0] + ':' + kolAkhir + x[0]);
      set(x[0], 1, x[1], x[2], { horizontal: 'center' });
    });
    const H = 8;
    ['Kode', 'Keterangan'].concat(d.kolom.map((k) => k.label)).forEach((t, i) => {
      const c = set(H, i + 1, t, { bold: true }, { horizontal: i < 2 ? 'left' : 'right' });
      c.border = { bottom: { style: 'thin', color: { argb: 'FF111111' } } };
    });
    const awal = H + 1;
    d.baris.forEach((b, i) => {
      const r = awal + i;
      set(r, 1, b.kode || '', { color: { argb: 'FF6E6E6E' } });
      const tebal = b.t === 'h' || b.t === 't' || (b.t === 's' && (b.kuat || !b.lvl));
      set(r, 2, b.label, { bold: tebal }, { indent: b.lvl || 0 });
      if (b.t === 'h') return;
      b.v.forEach((v, j) => {
        const c = ws.getCell(r, j + 3);
        if (v === null) { c.value = null; }
        else if (b.f && b.f.length) c.value = { formula: b.f.map((p, k) => (p[1] < 0 ? '-' : k ? '+' : '') + huruf(j + 2) + (awal + p[0])).join(''), result: v };
        else c.value = v;
        c.numFmt = FMT; c.font = F({ bold: tebal }); c.alignment = { horizontal: 'right' };
        if (b.t === 's') c.border = { top: { style: 'thin', color: { argb: 'FF333333' } } };
        if (b.t === 't') c.border = { top: { style: 'thin', color: { argb: 'FF333333' } }, bottom: { style: 'double', color: { argb: 'FF111111' } } };
      });
    });
    let r = awal + d.baris.length + 1;
    (d.catatan || []).forEach((c) => { set(r++, 1, c, { size: 8, color: { argb: 'FF6E6E6E' } }); });
    r += 1;
    const t = d.ttd || {};
    const kolTtd = nk <= 2 ? [2, 3, 4] : [2, nk >= 5 ? 3 + Math.floor((nk - 1) / 2) : 3, nk + 2];
    if (nk <= 2) [3, 4].forEach((c) => { if (!ws.getColumn(c).width || c > nk + 2) ws.getColumn(c).width = 20; });
    [['Dibuat oleh,', t.dibuat], ['Diperiksa oleh,', t.diperiksa], ['Disetujui oleh,', t.disetujui]].forEach((x, i) => {
      const al = { horizontal: i ? 'center' : 'left' };
      set(r, kolTtd[i], x[0], {}, al);
      const n = set(r + 4, kolTtd[i], x[1] || '(....................)', { bold: !!x[1] }, al);
      n.border = { top: { style: 'thin', color: { argb: 'FF333333' } } };
    });
    return ws;
  }
  /** Unduh Excel satu atau beberapa laporan akuntan (+ lembar data tambahan opsional). */
  A.xlsx = async function (daftar, file, tambahan) {
    daftar = [].concat(daftar);
    await R.lib('excel');
    const wb = new window.ExcelJS.Workbook(); wb.creator = 'ROVELO Finance'; wb.created = new Date();
    const dipakai = {};
    const namaUnik = (n) => { let s = String(n).replace(/[\\/?*[\]:]/g, '-').slice(0, 31), i = 2; while (dipakai[s]) s = String(n).slice(0, 28) + ' ' + i++; dipakai[s] = 1; return s; };
    const NAMA = { 'LAPORAN LABA RUGI': 'Laba Rugi', 'LAPORAN POSISI KEUANGAN (NERACA)': 'Neraca', 'LAPORAN ARUS KAS': 'Arus Kas', 'LAPORAN PERUBAHAN EKUITAS': 'Perubahan Ekuitas' };
    daftar.forEach((d) => lembarLaporan(wb, d, namaUnik(NAMA[d.judul] || d.judul)));
    (tambahan || []).forEach((l) => R.xlsx.lembarData(wb, Object.assign({}, l, { nama: namaUnik(l.nama) })));
    await R.xlsx.simpan(wb, file);
  };
})();
