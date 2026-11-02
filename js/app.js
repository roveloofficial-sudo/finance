/* =========================================================
   ROVELO Finance — aplikasi utama: login, kerangka, router SPA (hash)
   ========================================================= */
(function () {
  const R = window.R;
  const O = 'Owner', A = 'Admin Keuangan', S = 'Staf Input', V = 'Viewer';
  const SEMUA = [O, A, S, V], OA = [O, A], OAS = [O, A, S], OAV = [O, A, V];
  R.PERAN = { O: O, A: A, S: S, V: V, SEMUA: SEMUA, OA: OA, OAS: OAS, OAV: OAV };
  R.halaman = R.halaman || {};

  const MENU = [
    { grup: 'Utama' },
    { id: 'dashboard', label: 'Dashboard', ic: 'grid', roles: SEMUA },
    { id: 'transaksi', label: 'Pemasukan & Pengeluaran', ic: 'receipt', roles: OAS },
    { id: 'penjualan', label: 'Penjualan', ic: 'bag', roles: OAS },
    { id: 'piutang', label: 'Piutang & Utang', ic: 'wallet', roles: OAV },
    { id: 'gaji', label: 'Gaji Karyawan', ic: 'users', roles: OA },
    { id: 'aset', label: 'Aset Tetap', ic: 'building', roles: OAV },
    { grup: 'Laporan' },
    { id: 'laporan', label: 'Laporan Keuangan', ic: 'chart', roles: OAV },
    { id: 'laporan-penjualan', label: 'Laporan Penjualan', ic: 'trend', roles: OAV },
    { id: 'pajak', label: 'Pajak UMKM', ic: 'landmark', roles: OAV },
    { id: 'simulasi', label: 'Simulasi Harga', ic: 'calc', roles: SEMUA },
    { grup: 'Pengelolaan' },
    { id: 'pembukuan', label: 'Pembukuan', ic: 'book', roles: OA },
    { id: 'master', label: 'Master Data', ic: 'database', roles: OA },
    { id: 'pengaturan', label: 'Pengaturan', ic: 'settings', roles: OA },
    { id: 'panduan', label: 'Panduan', ic: 'help', roles: SEMUA }
  ];
  const app = R.app = {};
  const root = () => document.getElementById('app');
  R.peran = () => (R.boot && R.boot.user && R.boot.user.peran) || (R.api.sesi && R.api.sesi.user && R.api.sesi.user.peran) || V;
  R.boleh = (roles) => roles.indexOf(R.peran()) >= 0;
  R.isOA = () => R.boleh(OA);

  // ---------- Peta data master dari bootstrap ----------
  function indeks() {
    const b = R.boot || {};
    R.mAkun = {}; (b.akun || []).forEach((a) => { R.mAkun[a.no] = a; });
    R.mCh = {}; (b.channel || []).forEach((c) => { R.mCh[c.id] = c; });
    R.mKat = {}; (b.kategori || []).forEach((k) => { R.mKat[k.id] = k; if (k.akun && !R.mAkun[k.akun] && k.akun_nama) R.mAkun[k.akun] = { no: k.akun, nama: k.akun_nama }; });
    R.mProd = {}; (b.produk || []).forEach((p) => { R.mProd[p.sku] = p; });
    R.mKontak = {}; (b.kontak || []).forEach((k) => { R.mKontak[k.id] = k; });
    R.mKry = {}; (b.karyawan || []).forEach((k) => { R.mKry[k.id] = k; });
    if (b.usaha && /^#[0-9A-Fa-f]{6}$/.test(b.usaha.warna_aksen || '') && b.usaha.warna_aksen.toUpperCase() !== '#F97316') document.documentElement.style.setProperty('--accent', b.usaha.warna_aksen);
  }
  R.namaAkun = (no) => (R.mAkun && R.mAkun[no] ? R.mAkun[no].nama : no || '–');
  R.akunKas = () => ((R.boot && R.boot.akun) || []).filter((a) => a.kas && a.aktif);
  R.chTag = (id) => { const c = R.mCh && R.mCh[id]; return c ? '<span class="ch-tag">' + R.chLogo(id, 18) + R.esc(c.nama) + '</span>' : R.esc(id || '–'); };
  /** Merek di sidebar: logo unggahan Owner, atau wordmark ROVELO bawaan. */
  R.brandHTML = function (us) {
    us = us || {};
    if (us.logo_data) return '<div class="brand-mark"><img alt="" src="' + R.esc(us.logo_data) + '"></div><div>' + R.esc(us.nama_usaha || 'ROVELO') + '<small>Finance</small></div>';
    return '<div><img class="brand-word" src="img/rovelo-hitam.png" alt="ROVELO"><span class="brand-sub">FINANCE</span></div>';
  };
  /** Panel sampul futuristik di halaman masuk. */
  function sampul(judul, sub) {
    const logos = ['SHP', 'TTS', 'LZD', 'TKP', 'RSL'].map((c) => '<img alt="" src="img/ch-' + c + '.png">').join('');
    const koin = (k) => '<div class="fkoin ' + k + '"><div class="koin"><i>Rp</i><i class="b">R</i></div></div>';
    return '<section class="auth-art"><div class="aa-grid"></div><div class="aa-glow g1"></div><div class="aa-glow g2"></div>' +
      '<div class="aa-top"><img class="aa-word" src="img/rovelo-putih.png" alt="ROVELO"><span class="aa-tag">FINANCE</span></div>' +
      '<div class="aa-mid"><span class="aa-kicker"><i></i>Sistem keuangan ROVELO</span><h2>' + judul + '</h2><p>' + sub + '</p></div>' +
      '<div class="aa-scene" aria-hidden="true">' +
      '<div class="glass gl-kpi"><small>Laba bersih bulan ini</small><b>Rp83.009.992</b><span class="naik">▲ 18,4% vs bulan lalu</span>' +
      '<svg viewBox="0 0 220 54" preserveAspectRatio="none"><defs><linearGradient id="gk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F97316" stop-opacity=".55"/><stop offset="1" stop-color="#F97316" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="M0 44 C 22 40, 30 30, 50 33 S 82 22, 100 26 S 132 12, 150 16 S 186 6, 220 4 L220 54 L0 54Z" fill="url(#gk)"/><path d="M0 44 C 22 40, 30 30, 50 33 S 82 22, 100 26 S 132 12, 150 16 S 186 6, 220 4" fill="none" stroke="#FB923C" stroke-width="2.4"/></svg></div>' +
      '<div class="glass gl-ch"><small>Dana marketplace siap dicairkan</small><b>Rp42.822.705</b><div class="logos">' + logos + '</div><div class="bar"><i style="width:72%"></i></div></div>' +
      koin('k1') + koin('k2') + koin('k3') + '</div>' +
      '<div class="aa-foot"><span>SAK EMKM</span><span>PPh Final UMKM 0,5%</span><span>Shopee · TikTok · Lazada · Tokopedia</span></div></section>';
  }
  R.opsiKas = (pilih) => R.akunKas().map((a) => '<option value="' + a.no + '" ' + (a.no === pilih ? 'selected' : '') + '>' + R.esc(a.nama) + '</option>').join('');
  R.opsiChannel = (pilih, filter) => ((R.boot && R.boot.channel) || []).filter((c) => c.aktif && (!filter || filter(c))).map((c) => '<option value="' + c.id + '" ' + (c.id === pilih ? 'selected' : '') + '>' + R.esc(c.nama) + '</option>').join('');
  R.terkunci = (tgl) => ((R.boot && R.boot.periodeTerkunci) || []).indexOf(String(tgl).slice(0, 7)) >= 0;

  // ---------- Login ----------
  app.keLogin = function (pesan) {
    R.boot = null; document.title = 'Masuk — ROVELO Finance';
    root().innerHTML = '<div class="auth">' + sampul('Keuangan toko jadi <em>jelas</em>, setiap hari.', 'Catat pemasukan & pengeluaran, impor penjualan marketplace, lalu lihat laba rugi, neraca, dan arus kas yang tersusun otomatis sesuai SAK EMKM.') +
      '<section class="auth-form"><form class="auth-box" novalidate><div class="brand">' + R.brandHTML() + '</div>' +
      '<h1>Masuk</h1><p class="sub">Gunakan akun yang diberikan Owner.</p>' +
      (pesan ? '<div class="alert w mb">' + R.ic('info', 's18') + '<span>' + R.esc(pesan) + '</span></div>' : '') +
      '<div class="stack"><div class="field"><label for="lu">Username</label><input id="lu" class="inp" name="u" autocomplete="username" autocapitalize="none" spellcheck="false" required></div>' +
      '<div class="field"><label for="lp">Kata sandi</label><div class="inp-group"><input id="lp" class="inp" name="p" type="password" autocomplete="current-password" required style="padding-right:48px"><button type="button" class="btn ghost sm icon" data-lihat style="position:absolute;right:4px;top:4px" aria-label="Tampilkan sandi">' + R.ic('eye', 's18') + '</button></div></div>' +
      '<div class="alert r hidden" data-err></div><button class="btn primary block" type="submit">Masuk</button></div>' +
      '<p class="xs faint center mt-l">Lupa kata sandi? Hubungi Owner untuk reset.</p></form></section></div>';
    const f = root().querySelector('form');
    f.querySelector('[data-lihat]').onclick = () => { const p = f.p; p.type = p.type === 'password' ? 'text' : 'password'; };
    setTimeout(() => f.u.focus(), 50);
    f.onsubmit = async (e) => {
      e.preventDefault();
      const err = f.querySelector('[data-err]'), btn = f.querySelector('[type=submit]');
      if (!f.u.value.trim() || !f.p.value) { err.textContent = 'Isi username dan kata sandi.'; err.classList.remove('hidden'); return; }
      btn.classList.add('busy'); err.classList.add('hidden');
      try {
        const d = await R.api.login(f.u.value.trim(), f.p.value);
        if (d.user.wajib_ganti_sandi) app.wajibGanti(f.p.value); else mulai();
      } catch (ex) { err.innerHTML = R.ic('alert', 's18') + ' ' + R.esc(ex.message); err.classList.remove('hidden'); btn.classList.remove('busy'); }
    };
  };
  app.wajibGanti = function (sandiLama) {
    root().innerHTML = '<div class="auth">' + sampul('Amankan <em>akun</em> Anda.', 'Kata sandi sementara dari Owner wajib diganti sebelum mulai bekerja.') +
      '<section class="auth-form"><form class="auth-box" novalidate><div class="brand">' + R.brandHTML() + '</div><h1>Buat kata sandi baru</h1><p class="sub">Minimal 8 karakter, berisi huruf besar, huruf kecil, dan angka.</p><div class="stack">' +
      '<div class="field"><label>Kata sandi sementara</label><input class="inp" name="l" type="password" autocomplete="current-password" value="' + R.esc(sandiLama || '') + '"></div>' +
      '<div class="field"><label>Kata sandi baru</label><input class="inp" name="b" type="password" autocomplete="new-password"></div>' +
      '<div class="field"><label>Ulangi kata sandi baru</label><input class="inp" name="u" type="password" autocomplete="new-password"></div>' +
      '<div class="alert r hidden" data-err></div><button class="btn primary block">Simpan & lanjutkan</button><button type="button" class="btn ghost block" data-keluar>Keluar</button></div></form></section></div>';
    const f = root().querySelector('form'), err = f.querySelector('[data-err]');
    f.querySelector('[data-keluar]').onclick = () => { R.api.hapusSesi(); app.keLogin(); };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const tampil = (m) => { err.textContent = m; err.classList.remove('hidden'); };
      if (f.b.value !== f.u.value) return tampil('Ulangi kata sandi baru dengan sama persis.');
      if (f.b.value.length < 8 || !/[a-z]/.test(f.b.value) || !/[A-Z]/.test(f.b.value) || !/\d/.test(f.b.value)) return tampil('Kata sandi minimal 8 karakter dengan huruf besar, huruf kecil, dan angka.');
      const btn = f.querySelector('.btn.primary'); btn.classList.add('busy');
      try {
        const d = await R.api.call('auth.gantiSandi', { sandi_lama: f.l.value, sandi_baru: f.b.value }, { idem: false });
        const s = R.api.sesi; s.token = d.token; s.exp = d.exp; s.user.wajib_ganti_sandi = false; R.api.simpanSesi(s);
        R.toast('Kata sandi diganti. Selamat bekerja!'); mulai();
      } catch (ex) { tampil(ex.message); btn.classList.remove('busy'); }
    };
  };
  app.keluar = async function () {
    try { await R.api.call('auth.logout', {}, { idem: false, tulis: false, timeout: 5000, ulang: false }); } catch (e) { /* abaikan */ }
    R.api.hapusSesi(); location.hash = ''; app.keLogin('Anda sudah keluar.');
  };

  // ---------- Kerangka aplikasi ----------
  function kerangka() {
    const u = (R.boot && R.boot.user) || R.api.sesi.user;
    const us = (R.boot && R.boot.usaha) || {};
    const logo = us.logo_data ? '<img alt="" src="' + R.esc(us.logo_data) + '">' : 'R';
    const nav = MENU.filter((m) => m.grup || R.boleh(m.roles));
    // buang label grup tanpa isi
    const navBersih = nav.filter((m, i) => !m.grup || (nav[i + 1] && !nav[i + 1].grup));
    root().innerHTML = '<div class="shell"><aside class="side" aria-label="Menu utama"><div class="brand">' + R.brandHTML(us) + '</div><nav class="nav">' +
      navBersih.map((m) => m.grup ? '<div class="nav-label">' + m.grup + '</div>' : '<a href="#/' + m.id + '" data-nav="' + m.id + '">' + R.ic(m.ic) + '<span>' + m.label + '</span>' + (m.id === 'transaksi' ? '<span class="badge-n hidden" data-draft></span>' : '') + '</a>').join('') +
      '</nav><div class="side-foot"><div class="me" data-akun tabindex="0"><div class="avatar">' + R.esc((u.nama || u.username || '?').charAt(0).toUpperCase()) + '</div><div class="grow"><b class="ellipsis">' + R.esc(u.nama || u.username) + '</b><small>' + R.esc(u.peran) + '</small></div><button class="btn ghost sm icon" data-keluar title="Keluar" aria-label="Keluar">' + R.ic('logout', 's18') + '</button></div></div></aside>' +
      '<div class="main"><header class="top"><button class="icon-btn mobile-only" data-menu aria-label="Menu">' + R.ic('menu') + '</button><h1 data-judul>ROVELO Finance</h1><span class="sp"></span><span class="sync desk-only" data-sync><span class="sd"></span><span data-sync-t>Tersinkron</span></span>' +
      (R.boleh(OAS) ? '<button class="btn primary sm desk-only" data-catat>' + R.ic('plus', 's16') + ' Catat</button>' : '') +
      '<div style="position:relative"><button class="icon-btn" data-bell aria-label="Pengingat">' + R.ic('bell') + '<span class="dot-n hidden"></span></button></div></header>' +
      '<main class="content" id="view" tabindex="-1"></main></div></div>' + bnav();
    const r = root();
    r.querySelector('[data-keluar]').onclick = (e) => { e.stopPropagation(); app.keluar(); };
    r.querySelector('[data-akun]').onclick = () => { location.hash = '#/akun'; };
    r.querySelector('[data-bell]').onclick = (e) => { e.stopPropagation(); tampilNotif(e.currentTarget.parentElement); };
    const c = r.querySelector('[data-catat]'); if (c) c.onclick = catatCepat;
    r.querySelector('[data-menu]').onclick = menuLainnya;
    R.on(r, 'click', '[data-fab]', catatCepat);
    R.on(r, 'click', '[data-lainnya]', menuLainnya);
    window.addEventListener('scroll', () => { const t = r.querySelector('.top'); if (t) t.classList.toggle('scrolled', window.scrollY > 4); }, { passive: true });
    R.api.onStatus((n) => { const s = r.querySelector('[data-sync]'); if (!s) return; s.classList.toggle('busy', n > 0); s.querySelector('[data-sync-t]').textContent = n > 0 ? 'Menyinkronkan…' : 'Tersinkron'; });
  }
  function bnav() {
    const it = (id, ic, l) => '<a href="#/' + id + '" data-nav="' + id + '">' + R.ic(ic) + '<span>' + l + '</span></a>';
    if (R.boleh(OAS)) return '<nav class="bnav" aria-label="Navigasi bawah">' + it('dashboard', 'home', 'Beranda') + it('transaksi', 'receipt', 'Transaksi') + '<button class="fab" data-fab aria-label="Catat cepat">' + R.ic('plus') + '</button>' + it('penjualan', 'bag', 'Penjualan') + '<button data-lainnya>' + R.ic('menu') + '<span>Lainnya</span></button></nav>';
    return '<nav class="bnav" aria-label="Navigasi bawah">' + it('dashboard', 'home', 'Beranda') + it('laporan', 'chart', 'Laporan') + it('laporan-penjualan', 'trend', 'Penjualan') + it('pajak', 'landmark', 'Pajak') + '<button data-lainnya>' + R.ic('menu') + '<span>Lainnya</span></button></nav>';
  }
  function catatCepat() {
    const item = [
      { l: 'Pengeluaran', ic: 'up', w: 'var(--red-tint);color:var(--red)', f: () => R.catat('Pengeluaran'), roles: OAS },
      { l: 'Pemasukan', ic: 'down', w: 'var(--green-tint);color:var(--green)', f: () => R.catat('Pemasukan'), roles: OAS },
      { l: 'Transfer', ic: 'repeat', w: 'var(--blue-tint);color:var(--blue)', f: () => R.catat('Transfer'), roles: OAS },
      { l: 'Penjualan manual', ic: 'bag', w: 'var(--accent-tint);color:var(--accent-600)', f: () => { location.hash = '#/penjualan?tab=manual'; }, roles: OAS },
      { l: 'Impor penjualan', ic: 'upload', w: 'var(--lav-tint);color:var(--lav)', f: () => { location.hash = '#/penjualan?tab=impor'; }, roles: OA },
      { l: 'Pencairan dana', ic: 'cash', w: 'var(--green-tint);color:var(--green)', f: () => { location.hash = '#/penjualan?tab=pencairan'; }, roles: OA }
    ].filter((x) => R.boleh(x.roles));
    const d = R.drawer({ judul: 'Catat cepat', isi: '<p class="muted small" style="margin-top:0">Pilih jenis catatan. Jurnal akuntansinya dibuat otomatis.</p><div class="sheet-menu">' + item.map((x, i) => '<button data-i="' + i + '"><span class="si" style="background:' + x.w + '">' + R.ic(x.ic) + '</span>' + x.l + '</button>').join('') + '</div>' });
    R.on(d.body, 'click', '[data-i]', (e, b) => { d.tutup(); setTimeout(item[+b.dataset.i].f, 200); });
  }
  function menuLainnya() {
    const nav = MENU.filter((m) => !m.grup && R.boleh(m.roles));
    const u = (R.boot && R.boot.user) || {};
    const d = R.drawer({ judul: 'Menu', isi: '<div class="me mb" data-akun><div class="avatar">' + R.esc((u.nama || '?').charAt(0)) + '</div><div class="grow"><b>' + R.esc(u.nama) + '</b><small>' + R.esc(u.peran) + ' · Akun & kata sandi</small></div>' + R.ic('chevR', 's18') + '</div><div class="sheet-menu">' +
      nav.map((m) => '<a href="#/' + m.id + '"><span class="si" style="background:var(--canvas)">' + R.ic(m.ic) + '</span>' + m.label + '</a>').join('') + '</div><button class="btn block mt-l" data-keluar>' + R.ic('logout', 's18') + ' Keluar</button>' });
    R.on(d.body, 'click', 'a', () => d.tutup());
    d.body.querySelector('[data-akun]').onclick = () => { d.tutup(); location.hash = '#/akun'; };
    d.body.querySelector('[data-keluar]').onclick = () => { d.tutup(); app.keluar(); };
  }

  // ---------- Pengingat ----------
  let notifData = [];
  function muatNotif() {
    R.api.swr('notif.list', {}, (d) => {
      notifData = d || [];
      const dot = R.$('[data-bell] .dot-n'); if (dot) dot.classList.toggle('hidden', !notifData.length);
      const dr = notifData.find((x) => /Draft|menunggu diposting/.test(x.judul));
      const b = R.$('[data-draft]'); if (b) { const n = dr ? parseInt(dr.judul, 10) : 0; b.textContent = n || ''; b.classList.toggle('hidden', !n); }
    }).catch(() => {});
  }
  function tampilNotif(wadah) {
    const ada = wadah.querySelector('.pop'); if (ada) { ada.remove(); return; }
    const p = document.createElement('div'); p.className = 'pop';
    p.innerHTML = '<div class="row between" style="padding:8px 10px"><b>Pengingat</b><span class="xs faint">' + notifData.length + ' item</span></div>' +
      (notifData.length ? notifData.map((n) => '<a class="notif-item" href="' + R.esc(n.tautan || '#/dashboard') + '"><span class="ni ' + R.esc(n.tipe) + '">' + R.ic(n.tipe === 'info' ? 'info' : 'alert', 's18') + '</span><span class="small">' + R.esc(n.judul) + '</span></a>').join('') : R.kosong('Semua beres', 'Tidak ada pengingat saat ini.', 'check'));
    wadah.appendChild(p);
    const tutup = (e) => { if (!p.contains(e.target)) { p.remove(); document.removeEventListener('click', tutup); } };
    setTimeout(() => document.addEventListener('click', tutup), 0);
    R.on(p, 'click', 'a', () => p.remove());
  }

  // ---------- Router ----------
  let navId = 0, bersihkan = null;
  R.navId = () => navId;
  R.masihDi = (id) => id === navId;
  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [jalur, qs] = h.split('?');
    const bag = (jalur || 'dashboard').split('/');
    const q = {}; (qs || '').split('&').forEach((p) => { if (!p) return; const [k, v] = p.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { id: bag[0] || 'dashboard', sub: bag[1] || '', q: q };
  }
  R.ubahQuery = function (q) {
    const r = parse(); const gabung = Object.assign({}, r.q, q);
    const s = Object.keys(gabung).filter((k) => gabung[k] !== '' && gabung[k] !== null && gabung[k] !== undefined).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(gabung[k])).join('&');
    history.replaceState(null, '', '#/' + r.id + (r.sub ? '/' + r.sub : '') + (s ? '?' + s : ''));
  };
  function rute() {
    if (!R.api.sesi) return app.keLogin();
    const r = parse();
    const m = MENU.find((x) => x.id === r.id);
    const hal = R.halaman[r.id];
    if (!hal || (m && !R.boleh(m.roles)) || (hal.roles && !R.boleh(hal.roles))) { if (r.id !== 'dashboard') R.toast('Halaman tidak tersedia untuk peran Anda.', 'info'); location.replace('#/dashboard'); return; }
    navId++;
    if (typeof bersihkan === 'function') { try { bersihkan(); } catch (e) { /* abaikan */ } }
    bersihkan = null;
    R.$$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === r.id));
    const judul = hal.judul || (m && m.label) || 'ROVELO Finance';
    const j = R.$('[data-judul]'); if (j) j.textContent = judul;
    document.title = judul + ' — ROVELO Finance';
    const view = document.getElementById('view');
    // wadah baru per halaman → pendengar event halaman lama ikut terbuang
    const wadah = document.createElement('div'); wadah.className = 'page-in';
    view.replaceChildren(wadah);
    window.scrollTo(0, 0);
    try { bersihkan = hal.render(wadah, r.q, r.sub, navId); } catch (e) { console.error(e); R.gagalMuat(e, wadah, rute); }
    R.api.perbaruiToken();
  }
  app.rute = rute;

  // ---------- Mulai ----------
  async function mulai() {
    const s = R.api.sesi;
    const kunciBoot = 'rf_boot:' + s.user.username;
    const tersimpan = R.LS.get(kunciBoot);
    let sudah = false;
    const tampil = (d) => {
      R.boot = d; indeks();
      if (!sudah) { sudah = true; kerangka(); rute(); muatNotif(); }
      else { const br = R.$('.side .brand'); if (br) br.innerHTML = R.brandHTML(d.usaha); }
    };
    if (tersimpan && tersimpan.user && tersimpan.user.username === s.user.username) tampil(tersimpan);
    else root().innerHTML = R.loaderKoin('Menyiapkan ROVELO Finance');
    try {
      const d = await R.api.get('app.bootstrap', {});
      if (d.user.wajib_ganti_sandi) return app.wajibGanti();
      R.LS.set(kunciBoot, d);
      const berubah = !tersimpan || JSON.stringify(tersimpan) !== JSON.stringify(d);
      if (berubah) { const awal = !sudah; tampil(d); if (!awal) rute(); }
    } catch (e) {
      if (e.code === 'AUTH_REQUIRED' || e.code === 'MUST_CHANGE_PASSWORD') return;
      if (!sudah) root().innerHTML = '<div class="boot"><div class="card" style="max-width:420px">' + R.kosong('Tidak bisa terhubung ke server', e.message, 'alert', '<button class="btn primary" data-reload>Muat ulang</button>') + '</div></div>';
      if (!sudah) { const b = root().querySelector('[data-reload]'); if (b) b.onclick = () => location.reload(); }
      else R.toast('Data master belum terbaru: ' + e.message, 'err');
    }
    setInterval(muatNotif, 5 * 60e3);
  }
  /** Muat ulang data master (setelah ubah produk/kategori/pengaturan). */
  app.muatUlangBoot = async function () {
    try {
      const d = await R.api.get('app.bootstrap', {});
      R.LS.set('rf_boot:' + d.user.username, d); R.boot = d; indeks();
    } catch (e) { R.galat(e); }
  };
  app.muatNotif = muatNotif;

  // ---------- Halaman akun ----------
  R.halaman.akun = {
    judul: 'Akun Saya', roles: SEMUA,
    render(el) {
      const u = R.boot.user;
      el.innerHTML = '<div class="page-head"><div><h2>Akun saya</h2><p>Profil dan keamanan akun.</p></div></div><div class="grid g2"><div class="card"><div class="row"><div class="avatar" style="width:56px;height:56px;font-size:20px">' + R.esc(u.nama.charAt(0)) + '</div><div><b style="font-size:17px">' + R.esc(u.nama) + '</b><div class="muted small">@' + R.esc(u.username) + ' · ' + R.esc(u.peran) + '</div></div></div><hr class="divider"><div class="alert">' + R.ic('info', 's18') + '<span>Data nama dan peran diatur oleh Owner di menu Pengaturan → Pengguna.</span></div><button class="btn block mt" data-keluar>' + R.ic('logout', 's18') + ' Keluar dari aplikasi</button></div>' +
        '<form class="card" novalidate><h3 class="sec">Ganti kata sandi</h3><p class="sec-sub">Setelah diganti, sesi di perangkat lain otomatis keluar.</p><div class="stack mt"><div class="field"><label>Kata sandi lama</label><input class="inp" name="l" type="password" autocomplete="current-password"></div><div class="field"><label>Kata sandi baru</label><input class="inp" name="b" type="password" autocomplete="new-password"><span class="hint">Minimal 8 karakter, huruf besar, huruf kecil, dan angka.</span></div><button class="btn primary">Simpan kata sandi</button></div></form></div>';
      el.querySelector('[data-keluar]').onclick = app.keluar;
      const f = el.querySelector('form');
      f.onsubmit = async (e) => {
        e.preventDefault(); const b = f.querySelector('.btn'); b.classList.add('busy');
        try { const d = await R.api.call('auth.gantiSandi', { sandi_lama: f.l.value, sandi_baru: f.b.value }, { idem: false }); const s = R.api.sesi; s.token = d.token; s.exp = d.exp; R.api.simpanSesi(s); f.reset(); R.toast('Kata sandi berhasil diganti.'); }
        catch (ex) { R.galat(ex); } finally { b.classList.remove('busy'); }
      };
    }
  };

  window.addEventListener('hashchange', () => { if (R.boot) rute(); });
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.ROVELO_CONFIG || !window.ROVELO_CONFIG.GAS_URL) { root().innerHTML = '<div class="boot">Konfigurasi js/config.js tidak ditemukan.</div>'; return; }
    if (R.api.sesi && R.api.sesi.exp > Date.now()) { if (R.api.sesi.user && R.api.sesi.user.wajib_ganti_sandi) app.wajibGanti(); else mulai(); }
    else { R.api.hapusSesi(); app.keLogin(); }
  });
})();
