/* ASCEND 365 — utilities: dates, DOM, charts, sheets, feedback */
window.A = window.A || {};
window.A.views = window.A.views || {};
(function (A) {
  'use strict';

  // ---------- basics ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sum = (arr, f = (x) => x) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);
  const avg = (arr, f) => (arr.length ? sum(arr, f) / arr.length : 0);
  const round = (v, d = 0) => { const m = Math.pow(10, d); return Math.round(v * m) / m; };
  const fmtMoney = (v) => (v < 0 ? '-' : '') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US');
  const fmtNum = (v, d = 0) => (v == null || isNaN(v) ? '—' : Number(round(v, d)).toLocaleString('en-US'));
  const pct = (v) => Math.round(v * 100) + '%';
  Object.assign(A, { esc, uid, clamp, sum, avg, round, fmtMoney, fmtNum, pct });

  // ---------- dates (local calendar keys YYYY-MM-DD) ----------
  const pad = (n) => String(n).padStart(2, '0');
  const key = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const utc = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const diff = (a, b) => Math.round((utc(b) - utc(a)) / 86400000); // b - a in days
  const add = (k, n) => { const d = parse(k); d.setDate(d.getDate() + n); return key(d); };
  const addMonths = (k, n) => { const d = parse(k); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return key(d); };
  const dow = (k) => parse(k).getDay();
  const today = () => key(new Date());
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const toMin = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  const fromMin = (m) => pad(Math.floor(((m % 1440) + 1440) % 1440 / 60)) + ':' + pad(((m % 60) + 60) % 60);
  const fmtTime = (t) => { if (!t) return ''; let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + pad(m) + ' ' + ap; };
  const fmtTimeShort = (t) => { if (!t) return ''; let [h, m] = t.split(':').map(Number); h = h % 12 || 12; return h + ':' + pad(m); };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const fmtDate = (k, o = {}) => { const d = parse(k); let s = (o.dow ? DOW[d.getDay()] + ', ' : '') + MON[d.getMonth()] + ' ' + d.getDate(); if (o.year) s += ', ' + d.getFullYear(); return s; };
  const weekStart = (k) => { const d = dow(k); return add(k, -((d + 6) % 7)); }; // Monday
  const monthKey = (k) => k.slice(0, 7);
  const fmtMonth = (mk) => { const [y, m] = mk.split('-').map(Number); return MON[m - 1] + ' ' + y; };
  const range = (a, b) => { const out = []; for (let k = a; k <= b; k = add(k, 1)) out.push(k); return out; };
  const timeNow = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  A.d = { key, parse, diff, add, addMonths, dow, today, nowMin, toMin, fromMin, fmtTime, fmtTimeShort, fmtDate, weekStart, monthKey, fmtMonth, range, timeNow, MON, DOW, DOWL, pad };

  // Transformation year
  A.START = '2026-11-20';
  A.END = '2027-11-20';
  A.TOTAL = 365;
  A.chapters = (function () {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const s = addMonths(A.START, i), e = add(addMonths(A.START, i + 1), -1);
      out.push({ n: i + 1, start: s, end: e });
    }
    return out;
  })();
  A.chapterOf = (k) => A.chapters.find((c) => k >= c.start && k <= c.end) || null;
  A.year = function (k = today()) {
    const dayNum = diff(A.START, k) + 1;
    const started = dayNum >= 1;
    const complete = k >= A.END;
    const completed = clamp(diff(A.START, k), 0, A.TOTAL);
    const remaining = clamp(diff(k, A.END), 0, A.TOTAL);
    return { dayNum, started, complete, completed, remaining, progress: completed / A.TOTAL, untilStart: started ? 0 : diff(k, A.START) };
  };

  // ---------- icons (inline SVG, stroke-based) ----------
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    day: '<rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3.5 9.5h17M8 14l2.5 2.5L16 12"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    social: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    tennis: '<circle cx="12" cy="12" r="8.5"/><path d="M5.5 6.5c3 2.5 3 8.5 0 11M18.5 6.5c-3 2.5-3 8.5 0 11"/>',
    biz: '<path d="M3.5 17.5 9 12l4 4 7.5-8"/><path d="M15 8h5.5v5.5"/>',
    look: '<path d="M12 3.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.8l5-.7z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    flame: '<path d="M12 21c4 0 7-2.8 7-6.8 0-3.6-2.4-5.6-3.8-8.2-.5 2.2-1.6 3.4-3 4C12.6 7.4 11 4.6 8.6 3c.4 3-1.2 5-2.6 6.8C4.8 11.3 5 12.6 5 14.2 5 18.2 8 21 12 21z"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/>',
    bolt: '<path d="M13 2.5 4.5 13.5h6.5L10 21.5l9-11.5h-6.5z"/>',
    trophy: '<path d="M8 4h8v4.5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3.5 3.5 0 0 0 8 11M16 6h3.5v1.5A3.5 3.5 0 0 1 16 11M12 12.5V17M8.5 20.5h7M9.5 17h5v3.5h-5z"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    camera: '<path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    book: '<path d="M4 4.5h6a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H4zM20 4.5h-6a2 2 0 0 0-2 2V20a1.5 1.5 0 0 1 1.5-1.5H20z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
    send: '<path d="M4 12 20 4l-4 16-4-7z"/><path d="M12 13l8-9"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    skip: '<path d="M6 5l8 7-8 7zM18 5v14"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    review: '<path d="M5 4h11l3 3v13H5z"/><path d="M9 12l2 2 4-4"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>'
  };
  A.icon = (n, s = 20, extra = '') => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${P[n] || ''}</svg>`;

  // categories
  A.CATS = {
    fitness: { label: 'Fitness', color: 'var(--c-fitness)', hex: '#fb7185' },
    tennis: { label: 'Tennis', color: 'var(--c-tennis)', hex: '#a3e635' },
    business: { label: 'Business', color: 'var(--c-business)', hex: '#fbbf24' },
    social: { label: 'Social', color: 'var(--c-social)', hex: '#38bdf8' },
    discipline: { label: 'Discipline', color: 'var(--c-discipline)', hex: '#a78bfa' },
    appearance: { label: 'Appearance', color: 'var(--c-appearance)', hex: '#2dd4bf' },
    learning: { label: 'Learning', color: 'var(--c-learning)', hex: '#94a3b8' },
    recovery: { label: 'Recovery', color: 'var(--c-recovery)', hex: '#60a5fa' },
    life: { label: 'Life', color: 'var(--c-life)', hex: '#8b8b9e' }
  };
  A.catColor = (c) => (A.CATS[c] || A.CATS.life).color;

  // ---------- charts (SVG strings) ----------
  const C = {};
  C.ring = (p, size = 120, stroke = 10, color = 'url(#rg)', inner = '', track = 'var(--card3)') => {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(p || 0, 0, 1));
    const gid = 'rg' + Math.random().toString(36).slice(2, 6);
    const col = color === 'url(#rg)' ? `url(#${gid})` : color;
    return `<div class="ringwrap" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent3)"/><stop offset="1" stop-color="var(--accent)"/></linearGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${track}" stroke-width="${stroke}" fill="none"/><circle class="ringfg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${col}" stroke-width="${stroke}" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dashoffset .8s var(--ease)" data-c="${c}"/></svg><div class="in">${inner}</div></div>`;
  };
  // points: [{x:label, y:number}] ; opts: {h, color, fill, min, max, fmt, goal, goalLabel, dots}
  C.line = (pts, o = {}) => {
    if (!pts.length) return '<div class="empty">No data yet</div>';
    const W = 340, H = o.h || 150, pl = 34, pr = 10, pt = 12, pb = 22;
    const ys = pts.map((p) => p.y).filter((v) => v != null);
    let mn = o.min != null ? o.min : Math.min(...ys, o.goal != null ? o.goal : Infinity);
    let mx = o.max != null ? o.max : Math.max(...ys, o.goal != null ? o.goal : -Infinity);
    if (mn === mx) { mn -= 1; mx += 1; }
    const padv = (mx - mn) * 0.12; if (o.min == null) mn -= padv; if (o.max == null) mx += padv;
    const X = (i) => pl + (pts.length === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (pts.length - 1));
    const Y = (v) => pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb);
    const col = o.color || 'var(--accent2)';
    const gid = 'lg' + Math.random().toString(36).slice(2, 6);
    let path = '', area = '';
    pts.forEach((p, i) => { if (p.y == null) return; path += (path ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.y).toFixed(1); });
    const valid = pts.map((p, i) => [i, p]).filter(([, p]) => p.y != null);
    if (valid.length > 1) area = path + `L${X(valid[valid.length - 1][0]).toFixed(1)} ${H - pb}L${X(valid[0][0]).toFixed(1)} ${H - pb}Z`;
    const fmt = o.fmt || ((v) => fmtNum(v, Math.abs(mx - mn) < 10 ? 1 : 0));
    let grid = '';
    for (let i = 0; i <= 3; i++) { const v = mn + ((mx - mn) * i) / 3, y = Y(v); grid += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pl - 6}" y="${y + 3}" text-anchor="end">${fmt(v)}</text>`; }
    const step = Math.max(1, Math.ceil(pts.length / 6));
    const lastOK = (n) => (n - 1) % step === 0 || (n - 1) % step >= step * 0.6;
    let xl = ''; pts.forEach((p, i) => { if (i % step === 0 || (i === pts.length - 1 && lastOK(pts.length))) xl += `<text x="${X(i)}" y="${H - 6}" text-anchor="middle">${esc(p.x)}</text>`; });
    let goal = '';
    if (o.goal != null) { const y = Y(o.goal); goal = `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--good)" stroke-dasharray="4 4" opacity=".7"/><text x="${W - pr}" y="${y - 4}" text-anchor="end" style="fill:var(--good)">${esc(o.goalLabel || 'Goal')}</text>`; }
    const dots = valid.length <= 40 ? valid.map(([i, p]) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="3" fill="var(--bg)" stroke="${col}" stroke-width="2"/>`).join('') : '';
    return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.fillColor || 'var(--accent)'}" stop-opacity=".35"/><stop offset="1" stop-color="${o.fillColor || 'var(--accent)'}" stop-opacity="0"/></linearGradient></defs>${grid}${goal}${area ? `<path d="${area}" fill="url(#${gid})"/>` : ''}<path d="${path}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${dots}${xl}</svg>`;
  };
  // bars: [{x, y, color?}]
  C.bars = (pts, o = {}) => {
    if (!pts.length) return '<div class="empty">No data yet</div>';
    const W = 340, H = o.h || 140, pl = o.noAxis ? 4 : 34, pr = 6, pt = 14, pb = 22;
    const mx = Math.max(o.max || 0, ...pts.map((p) => p.y), o.goal || 0) || 1;
    const bw = (W - pl - pr) / pts.length;
    const Y = (v) => pt + (1 - v / mx) * (H - pt - pb);
    const fmt = o.fmt || ((v) => fmtNum(v));
    let s = '';
    if (!o.noAxis) for (let i = 0; i <= 2; i++) { const v = (mx * i) / 2, y = Y(v); s += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pl - 6}" y="${y + 3}" text-anchor="end">${fmt(v)}</text>`; }
    const step = Math.max(1, Math.ceil(pts.length / 8));
    pts.forEach((p, i) => {
      const x = pl + i * bw + bw * 0.18, w = bw * 0.64, y = Y(Math.max(0, p.y)), h = H - pb - y;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${Math.max(h, p.y > 0 ? 2 : 0)}" rx="${Math.min(4, w / 2)}" fill="${p.color || o.color || 'var(--accent2)'}" opacity="${p.dim ? 0.35 : 1}"/>`;
      if (o.labels && p.y > 0) s += `<text x="${x + w / 2}" y="${y - 3}" text-anchor="middle" style="fill:var(--muted)">${fmt(p.y)}</text>`;
      if (i % step === 0 || (i === pts.length - 1 && ((pts.length - 1) % step === 0 || (pts.length - 1) % step >= step * 0.6))) s += `<text x="${x + w / 2}" y="${H - 6}" text-anchor="middle">${esc(p.x)}</text>`;
    });
    if (o.goal) { const y = Y(o.goal); s += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--good)" stroke-dasharray="4 4" opacity=".8"/><text x="${W - pr}" y="${y - 4}" text-anchor="end" style="fill:var(--good)">${esc(o.goalLabel || 'Goal')}</text>`; }
    return `<svg class="chart" viewBox="0 0 ${W} ${H}">${s}</svg>`;
  };
  // heatmap: values map key->0..1 (null = no data); weeks columns ending at endKey
  C.heat = (valFn, endKey, weeks = 17, o = {}) => {
    const end = endKey; const startCol = A.d.weekStart(end); const first = A.d.add(startCol, -7 * (weeks - 1));
    let cells = '';
    for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) {
      const k = A.d.add(first, w * 7 + d);
      if (k > end) { cells += '<i style="opacity:0"></i>'; continue; }
      const v = valFn(k);
      let bg = 'var(--card3)';
      if (v != null && v > 0) bg = `color-mix(in srgb, var(--accent2) ${Math.round(20 + v * 80)}%, var(--card3))`;
      cells += `<i title="${k}" style="background:${bg}${k === A.d.today() ? ';outline:1.5px solid var(--accent3);outline-offset:1px' : ''}"></i>`;
    }
    return `<div class="heat" style="grid-template-columns:repeat(${weeks},1fr)">${cells}</div>`;
  };
  C.spark = (vals, color = 'var(--accent2)', w = 80, h = 26) => {
    const v = vals.filter((x) => x != null); if (v.length < 2) return '';
    const mn = Math.min(...v), mx = Math.max(...v) || 1, r = mx - mn || 1;
    const d = vals.map((x, i) => (x == null ? null : [(i / (vals.length - 1)) * w, h - 2 - ((x - mn) / r) * (h - 4)])).filter(Boolean).map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  };
  A.chart = C;
  A.bar = (p, color) => `<div class="bar"><i style="width:${clamp(p * 100, 0, 100)}%${color ? ';background:' + color : ''}"></i></div>`;

  // ---------- feedback: toast, sound, haptics, xp float, celebration ----------
  let toastT;
  A.toast = (msg) => {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.querySelector('.app').appendChild(el); }
    el.textContent = msg; el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2200);
  };
  let actx;
  A.sfx = (type) => {
    if (!A.state || !A.state.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const notes = { tick: [[880, 0, 0.06]], done: [[660, 0, 0.07], [990, 0.06, 0.1]], level: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.12], [1047, 0.3, 0.25]], undo: [[440, 0, 0.06]] }[type] || [[660, 0, 0.06]];
      notes.forEach(([f, d, len]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.08, t + d + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d + len);
        o.connect(g); g.connect(actx.destination); o.start(t + d); o.stop(t + d + len + 0.02);
      });
    } catch (e) { /* audio not available */ }
  };
  A.hapticsSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  A.haptic = (ms = 12) => { if (A.state && A.state.settings.haptics && A.hapticsSupported) try { navigator.vibrate(ms); } catch (e) {} };
  A.reduced = () => (A.state && A.state.settings.reducedMotion) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  A.floatXP = (el, amt) => {
    if (!el || !amt) return;
    const r = el.getBoundingClientRect(); const f = document.createElement('div');
    f.className = 'xpfloat'; f.textContent = (amt > 0 ? '+' : '') + amt + ' XP';
    f.style.left = r.left + r.width / 2 - 24 + 'px'; f.style.top = r.top - 6 + 'px';
    document.body.appendChild(f); setTimeout(() => f.remove(), 1200);
  };
  A.celebrate = ({ icon = '🏆', title, sub = '', btn = 'Continue' }) => new Promise((res) => {
    const app = document.querySelector('.app');
    const el = document.createElement('div'); el.className = 'celebrate';
    el.innerHTML = `<canvas></canvas><div class="cb"><div class="ico">${icon}</div><h2>${esc(title)}</h2><p>${esc(sub)}</p><button class="btn pri">${esc(btn)}</button></div>`;
    app.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    A.sfx('level'); A.haptic(30);
    if (!A.reduced()) burst(el.querySelector('canvas'));
    el.querySelector('button').onclick = () => { el.classList.remove('on'); setTimeout(() => { el.remove(); res(); }, 300); };
  });
  function burst(cv) {
    const r = cv.getBoundingClientRect(); cv.width = r.width * 2; cv.height = r.height * 2;
    const x = cv.getContext('2d'); const cx = cv.width / 2, cy = cv.height * 0.42;
    const cols = ['#c4b5fd', '#a78bfa', '#8b5cf6', '#ffffff', '#f0abfc'];
    const ps = Array.from({ length: 60 }, () => { const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 9; return { x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, r: 2 + Math.random() * 4, c: cols[(Math.random() * cols.length) | 0], l: 1 }; });
    (function f() {
      x.clearRect(0, 0, cv.width, cv.height); let alive = false;
      ps.forEach((p) => { if (p.l <= 0) return; alive = true; p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.vx *= 0.985; p.l -= 0.014; x.globalAlpha = Math.max(0, p.l); x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); });
      if (alive) requestAnimationFrame(f);
    })();
  }

  // ---------- sheets ----------
  // A.sheet({title, body, foot: [{label, cls, act}], onMount(el, close), onAction(act, el, close)})
  A.sheet = (o) => {
    const app = document.querySelector('.app');
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const sh = document.createElement('div'); sh.className = 'sheet';
    const foot = (o.foot || []).map((b) => `<button class="btn ${b.cls || ''}" data-sact="${b.act}">${b.label}</button>`).join('');
    sh.innerHTML = `<div class="grab"></div><div class="sh"><h2>${o.title || ''}</h2><button class="iconbtn" data-sact="close" aria-label="Close">${A.icon('plus', 18, 'style="transform:rotate(45deg)"')}</button></div><div class="sb">${o.body || ''}</div>${foot ? `<div class="sf">${foot}</div>` : ''}`;
    app.appendChild(scrim); app.appendChild(sh);
    requestAnimationFrame(() => { scrim.classList.add('on'); sh.classList.add('on'); });
    let closed = false;
    const close = () => { if (closed) return; closed = true; scrim.classList.remove('on'); sh.classList.remove('on'); setTimeout(() => { scrim.remove(); sh.remove(); if (o.onClose) o.onClose(); }, 320); };
    scrim.onclick = close;
    sh.addEventListener('click', (e) => {
      const t = e.target.closest('[data-sact]'); if (t) { const a = t.dataset.sact; if (a === 'close') return close(); if (o.onAction) o.onAction(a, sh, close, t); }
      A.bindFormBits(e);
    });
    if (o.onMount) o.onMount(sh, close);
    return { el: sh, close };
  };
  A.confirm = (title, msg, okLabel = 'Confirm', danger) => new Promise((res) => {
    let done = false;
    A.sheet({ title, body: `<p class="muted" style="margin:0 0 6px">${msg}</p>`, foot: [{ label: 'Cancel', act: 'no' }, { label: okLabel, cls: danger ? 'danger' : 'pri', act: 'yes' }],
      onAction: (a, el, close) => { done = true; close(); res(a === 'yes'); }, onClose: () => { if (!done) res(false); } });
  });

  // ---------- form helpers ----------
  // field: {n, l, t:'text'|'number'|'date'|'time'|'textarea'|'select'|'chips'|'multichips'|'scale'|'toggle', o:[[v,label]], v, ph, step, min, max, half}
  A.field = (f) => {
    const v = f.v == null ? '' : f.v;
    let inner = '';
    const at = `name="${f.n}" ${f.ph ? `placeholder="${esc(f.ph)}"` : ''} ${f.step ? `step="${f.step}"` : ''} ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} ${f.req ? 'required' : ''}`;
    switch (f.t) {
      case 'textarea': inner = `<textarea class="inp" ${at}>${esc(v)}</textarea>`; break;
      case 'select': inner = `<select class="inp" ${at}>${f.o.map(([ov, ol]) => `<option value="${esc(ov)}" ${String(ov) === String(v) ? 'selected' : ''}>${esc(ol)}</option>`).join('')}</select>`; break;
      case 'chips': inner = `<div class="chips" data-chips="${f.n}" data-single="1">${f.o.map(([ov, ol]) => `<button type="button" class="chip ${String(ov) === String(v) ? 'on' : ''}" data-v="${esc(ov)}">${esc(ol)}</button>`).join('')}</div><input type="hidden" name="${f.n}" value="${esc(v)}">`; break;
      case 'multichips': { const arr = Array.isArray(v) ? v : []; inner = `<div class="chips" data-chips="${f.n}">${f.o.map(([ov, ol]) => `<button type="button" class="chip ${arr.includes(ov) ? 'on' : ''}" data-v="${esc(ov)}">${esc(ol)}</button>`).join('')}</div><input type="hidden" name="${f.n}" value="${esc(arr.join('|'))}" data-multi="1">`; break; }
      case 'scale': { const mx = f.max || 10, mn = f.min || 1; let b = ''; for (let i = mn; i <= mx; i++) b += `<button type="button" class="${String(i) === String(v) ? 'on' : ''}" data-v="${i}">${i}</button>`; inner = `<div class="scale" data-scale="${f.n}">${b}</div><input type="hidden" name="${f.n}" value="${esc(v)}">`; break; }
      case 'toggle': inner = `<button type="button" class="toggle ${v ? 'on' : ''}" data-toggle="${f.n}"></button><input type="hidden" name="${f.n}" value="${v ? '1' : ''}">`; break;
      default: inner = `<input class="inp" type="${f.t || 'text'}" ${f.t === 'number' ? 'inputmode="decimal"' : ''} value="${esc(v)}" ${at}>`;
    }
    return `<div class="fld">${f.l ? `<label>${esc(f.l)}</label>` : ''}${inner}${f.hint ? `<div class="tiny dim">${esc(f.hint)}</div>` : ''}</div>`;
  };
  A.fields = (arr) => arr.map((f) => (Array.isArray(f) ? `<div class="${f.length === 3 ? 'frow3' : 'frow'}">${f.map(A.field).join('')}</div>` : typeof f === 'string' ? f : A.field(f))).join('');
  A.bindFormBits = (e) => {
    const chip = e.target.closest('.chips[data-chips] .chip');
    if (chip) {
      const wrap = chip.parentElement, inp = wrap.nextElementSibling;
      if (wrap.dataset.single) { wrap.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === chip && !(c.classList.contains('on') && wrap.dataset.allowNone))); inp.value = chip.classList.contains('on') ? chip.dataset.v : ''; }
      else { chip.classList.toggle('on'); inp.value = [...wrap.querySelectorAll('.chip.on')].map((c) => c.dataset.v).join('|'); }
      A.sfx('tick');
    }
    const sb = e.target.closest('.scale button');
    if (sb) { const w = sb.parentElement; w.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === sb)); w.nextElementSibling.value = sb.dataset.v; A.sfx('tick'); }
    const tg = e.target.closest('.toggle[data-toggle]');
    if (tg) { tg.classList.toggle('on'); tg.nextElementSibling.value = tg.classList.contains('on') ? '1' : ''; }
  };
  A.read = (root) => {
    const o = {};
    root.querySelectorAll('[name]').forEach((el) => {
      let v = el.value;
      if (el.dataset.multi) v = v ? v.split('|') : [];
      else if (el.type === 'number') v = v === '' ? null : Number(v);
      o[el.name] = v;
    });
    return o;
  };
})(window.A);
