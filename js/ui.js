/* =========================================================
   ROVELO Finance — utilitas UI: ikon, format, drawer, modal,
   toast, tabel, pemilih periode, grafik, PDF, Excel
   ========================================================= */
(function () {
  const R = window.R = window.R || {};

  // ---------- Ikon (garis, gaya lucide) ----------
  const P = {
    grid: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
    receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    bag: '<path d="M6 7h12l1 14H5z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    package: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    chart: '<path d="M3 20h18"/><rect x="5" y="11" width="3" height="7" rx="1"/><rect x="10.5" y="6" width="3" height="12" rx="1"/><rect x="16" y="13" width="3" height="5" rx="1"/>',
    pie: '<path d="M21 12a9 9 0 1 1-9-9v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    landmark: '<path d="M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M2 10l10-6 10 6z"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2.2-2.4 3.7M12 17h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    up: '<path d="M7 17 17 7M8 7h9v9"/>', down: '<path d="M17 7 7 17M16 17H7V8"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v9h14v-9M10 21v-5h4v5"/>',
    truck: '<path d="M2 5h12v11H2zM14 9h4l4 4v3h-8"/><circle cx="6.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
    megaphone: '<path d="m3 11 15-6v14L3 13z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    camera: '<path d="M14.5 4h-5L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5z"/><circle cx="12" cy="13" r="3.5"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13 7 22l5-3 5 3-1.2-9"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    hand: '<path d="M11 12V6.5a1.5 1.5 0 0 1 3 0V12M14 11V5.5a1.5 1.5 0 0 1 3 0V13M8 12.5V8.5a1.5 1.5 0 0 1 3 0"/><path d="M17 9.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.5a7 7 0 0 1-5.6-2.8L3.5 16a1.6 1.6 0 0 1 2.5-2L8 16"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    droplet: '<path d="M12 2.7 6.3 8.4a8 8 0 1 0 11.4 0z"/>',
    wifi: '<path d="M5 12.6a10 10 0 0 1 14 0M8.5 16.1a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4M5 17v4M7 19H3"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    car: '<path d="M5 17h14v-5l-2-5H7l-2 5z"/><path d="M3 12h18"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    clip: '<path d="m21.4 11-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
    building: '<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'
  };
  R.ic = function (n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || P.tag) + '</svg>'; };

  // ---------- Format ----------
  const esc = R.esc = function (s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); };
  const titik = (n) => Math.round(Math.abs(+n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  R.rp = (n) => ((+n || 0) < 0 ? '−Rp' : 'Rp') + titik(n);
  R.angka = (n) => ((+n || 0) < 0 ? '−' : '') + titik(n);
  R.rpK = function (n) {
    const a = Math.abs(+n || 0), s = (+n || 0) < 0 ? '−' : '';
    const f = (v, u) => s + 'Rp' + (Math.round(v * 10) / 10).toString().replace('.', ',') + ' ' + u;
    if (a >= 1e9) return f(a / 1e9, 'M'); if (a >= 1e6) return f(a / 1e6, 'jt'); if (a >= 1e4) return f(a / 1e3, 'rb');
    return R.rp(n);
  };
  R.persen = (n) => (Math.round((+n || 0) * 10) / 10).toString().replace('.', ',') + '%';
  const BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  R.BULAN = BLN;
  R.tgl = (t) => { if (!t) return '–'; const s = String(t); return +s.slice(8, 10) + ' ' + BLN[+s.slice(5, 7) - 1].slice(0, 3) + ' ' + s.slice(0, 4); };
  R.tglP = (t) => { if (!t) return '–'; const s = String(t); return +s.slice(8, 10) + ' ' + BLN[+s.slice(5, 7) - 1] + ' ' + s.slice(0, 4); };
  R.bln = (p) => p ? BLN[+String(p).slice(5, 7) - 1] + ' ' + String(p).slice(0, 4) : '–';
  R.waktu = (iso) => { if (!iso) return '–'; const s = String(iso); return R.tgl(s.slice(0, 10)) + ' ' + s.slice(11, 16); };
  R.hariIni = function () {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { const d = new Date(Date.now() + 7 * 3600e3); return d.toISOString().slice(0, 10); }
  };
  const ms = (t) => { const p = t.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); };
  const keT = (m) => new Date(m).toISOString().slice(0, 10);
  R.tambahHari = (t, n) => keT(ms(t) + n * 864e5);
  R.akhirBulan = (p) => keT(Date.UTC(+p.slice(0, 4), +p.slice(5, 7), 0));
  R.tambahBulan = (p, n) => { const d = new Date(Date.UTC(+p.slice(0, 4), +p.slice(5, 7) - 1 + n, 1)); return d.toISOString().slice(0, 7); };
  R.selisihHari = (a, b) => Math.round((ms(b) - ms(a)) / 864e5);
  R.labelRentang = function (dari, sampai) {
    if (dari === sampai) return R.tglP(dari);
    if (dari.slice(8) === '01' && sampai === R.akhirBulan(dari.slice(0, 7)) && dari.slice(0, 7) === sampai.slice(0, 7)) return R.bln(dari.slice(0, 7));
    if (dari.slice(5) === '01-01' && sampai.slice(5) === '12-31' && dari.slice(0, 4) === sampai.slice(0, 4)) return 'Tahun ' + dari.slice(0, 4);
    return R.tgl(dari) + ' – ' + R.tgl(sampai);
  };
  /** Rentang dari preset: hari, kemarin, 7hari, minggu, bulan, bulanlalu, 6bulan, tahun, 5tahun. */
  R.rentang = function (p, tahun) {
    const h = R.hariIni(), bln = h.slice(0, 7);
    let d, s;
    switch (p) {
      case 'hari': d = s = h; break;
      case 'kemarin': d = s = R.tambahHari(h, -1); break;
      case '7hari': d = R.tambahHari(h, -6); s = h; break;
      case 'minggu': { const dow = (new Date(ms(h)).getUTCDay() + 6) % 7; d = R.tambahHari(h, -dow); s = h; break; }
      case 'bulanlalu': { const pl = R.tambahBulan(bln, -1); d = pl + '-01'; s = R.akhirBulan(pl); break; }
      case '6bulan': d = R.tambahBulan(bln, -5) + '-01'; s = h; break;
      case 'tahun': { const y = tahun || +h.slice(0, 4); d = y + '-01-01'; s = y === +h.slice(0, 4) ? h : y + '-12-31'; break; }
      case '5tahun': d = (+h.slice(0, 4) - 4) + '-01-01'; s = h; break;
      default: d = bln + '-01'; s = h;
    }
    return { preset: p, dari: d, sampai: s, label: R.labelRentang(d, s) };
  };
  R.delta = function (a, b, kebalik) {
    if (!b) return a ? '<span class="delta flat">baru</span>' : '';
    const ch = (a - b) / Math.abs(b) * 100; const naik = ch >= 0; const baik = kebalik ? !naik : naik;
    return '<span class="delta ' + (Math.abs(ch) < 0.05 ? 'flat' : baik ? 'up' : 'down') + '">' + (naik ? '▲' : '▼') + ' ' + R.persen(Math.abs(ch)) + '</span>';
  };
  R.tunda = function (fn, t) { let h; return function () { const a = arguments, s = this; clearTimeout(h); h = setTimeout(() => fn.apply(s, a), t || 250); }; };
  R.$ = (s, r) => (r || document).querySelector(s);
  R.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  R.on = function (root, ev, sel, fn) { root.addEventListener(ev, (e) => { const t = e.target.closest(sel); if (t && root.contains(t)) fn(e, t); }); };

  // ---------- Logo channel & loading koin ----------
  const LOGO_CH = { SHP: 1, TTS: 1, LZD: 1, TKP: 1, RSL: 1 };
  R.chLogo = function (id, s) {
    s = s || 18;
    if (LOGO_CH[id]) return '<img class="ch-logo" src="img/ch-' + id + '.png" alt="" width="' + s + '" height="' + s + '" loading="lazy">';
    if (id === 'MNL') return '<span class="ch-ic" style="width:' + s + 'px;height:' + s + 'px">' + R.ic('store') + '</span>';
    const c = R.mCh && R.mCh[id];
    return '<span class="ch-dot" style="background:' + esc(c ? c.warna : '#94A3B8') + '"></span>';
  };
  R.loaderKoin = (teks) => '<div class="boot"><div class="koin-wrap"><img class="brand-word" src="img/rovelo-hitam.png" alt="ROVELO"><div class="koin-lompat"><div class="koin"><i>Rp</i><i class="b">R</i></div></div><div class="koin-bayang"></div><div class="koin-teks">' + esc(teks || 'Memuat ROVELO Finance') + '<b>.</b><b>.</b><b>.</b></div></div></div>';

  // ---------- Bus peristiwa antar-halaman ----------
  const bus = document.createElement('i');
  R.emit = (n, d) => bus.dispatchEvent(new CustomEvent(n, { detail: d }));
  R.dengar = (n, fn) => { const h = (e) => fn(e.detail); bus.addEventListener(n, h); return () => bus.removeEventListener(n, h); };

  // ---------- Input rupiah ----------
  R.nilai = (v) => { const n = Number(String(v === undefined || v === null ? '' : v).replace(/[^\d-]/g, '')); return isFinite(n) ? n : 0; };
  R.inpRp = function (el) {
    const fmt = () => { const pos = el.value.length - el.selectionStart; const n = R.nilai(el.value); el.value = el.value.trim() === '' ? '' : titik(n); try { const p = Math.max(0, el.value.length - pos); el.setSelectionRange(p, p); } catch (e) { /* abaikan */ } };
    el.addEventListener('input', fmt); if (el.value) el.value = titik(R.nilai(el.value));
  };
  R.inpRpSemua = (root) => R.$$('[data-rp]', root).forEach((el) => { if (!el._rp) { el._rp = 1; R.inpRp(el); } });

  // ---------- Toast ----------
  R.toast = function (pesan, tipe, opt) {
    let box = R.$('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast ' + (tipe || 'ok');
    t.innerHTML = R.ic(tipe === 'err' ? 'alert' : tipe === 'info' ? 'info' : 'check', 's18') + '<span>' + esc(pesan) + '</span>' + (opt && opt.aksi ? '<button class="t-act">' + esc(opt.aksi.label) + '</button>' : '');
    if (opt && opt.aksi) t.querySelector('.t-act').onclick = () => { opt.aksi.fn(); t.remove(); };
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 320); }, tipe === 'err' ? 6000 : 3200);
  };
  R.galat = (e) => R.toast(e && e.message ? e.message : String(e), 'err');

  // ---------- Drawer & modal ----------
  const tumpukan = [];
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tumpukan.length) tumpukan[tumpukan.length - 1].tutup(); });
  R.drawer = function (o) {
    const ovl = document.createElement('div'); ovl.className = 'ovl';
    const d = document.createElement('aside'); d.className = 'drawer' + (o.lebar ? ' wide' : ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="dr-head"><h3>' + esc(o.judul) + '</h3>' + (o.aksiKepala || '') + '<button class="icon-btn" data-x aria-label="Tutup">' + R.ic('x') + '</button></div><div class="dr-body">' + (o.isi || '') + '</div>' + (o.kaki !== undefined ? '<div class="dr-foot">' + o.kaki + '</div>' : '');
    document.body.append(ovl, d);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { ovl.classList.add('in'); d.classList.add('in'); });
    const api = {
      el: d, body: d.querySelector('.dr-body'), foot: d.querySelector('.dr-foot'),
      set judul(v) { d.querySelector('.dr-head h3').textContent = v; },
      tutup() {
        if (api._tutup) return; api._tutup = true;
        if (o.onTutup && o.onTutup() === false) { api._tutup = false; return; }
        ovl.classList.remove('in'); d.classList.remove('in');
        const i = tumpukan.indexOf(api); if (i >= 0) tumpukan.splice(i, 1);
        if (!tumpukan.length) document.body.style.overflow = '';
        setTimeout(() => { ovl.remove(); d.remove(); }, 280);
      }
    };
    ovl.onclick = () => api.tutup(); d.querySelector('[data-x]').onclick = () => api.tutup();
    tumpukan.push(api);
    R.inpRpSemua(d);
    setTimeout(() => { const f = d.querySelector('[autofocus]'); if (f && window.innerWidth > 960) f.focus(); }, 280);
    return api;
  };
  R.konfirmasi = function (o) {
    return new Promise((resolve) => {
      const ovl = document.createElement('div'); ovl.className = 'ovl';
      const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'alertdialog');
      m.innerHTML = '<div class="m-ic ' + (o.bahaya ? 'r' : '') + '">' + R.ic(o.ikon || (o.bahaya ? 'alert' : 'info')) + '</div><h3>' + esc(o.judul) + '</h3><p>' + (o.html || esc(o.pesan || '')) + '</p>' +
        (o.input ? '<div class="field"><label>' + esc(o.input.label) + '</label><' + (o.input.area ? 'textarea' : 'input') + ' class="inp" data-in placeholder="' + esc(o.input.placeholder || '') + '" ' + (o.input.tipe ? 'type="' + o.input.tipe + '"' : '') + '>' + (o.input.area ? '</textarea>' : '') + '<div class="err">Wajib diisi</div></div>' : '') +
        '<div class="acts"><button class="btn ghost" data-no>' + esc(o.batal || 'Batal') + '</button><button class="btn ' + (o.bahaya ? 'danger' : 'primary') + '" data-ok>' + esc(o.ok || 'Ya, lanjutkan') + '</button></div>';
      document.body.append(ovl, m);
      requestAnimationFrame(() => { ovl.classList.add('in'); m.classList.add('in'); });
      const inp = m.querySelector('[data-in]');
      if (inp) setTimeout(() => inp.focus(), 100); else setTimeout(() => m.querySelector('[data-ok]').focus(), 100);
      let selesai = false;
      const entri = { tutup: () => tutup(false) };
      function tutup(v) {
        if (selesai) return; selesai = true;
        ovl.classList.remove('in'); m.classList.remove('in');
        const i = tumpukan.indexOf(entri); if (i >= 0) tumpukan.splice(i, 1);
        setTimeout(() => { ovl.remove(); m.remove(); }, 220); resolve(v);
      }
      tumpukan.push(entri);
      ovl.onclick = () => tutup(false); m.querySelector('[data-no]').onclick = () => tutup(false);
      m.querySelector('[data-ok]').onclick = () => {
        if (inp) { const v = inp.value.trim(); if (o.input.wajib && !v) { inp.closest('.field').classList.add('bad'); return; } tutup(v || true); }
        else tutup(true);
      };
      if (inp && !o.input.area) inp.onkeydown = (e) => { if (e.key === 'Enter') m.querySelector('[data-ok]').click(); };
    });
  };

  // ---------- Kerangka & kosong ----------
  /** Animasi koin Rp berputar untuk semua keadaan memuat. */
  R.koinKecil = (cls) => '<span class="koin-k ' + (cls || '') + '" aria-hidden="true"><span class="koin"><i>Rp</i><i class="b">Rp</i></span></span>';
  R.loaderMini = (teks) => '<div class="muat-koin" role="status">' + R.koinKecil() + '<div class="koin-teks">' + esc(teks || 'Memuat data') + '<b>.</b><b>.</b><b>.</b></div></div>';
  R.kerangka = (n, tipe) => tipe === 'kartu' ? '<div class="card">' + R.loaderMini('Memuat ringkasan') + '</div>' : '<div class="card">' + R.loaderMini('Memuat data') + '</div>';
  R.kosong = (judul, pesan, ikon, aksi) => '<div class="empty"><div class="em-ic">' + R.ic(ikon || 'search', 's24') + '</div><b>' + esc(judul) + '</b>' + esc(pesan || '') + (aksi ? '<div class="mt">' + aksi + '</div>' : '') + '</div>';
  R.gagalMuat = (e, el, ulang) => { el.innerHTML = '<div class="card">' + R.kosong('Gagal memuat data', e.message, 'alert', '<button class="btn sm" data-ulang>' + R.ic('refresh', 's16') + ' Coba lagi</button>') + '</div>'; const b = el.querySelector('[data-ulang]'); if (b && ulang) b.onclick = ulang; };

  // ---------- Tabel ----------
  R.fmtSel = function (v, tipe) {
    if (tipe === 'rp') return R.rp(v); if (tipe === 'angka') return R.angka(v); if (tipe === 'persen') return R.persen(v);
    if (tipe === 'tgl') return v ? R.tgl(v) : '–'; if (tipe === 'bln') return R.bln(v); return esc(v === undefined || v === null || v === '' ? '–' : v);
  };
  /**
   * cfg: {kolom:[{k,label,tipe,render(row),lead,hideM,cls}], baris, total, klik(row), pilih:true, kunci, kosong, kartu:true, ringkas}
   * Mengembalikan {terpilih()}.
   */
  R.tabel = function (el, cfg) {
    const kol = cfg.kolom, rows = cfg.baris || [];
    if (!rows.length) { el.innerHTML = R.kosong(cfg.kosong || 'Belum ada data', cfg.kosongPesan || '', cfg.kosongIkon); return { terpilih: () => [] }; }
    const num = (c) => c.tipe === 'rp' || c.tipe === 'angka' || c.tipe === 'persen' || c.n;
    const nomor = cfg.no !== false && rows.length > 1, mulai = cfg.mulai || 0;
    let h = '<div class="tbl-wrap"><table class="tbl ' + (cfg.kartu !== false ? 'cards ' : '') + (cfg.ringkas ? 'compact' : '') + '"><thead><tr>' + (cfg.pilih ? '<th style="width:36px"><input type="checkbox" data-all aria-label="Pilih semua"></th>' : '') + (nomor ? '<th class="no">No</th>' : '') +
      kol.map((c) => '<th class="' + (num(c) ? 'n' : '') + '">' + esc(c.label) + '</th>').join('') + '</tr></thead><tbody>';
    rows.forEach((r, i) => {
      h += '<tr data-i="' + i + '" class="' + (cfg.klik ? 'click ' : '') + (r._pending ? 'pending' : '') + '">' + (cfg.pilih ? '<td class="hide-m" style="width:36px">' + (cfg.bisaPilih && !cfg.bisaPilih(r) ? '' : '<input type="checkbox" data-pick aria-label="Pilih baris">') + '</td>' : '') + (nomor ? '<td class="no" data-l="No">' + (mulai + i + 1) + '</td>' : '') +
        kol.map((c) => '<td data-l="' + esc(c.label) + '" class="' + (num(c) ? 'n ' : '') + (c.lead ? 'lead ' : '') + (c.hideM ? 'hide-m ' : '') + (c.cls || '') + '">' + (c.render ? c.render(r) : R.fmtSel(r[c.k], c.tipe)) + '</td>').join('') + '</tr>';
    });
    h += '</tbody>';
    if (cfg.total) h += '<tfoot><tr>' + (cfg.pilih ? '<td class="hide-m"></td>' : '') + (nomor ? '<td class="no hide-m"></td>' : '') + kol.map((c, i) => '<td data-l="' + esc(c.label) + '" class="' + (num(c) ? 'n' : '') + (i === 0 ? ' lead' : '') + '">' + (i === 0 ? 'Total' : cfg.total[c.k] !== undefined ? R.fmtSel(cfg.total[c.k], c.tipe) : '') + '</td>').join('') + '</tr></tfoot>';
    h += '</table></div>';
    el.innerHTML = h;
    const tb = el.querySelector('tbody');
    if (cfg.klik) tb.addEventListener('click', (e) => { if (e.target.closest('input,button,a')) return; const tr = e.target.closest('tr'); if (tr) cfg.klik(rows[+tr.dataset.i], tr); });
    const sel = new Set();
    const perbarui = () => { if (cfg.onPilih) cfg.onPilih(Array.from(sel).map((i) => rows[i])); };
    if (cfg.pilih) {
      tb.addEventListener('change', (e) => { if (!e.target.matches('[data-pick]')) return; const i = +e.target.closest('tr').dataset.i; e.target.checked ? sel.add(i) : sel.delete(i); e.target.closest('tr').classList.toggle('sel', e.target.checked); perbarui(); });
      el.querySelector('[data-all]').addEventListener('change', (e) => { R.$$('[data-pick]', tb).forEach((c) => { c.checked = e.target.checked; const i = +c.closest('tr').dataset.i; e.target.checked ? sel.add(i) : sel.delete(i); c.closest('tr').classList.toggle('sel', e.target.checked); }); perbarui(); });
    }
    return { terpilih: () => Array.from(sel).map((i) => rows[i]) };
  };
  R.pager = function (el, d, ke) {
    const maks = Math.max(1, Math.ceil((d.total || 0) / d.per));
    if (maks <= 1) { el.innerHTML = ''; return; }
    el.innerHTML = '<div class="pager"><span>' + R.angka((d.halaman - 1) * d.per + 1) + '–' + R.angka(Math.min(d.total, d.halaman * d.per)) + ' dari ' + R.angka(d.total) + '</span><div class="actions"><button class="btn sm icon" data-p="-1" ' + (d.halaman <= 1 ? 'disabled' : '') + ' aria-label="Sebelumnya">' + R.ic('chevL', 's16') + '</button><span class="small">Hal ' + d.halaman + ' / ' + maks + '</span><button class="btn sm icon" data-p="1" ' + (d.halaman >= maks ? 'disabled' : '') + ' aria-label="Berikutnya">' + R.ic('chevR', 's16') + '</button></div></div>';
    R.$$('[data-p]', el).forEach((b) => { b.onclick = () => ke(d.halaman + +b.dataset.p); });
  };

  // ---------- Tab & segmen ----------
  R.tabs = function (el, daftar, aktif, ubah) {
    el.className = 'tabs'; el.setAttribute('role', 'tablist');
    el.innerHTML = daftar.map((t) => '<button role="tab" data-t="' + t.id + '" class="' + (t.id === aktif ? 'on' : '') + '">' + esc(t.label) + (t.cnt !== undefined && t.cnt !== null ? '<span class="cnt">' + t.cnt + '</span>' : '') + '</button>').join('');
    el.onclick = (e) => { const b = e.target.closest('[data-t]'); if (!b) return; R.$$('button', el).forEach((x) => x.classList.toggle('on', x === b)); ubah(b.dataset.t); };
  };
  R.seg = function (el, daftar, aktif, ubah, cls) {
    el.className = 'seg ' + (cls || '');
    el.innerHTML = daftar.map((t) => '<button type="button" data-v="' + esc(t.v) + '" class="' + (String(t.v) === String(aktif) ? 'on' : '') + '">' + esc(t.l) + '</button>').join('');
    el.onclick = (e) => { const b = e.target.closest('[data-v]'); if (!b) return; R.$$('button', el).forEach((x) => x.classList.toggle('on', x === b)); ubah(b.dataset.v); };
  };

  // ---------- Pemilih periode ----------
  const PRESET = { hari: 'Hari ini', '7hari': '7 Hari', minggu: 'Minggu ini', bulan: 'Bulan ini', bulanlalu: 'Bulan lalu', '6bulan': '6 Bulan', tahun: 'Tahun', '5tahun': '5 Tahun', kustom: 'Pilih tanggal' };
  /** o: {nilai:{preset,dari,sampai,tahun}, preset:[...], ubah(r)} */
  R.periode = function (el, o) {
    const daftar = o.preset || ['hari', '7hari', 'bulan', 'bulanlalu', '6bulan', 'tahun', 'kustom'];
    let v = o.nilai || R.rentang('bulan');
    const thIni = +R.hariIni().slice(0, 4);
    const gambar = () => {
      el.innerHTML = '<div class="row wrap" style="gap:8px"><div class="seg" data-seg></div>' +
        '<select class="inp sm" data-th style="width:auto;' + (v.preset === 'tahun' ? '' : 'display:none') + '" aria-label="Tahun">' + Array.from({ length: 11 }, (_, i) => thIni - 5 + i).map((y) => '<option ' + (y === (v.tahun || thIni) ? 'selected' : '') + '>' + y + '</option>').join('') + '</select>' +
        '<span class="row" data-kus style="gap:6px;' + (v.preset === 'kustom' ? '' : 'display:none') + '"><input type="date" class="inp sm" data-d value="' + v.dari + '" aria-label="Dari"><span class="faint">–</span><input type="date" class="inp sm" data-s value="' + v.sampai + '" aria-label="Sampai"></span></div>';
      R.seg(el.querySelector('[data-seg]'), daftar.map((p) => ({ v: p, l: PRESET[p] })), v.preset, (p) => {
        if (p === 'kustom') { v = Object.assign({}, v, { preset: 'kustom' }); gambar(); return; }
        v = R.rentang(p, p === 'tahun' ? (v.tahun || thIni) : null); if (p === 'tahun') v.tahun = v.tahun || thIni;
        gambar(); o.ubah(v);
      });
      el.querySelector('[data-th]').onchange = (e) => { v = R.rentang('tahun', +e.target.value); v.tahun = +e.target.value; o.ubah(v); };
      const kus = () => { const d = el.querySelector('[data-d]').value, s = el.querySelector('[data-s]').value; if (d && s && d <= s) { v = { preset: 'kustom', dari: d, sampai: s, label: R.labelRentang(d, s) }; o.ubah(v); } };
      el.querySelector('[data-d]').onchange = kus; el.querySelector('[data-s]').onchange = kus;
    };
    gambar();
    return { get nilai() { return v; } };
  };

  // ---------- Muat pustaka eksternal saat dibutuhkan ----------
  const LIB = {
    chart: ['https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.js'],
    xlsx: ['https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'],
    pdf: ['https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js'],
    excel: ['https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js']
  };
  const muat = {};
  function skrip(src) { return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.async = false; s.crossOrigin = 'anonymous'; s.onload = ok; s.onerror = () => no(new Error('Gagal memuat pustaka. Periksa koneksi internet.')); document.head.appendChild(s); }); }
  R.lib = function (n) {
    if (n === 'chart' && window.Chart) return Promise.resolve();
    if (n === 'xlsx' && window.XLSX) return Promise.resolve();
    if (n === 'pdf' && window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable) return Promise.resolve();
    if (n === 'excel' && window.ExcelJS) return Promise.resolve();
    if (!muat[n]) muat[n] = LIB[n].reduce((p, src) => p.then(() => skrip(src)), Promise.resolve()).catch((e) => { delete muat[n]; throw e; });
    return muat[n];
  };

  // ---------- Grafik ----------
  const grafikAktif = new WeakMap();
  R.WARNA = { accent: '#F97316', soft: '#FB923C', green: '#16A34A', red: '#DC2626', lav: '#7C6CF2', blue: '#2563EB', ink: '#1F2328', grey: '#94A3B8', amber: '#D97706' };
  R.gradien = function (ctx, area, warna, kuat) {
    if (!area) return warna + '33';
    const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, warna + (kuat || '40')); g.addColorStop(1, warna + '00');
    return g;
  };
  /** Warna channel untuk grafik (sudah diuji aman untuk buta warna). */
  const WARNA_CH = { SHP: '#EE4D2D', TTS: '#0F9F9A', LZD: '#2563EB', TKP: '#65A30D', RSL: '#7C6CF2', MNL: '#94A3B8' };
  R.warnaCh = (id) => WARNA_CH[id] || ((R.mCh && R.mCh[id] && R.mCh[id].warna) || '#94A3B8');
  /** Angka sumbu grafik dalam juta: 12,5 jt · 850 rb · 1,2 M */
  R.rpSumbu = function (v) {
    const a = Math.abs(v), s = v < 0 ? '−' : '', k = (x) => (Math.round(x * 10) / 10).toString().replace('.', ',');
    if (a >= 1e9) return s + k(a / 1e9) + ' M'; if (a >= 1e6) return s + k(a / 1e6) + ' jt'; if (a >= 1e3) return s + k(a / 1e3) + ' rb'; return s + a;
  };
  // plugin: label nilai di atas batang (hanya dataset yang diminta lewat cfg.labelNilai)
  const pluginLabel = {
    id: 'labelNilai',
    afterDatasetsDraw(ch, args, opt) {
      if (!opt || !opt.ds || !opt.ds.length) return;
      const ctx = ch.ctx; ctx.save(); ctx.font = '600 11px ' + ch.options.font.family; ctx.fillStyle = '#5B6270'; ctx.textAlign = 'center';
      opt.ds.forEach((di) => {
        const meta = ch.getDatasetMeta(di); if (meta.hidden) return;
        meta.data.forEach((el, i) => {
          const v = ch.data.datasets[di].data[i]; if (!v) return;
          const t = opt.angka ? R.angka(v) : R.rpSumbu(v);
          const hz = ch.options.indexAxis === 'y';
          if (hz) { ctx.textAlign = 'left'; ctx.fillText(t, el.x + 6, el.y + 4); }
          else ctx.fillText(t, el.x, v >= 0 ? el.y - 6 : el.y + 14);
        });
      });
      ctx.restore();
    }
  };
  R.grafik = async function (canvas, cfg) {
    await R.lib('chart');
    const C = window.Chart;
    if (!C._rovelo) {
      C.defaults.font.family = getComputedStyle(document.body).fontFamily; C.defaults.font.size = 12; C.defaults.color = '#5B6270';
      C.defaults.plugins.legend.display = false; C.defaults.maintainAspectRatio = false; C.defaults.animation.duration = 450;
      C.defaults.plugins.tooltip.backgroundColor = '#1F2328'; C.defaults.plugins.tooltip.padding = 10; C.defaults.plugins.tooltip.cornerRadius = 10;
      C.defaults.plugins.tooltip.titleFont = { weight: '600' }; C.defaults.plugins.tooltip.boxPadding = 4;
      C.defaults.elements.line.cubicInterpolationMode = 'monotone';
      C.defaults.elements.bar.borderRadius = 4; C.defaults.elements.bar.borderSkipped = 'start';
      C.register(pluginLabel);
      C._rovelo = 1;
    }
    const lama = grafikAktif.get(canvas); if (lama) lama.destroy();
    const judulY = cfg.judulY === undefined ? (cfg.angka ? 'pcs' : 'Rupiah') : cfg.judulY;
    const skalaRp = { beginAtZero: true, grid: { color: '#EEF0F3', drawTicks: false }, border: { display: false }, ticks: { padding: 8, maxTicksLimit: 6, callback: (v) => cfg.angka ? R.angka(v) : R.rpSumbu(v) }, title: { display: !!judulY, text: judulY, color: '#8A919E', font: { size: 11 } } };
    const skalaX = { grid: { display: false }, border: { color: '#E3E6EB' }, ticks: { padding: 6, maxRotation: 0, autoSkipPadding: 14 } };
    cfg.options = cfg.options || {};
    if (cfg.type !== 'doughnut' && !cfg.options.indexAxis) cfg.options.scales = Object.assign({ x: skalaX, y: skalaRp }, cfg.options.scales || {});
    if (cfg.options.indexAxis === 'y') cfg.options.scales = Object.assign({ y: skalaX, x: skalaRp }, cfg.options.scales || {});
    cfg.options.plugins = cfg.options.plugins || {};
    const nSeri = (cfg.data.datasets || []).length;
    if (nSeri > 1 && !cfg.options.plugins.legend) cfg.options.plugins.legend = { display: true, position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 14, color: '#1F2328' } };
    cfg.options.plugins.labelNilai = { ds: cfg.labelNilai || [], angka: !!cfg.angka };
    if (cfg.labelNilai && cfg.labelNilai.length) cfg.options.layout = Object.assign({ padding: { top: 18, right: cfg.options.indexAxis === 'y' ? 56 : 0 } }, cfg.options.layout || {});
    cfg.options.plugins.tooltip = Object.assign({ callbacks: { label: (c) => ' ' + (c.dataset.label ? c.dataset.label + ': ' : '') + (cfg.angka ? R.angka(c.parsed.y !== undefined && cfg.options.indexAxis !== 'y' ? c.parsed.y : c.parsed.x) + ' pcs' : R.rp(cfg.options.indexAxis === 'y' ? c.parsed.x : c.parsed.y !== undefined ? c.parsed.y : c.parsed)) } }, cfg.options.plugins.tooltip || {});
    cfg.options.interaction = cfg.options.interaction || { mode: 'index', intersect: false };
    const ch = new C(canvas.getContext('2d'), cfg);
    grafikAktif.set(canvas, ch);
    return ch;
  };
  /** Daftar batang mendatar (HTML): [{label, n, warna?, sub?}] — untuk porsi/komposisi yang mudah dibaca. */
  R.batangList = function (list, opt) {
    opt = opt || {};
    if (!list || !list.length) return R.kosong(opt.kosong || 'Belum ada data', '', opt.ikon || 'chart');
    const tot = opt.total || list.reduce((s, x) => s + Math.max(0, x.n), 0) || 1;
    const maks = Math.max(...list.map((x) => Math.abs(x.n)), 1);
    return '<div class="blist">' + list.map((x) => '<div class="bl-row' + (x.sorot ? ' sorot' : '') + '"><div class="bl-top"><span class="bl-lbl">' + (x.ikon || '') + esc(x.label) + '</span><span class="bl-val"><b class="num' + (x.n < 0 ? ' neg' : '') + '">' + (opt.angka ? R.angka(x.n) + (opt.satuan || '') : R.rp(x.n)) + '</b>' + (opt.persen === false ? '' : '<span class="bl-pct">' + R.persen(x.n / tot * 100) + '</span>') + '</span></div>' +
      '<div class="bl-bar"><i style="width:' + Math.max(1.5, Math.abs(x.n) / (opt.relatif ? maks : tot) * 100) + '%;background:' + (x.warna || 'var(--accent)') + '"></i></div>' + (x.sub ? '<div class="xs muted" style="margin-top:3px">' + x.sub + '</div>' : '') + '</div>').join('') + '</div>';
  };

  // ---------- Gambar & lampiran ----------
  R.bacaFile = (f) => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(new Error('File tidak bisa dibaca.')); r.readAsDataURL(f); });
  R.kompres = async function (file, maks, kualitas, mime) {
    if (file.type === 'application/pdf') {
      if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran PDF maksimal 5 MB.');
      const url = await R.bacaFile(file); return { base64: url.split(',')[1], mime: 'application/pdf', nama: file.name, url: url };
    }
    if (!/^image\//.test(file.type)) throw new Error('Pilih foto (JPG/PNG) atau PDF.');
    const url = await R.bacaFile(file);
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Gambar tidak valid.')); i.src = url; });
    const s = Math.min(1, (maks || 1600) / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    const x = c.getContext('2d'); if ((mime || 'image/jpeg') === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
    x.drawImage(img, 0, 0, c.width, c.height);
    const out = c.toDataURL(mime || 'image/jpeg', kualitas || 0.82);
    return { base64: out.split(',')[1], mime: mime || 'image/jpeg', nama: file.name.replace(/\.\w+$/, '') + (mime === 'image/png' ? '.png' : '.jpg'), url: out };
  };
  /** Kotak unggah lampiran: unggah otomatis saat dipilih → simpan id di el.dataset.id */
  R.kotakLampiran = function (el, wajibFn) {
    el.innerHTML = '<input type="file" accept="image/*,application/pdf" capture="environment" hidden><div class="drop">' + R.ic('camera', 's24') + '<div><b>Foto bukti / nota</b></div><div class="small">Ketuk untuk memotret atau pilih file (JPG, PNG, PDF)</div></div><div class="lamp-info hidden row mt"></div>';
    const inp = el.querySelector('input'), drop = el.querySelector('.drop'), info = el.querySelector('.lamp-info');
    drop.onclick = () => inp.click();
    ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) pilih(e.dataTransfer.files[0]); });
    inp.onchange = () => { if (inp.files[0]) pilih(inp.files[0]); };
    async function pilih(f) {
      el.dataset.id = ''; el.dataset.proses = '1';
      info.classList.remove('hidden'); info.innerHTML = '<span class="sync busy"><span class="sd"></span> Mengunggah ' + esc(f.name) + '…</span>';
      try {
        const k = await R.kompres(f, 1600, 0.8);
        const r = await R.api.call('lampiran.upload', { base64: k.base64, mime: k.mime, nama_file: k.nama }, { idem: false, tulis: false });
        el.dataset.id = r.id;
        info.innerHTML = (k.mime === 'application/pdf' ? '<div class="thumb" style="display:grid;place-items:center">' + R.ic('file') + '</div>' : '<img class="thumb" alt="" src="' + k.url + '">') + '<div class="grow"><b class="small">' + esc(k.nama) + '</b><div class="xs pos">Terunggah</div></div><button type="button" class="btn sm ghost" data-hapus>' + R.ic('trash', 's16') + '</button>';
        info.querySelector('[data-hapus]').onclick = () => { el.dataset.id = ''; info.classList.add('hidden'); inp.value = ''; };
      } catch (e) { info.innerHTML = '<span class="neg small">' + esc(e.message) + '</span>'; }
      finally { el.dataset.proses = ''; }
    }
  };
  R.lihatLampiran = async function (id) {
    const d = R.drawer({ judul: 'Lampiran', isi: R.loaderMini('Membuka lampiran'), lebar: true });
    try {
      const f = await R.api.get('lampiran.get', { id: id });
      const bin = atob(f.base64), arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([arr], { type: f.mime }));
      d.body.innerHTML = (f.mime === 'application/pdf' ? '<iframe title="Lampiran" src="' + url + '" style="width:100%;height:70vh;border:0;border-radius:12px"></iframe>' : '<img alt="Lampiran" src="' + url + '" style="border-radius:12px;margin:auto">') +
        '<div class="mt"><a class="btn sm" download="' + esc(f.nama) + '" href="' + url + '">' + R.ic('download', 's16') + ' Unduh</a></div>';
    } catch (e) { d.body.innerHTML = R.kosong('Lampiran tidak bisa dibuka', e.message, 'alert'); }
  };

  // ---------- Terbilang ----------
  R.terbilang = function (n) {
    const s = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
    const t = (x) => {
      if (x < 12) return s[x]; if (x < 20) return t(x - 10) + ' belas'; if (x < 100) return t(Math.floor(x / 10)) + ' puluh ' + t(x % 10);
      if (x < 200) return 'seratus ' + t(x - 100); if (x < 1000) return t(Math.floor(x / 100)) + ' ratus ' + t(x % 100);
      if (x < 2000) return 'seribu ' + t(x - 1000); if (x < 1e6) return t(Math.floor(x / 1000)) + ' ribu ' + t(x % 1000);
      if (x < 1e9) return t(Math.floor(x / 1e6)) + ' juta ' + t(x % 1e6); if (x < 1e12) return t(Math.floor(x / 1e9)) + ' miliar ' + t(x % 1e9);
      return t(Math.floor(x / 1e12)) + ' triliun ' + t(x % 1e12);
    };
    n = Math.round(Math.abs(+n || 0));
    const h = n === 0 ? 'nol' : t(n).replace(/\s+/g, ' ').trim();
    return h.charAt(0).toUpperCase() + h.slice(1) + ' rupiah';
  };

  // ---------- Excel (ExcelJS untuk ekspor rapi, SheetJS untuk membaca file impor) ----------
  R.xlsx = {
    /** Tambah lembar data tabel biasa: header tebal, garis, format angka, filter, baris beku. */
    lembarData(wb, l) {
      const data = l.aoa || [Object.keys((l.baris && l.baris[0]) || { Keterangan: 1 })].concat(l.baris && l.baris.length ? l.baris.map((r) => Object.values(r)) : [['Tidak ada data']]);
      const ws = wb.addWorksheet(String(l.nama).replace(/[\\/?*[\]:]/g, '-').slice(0, 31), { views: [{ state: 'frozen', ySplit: 1 }], pageSetup: { paperSize: 9, orientation: (data[0] || []).length > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
      const F = { name: 'Calibri', size: 11, color: { argb: 'FF1F2328' } };
      data.forEach((row, i) => {
        const r = ws.addRow(row.map((v) => v === undefined || v === null ? '' : v));
        r.eachCell({ includeEmpty: true }, (c) => {
          c.font = i === 0 ? Object.assign({}, F, { bold: true }) : F;
          if (i === 0) { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; c.border = { bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } } }; c.alignment = { vertical: 'middle', wrapText: true }; }
          else if (typeof c.value === 'number') { c.numFmt = Number.isInteger(c.value) ? '#,##0;(#,##0);"-"' : '#,##0.0;(#,##0.0);"-"'; }
          else c.border = undefined;
        });
      });
      const nCol = Math.max(...data.map((r) => r.length));
      for (let i = 0; i < nCol; i++) {
        const isAngka = data.slice(1, 200).some((r) => typeof r[i] === 'number');
        if (isAngka) ws.getRow(1).getCell(i + 1).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
        ws.getColumn(i + 1).width = Math.min(50, Math.max(10, ...data.slice(0, 300).map((r) => String(r[i] === undefined || r[i] === null ? '' : typeof r[i] === 'number' ? r[i].toLocaleString('id-ID') : r[i]).length + 2)));
      }
      if (data.length > 1) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: nCol } };
      return ws;
    },
    async simpan(wb, nama) {
      const buf = await wb.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a = document.createElement('a'); a.href = url; a.download = String(nama).replace(/[^\w.\- ]/g, '_') + (/\.xlsx$/.test(nama) ? '' : '.xlsx');
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    },
    async unduh(nama, lembar) {
      await R.lib('excel');
      const wb = new window.ExcelJS.Workbook(); wb.creator = 'ROVELO Finance'; wb.created = new Date();
      const dipakai = {};
      lembar.forEach((l) => { let n = String(l.nama).replace(/[\\/?*[\]:]/g, '-').slice(0, 31), i = 2; while (dipakai[n]) n = String(l.nama).slice(0, 28) + ' ' + i++; dipakai[n] = 1; R.xlsx.lembarData(wb, Object.assign({}, l, { nama: n })); });
      await R.xlsx.simpan(wb, nama);
    },
    async baca(file) {
      await R.lib('xlsx');
      const buf = await file.arrayBuffer();
      const wb = window.XLSX.read(buf, { type: 'array', cellDates: true, raw: false, codepage: 65001 });
      const out = {};
      wb.SheetNames.forEach((n) => { out[n] = window.XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '', blankrows: false }); });
      return { nama: wb.SheetNames, lembar: out };
    }
  };

  // ---------- PDF dokumen umum (huruf Inter, gaya bersih) ----------
  function pdfBaru(orientasi) { const J = window.jspdf.jsPDF; return new J({ orientation: orientasi || 'p', unit: 'mm', format: 'a4' }); }
  const ttdUsaha = () => { const u = (R.boot && R.boot.usaha) || {}; return { dibuat: u.pembuat_laporan || '', diperiksa: u.pemeriksa_laporan || '', disetujui: u.penandatangan || '' }; };
  function tabelBersih(doc, FONT, b, y, fs) {
    const angka = b.angka || [];
    doc.autoTable({
      startY: y, head: b.head, body: b.body, foot: b.foot, theme: 'plain', margin: { left: 16, right: 16, bottom: 18 },
      styles: { font: FONT, fontSize: fs || 8.5, textColor: [31, 35, 40], cellPadding: { top: 1.6, bottom: 1.6, left: 1.6, right: 1.6 }, overflow: 'linebreak' },
      headStyles: { fontStyle: 'bold', textColor: [31, 35, 40], fillColor: [243, 244, 246] },
      footStyles: { fontStyle: 'bold', textColor: [31, 35, 40] },
      columnStyles: angka.reduce((m, i) => { m[i] = { halign: 'right' }; return m; }, {}),
      didParseCell: (d) => { if (d.section === 'head' && angka.indexOf(d.column.index) >= 0) d.cell.styles.halign = 'right'; if (d.section === 'foot' && angka.indexOf(d.column.index) >= 0) d.cell.styles.halign = 'right'; if (d.section === 'body' && b.gaya) { const g = b.gaya(d.row.index); if (g) Object.assign(d.cell.styles, g); } },
      didDrawCell: (d) => {
        const yb = d.cell.y + d.cell.height;
        if (d.section === 'head') { doc.setDrawColor(31, 35, 40); doc.setLineWidth(0.3); doc.line(d.cell.x, yb, d.cell.x + d.cell.width, yb); }
        else if (d.section === 'body') { doc.setDrawColor(232, 234, 238); doc.setLineWidth(0.15); doc.line(d.cell.x, yb, d.cell.x + d.cell.width, yb); }
        else if (d.section === 'foot') { doc.setDrawColor(31, 35, 40); doc.setLineWidth(0.3); doc.line(d.cell.x, d.cell.y, d.cell.x + d.cell.width, d.cell.y); }
      }
    });
    return doc.lastAutoTable.finalY;
  }
  R.pdf = {
    /** bagian: [{judul, head:[[..]], body:[[..]], angka:[idx kolom angka], foot:[[..]], gaya(row)}] */
    async laporan(o) {
      await R.lib('pdf');
      const doc = pdfBaru(o.orientasi);
      const FONT = await R.akt.pasangFont(doc, 'inter');
      let y = await R.akt.kopPdf(doc, FONT, o.judul, o.sub, o.satuan || '');
      if ((o.ringkas || []).length) {
        y = tabelBersih(doc, FONT, { head: [['Ringkasan', '']], body: o.ringkas, angka: [1] }, y, 9) + 6;
      }
      o.bagian.forEach((b) => {
        if (b.judul) { if (y > doc.internal.pageSize.getHeight() - 34) { doc.addPage(); y = 20; } doc.setFont(FONT, 'bold'); doc.setFontSize(10); doc.setTextColor(31, 35, 40); doc.text(b.judul, 16, y + 2); y += 5; }
        y = tabelBersih(doc, FONT, b, y) + 7;
      });
      if (o.ttd !== false) R.akt.ttdPdf(doc, FONT, y, ttdUsaha());
      R.akt.kakiPdf(doc, FONT, ((R.boot && R.boot.usaha && R.boot.usaha.nama_usaha) || 'ROVELO') + ' · ' + o.judul);
      doc.save((o.file || o.judul).replace(/[^\w\- ]/g, '_') + '.pdf');
    },
    async slip(d) {
      await R.lib('pdf');
      const doc = pdfBaru('p');
      const FONT = await R.akt.pasangFont(doc, 'inter');
      const W = doc.internal.pageSize.getWidth();
      for (let idx = 0; idx < (d.karyawan || []).length; idx++) {
        const k = d.karyawan[idx];
        if (idx) doc.addPage();
        let y = await R.akt.kopPdf(doc, FONT, 'SLIP GAJI', 'Periode ' + R.bln(d.periode), '');
        doc.autoTable({ startY: y, theme: 'plain', styles: { font: FONT, fontSize: 9, cellPadding: 1.2, textColor: [31, 35, 40] }, margin: { left: 16, right: 16 }, body: [
          ['Nama', ': ' + k.nama, 'Tanggal bayar', ': ' + R.tglP(k.tanggal_bayar || d.tanggal_bayar)], ['Jabatan', ': ' + (k.jabatan || '–'), 'ID karyawan', ': ' + k.id_karyawan],
          ['Rekening', ': ' + ([k.bank, k.no_rekening].filter(Boolean).join(' ') || '–'), 'Status', ': Dibayar']] });
        y = doc.lastAutoTable.finalY + 4;
        const pend = [['Gaji pokok', k.gaji_pokok], ['Lembur', k.lembur], ['Tunjangan', k.tunjangan], ['Bonus', k.bonus]].filter((x) => +x[1]);
        const pot = [['Potongan absensi', k.potongan_absensi], ['Potongan kasbon', k.potongan_kasbon], ['BPJS (bagian karyawan)', k.potongan_bpjs], ['PPh 21', k.pph21]].filter((x) => +x[1]);
        const baris = Math.max(pend.length, pot.length, 1);
        const body = []; for (let i = 0; i < baris; i++) body.push([pend[i] ? pend[i][0] : '', pend[i] ? R.rp(pend[i][1]) : '', pot[i] ? pot[i][0] : '', pot[i] ? R.rp(pot[i][1]) : '']);
        y = tabelBersih(doc, FONT, { head: [['Pendapatan', '', 'Potongan', '']], body: body, angka: [1, 3], foot: [['Total pendapatan', R.rp(k.total_pendapatan), 'Total potongan', R.rp(k.total_potongan)]] }, y, 9) + 6;
        doc.setDrawColor(31, 35, 40); doc.setLineWidth(0.3); doc.rect(16, y, W - 32, 18);
        doc.setFont(FONT, 'normal'); doc.setFontSize(9); doc.setTextColor(91, 98, 112); doc.text('GAJI BERSIH DITERIMA', 20, y + 6.5);
        doc.setFont(FONT, 'bold'); doc.setFontSize(14); doc.setTextColor(31, 35, 40); doc.text(R.rp(k.gaji_bersih), W - 20, y + 8, { align: 'right' });
        doc.setFont(FONT, 'normal'); doc.setFontSize(8); doc.setTextColor(91, 98, 112); doc.text('Terbilang: ' + R.terbilang(k.gaji_bersih), 20, y + 13.5);
        if (k.catatan) { doc.text('Catatan: ' + k.catatan, 16, y + 24); }
        y += 30;
        const u = ttdUsaha();
        doc.setFont(FONT, 'normal'); doc.setFontSize(9); doc.setTextColor(31, 35, 40);
        doc.text('Penerima,', 46, y + 6, { align: 'center' }); doc.line(22, y + 27, 70, y + 27); doc.setFont(FONT, 'bold'); doc.text(k.nama, 46, y + 31.5, { align: 'center' });
        doc.setFont(FONT, 'normal'); doc.text('Disetujui oleh,', W - 46, y + 6, { align: 'center' }); doc.line(W - 70, y + 27, W - 22, y + 27); doc.setFont(FONT, u.disetujui ? 'bold' : 'normal'); doc.text(u.disetujui || '(nama & tanda tangan)', W - 46, y + 31.5, { align: 'center' });
      }
      R.akt.kakiPdf(doc, FONT, ((R.boot && R.boot.usaha && R.boot.usaha.nama_usaha) || 'ROVELO') + ' · Slip gaji');
      doc.save((d.file || 'Slip Gaji ' + R.bln(d.periode)).replace(/[^\w\- ]/g, '_') + '.pdf');
    }
  };
})();
