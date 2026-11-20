/* ASCEND 365 — Insights & Settings */
(function (A) {
  'use strict';
  const d = A.d, esc = A.esc, I = A.icon;

  // =================== INSIGHTS ===================
  let range = 30;
  A.views.insights = {
    title: 'Insights',
    render(r) { const sub = r.sub || ''; return `<div class="seg">${[['', 'Trends'], ['badges', 'Badges'], ['reports', 'Reports']].map(([k, l]) => `<button class="${sub === k ? 'on' : ''}" data-go="insights${k ? '/' + k : ''}">${l}</button>`).join('')}</div>` + ({ '': trends, xp, badges, reports }[sub] || trends)(); },
    act: { range(el) { range = Number(el.dataset.r); A.refresh(); }, how: () => howSheet() }
  };
  function catCompletion(a, b) {
    const out = {}; d.range(a, b).forEach((k) => { const dy = A.state.days[k]; if (!dy) return; dy.tasks.forEach((t) => { if (t.status === 'skipped') return; const o = (out[t.cat] = out[t.cat] || { done: 0, total: 0 }); o.total++; if (t.status === 'done') o.done++; }); });
    return out;
  }
  function trends() {
    const S = A.state, t = d.today(), a = d.add(t, -(range - 1)), pa = d.add(a, -range), pb = d.add(a, -1);
    const days = d.range(a, t).filter((k) => k >= A.firstDay());
    if (!Object.keys(S.days).length) return '<div class="empty">Insights appear once you start checking things off.</div>';
    const comp = days.map((k) => ({ x: d.fmtDate(k), y: S.days[k] || k < t ? Math.round(A.dayStats(k).pct * 100) : null }));
    const cc = catCompletion(a, t); const ccArr = Object.entries(cc).filter(([, v]) => v.total >= 3).map(([c, v]) => [c, v.done / v.total]).sort((x, y) => y[1] - x[1]);
    const nights = days.slice(0, -1).map((k) => { const i = A.sleepInfo(k); return { x: d.fmtDate(k), y: i && i.complete ? A.round(i.durMin / 60, 1) : null }; });
    const scr = days.map((k) => ({ x: d.fmtDate(k), y: S.days[k] && S.days[k].screen != null ? S.days[k].screen : null }));
    const cmp = (m, label, fmt = (v) => v) => { const cur = A.metric(m, a, t), prev = A.metric(m, pa, pb); const diff = cur - prev; const first = pb < A.firstDay(); return `<div class="stat"><div class="k">${label}</div><div class="v num">${fmt(cur)}</div><div class="s ${first ? '' : diff > 0 ? 'good' : diff < 0 ? 'bad' : ''}">${first ? 'first ' + range + ' days tracked' : diff === 0 ? 'no change vs prev ' + range + 'd' : (diff > 0 ? '▲ ' : '▼ ') + fmt(Math.abs(A.round(diff, 1))) + ' vs prev ' + range + 'd'}</div></div>`; };
    const wk = []; for (let i = Math.min(11, Math.floor(range / 7)); i >= 0; i--) { const s = d.add(d.weekStart(t), -7 * i), e = d.add(s, 6); wk.push({ s, e, x: d.fmtDate(s) }); }
    const strong = ccArr.slice(0, 2), weak = ccArr.slice(-2).reverse().filter((x) => !strong.includes(x));
    return `<div class="seg" style="margin-bottom:12px">${[7, 30, 90].map((n) => `<button class="${range === n ? 'on' : ''}" data-act="range" data-r="${n}">${n} days</button>`).join('')}</div>
      <div class="grid2" style="margin-bottom:12px">${cmp('avgCompletion', 'Avg completion', (v) => v + '%')}${cmp('workouts', 'Workouts')}${cmp('tennis', 'Tennis sessions')}${cmp('deepHours', 'Focus hours', (v) => v + 'h')}${cmp('sleepNights', 'Nights on target')}${cmp('challenges', 'Social challenges')}</div>
      <div class="card"><h3>Daily completion</h3>${A.chart.line(comp, { min: 0, max: 100, fmt: (v) => Math.round(v) + '%', goal: S.settings.keepThreshold, goalLabel: 'streak line' })}</div>
      <div class="card"><h3>Strengths & weak spots</h3>${ccArr.length ? `<div class="small" style="margin-bottom:10px">${strong.length ? `<b class="good">Strongest:</b> ${strong.map(([c, v]) => A.CATS[c].label + ' (' + Math.round(v * 100) + '%)').join(', ')}` : ''}${weak.length ? `<br><b class="warn">Needs attention:</b> ${weak.map(([c, v]) => A.CATS[c].label + ' (' + Math.round(v * 100) + '%)').join(', ')}` : ''}</div>` + ccArr.map(([c, v]) => `<div style="margin-bottom:8px"><div class="row small"><span class="dot" style="background:${A.catColor(c)}"></span><span>${A.CATS[c].label}</span><span class="sp"></span><b class="num">${Math.round(v * 100)}%</b><span class="tiny dim" style="margin-left:6px">${cc[c].done}/${cc[c].total}</span></div><div class="bar thin" style="margin-top:3px"><i style="width:${v * 100}%;background:${A.catColor(c)}"></i></div></div>`).join('') : '<div class="small dim">Not enough data yet.</div>'}</div>
      <div class="card"><h3>Sleep (hours)</h3>${nights.some((n) => n.y != null) ? A.chart.line(nights, { min: 4, goal: 7.5, goalLabel: '7.5h', color: 'var(--c-recovery)', fillColor: 'var(--c-recovery)' }) : '<div class="small dim">Tick “Wake up” and “Lights out” or log sleep in My Day.</div>'}</div>
      <div class="card"><h3>Training per week</h3>${A.chart.bars(wk.map((w) => ({ x: w.x, y: A.metric('workouts', w.s, w.e) + A.metric('tennis', w.s, w.e) })), { color: 'var(--c-fitness)', labels: true })}<div class="tiny dim">Gym + tennis sessions</div></div>
      <div class="card"><h3>Focus hours per week</h3>${A.chart.bars(wk.map((w) => ({ x: w.x, y: A.metric('deepHours', w.s, w.e) })), { color: 'var(--c-business)', goal: S.settings.deepHoursPerWeek, goalLabel: 'target', fmt: (v) => A.round(v, 1) + 'h' })}</div>
      <div class="card"><h3>Screen time (min)</h3>${scr.some((x) => x.y != null) ? A.chart.line(scr, { min: 0, goal: S.settings.screenGoal, goalLabel: 'goal', color: 'var(--warn)', fillColor: 'var(--warn)' }) : '<div class="small dim">Enter daily screen time in My Day → Daily log.</div>'}</div>
      <div class="card"><h3>Consistency · full year</h3>${A.chart.heat((k) => (S.days[k] ? A.dayStats(k).pct : null), t < A.END ? (t > A.START ? t : A.START) : A.END, 53)}</div>`;
  }
  function xp() {
    const S = A.state, li = A.levelInfo(), t = d.today();
    const per = d.range(d.add(t, -29), t).map((k) => ({ x: d.fmtDate(k), y: A.xpOn(k) }));
    const SRC = { task: 'Checklist tasks', bonus: 'Day bonuses', cb: 'Comeback days', sleep: 'Sleep on target', focus: 'Deep work', wo: 'Workouts', pr: 'Personal records', sk: 'Calisthenics skills', tn: 'Tennis', sc: 'Social challenges', sim: 'Practice conversations', les: 'Lessons', rev: 'Weekly reviews', ms: 'Milestones', ch: 'Chapters', scr: 'Screen time', year: 'Year reflection' };
    const by = {}; S.xp.forEach((x) => { const k = x.src.split(':')[0]; by[k] = (by[k] || 0) + x.amt; });
    const tot = A.totalXP() || 1;
    return `<div class="card hero"><div class="row" style="gap:16px">${A.chart.ring(li.p, 96, 9, 'url(#rg)', `<div><div class="mid num">${li.lv}</div><div class="tiny dim">level</div></div>`)}<div class="sp"><div class="mid">${li.title}</div><div class="small muted num">${A.fmtNum(li.xp)} XP total</div><div class="small muted num">${li.need - li.into} XP to level ${li.lv + 1}</div></div></div><button class="btn sm ghost" style="margin-top:12px" data-act="how">How scoring works</button></div>
      <div class="card"><h3>XP per day · 30 days</h3>${A.chart.bars(per, { color: 'var(--accent2)' })}</div>
      <div class="card"><h3>Where your XP comes from</h3>${Object.entries(by).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div style="margin-bottom:8px"><div class="row small"><span>${SRC[k] || k}</span><span class="sp"></span><b class="num">${A.fmtNum(v)}</b></div><div class="bar thin" style="margin-top:3px"><i style="width:${(v / tot) * 100}%"></i></div></div>`).join('') || '<div class="small dim">No XP yet.</div>'}</div>
      <div class="card flat"><h3>XP ledger</h3>${S.xp.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60).map((x) => `<div class="row small" style="margin-bottom:6px"><span class="dim" style="width:52px">${d.fmtDate(x.date)}</span><span class="sp">${esc(x.why)}</span><b class="num acc">+${x.amt}</b></div>`).join('') || '<div class="small dim">Empty</div>'}</div>`;
  }
  function howSheet() {
    const S = A.state;
    A.sheet({ title: 'How scoring works', body: `<div class="small" style="line-height:1.6">
      <b>XP</b> rewards actions, with caps so overdoing it never pays:<br>
      • Checklist tasks: 5–40 XP each (you set it)<br>• Day 80%+ complete: +50 · Comeback day after a miss: +40<br>• Slept on target (in bed ≤30 min after target, 7h+): +25<br>• Screen time under goal: +20<br>• Deep work: 1 XP per 3 min, capped at ${S.settings.deepCapMin / 60}h/day<br>• Workout logged: +40 (once a day) · PR: +20<br>• Tennis session: +30 (once a day) · Calisthenics level: +50<br>• Social challenge: +40 · Practice conversation: 30–50 · Lesson: +25<br>• Weekly review: +60 · Milestone: +150 · Full chapter: +300<br><br>
      <b>Levels</b>: each level needs 50 XP more than the last (150, 200, 250…). Unchecking a task removes its XP — the ledger always matches reality.<br><br>
      <b>Streak</b>: a day counts when you hit ${S.settings.keepThreshold}% of that day's tasks (skipped tasks don't count against you). Every 7 kept days earns a shield (max 3). A missed day uses a shield instead of breaking your streak. Missing never removes XP or levels.<br><br>
      <b>Overall Rating</b> (40–99): every XP you earn builds one of six attributes — Fitness, Tennis, Business, Social, Discipline, Style. Each rises fast at first and slower near the top. OVR is their average, and ranks go Bronze → Silver (50) → Gold (62) → Platinum (72) → Diamond (82) → Elite (90) → Legend (96). It only goes up.</div>` });
  }
  function badges() {
    const S = A.state;
    return `<div class="grid3" style="gap:14px">${A.BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? 'got' : ''}"><div class="b">${b.i}</div><b style="color:var(--text)">${b.n}</b><span class="tiny">${S.badges[b.id] ? d.fmtDate(S.badges[b.id], { year: true }) : b.d}</span></div>`).join('')}</div>`;
  }
  function reports() {
    const S = A.state, t = d.today();
    const chs = A.chapters.filter((c) => c.start <= t);
    const report = (a, b, title, sub) => {
      const w = S.fitness.weights.filter((x) => x.date >= a && x.date <= b); const wch = w.length > 1 ? A.round(w[w.length - 1].lb - w[0].lb, 1) : null;
      const xp = A.sum(S.xp.filter((x) => x.date >= a && x.date <= b), (x) => x.amt);
      return `<div class="card"><h3>${title}<span class="sp"></span><span class="tiny dim" style="text-transform:none;letter-spacing:0">${sub}</span></h3><div class="grid3">${[['Completion', A.metric('avgCompletion', a, b) + '%'], ['Workouts', A.metric('workouts', a, b)], ['Tennis', A.metric('tennis', a, b)], ['Focus', A.metric('deepHours', a, b) + 'h'], ['Sleep ✓', A.metric('sleepNights', a, b)], ['Social', A.metric('challenges', a, b)], ['Income', A.fmtMoney(A.sum(S.biz.income.filter((x) => x.date >= a && x.date <= b), (x) => x.amount))], ['Weight', wch == null ? '—' : (wch > 0 ? '+' : '') + wch], ['XP', '+' + A.fmtNum(xp)]].map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v num" style="font-size:17px">${v}</div></div>`).join('')}</div></div>`;
    };
    const mk = d.monthKey(t);
    return `<p class="small muted" style="margin-top:0">Each chapter is one month of your year. Calendar-month report for ${d.fmtMonth(mk)} is first.</p>` + report(mk + '-01', t, d.fmtMonth(mk), 'month to date') +
      (chs.length ? chs.slice().reverse().map((c) => report(c.start, c.end < t ? c.end : t, 'Chapter ' + c.n + ' · ' + A.CHAPTER_THEMES[c.n - 1], d.fmtDate(c.start) + ' – ' + d.fmtDate(c.end) + (c.end >= t ? ' (in progress)' : ''))).join('') : '<div class="empty">Chapter reports start on Nov 20, 2026.</div>');
  }

  // =================== SETTINGS ===================
  let rt = 'weekday';
  A.views.settings = {
    title: 'Settings',
    render(r) {
      if (r.sub === 'routine') return routineEditor(r.arg || rt);
      const S = A.state, st = S.settings;
      const tog = (k, l, sub) => `<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="sp"><div>${l}</div>${sub ? `<div class="tiny dim">${sub}</div>` : ''}</div><button class="toggle ${st[k] ? 'on' : ''}" data-act="tog" data-k="${k}"></button></div>`;
      const num = (k, l, sub) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="sp"><div>${l}</div>${sub ? `<div class="tiny dim">${sub}</div>` : ''}</div><input class="inp num" type="number" inputmode="decimal" data-num="${k}" value="${st[k]}" style="width:86px;padding:8px;text-align:right"></div>`;
      return `<div class="card"><h3>Profile</h3><div class="fld"><label>Your name</label><input class="inp" data-prof="name" value="${esc(S.profile.name)}" placeholder="Shown on the dashboard"></div><div class="small muted">Transformation year: <b>Nov 20, 2026 → Nov 20, 2027</b> (your birthday).</div></div>
        <div class="card"><h3>Routines & schedule</h3><div class="list">${Object.entries(A.DAYTYPE_LABEL).map(([k, l]) => `<div class="li" data-go="settings/routine/${k}"><div class="sp"><div class="t">${l}</div><div class="s">${S.routines[k].length} tasks</div></div>${I('chev', 16, 'class="chev"')}</div>`).join('')}</div>
          <div class="fld" style="margin-top:10px"><label>Weekend days (use the Weekend routine)</label><div class="chips">${[1, 2, 3, 4, 5, 6, 0].map((i) => `<button class="chip ${st.weekendDays.includes(i) ? 'on' : ''}" data-act="wkend" data-i="${i}">${d.DOW[i]}</button>`).join('')}</div></div>
          ${tog('duolingo', 'Daily Duolingo checklist item', 'Optional — lessons happen in the Duolingo app')}</div>
        <div class="card"><h3>Targets</h3>${num('keepThreshold', 'Streak threshold (%)', 'Share of a day\'s tasks that keeps your streak')}${num('screenGoal', 'Screen time goal (min/day)')}${num('tennisPerWeek', 'Tennis sessions / week')}${num('deepHoursPerWeek', 'Focus hours / week')}${num('deepCapMin', 'Deep-work XP cap (min/day)', 'Protects against rewarding burnout')}${num('challengesPerWeek', 'Social challenges / week')}${num('wipLimit', 'Max active projects', 'Your guard against starting too many things')}<div class="row" style="padding:8px 0"><div class="sp">$ / month income target</div><input class="inp num" type="number" data-biz="target" value="${S.biz.target}" style="width:96px;padding:8px;text-align:right"></div></div>
        <div class="card"><h3>Look & feel</h3><div class="fld"><label>Accent</label><div class="chips">${[['violet', 'Violet'], ['indigo', 'Indigo'], ['magenta', 'Magenta'], ['blue', 'Blue']].map(([k, l]) => `<button class="chip ${st.accent === k ? 'on' : ''}" data-act="accent" data-k="${k}">${l}</button>`).join('')}</div></div>${tog('oled', 'Pure black background', 'Saves battery on OLED iPhones')}${tog('reducedMotion', 'Reduce motion')}${tog('sound', 'Sounds', 'Soft ticks on completion')}${A.hapticsSupported ? tog('haptics', 'Haptics') : '<div class="tiny dim" style="padding:10px 0">Haptic feedback isn\'t available to web apps on iPhone, so it\'s off there.</div>'}</div>
        <div class="card"><h3>Reminders</h3><div class="small muted">Home-screen web apps on iPhone can't schedule their own notifications without a push server, so there are no fake reminder toggles here. Use iPhone Clock alarms for wake-up and bedtime, and open ASCEND first thing — the dashboard always shows what's next.</div></div>
        <div class="card"><h3>Privacy</h3><div class="small muted" style="margin-bottom:10px">Everything — notes, photos, progress — stays on this device. Nothing is uploaded and there is no account or sync.</div>${st.pinHash ? `<button class="btn ghost block" data-act="pinoff">Remove passcode lock</button>` : `<button class="btn ghost block" data-act="pinon">${I('lock', 16)} Set a 4-digit passcode</button>`}<div class="tiny dim" style="margin-top:6px">The passcode is a privacy screen. It isn't encryption — anyone with the unlocked phone and dev tools could still read the data.</div></div>
        <div class="card"><h3>Backup & data</h3><div class="small muted" style="margin-bottom:10px">Data lives in this browser on this device. Export a backup regularly (weekly is good) and keep it in iCloud Drive or Files. Moving to a new phone = export here, import there.</div>
          <div class="grid2"><button class="btn" data-act="exp">${I('download', 16)} Export</button><button class="btn" data-act="expp">${I('camera', 16)} Export + photos</button></div>
          <label class="btn ghost block" style="margin-top:8px">${I('upload', 16)} Import backup<input type="file" accept="application/json,.json" id="impf" hidden></label>
          <div class="tiny dim" style="margin-top:8px" id="usage">${A.lastSave ? 'Last saved ' + new Date(A.lastSave).toLocaleTimeString() : 'Saves automatically'}</div>
          <button class="btn danger block" style="margin-top:12px" data-act="reset">Erase all data</button></div>
        <div class="card flat"><h3>Install on iPhone</h3><div class="small muted" style="line-height:1.6">1. Open this app's link in <b>Safari</b>.<br>2. Tap <b>Share</b> → <b>Add to Home Screen</b> → Add.<br>3. Launch it from the home-screen icon. It opens full-screen, works offline, and your data stays put.<br>Use the same link every time — data belongs to that address.</div></div>
        <div class="tiny dim" style="text-align:center;margin:10px 0 20px">ASCEND 365 · v1.0 · <button class="link tiny" data-act="how">How scoring works</button></div>`;
    },
    mount(root, r) {
      const S = A.state;
      root.querySelectorAll('[data-num]').forEach((el) => el.addEventListener('change', () => { const v = Number(el.value); if (isNaN(v) || v < 0) return; S.settings[el.dataset.num] = v; A.mutate(() => { Object.keys(S.days).forEach(A.syncDayBonus); }); A.toast('Saved'); }));
      root.querySelectorAll('[data-prof]').forEach((el) => el.addEventListener('change', () => { S.profile[el.dataset.prof] = el.value.trim(); A.save(); A.toast('Saved'); }));
      const bt = root.querySelector('[data-biz]'); bt && bt.addEventListener('change', () => { S.biz.target = Number(bt.value) || 10000; const g = S.roadmap.goals.find((x) => x.auto === 'income'); if (g) g.target = S.biz.target; A.save(); A.toast('Saved'); });
      const imp = root.querySelector('#impf'); imp && imp.addEventListener('change', async () => { const f = imp.files[0]; if (!f) return; if (!(await A.confirm('Import backup?', 'This replaces everything currently in the app with the backup.', 'Replace & import', true))) return; try { await A.importData(await f.text()); A.applyTheme(); A.toast('Backup restored'); A.go('home'); } catch (e) { A.toast('Import failed: ' + e.message); } });
      if (r.sub === 'routine') bindRoutine(root);
      if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then((e) => { const u = root.querySelector('#usage'); if (u) u.textContent += ` · ${(e.usage / 1048576).toFixed(1)} MB used`; }).catch(() => {});
    },
    act: {
      tog(el) { const k = el.dataset.k; A.state.settings[k] = !A.state.settings[k]; A.applyTheme(); A.save(); A.refresh(); },
      accent(el) { A.state.settings.accent = el.dataset.k; A.applyTheme(); A.save(); A.refresh(); },
      wkend(el) { const i = Number(el.dataset.i); const w = A.state.settings.weekendDays; A.state.settings.weekendDays = w.includes(i) ? w.filter((x) => x !== i) : w.concat(i); A.save(); A.refresh(); },
      how: () => howSheet(),
      async exp() { await doExport(false); }, async expp() { await doExport(true); },
      async reset() { if (!(await A.confirm('Erase everything?', 'All progress, logs and photos on this device will be deleted. Export a backup first if you might want it.', 'Erase all', true))) return; if (!(await A.confirm('Are you sure?', 'This cannot be undone.', 'Yes, erase', true))) return; for (const p of A.state.photos) await A.photoDB.del(p.id).catch(() => {}); A.state = A.initialState(); A.saveNow(); A.applyTheme(); A.ensureDay(d.today()); A.go('home'); },
      pinon() { A.sheet({ title: 'Set passcode', body: A.fields([{ n: 'p1', l: '4-digit passcode', t: 'password', ph: '••••' }, { n: 'p2', l: 'Repeat', t: 'password', ph: '••••' }]), foot: [{ label: 'Save', cls: 'pri', act: 's' }], onAction: async (a, el, close) => { const f = A.read(el); if (!/^\d{4}$/.test(f.p1)) return A.toast('Use exactly 4 digits'); if (f.p1 !== f.p2) return A.toast("Passcodes don't match"); A.state.settings.pinHash = await A.sha(f.p1); A.saveNow(); close(); A.toast('Passcode set'); A.refresh(); } }); },
      async pinoff() { if (await A.confirm('Remove passcode?', 'The app will open without a lock screen.', 'Remove')) { A.state.settings.pinHash = null; A.save(); A.refresh(); } },
      rsel(el) { rt = el.dataset.k; A.go('settings/routine/' + rt); },
      redit(el) { editRoutineTask(A.route().arg || rt, el.dataset.tid); },
      radd() { editRoutineTask(A.route().arg || rt, null); },
      rapply() { applyRoutineToday(A.route().arg || rt); },
      rreset() { resetRoutine(A.route().arg || rt); }
    }
  };
  async function doExport(withPhotos) {
    const blob = await A.exportData(withPhotos); const name = 'ascend365-backup-' + d.today() + '.json';
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'ASCEND 365 backup' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
    A.toast('Backup exported');
  }

  // routine editor
  function routineEditor(type) {
    const S = A.state; if (!S.routines[type]) type = 'weekday';
    const list = A.sortTasks(S.routines[type]);
    return `<div class="row" style="margin-bottom:12px"><button class="btn sm ghost" data-go="settings">${I('back', 14)} Settings</button></div>
      <div class="seg">${Object.entries(A.DAYTYPE_LABEL).map(([k, l]) => `<button class="${type === k ? 'on' : ''}" data-act="rsel" data-k="${k}">${l.replace(' day', '')}</button>`).join('')}</div>
      <p class="small muted" style="margin-top:0">This is the template for every ${A.DAYTYPE_LABEL[type].toLowerCase()}. Changes apply to days you haven't opened yet. Linked tasks (gym, tennis, focus, sleep…) connect to their logs.</p>
      <div class="card flat"><div class="list">${list.map((t) => `<div class="li" data-act="redit" data-tid="${t.tid}"><span class="num small" style="width:60px;color:var(--muted)">${t.time ? d.fmtTimeShort(t.time) + (t.end ? '–' + d.fmtTimeShort(t.end) : '') : 'Anytime'}</span><span class="dot" style="background:${A.catColor(t.cat)}"></span><div class="sp"><div class="t" style="font-size:14px">${esc(t.title)}</div><div class="s">+${t.xp} XP${t.kind ? ' · linked' : ''}${t.days && t.days.length ? ' · ' + t.days.map((x) => d.DOW[x]).join(', ') + ' only' : ''}</div></div></div>`).join('')}</div></div>
      <div class="row" style="gap:8px"><button class="btn sp" data-act="radd">${I('plus', 15)} Add task</button><button class="btn pri sp" data-act="rapply">Apply to today</button></div>
      <button class="btn ghost block" style="margin-top:8px" data-act="rreset">Restore default ${A.DAYTYPE_LABEL[type].toLowerCase()} routine</button>`;
  }
  function bindRoutine() {}
  function editRoutineTask(type, tid) {
    const S = A.state; const arr = S.routines[type]; const t = tid ? arr.find((x) => x.tid === tid) : null; const isNew = !t;
    const x = t || { tid: 't' + A.uid(), time: '', end: '', title: '', cat: 'life', xp: 10, kind: null, days: [] };
    A.sheet({ title: isNew ? 'Add routine task' : 'Edit routine task', body: A.fields([{ n: 'title', l: 'Task', v: x.title }, [{ n: 'time', l: 'Start (blank = anytime)', t: 'time', v: x.time || '' }, { n: 'end', l: 'End', t: 'time', v: x.end || '' }], [{ n: 'cat', l: 'Category', t: 'select', o: Object.entries(A.CATS).map(([k, c]) => [k, c.label]), v: x.cat }, { n: 'xp', l: 'XP (5–40)', t: 'number', v: x.xp }], { n: 'days', l: 'Only on these days (none = every ' + A.DAYTYPE_LABEL[type].toLowerCase() + ')', t: 'multichips', o: [1, 2, 3, 4, 5, 6, 0].map((i) => [String(i), d.DOW[i]]), v: (x.days || []).map(String) }]) + (x.kind ? `<div class="tiny dim" style="margin-bottom:10px">Linked task (${x.kind}) — keeps its connection to logs.</div>` : '') + (isNew ? '' : `<button class="btn sm danger" data-sact="del">${I('trash', 14)} Remove from routine</button>`),
      foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => {
        if (a === 'del') { S.routines[type] = arr.filter((y) => y.tid !== x.tid); A.save(); close(); A.refresh(); return; }
        const f = A.read(el); if (!f.title) return A.toast('Name it');
        Object.assign(x, { title: f.title, time: f.time || null, end: f.end || null, cat: f.cat, xp: A.clamp(f.xp || 10, 5, 40), days: f.days.map(Number) });
        if (isNew) arr.push(x); A.save(); close(); A.refresh();
      } });
  }
  async function applyRoutineToday(type) {
    const k = d.today(); const dy = A.ensureDay(k);
    if (!(await A.confirm('Rebuild today?', `Today's unchecked tasks will be replaced with your current ${A.DAYTYPE_LABEL[type].toLowerCase()} routine. Completed tasks stay.`, 'Rebuild'))) return;
    A.mutate(() => { const keep = dy.tasks.filter((x) => x.status === 'done'); dy.tasks.filter((x) => x.status !== 'done').forEach((x) => A.xpRemove('task:' + k + ':' + x.id)); A.state.dayType[k] = type; dy.type = type; dy.tasks = keep.concat(A.buildTasks(k, type).filter((x) => !keep.some((y) => y.tid === x.tid))); A.syncDayBonus(k); });
    A.toast('Today rebuilt'); A.go('day');
  }
  async function resetRoutine(type) { if (!(await A.confirm('Restore default?', 'Your edits to this routine will be lost.', 'Restore', true))) return; A.state.routines[type] = JSON.parse(JSON.stringify(A.DEFAULT_ROUTINES[type])); A.save(); A.refresh(); }
})(window.A);
