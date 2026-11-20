/* ASCEND 365 — state, persistence, XP, stats */
(function (A) {
  'use strict';
  const LS = 'ascend365.v2';
  const d = A.d;

  A.initialState = function () {
    const t = d.today();
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const routines = clone(A.DEFAULT_ROUTINES);
    const ap = A.DEFAULT_APPEARANCE;
    return {
      v: 1, created: t,
      profile: { name: '', birthday: '11-20', startWeight: 146, goalWeight: 170, height: '6\'1"' },
      settings: { sound: true, haptics: true, reducedMotion: false, oled: false, accent: 'violet', duolingo: true, keepThreshold: 60, screenGoal: 120, weekendDays: [0, 6], deepCapMin: 180, wipLimit: 2, tennisPerWeek: 6, deepHoursPerWeek: 7.5, challengesPerWeek: 5, pinHash: null, onboarded: false },
      routines, dayType: {}, days: {}, xp: [],
      sleep: {}, focus: [], timer: null,
      fitness: { split: clone(A.DEFAULT_SPLIT), program: clone(A.DEFAULT_PROGRAM), templates: clone(A.DEFAULT_TEMPLATES), workouts: [], weights: [], measures: [], skills: {}, skillLogs: [], goals: [] },
      photos: [],
      tennis: { sessions: [], matches: [], assessments: [], strengths: [], weaknesses: [], goals: [] },
      biz: { target: 10000, income: [], trades: [], projects: [
        { id: A.uid(), name: 'Roblox games (with dev partner)', type: 'roblox', status: 'active', next: '', notes: '', created: t, milestones: [
          { id: A.uid(), t: 'Agree on the next game concept and scope', due: '', done: false },
          { id: A.uid(), t: 'Playable prototype of the core loop', due: '', done: false },
          { id: A.uid(), t: 'Test build with 5+ outside players', due: '', done: false },
          { id: A.uid(), t: 'Public launch', due: '', done: false },
          { id: A.uid(), t: 'First monetization (game passes / dev products)', due: '', done: false }] },
        { id: A.uid(), name: 'Quant stock research algorithm', type: 'algo', status: 'active', next: '', notes: '', created: t, milestones: [
          { id: A.uid(), t: 'Written v1 spec: universe, signals, outputs', due: '', done: false },
          { id: A.uid(), t: 'Daily data pipeline running', due: '', done: false },
          { id: A.uid(), t: 'Momentum + early-opportunity screens', due: '', done: false },
          { id: A.uid(), t: 'Backtest with written results', due: '', done: false },
          { id: A.uid(), t: 'Daily watchlist used for real research', due: '', done: false }] }
      ], journal: [], experiments: [], ideas: [] },
      reviews: {},
      social: { challenges: [], skipped: {}, sims: [], lessons: {}, swaps: {} },
      appearance: { am: ap.am.map((t) => ({ id: A.uid(), t })), pm: ap.pm.map((t) => ({ id: A.uid(), t })), checks: {}, grooming: ap.grooming.map(([t, every]) => ({ id: A.uid(), t, every, last: null })), goals: [], wardrobe: [], outfits: [], notes: '' },
      roadmap: { milestones: A.defaultMilestones(), goals: A.defaultYearGoals(), reflection: {} },
      badges: {}, priorities: {}
    };
  };

  // ---------- persistence ----------
  let saveT;
  A.load = function () {
    try {
      const raw = localStorage.getItem(LS);
      if (raw) { const s = JSON.parse(raw); A.state = migrate(s); return; }
    } catch (e) { console.error('load failed', e); }
    A.state = A.initialState();
  };
  function migrate(s) {
    const base = A.initialState();
    // shallow-fill any missing keys from newer versions
    (function fill(t, b) { for (const k in b) { if (t[k] === undefined) t[k] = b[k]; else if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k]) && !['days', 'sleep', 'dayType', 'reviews', 'badges', 'priorities', 'checks', 'skills', 'lessons', 'skipped', 'swaps', 'reflection', 'program', 'templates'].includes(k)) fill(t[k], b[k]); } })(s, base);
    return s;
  }
  A.saveNow = function () {
    try { localStorage.setItem(LS, JSON.stringify(A.state)); A.lastSave = Date.now(); }
    catch (e) { console.error(e); A.toast('Could not save — storage full? Export a backup in Settings.'); }
  };
  A.save = function () { clearTimeout(saveT); saveT = setTimeout(A.saveNow, 150); };
  window.addEventListener('pagehide', () => A.state && A.saveNow());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && A.state) A.saveNow(); });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  // ---------- photo store (IndexedDB) ----------
  let dbp;
  const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('ascend365', 1); r.onupgradeneeded = () => r.result.createObjectStore('photos'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const tx = (mode, fn) => db().then((x) => new Promise((res, rej) => { const t = x.transaction('photos', mode); const s = t.objectStore('photos'); const out = fn(s); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); }));
  A.photoDB = {
    put: (id, blob) => tx('readwrite', (s) => s.put(blob, id)),
    get: (id) => tx('readonly', (s) => s.get(id)),
    del: (id) => tx('readwrite', (s) => s.delete(id)),
    keys: () => tx('readonly', (s) => s.getAllKeys())
  };
  const urlCache = {};
  A.photoURL = async (id) => { if (urlCache[id]) return urlCache[id]; const b = await A.photoDB.get(id); if (!b) return null; return (urlCache[id] = URL.createObjectURL(b)); };
  A.shrinkImage = (file, max = 1280) => new Promise((res, rej) => {
    const img = new Image(); const u = URL.createObjectURL(file);
    img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.85); };
    img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('Could not read that image')); };
    img.src = u;
  });

  // ---------- XP & levels ----------
  A.xpAdd = (src, amt, why, date) => {
    const S = A.state; const i = S.xp.findIndex((x) => x.src === src);
    if (amt <= 0) { if (i >= 0) S.xp.splice(i, 1); return 0; }
    const prev = i >= 0 ? S.xp[i].amt : 0;
    const e = { src, amt, why, date: date || d.today() };
    if (i >= 0) S.xp[i] = e; else S.xp.push(e);
    return amt - prev;
  };
  A.xpRemove = (src) => { const S = A.state; const i = S.xp.findIndex((x) => x.src === src); if (i < 0) return 0; const a = S.xp[i].amt; S.xp.splice(i, 1); return -a; };
  A.totalXP = () => A.sum(A.state.xp, (x) => x.amt);
  A.xpOn = (k) => A.sum(A.state.xp.filter((x) => x.date === k), (x) => x.amt);
  const TITLES = [[1, 'Initiate'], [5, 'Apprentice'], [10, 'Contender'], [15, 'Disciplined'], [20, 'Relentless'], [30, 'Ascendant'], [40, 'Elite'], [50, 'Master'], [65, 'Legend']];
  A.levelInfo = (xp = A.totalXP()) => {
    let lv = 1, need = 150, base = 0;
    while (xp >= base + need) { base += need; lv++; need = 150 + 50 * (lv - 1); }
    const title = TITLES.filter(([l]) => lv >= l).pop()[1];
    return { lv, title, into: xp - base, need, p: (xp - base) / need, xp };
  };

  // ---------- Overall Rating (Lock In style): XP builds six attributes; OVR is their average ----------
  A.ATTRS = [['fitness', 'Fitness'], ['tennis', 'Tennis'], ['business', 'Business'], ['social', 'Social'], ['discipline', 'Discipline']];
  const ATTR_K = { fitness: 6000, tennis: 5000, business: 6000, social: 5000, discipline: 12000, appearance: 2500 };
  A.xpCat = (x) => {
    const p = x.src.split(':')[0];
    if (p === 'task') { const [, k, id] = x.src.split(':'); const dy = A.state.days[k]; const t = dy && dy.tasks.find((y) => y.id === id); const c = t ? t.cat : 'discipline'; return { life: 'discipline', learning: 'discipline', recovery: 'fitness', appearance: 'discipline' }[c] || c; }
    if (p === 'ms') { const m = A.state.roadmap.milestones.find((y) => 'ms:' + y.id === x.src); return m ? m.cat : 'discipline'; }
    return { wo: 'fitness', sk: 'fitness', pr: 'fitness', tn: 'tennis', focus: 'business', sc: 'social', sim: 'social', les: 'social' }[p] || 'discipline';
  };
  A.attrs = () => {
    const by = {}; A.state.xp.forEach((x) => { const c = A.xpCat(x); by[c] = (by[c] || 0) + x.amt; });
    const o = {}; A.ATTRS.forEach(([k]) => (o[k] = Math.min(99, Math.round(99 * (1 - Math.exp(-(by[k] || 0) / ATTR_K[k]))))));
    o._xp = by; return o;
  };
  A.RANKS = [[0, 'Bronze', '#c08457'], [20, 'Silver', '#cbd5e1'], [40, 'Gold', '#fbbf24'], [60, 'Platinum', '#67e8f9'], [75, 'Diamond', '#a78bfa'], [88, 'Elite', '#f472b6'], [95, 'Legend', '#fde68a']];
  A.ovr = () => { const a = A.attrs(); const v = Math.round(A.avg(A.ATTRS, ([k]) => a[k])); const r = A.RANKS.filter(([m]) => v >= m).pop(); const nx = A.RANKS.find(([m]) => m > v); return { v, rank: r[1], color: r[2], next: nx, attrs: a }; };

  // ---------- days ----------
  A.dayType = (k) => A.state.dayType[k] || (A.state.settings.weekendDays.includes(d.dow(k)) ? 'weekend' : 'weekday');
  A.buildTasks = (k, type) => {
    const S = A.state; const dw = d.dow(k);
    S.fitness.split = S.fitness.split || JSON.parse(JSON.stringify(A.DEFAULT_SPLIT));
    const wt = S.fitness.split[dw];
    return (S.routines[type] || []).filter((t) => (!t.days || !t.days.length || t.days.includes(dw)) && !(t.kind === 'duolingo' && !S.settings.duolingo)).map((t) => {
      const task = { id: A.uid(), tid: t.tid, time: t.time, end: t.end, title: t.title, cat: t.cat, color: t.color || null, xp: t.xp, kind: t.kind, status: 'pending', doneAt: null, note: '' };
      if (t.kind === 'workout') {
        if (wt) { task.title = 'Gym · ' + wt; task.wtype = wt; }
        else { task.title = 'Rest day: walk & stretch'; task.cat = 'recovery'; task.kind = null; task.xp = 10; }
      }
      if (t.kind === 'skills') task.wtype = 'Skills';
      return task;
    });
  };
  A.day = (k) => A.state.days[k];
  A.ensureDay = (k) => {
    const S = A.state;
    if (!S.days[k]) { const type = A.dayType(k); S.days[k] = { type, tasks: A.buildTasks(k, type), screen: null, note: '' }; A.save(); }
    return S.days[k];
  };
  A.sortTasks = (tasks) => tasks.slice().sort((a, b) => { const x = A.d.toMin(a.time), y = A.d.toMin(b.time); if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1; return x - y; });
  A.dayStats = (k) => {
    const dy = A.state.days[k]; if (!dy) return { total: 0, done: 0, skipped: 0, pct: 0, has: false };
    const total = dy.tasks.length, done = dy.tasks.filter((t) => t.status === 'done').length, skipped = dy.tasks.filter((t) => t.status === 'skipped').length;
    const den = total - skipped;
    return { total, done, skipped, pct: den > 0 ? done / den : 0, has: true };
  };
  A.firstDay = () => { const ks = Object.keys(A.state.days).sort(); return ks[0] || d.today(); };
  A.kept = (k) => A.dayStats(k).pct * 100 >= A.state.settings.keepThreshold;

  // streak with shields (earn 1 per 7 kept days, max 3; a missed day uses one)
  A.streak = () => {
    const S = A.state, t = d.today(); const first = A.firstDay();
    let cur = 0, best = 0, shields = 0, run = 0; const shielded = {};
    for (let k = first; k <= t; k = d.add(k, 1)) {
      const kept = A.kept(k);
      if (k === t && !kept) break; // today still in progress
      if (kept) { cur++; run++; if (run % 7 === 0 && shields < 3) shields++; }
      else if (shields > 0) { shields--; shielded[k] = true; run = 0; }
      else { cur = 0; run = 0; }
      best = Math.max(best, cur);
    }
    return { cur, best, shields, shielded, todayKept: A.kept(t) };
  };

  // ---------- sleep ----------
  // sleep[nightKey] = {bed:'HH:MM', wake:'HH:MM', q}
  A.sleepTarget = (nightKey) => { const dy = A.state.days[nightKey]; const t = dy && dy.tasks.find((x) => x.kind === 'sleep'); if (t && t.time) return t.time; const r = (A.state.routines[A.dayType(nightKey)] || []).find((x) => x.kind === 'sleep'); return (r && r.time) || '21:30'; };
  A.sleepInfo = (nightKey) => {
    const s = A.state.sleep[nightKey]; if (!s || !s.bed || !s.wake) return s ? { ...s, complete: false } : null;
    const b = d.toMin(s.bed), w = d.toMin(s.wake); let dur = (w - b + 1440) % 1440; if (dur === 0) dur = 1440;
    let tgt = d.toMin(A.sleepTarget(nightKey));
    let late = b - tgt; if (late < -720) late += 1440; if (late > 720) late -= 1440;
    const onTarget = late <= 30 && dur >= 420;
    return { ...s, complete: true, durMin: dur, lateMin: late, onTarget };
  };
  A.syncSleepXP = (nightKey) => { const i = A.sleepInfo(nightKey); return A.xpAdd('sleep:' + nightKey, i && i.onTarget ? 25 : 0, 'Slept on target', d.add(nightKey, 1)); };

  // ---------- tasks ----------
  A.setTask = (k, id, status, opts = {}) => {
    const S = A.state; const dy = A.ensureDay(k); const t = dy.tasks.find((x) => x.id === id); if (!t) return 0;
    const before = A.levelInfo().lv;
    let delta = 0; const wasKept = A.kept(k);
    t.status = status; t.doneAt = status === 'done' ? new Date().toISOString() : null;
    if (status === 'done') delta += A.xpAdd('task:' + k + ':' + id, t.xp, t.title, k); else delta += A.xpRemove('task:' + k + ':' + id);
    const isToday = k === d.today();
    const stamp = isToday ? d.timeNow() : t.time;
    if (t.kind === 'workout' || t.kind === 'skills') { S.fitness.workouts = S.fitness.workouts.filter((w) => !(w.date === k && w.task === t.id)); if (status === 'done') S.fitness.workouts.push({ id: A.uid(), date: k, type: t.wtype || 'Workout', task: t.id }); }
    if (t.kind === 'wake') { const n = d.add(k, -1); S.sleep[n] = S.sleep[n] || {}; if (status === 'done') S.sleep[n].wake = S.sleep[n].wake || stamp; delta += A.syncSleepXP(n); }
    if (t.kind === 'sleep') { S.sleep[k] = S.sleep[k] || {}; if (status === 'done') S.sleep[k].bed = S.sleep[k].bed || stamp; delta += A.syncSleepXP(k); }
    if ((t.kind === 'skincare_am' || t.kind === 'skincare_pm') && status === 'done') { const ch = (S.appearance.checks[k] = S.appearance.checks[k] || {}); (t.kind === 'skincare_am' ? S.appearance.am : S.appearance.pm).forEach((it) => (ch[it.id] = true)); }
    delta += A.syncDayBonus(k);
    A.after(before);
    return delta;
  };
  A.syncDayBonus = (k) => {
    const st = A.dayStats(k); let delta = 0;
    delta += A.xpAdd('bonus:' + k, st.pct >= 0.8 ? 50 : 0, 'Day 80%+ complete', k);
    const prev = d.add(k, -1);
    const missedPrev = prev >= A.firstDay() && prev < k ? !A.kept(prev) : false;
    delta += A.xpAdd('cb:' + k, missedPrev && A.kept(k) ? 40 : 0, 'Comeback day', k);
    return delta;
  };

  // ---------- focus ----------
  A.syncFocusXP = (k) => {
    const mins = A.sum(A.state.focus.filter((f) => f.date === k), (f) => f.min);
    const capped = Math.min(mins, A.state.settings.deepCapMin);
    return A.xpAdd('focus:' + k, Math.floor(capped / 3), 'Focused work (' + Math.round(mins) + ' min)', k);
  };
  A.addFocus = (f) => {
    const before = A.levelInfo().lv;
    A.state.focus.push(Object.assign({ id: A.uid() }, f));
    const delta = A.syncFocusXP(f.date);
    // auto-complete the focus task for that day
    const dy = A.state.days[f.date]; if (dy) { const t = dy.tasks.find((x) => x.kind === 'focus' && x.status !== 'done'); if (t) A.setTask(f.date, t.id, 'done'); }
    A.after(before); return delta;
  };
  A.autoTask = (k, kind) => { const dy = A.state.days[k]; if (!dy) return; const t = dy.tasks.find((x) => x.kind === kind && x.status !== 'done'); if (t) A.setTask(k, t.id, 'done'); };

  // ---------- metrics ----------
  A.metric = (m, a, b) => {
    const S = A.state; const inR = (k) => k >= a && k <= b;
    switch (m) {
      case 'workouts': return new Set(S.fitness.workouts.filter((w) => inR(w.date)).map((w) => w.date)).size;
      case 'tennis': return S.tennis.sessions.filter((x) => inR(x.date)).length;
      case 'matches': return S.tennis.matches.filter((x) => inR(x.date)).length;
      case 'deepHours': return A.round(A.sum(S.focus.filter((f) => inR(f.date)), (f) => f.min) / 60, 1);
      case 'challenges': return S.social.challenges.filter((x) => inR(x.date)).length;
      case 'sims': return S.social.sims.filter((x) => inR(x.date)).length;
      case 'sleepNights': { let n = 0; for (let k = a; k <= b && k <= d.today(); k = d.add(k, 1)) { const i = A.sleepInfo(k); if (i && i.onTarget) n++; } return n; }
      case 'avgCompletion': { const end = b < d.today() ? b : d.today(); const st = a > A.firstDay() ? a : A.firstDay(); if (st > end) return 0; const ks = d.range(st, end).filter((k) => k < d.today() || A.state.days[k]); if (!ks.length) return 0; return Math.round(A.avg(ks, (k) => A.dayStats(k).pct) * 100); }
      case 'reviews': return Object.keys(S.reviews).filter((wk) => inR(wk) || inR(d.add(wk, 6))).length;
      case 'income': { const ms = {}; S.biz.income.forEach((x) => { const mk = d.monthKey(x.date); ms[mk] = (ms[mk] || 0) + Number(x.amount || 0); }); const ma = d.monthKey(a), mb = d.monthKey(b); let best = 0; for (const mk in ms) if (mk >= ma && mk <= mb) best = Math.max(best, ms[mk]); return best; }
    }
    return 0;
  };
  A.msProgress = (m) => {
    if (m.done) return 1;
    if (m.metric && m.target) { const ch = A.chapters[m.ch - 1]; return A.clamp(A.metric(m.metric, ch.start, m.due || ch.end) / m.target, 0, 1); }
    return (m.manualPct || 0) / 100;
  };
  A.msValue = (m) => { if (!m.metric) return null; const ch = A.chapters[m.ch - 1]; return A.metric(m.metric, ch.start, m.due || ch.end); };
  A.msStatus = (m) => {
    const p = A.msProgress(m), t = d.today(), ch = A.chapters[m.ch - 1];
    if (m.done || p >= 1) return ['Done', 'good'];
    if (t > (m.due || ch.end)) return ['Overdue', 'bad'];
    if (t >= ch.start || p > 0) return ['In progress', 'acc'];
    return ['Upcoming', ''];
  };
  // auto-complete metric milestones that hit 100%
  A.syncMilestones = () => {
    const S = A.state; let any = [];
    S.roadmap.milestones.forEach((m) => {
      const full = m.metric && m.target && A.msProgress(m) >= 1;
      if (full && !m.done) { m.done = true; m.doneOn = d.today(); any.push(m); }
      A.xpAdd('ms:' + m.id, m.done ? 150 : 0, 'Milestone: ' + m.title, m.doneOn || d.today());
    });
    A.chapters.forEach((c) => {
      const ms = S.roadmap.milestones.filter((m) => m.ch === c.n);
      const all = ms.length && ms.every((m) => m.done);
      A.xpAdd('ch:' + c.n, all ? 300 : 0, 'Chapter ' + c.n + ' complete', d.today());
    });
    return any;
  };

  // ---------- ratings (transparent) ----------
  A.plannedWorkouts = (a, b) => d.range(a, b).filter((k) => (A.state.fitness.split || A.DEFAULT_SPLIT)[d.dow(k)]).length;
  A.categoryRatings = () => {
    const S = A.state, t = d.today(), a = d.add(t, -13);
    const days = d.range(a, t).filter((k) => S.days[k]);
    if (!days.length) return null;
    const startK = days[0]; const nDays = d.diff(startK, t) + 1; const weeks = nDays / 7;
    const disc = (() => { const comp = A.avg(days, (k) => A.dayStats(k).pct); const nights = d.range(startK, d.add(t, -1)); const slp = nights.length ? nights.filter((k) => { const i = A.sleepInfo(k); return i && i.onTarget; }).length / nights.length : comp; const scr = days.filter((k) => S.days[k].screen != null); const scrR = scr.length ? scr.filter((k) => S.days[k].screen <= S.settings.screenGoal).length / scr.length : comp; return comp * 0.5 + slp * 0.3 + scrR * 0.2; })();
    const planned = A.plannedWorkouts(startK, t) || Math.max(1, Math.round(weeks * 4));
    const fit = Math.min(1, A.metric('workouts', startK, t) / planned);
    const ten = Math.min(1, A.metric('tennis', startK, t) / Math.max(1, S.settings.tennisPerWeek * weeks));
    const biz = Math.min(1, A.metric('deepHours', startK, t) / Math.max(0.5, S.settings.deepHoursPerWeek * weeks));
    const soc = Math.min(1, A.metric('challenges', startK, t) / Math.max(1, S.settings.challengesPerWeek * weeks));
    const items = S.appearance.am.length + S.appearance.pm.length;
    const app = items ? A.avg(days, (k) => { const c = S.appearance.checks[k] || {}; return Object.keys(c).filter((x) => c[x]).length / items; }) : 0;
    return { discipline: disc, fitness: fit, tennis: ten, business: biz, social: soc, appearance: Math.min(1, app), days: nDays };
  };
  A.overall = () => {
    const S = A.state, t = d.today(), a = d.add(t, -6);
    const days = d.range(a, t).filter((k) => S.days[k]); if (!days.length) return null;
    const startK = days[0]; const n = d.diff(startK, t) + 1;
    const routine = A.avg(d.range(startK, t).filter((k) => k < t || S.days[k]), (k) => A.dayStats(k).pct);
    const nights = d.range(startK, d.add(t, -1)); const sleep = nights.length ? nights.filter((k) => { const i = A.sleepInfo(k); return i && i.onTarget; }).length / nights.length : null;
    const planned = A.plannedWorkouts(startK, t) + S.settings.tennisPerWeek * n / 7;
    const training = Math.min(1, (A.metric('workouts', startK, t) + A.metric('tennis', startK, t)) / Math.max(1, planned));
    const deep = Math.min(1, A.metric('deepHours', startK, t) / Math.max(0.5, S.settings.deepHoursPerWeek * n / 7));
    const social = Math.min(1, A.metric('challenges', startK, t) / Math.max(1, S.settings.challengesPerWeek * n / 7));
    const due = S.roadmap.milestones.filter((m) => A.chapters[m.ch - 1].start <= t);
    const road = due.length ? A.avg(due, A.msProgress) : null;
    const parts = [
      ['Routine adherence', 30, routine, '7-day average checklist completion'],
      ['Sleep', 20, sleep, 'Nights in bed on time with 7h+ sleep'],
      ['Training', 15, training, 'Gym + tennis sessions vs. plan'],
      ['Deep work', 15, deep, 'Focus hours vs. weekly target'],
      ['Social practice', 10, social, 'Real-world challenges vs. weekly target'],
      ['Roadmap', 10, road, 'Progress on milestones in current & past chapters']
    ];
    const used = parts.filter((p) => p[2] != null); const wsum = A.sum(used, (p) => p[1]);
    const score = wsum ? Math.round(A.sum(used, (p) => p[1] * p[2]) / wsum * 100) : 0;
    return { score, parts, days: n };
  };

  // ---------- badges ----------
  A.checkBadges = () => {
    const S = A.state; const has = (id) => S.badges[id]; const got = [];
    const give = (id, cond) => { if (!has(id) && cond) { S.badges[id] = d.today(); got.push(id); } };
    const st = A.streak(); const allDays = Object.keys(S.days);
    const wo = new Set(S.fitness.workouts.map((w) => w.date)).size;
    const deepH = A.sum(S.focus, (f) => f.min) / 60;
    const nights = Object.keys(S.sleep).filter((k) => { const i = A.sleepInfo(k); return i && i.onTarget; }).length;
    const wakes = allDays.filter((k) => S.days[k].tasks.some((t) => t.kind === 'wake' && t.status === 'done' && t.doneAt && (new Date(t.doneAt).getHours() * 60 + new Date(t.doneAt).getMinutes()) <= A.d.toMin(t.time) + 15)).length;
    give('first', S.xp.some((x) => x.src.startsWith('task:')));
    give('perfect', allDays.some((k) => { const s = A.dayStats(k); return s.total > 0 && s.done === s.total - s.skipped && s.done > 0; }));
    give('streak7', st.best >= 7); give('streak30', st.best >= 30); give('streak100', st.best >= 100);
    give('comeback', S.xp.some((x) => x.src.startsWith('cb:')));
    give('wo1', wo >= 1); give('wo25', wo >= 25); give('wo100', wo >= 100);
    give('skill', Object.values(S.fitness.skills).some((v) => v >= 0));
    give('tennis10', S.tennis.sessions.length >= 10);
    give('win', S.tennis.matches.some((m) => m.result === 'W'));
    give('sleep7', nights >= 7); give('early', wakes >= 5);
    give('deep10', deepH >= 10); give('deep100', deepH >= 100);
    give('income1', S.biz.income.length > 0);
    give('sim1', S.social.sims.length > 0); give('chal10', S.social.challenges.length >= 10);
    give('social3', A.socialLevel ? A.socialLevel() >= 3 : false);
    give('review4', Object.keys(S.reviews).length >= 4);
    give('milestone', S.roadmap.milestones.some((m) => m.done));
    give('chapter', A.chapters.some((c) => { const ms = S.roadmap.milestones.filter((m) => m.ch === c.n); return ms.length && ms.every((m) => m.done); }));
    const lv = A.levelInfo().lv; give('level10', lv >= 10); give('level25', lv >= 25);
    got.forEach((id) => A.xpAdd('badge:' + id, 0, '', d.today()));
    return got;
  };

  // run after any mutation: save, detect milestones/badges/level-ups, queue celebrations
  A.celebQ = [];
  A.after = (levelBefore) => {
    const newMs = A.syncMilestones();
    const newB = A.checkBadges();
    const lv = A.levelInfo().lv;
    const rk = A.ovr().rank; if (A._rank && rk !== A._rank && A.RANKS.findIndex((r) => r[1] === rk) > A.RANKS.findIndex((r) => r[1] === A._rank)) A.celebQ.push({ icon: '🛡️', title: rk + ' rank', sub: 'Your Overall Rating hit ' + A.ovr().v + '.' }); A._rank = rk;
    if (levelBefore != null && lv > levelBefore) A.celebQ.push({ icon: '⚡', title: 'Level ' + lv, sub: A.levelInfo().title + ' — keep stacking days.' });
    newMs.forEach((m) => A.celebQ.push({ icon: '🎯', title: 'Milestone complete', sub: m.title + ' (+150 XP)' }));
    newB.forEach((id) => { const b = A.BADGES.find((x) => x.id === id); if (b && id !== 'first') A.celebQ.push({ icon: b.i, title: b.n, sub: b.d }); else if (b) A.toast(b.i + ' Badge: ' + b.n); });
    A.save();
  };
  A.flushCeleb = async () => { while (A.celebQ.length) { const c = A.celebQ.shift(); await A.celebrate(c); } };
  A.mutate = (fn) => { const before = A.levelInfo().lv; const r = fn(); A.after(before); return r; };

  // ---------- export / import ----------
  const toDataURL = (b) => new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
  A.exportData = async (withPhotos) => {
    const out = { app: 'ASCEND365', exported: new Date().toISOString(), state: A.state, photos: {} };
    if (withPhotos) for (const p of A.state.photos) { const b = await A.photoDB.get(p.id); if (b) out.photos[p.id] = await toDataURL(b); }
    return new Blob([JSON.stringify(out)], { type: 'application/json' });
  };
  A.importData = async (text) => {
    const o = JSON.parse(text); if (o.app !== 'ASCEND365' || !o.state) throw new Error('Not an ASCEND 365 backup file');
    A.state = migrate(o.state);
    for (const id in o.photos || {}) { const b = await (await fetch(o.photos[id])).blob(); await A.photoDB.put(id, b); }
    A.saveNow();
  };
  A.sha = async (s) => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ascend365:' + s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); };
})(window.A);
