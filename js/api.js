/* =========================================================
   ROVELO Finance — lapisan API
   • fetch POST text/plain (tanpa preflight CORS) ke GAS
   • gabung otomatis beberapa panggilan baca → 1 permintaan "multi"
   • SWR: tampilkan data tersimpan dulu (instan), perbarui di belakang
   • tulis: client_id idempoten + 1x coba ulang bila jaringan putus
   ========================================================= */
(function () {
  const R = window.R = window.R || {};
  const LS = {
    get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } },
    keys() { try { return Object.keys(localStorage); } catch (e) { return []; } }
  };
  R.LS = LS;
  const K_SESI = 'rf_sesi', K_CACHE = 'rf_c:';
  let sesi = LS.get(K_SESI); // {token, exp, user}
  const mem = new Map();
  let antrean = [], jadwal = null, aktif = 0;
  const pendengar = new Set();

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  function status(n) { aktif += n; pendengar.forEach((f) => f(aktif)); }
  function ApiError(err) { const e = new Error((err && err.message) || 'Terjadi kesalahan.'); e.code = (err && err.code) || 'ERROR'; e.fields = err && err.fields; e.extra = err; return e; }

  async function kirim(body, opt) {
    const url = (window.ROVELO_CONFIG || {}).GAS_URL;
    if (!url || url.indexOf('GANTI_DENGAN') >= 0) throw ApiError({ code: 'CONFIG', message: 'Alamat server belum diatur di js/config.js.' });
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), (opt && opt.timeout) || 90000);
    status(1);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow', signal: ctrl.signal, cache: 'no-store' });
      const teks = await res.text();
      let json;
      try { json = JSON.parse(teks); } catch (e) { throw ApiError({ code: 'BAD_RESPONSE', message: 'Server mengirim balasan tidak terduga. Pastikan Web App di-deploy dengan akses "Anyone".' }); }
      return json;
    } catch (e) {
      if (e.name === 'AbortError') throw ApiError({ code: 'TIMEOUT', message: 'Server terlalu lama merespons. Coba lagi.' });
      if (e.code) throw e;
      throw ApiError({ code: 'NETWORK', message: 'Tidak bisa terhubung. Periksa koneksi internet.' });
    } finally { clearTimeout(to); status(-1); }
  }
  function tanganiSesi(res) {
    if (res && !res.ok && res.error) {
      if (res.error.code === 'AUTH_REQUIRED') { R.api.hapusSesi(); if (R.app) R.app.keLogin('Sesi berakhir. Silakan masuk lagi.'); }
      if (res.error.code === 'MUST_CHANGE_PASSWORD' && R.app) R.app.wajibGanti();
    }
    return res;
  }

  /** Panggilan langsung (dipakai untuk tulis). */
  async function call(action, data, opt) {
    opt = opt || {};
    data = data || {};
    if (opt.idem !== false && /(create|bayar|save|Save|setor|posting|batal|jual|upload|Manual|Start|Chunk|kunci|catat|jurnalUmum|saldoAwal|penyesuaian|tutupTahun|ubahStatus)/.test(action) && !data.client_id) data.client_id = uid();
    const body = { action: action, data: data, token: sesi && sesi.token };
    let res;
    try { res = await kirim(body, opt); }
    catch (e) {
      if (e.code === 'NETWORK' && opt.ulang !== false) { await new Promise((r) => setTimeout(r, 1500)); res = await kirim(body, opt); }
      else throw e;
    }
    tanganiSesi(res);
    if (!res.ok) throw ApiError(res.error);
    if (opt.tulis !== false && !/^(auth\.|lampiran\.get)/.test(action) && /(create|bayar|save|Save|setor|posting|batal|jual|Manual|Finish|Chunk|kunci|buka|catat|jurnalUmum|saldoAwal|penyesuaian|tutupTahun|ubahStatus|sync|resetSandi)/.test(action)) setelahTulis();
    return res.data === null ? { _pesan: res.message } : Object.assign(Array.isArray(res.data) ? res.data : res.data, { _pesan: res.message });
  }

  /** Baca: digabung dengan panggilan lain di tick yang sama. */
  function get(action, data) {
    return new Promise((resolve, reject) => {
      antrean.push({ action: action, data: data || {}, resolve: resolve, reject: reject });
      if (!jadwal) jadwal = setTimeout(flush, 0);
    });
  }
  async function flush() {
    const batch = antrean.splice(0, 12);
    jadwal = antrean.length ? setTimeout(flush, 0) : null;
    if (!batch.length) return;
    if (batch.length === 1) {
      const b = batch[0];
      try { const res = tanganiSesi(await kirim({ action: b.action, data: b.data, token: sesi && sesi.token })); res.ok ? b.resolve(res.data) : b.reject(ApiError(res.error)); }
      catch (e) { b.reject(e); }
      return;
    }
    try {
      const res = tanganiSesi(await kirim({ action: 'multi', data: { calls: batch.map((b) => ({ action: b.action, data: b.data })) }, token: sesi && sesi.token }));
      if (!res.ok) { batch.forEach((b) => b.reject(ApiError(res.error))); return; }
      res.data.results.forEach((r, i) => { tanganiSesi(r); r.ok ? batch[i].resolve(r.data) : batch[i].reject(ApiError(r.error)); });
    } catch (e) { batch.forEach((b) => b.reject(e)); }
  }

  function kunci(action, data) { return (sesi && sesi.user ? sesi.user.username : '-') + '|' + action + '|' + JSON.stringify(data || {}); }
  /**
   * SWR: cb(data, {cache}) dipanggil segera bila ada data tersimpan, lalu lagi bila data baru berbeda.
   * opt.simpan: simpan ke localStorage agar instan saat aplikasi dibuka lagi.
   */
  function swr(action, data, cb, opt) {
    opt = opt || {};
    const k = kunci(action, data);
    let hit = mem.get(k);
    if (!hit && opt.simpan) { hit = LS.get(K_CACHE + k); if (hit) mem.set(k, hit); }
    if (hit) { try { cb(hit.d, { cache: true, umur: Date.now() - hit.t }); } catch (e) { console.error(e); } }
    const p = get(action, data).then((d) => {
      const baru = { d: d, t: Date.now(), s: JSON.stringify(d) };
      const sama = hit && hit.s === baru.s;
      mem.set(k, baru);
      if (opt.simpan) simpanLS(k, baru);
      if (!sama) cb(d, { cache: false });
      return d;
    });
    if (hit) { p.catch((e) => { if (e.code !== 'AUTH_REQUIRED' && R.toast) R.toast('Data mungkin belum terbaru: ' + e.message, 'err'); }); return Promise.resolve(hit.d); }
    return p;
  }
  function simpanLS(k, v) {
    if (v.s.length > 400000) return;
    if (!LS.set(K_CACHE + k, v)) {
      // penuh → buang separuh cache tertua
      const ks = LS.keys().filter((x) => x.indexOf(K_CACHE) === 0).map((x) => ({ k: x, t: (LS.get(x) || {}).t || 0 })).sort((a, b) => a.t - b.t);
      ks.slice(0, Math.ceil(ks.length / 2)).forEach((x) => LS.del(x.k));
      LS.set(K_CACHE + k, v);
    }
  }
  /** Setelah data berubah: cache ditandai lama (tetap tampil, tapi selalu diperbarui). */
  function setelahTulis() { mem.forEach((v) => { v.s = '~' + v.s; }); }
  function hapusCache(pola) { Array.from(mem.keys()).forEach((k) => { if (!pola || k.indexOf(pola) >= 0) mem.delete(k); }); }

  R.api = {
    call: call, get: get, swr: swr, uid: uid, hapusCache: hapusCache,
    /** Tandai semua data tersimpan sebagai lama → halaman berikutnya pasti mengambil ulang dari server. */
    segarkan() { setelahTulis(); LS.keys().forEach((k) => { if (k.indexOf(K_CACHE) === 0) { const v = LS.get(k); if (v && v.s) { v.s = '~' + v.s; LS.set(k, v); } } }); },
    onStatus(f) { pendengar.add(f); return () => pendengar.delete(f); },
    get sesi() { return sesi; },
    simpanSesi(s) { sesi = s; LS.set(K_SESI, s); },
    hapusSesi() {
      sesi = null; mem.clear(); LS.del(K_SESI);
      LS.keys().forEach((k) => { if (k.indexOf(K_CACHE) === 0 || k.indexOf('rf_draf') === 0) LS.del(k); });
    },
    async login(username, password) {
      const res = await kirim({ action: 'auth.login', data: { username: username, password: password } });
      if (!res.ok) throw ApiError(res.error);
      R.api.simpanSesi({ token: res.data.token, exp: res.data.exp, user: res.data.user });
      return res.data;
    },
    async perbaruiToken() {
      if (!sesi || !sesi.exp || sesi.exp - Date.now() > 3600e3) return;
      try { const d = await call('auth.refresh', {}, { tulis: false }); sesi.token = d.token; sesi.exp = d.exp; LS.set(K_SESI, sesi); } catch (e) { /* biarkan */ }
    }
  };
})();
