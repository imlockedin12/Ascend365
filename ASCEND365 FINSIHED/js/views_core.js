/* ASCEND 365 — Home, My Day, Weekly Review, More, Notes */
(function (A) {
  'use strict';
  const d = A.d, esc = A.esc, I = A.icon;

  A.nextTask = (k) => {
    const dy = A.state.days[k]; if (!dy) return null;
    const now = d.nowMin(); const ts = A.sortTasks(dy.tasks).filter((t) => t.status === 'pending' && t.time);
    return ts.find((t) => (d.toMin(t.end || t.time) || 0) >= now) || null;
  };
  A.prios = (k) => { const P = A.state.priorities; if (!P[k]) P[k] = [{ t: '', done: false }, { t: '', done: false }, { t: '', done: false }]; return P[k]; };

  A.ratingSheet = () => {
    const o = A.ovr(), a = o.attrs;
    A.sheet({ title: 'Overall Rating · ' + o.v, body: `<p class="small muted" style="margin-top:0">Every bit of XP you earn builds the attribute it belongs to. Your Overall Rating is the average of all six, so neglecting one area holds the whole card back. Missed days never lower it.</p>` +
      A.ATTRS.map(([k, l]) => `<div style="margin-bottom:12px"><div class="row small"><b>${l}</b><span class="sp"></span><span class="num">${a[k]}</span></div>${A.bar(a[k] / 99, A.catColor(k))}<div class="tiny dim" style="margin-top:3px">${A.fmtNum(a._xp[k] || 0)} XP earned</div></div>`).join('') +
      `<div class="sec">Ranks</div><div class="row" style="flex-wrap:wrap;gap:6px">${A.RANKS.map(([m, n, c]) => `<span class="pill" style="color:${c};${n === o.rank ? 'border-color:' + c : ''}">${n} ${m}+</span>`).join('')}</div>` });
  };

  // ---------- HOME: overview only ----------
  A.views.home = {
    title: () => { const h = new Date().getHours(); const n = A.state.profile.name; return (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + (n ? ', ' + esc(n) : ''); },
    render() {
      const S = A.state, t = d.today(), y = A.year(t); A.ensureDay(t);
      const st = A.dayStats(t), li = A.levelInfo(), sk = A.streak(), o = A.ovr();
      const dayNum = y.complete ? 365 : Math.max(1, y.dayNum);
      const prev = d.add(t, -1); const comeback = prev >= A.firstDay() && !A.kept(prev) && !sk.shielded[prev];
      const hero = y.complete
        ? `<div class="card hero" data-go="year" style="cursor:pointer"><div class="row"><div style="font-size:34px">🏆</div><div class="sp"><div class="mid">Year complete</div><div class="small muted">Open your reflection</div></div>${I('chev', 18, 'class="chev"')}</div></div>`
        : `<div class="card hero"><div class="row" style="align-items:flex-end"><div class="big num">Day ${dayNum}<span class="dim" style="font-size:18px"> / 365</span></div><span class="sp"></span><div class="small muted num" style="padding-bottom:4px">${y.remaining} days left</div></div><div style="margin-top:12px">${A.bar(y.progress)}</div></div>`;
      const card = `<div class="card" data-act="rating" style="cursor:pointer;background:radial-gradient(120% 120% at 100% 0%,${o.color}22,transparent 55%),linear-gradient(180deg,var(--card2),var(--card))">
        <div class="row" style="gap:16px;align-items:center"><div style="text-align:center;min-width:76px"><div class="num" style="font-family:var(--display);font-size:52px;font-weight:800;line-height:1;letter-spacing:-.04em">${o.v}</div><div class="tiny" style="font-weight:800;letter-spacing:.12em;color:${o.color};margin-top:4px">${o.rank.toUpperCase()}</div></div>
        <div class="sp" style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px">${A.ATTRS.map(([k, l]) => `<div><div class="row tiny"><span class="muted">${l}</span><span class="sp"></span><b class="num">${o.attrs[k]}</b></div><div class="bar thin" style="margin-top:3px"><i style="width:${(o.attrs[k] / 99) * 100}%;background:${A.catColor(k)}"></i></div></div>`).join('')}</div></div>
        <div class="row tiny dim" style="margin-top:14px"><span>Level ${li.lv} · ${li.title}</span><span class="sp"></span><span class="num">${li.into}/${li.need} XP</span></div><div class="bar thin" style="margin-top:5px"><i style="width:${li.p * 100}%"></i></div></div>`;
      const row = `<div class="grid2" style="margin-bottom:12px">
        <div class="card" style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:20px 12px"><div class="row" style="gap:8px">${I('flame', 40, 'style="color:#fb923c"')}<span class="num" style="font-family:var(--display);font-size:52px;font-weight:800;line-height:1">${sk.cur}</span></div><div class="tiny dim" style="font-weight:700;letter-spacing:.08em">DAY STREAK</div></div>
        <div class="card" style="margin:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:16px 12px" data-go="day">${A.chart.ring(st.pct, 92, 9, 'url(#rg)', `<b class="num" style="font-size:22px">${Math.round(st.pct * 100)}%</b>`)}<div class="tiny dim" style="font-weight:700;letter-spacing:.08em">TODAY</div></div></div>`;
      const recentB = Object.entries(S.badges).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 6);
      const biz = A.views.biz.render(); const bizCard = biz.slice(0, biz.indexOf('</button></div>') + 15);
      return hero + card + row + bizCard +
        `<div class="card"><h3>Consistency</h3>${A.chart.heat((k) => (S.days[k] ? A.dayStats(k).pct : null), t)}</div>` +
        `<div class="card" data-go="insights/badges" style="cursor:pointer"><h3>Badges<span class="sp"></span><span class="tiny dim num" style="text-transform:none;letter-spacing:0">${Object.keys(S.badges).length}/${A.BADGES.length}</span></h3>${recentB.length ? `<div class="row" style="gap:14px;overflow-x:auto">${recentB.map(([id]) => { const b = A.BADGES.find((x) => x.id === id); return b ? `<div class="badge got"><div class="b">${b.i}</div>${b.n}</div>` : ''; }).join('')}</div>` : '<div class="small dim">Check off your first task to earn one.</div>'}</div>`;
    },
    act: { rating: () => A.ratingSheet(), incadd: () => A.views.biz.act.incadd() }
  };

  // ---------- MY DAY ----------
  let dayKey = null;
  const COLORS = ['#a78bfa', '#fb7185', '#a3e635', '#fbbf24', '#38bdf8', '#2dd4bf', '#f97316', '#94a3b8'];
  const KIND_ACTION = {
    workout: ['Change workout type', (t) => workoutType(dayKey, t)], skills: null,
    tennis: ['Log tennis session', () => A.go('tennis/log')], focus: ['Start focus timer', () => A.openTimer()], social: ["Open today's challenge", () => A.go('social')],
    weigh: ['Log bodyweight', () => A.logWeight()], review: ['Open weekly review', () => A.go('review')], skincare_am: null, skincare_pm: null, duolingo: null
  };
  function workoutType(k, t) {
    A.sheet({ title: 'What did you train?', body: `<div class="chips">${A.SPLIT_TYPES.map((x) => `<button class="chip ${t.wtype === x ? 'on' : ''}" data-sact="w:${x}">${x}</button>`).join('')}</div>`,
      onAction: (a, el, close) => { if (!a.startsWith('w:')) return; const w = a.slice(2); t.wtype = w; t.title = 'Gym · ' + w; const wo = A.state.fitness.workouts.find((x) => x.task === t.id); if (wo) wo.type = w; A.save(); close(); A.refresh(); } });
  }
  function taskRow(t, k) {
    const isNow = k === d.today() && t.status === 'pending' && t.time && d.toMin(t.time) <= d.nowMin() && d.nowMin() <= (d.toMin(t.end) || d.toMin(t.time) + 30);
    return `<div class="task ${t.status} ${isNow ? 'now' : ''}" data-id="${t.id}">
      <div class="time">${t.time ? d.fmtTimeShort(t.time) : ''}</div>
      <div class="body"><span class="dot" style="background:${t.color || A.catColor(t.cat)}"></span>
        <div class="sp ttl" style="min-width:0" data-act="task" data-id="${t.id}">${esc(t.title)}</div>
        ${t.status === 'skipped' ? `<button class="skipico" data-act="unskip" data-id="${t.id}" aria-label="Unskip">${I('undo', 14)}</button>` : `<button class="chk" data-act="tick" data-id="${t.id}" aria-label="Complete"><span class="ring"></span><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`}
      </div></div>`;
  }
  function progressBlock(k) {
    const st = A.dayStats(k);
    return `<div id="dprog" style="margin:0 2px 16px">${A.bar(st.pct)}</div>`;
  }
  A.logWeight = () => {
    const S = A.state; const last = S.fitness.weights[S.fitness.weights.length - 1];
    A.sheet({ title: 'Bodyweight', body: A.fields([[{ n: 'lb', l: 'Weight (lb)', t: 'number', step: '0.1', v: last ? last.lb : S.profile.startWeight }, { n: 'date', l: 'Date', t: 'date', v: d.today() }]]), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => { const f = A.read(el); if (!f.lb) return; A.mutate(() => { S.fitness.weights = S.fitness.weights.filter((w) => w.date !== f.date); S.fitness.weights.push({ date: f.date, lb: f.lb }); S.fitness.weights.sort((x, y) => x.date.localeCompare(y.date)); A.autoTask(f.date, 'weigh'); }); close(); A.toast('Saved ' + f.lb + ' lb'); A.refresh(); } });
  };
  function taskSheet(k, t) {
    const S = A.state, dy = A.state.days[k];
    const act = KIND_ACTION[t.kind];
    A.sheet({ title: esc(t.title), body:
      (act ? `<button class="btn pri block" data-sact="kind" style="margin-bottom:14px">${act[0]}</button>` : '') +
      A.fields([{ n: 'title', l: 'Task', v: t.title }, [{ n: 'time', l: 'Start', t: 'time', v: t.time || '' }, { n: 'end', l: 'End', t: 'time', v: t.end || '' }], { n: 'color', l: 'Color', t: 'chips', o: COLORS.map((c) => [c, '●']), v: t.color || '' }, { n: 'note', l: 'Note', t: 'textarea', v: t.note }, { n: 'tpl', l: 'Also change it in my routine', t: 'toggle', v: false }]).replace(/data-v="(#[0-9a-f]{6})">●/g, 'data-v="$1" style="color:$1;font-size:18px;padding:2px 10px">●') +
      `<div class="row" style="gap:8px"><button class="btn sm ghost" data-sact="skip">${t.status === 'skipped' ? 'Unskip' : 'Skip today'}</button><button class="btn sm ghost" data-sact="later">+30 min</button><span class="sp"></span><button class="btn sm danger" data-sact="del">${I('trash', 15)}</button></div>`,
      foot: [{ label: 'Save', cls: 'pri', act: 'save' }],
      onAction: async (a, el, close) => {
        if (a === 'kind') { close(); act[1](t); return; }
        if (a === 'skip') { A.setTask(k, t.id, t.status === 'skipped' ? 'pending' : 'skipped'); close(); A.refresh(); return; }
        if (a === 'later') { if (!t.time) return; t.time = d.fromMin(d.toMin(t.time) + 30); if (t.end) t.end = d.fromMin(d.toMin(t.end) + 30); A.save(); close(); A.refresh(); return; }
        if (a === 'del') { if (!(await A.confirm('Delete task?', 'Removes it from this day only.', 'Delete', true))) return; A.mutate(() => { A.xpRemove('task:' + k + ':' + t.id); dy.tasks = dy.tasks.filter((x) => x.id !== t.id); A.syncDayBonus(k); }); close(); A.refresh(); return; }
        if (a === 'save') {
          const f = A.read(el); if (!f.title) return A.toast('Task needs a name');
          A.mutate(() => {
            Object.assign(t, { title: f.title, time: f.time || null, end: f.end || null, note: f.note, color: f.color || t.color || null });
            if (f.tpl) { const r = S.routines[dy.type].find((x) => x.tid === t.tid); if (r) Object.assign(r, { title: f.title, time: t.time, end: t.end, color: t.color }); }
          });
          close(); A.refresh();
        }
      } });
  }
  function addTaskSheet(k) {
    const S = A.state, dy = A.ensureDay(k);
    A.sheet({ title: 'Add task', body: A.fields([{ n: 'title', l: 'Task' }, [{ n: 'time', l: 'Start (optional)', t: 'time' }, { n: 'end', l: 'End', t: 'time' }], { n: 'cat', l: 'Area', t: 'chips', o: [['fitness', 'Fitness'], ['tennis', 'Tennis'], ['business', 'Business'], ['social', 'Social'], ['discipline', 'Discipline'], ['appearance', 'Style'], ['life', 'Other']], v: 'life' }, { n: 'tpl', l: 'Repeat on every ' + A.DAYTYPE_LABEL[dy.type].toLowerCase(), t: 'toggle' }]), foot: [{ label: 'Add', cls: 'pri', act: 'add' }],
      onAction: (a, el, close) => {
        const f = A.read(el); if (!f.title) return A.toast('Task needs a name');
        const tid = 't' + A.uid();
        const task = { id: A.uid(), tid, time: f.time || null, end: f.end || null, title: f.title, cat: f.cat || 'life', xp: 10, kind: null, status: 'pending', doneAt: null, note: '' };
        A.mutate(() => { dy.tasks.push(task); if (f.tpl) S.routines[dy.type].push({ tid, time: task.time, end: task.end, title: task.title, cat: task.cat, xp: 10, kind: null }); A.syncDayBonus(k); });
        close(); A.refresh();
      } });
  }
  function dayMenu(k) {
    const dy = A.ensureDay(k);
    A.sheet({ title: 'Day options', body: `<button class="btn block pri" data-sact="add" style="margin-bottom:16px">${I('plus', 16)} Add a task</button><div class="small muted" style="margin-bottom:8px">Today's routine is picked automatically. Switch it if today is different:</div>` + Object.entries(A.DAYTYPE_LABEL).map(([v, l]) => `<button class="btn block ${dy.type === v ? '' : 'ghost'}" style="margin-bottom:8px" data-sact="${v}">${l}${dy.type === v ? ' ✓' : ''}</button>`).join(''),
      onAction: (a, el, close) => {
        if (a === 'add') { close(); return addTaskSheet(k); }
        if (!A.DAYTYPE_LABEL[a]) return;
        A.mutate(() => {
          A.state.dayType[k] = a;
          const keep = dy.tasks.filter((x) => x.status === 'done');
          const fresh = A.buildTasks(k, a).filter((x) => !keep.some((y) => y.tid === x.tid));
          dy.tasks.filter((x) => x.status !== 'done').forEach((x) => A.xpRemove('task:' + k + ':' + x.id));
          dy.type = a; dy.tasks = keep.concat(fresh); A.syncDayBonus(k);
        });
        close(); A.refresh();
      } });
  }

  A.views.day = {
    title: 'My Day',
    render(r) {
      const t0 = d.today(); const t = t0 < A.START ? A.START : t0; dayKey = r.sub && /^\d{4}-\d{2}-\d{2}$/.test(r.sub) ? r.sub : t;
      const k = dayKey, dy = A.ensureDay(k);
      const tasks = A.sortTasks(dy.tasks); const timed = tasks.filter((x) => x.time), anytime = tasks.filter((x) => !x.time);
      let rows = ''; let nowShown = k !== t;
      timed.forEach((x) => { rows += taskRow(x, k); });
      const y = A.year(k);
      return `<div class="row" style="margin-bottom:14px">
          <button class="iconbtn" data-go="day/${d.add(k, -1)}" aria-label="Previous day">${I('left', 18)}</button>
          <div class="sp" style="text-align:center" ${k !== t ? 'data-go="day"' : ''}><div style="font-weight:700">${d.fmtDate(k, { dow: true })}</div><div class="tiny dim">${k === t ? 'Today' : 'Tap for today'}${y.dayNum >= 1 && y.dayNum <= 365 ? ' · Day ' + y.dayNum : ''}${dy.type !== 'weekday' && dy.type !== 'weekend' ? ' · ' + A.DAYTYPE_LABEL[dy.type] : ''}</div></div>
          <button class="iconbtn" data-act="menu" aria-label="Day options">${I('more', 18)}</button>
          <button class="iconbtn" data-go="day/${d.add(k, 1)}" aria-label="Next day">${I('right', 18)}</button></div>
        <div class="tl">${rows || '<div class="empty">Nothing scheduled.</div>'}</div>
        ${anytime.length ? `<div class="sec">Anytime</div><div class="tl">${anytime.map((x) => taskRow(x, k)).join('')}</div>` : ''}
        <div class="card" style="margin-top:16px"><div class="row"><div class="sp small">Screen time (min)</div><input class="inp num" type="number" inputmode="numeric" data-screen value="${dy.screen == null ? '' : dy.screen}" placeholder="—" style="width:90px;padding:8px;text-align:right"></div>
        <textarea class="inp" data-note placeholder="Reflection: what went well, what to fix tomorrow" style="margin-top:12px;min-height:70px">${esc(dy.note || '')}</textarea></div>`;
    },
    mount(root) {
      const S = A.state, k = dayKey, dy = S.days[k];
      const sc = root.querySelector('[data-screen]');
      sc && sc.addEventListener('change', () => { A.mutate(() => { dy.screen = sc.value === '' ? null : Number(sc.value); A.xpAdd('scr:' + k, dy.screen != null && dy.screen <= S.settings.screenGoal ? 20 : 0, 'Screen time under goal', k); }); A.toast(dy.screen != null && dy.screen <= S.settings.screenGoal ? 'Under your ' + S.settings.screenGoal + ' min goal · +20 XP' : 'Saved'); });
      const nt = root.querySelector('[data-note]'); nt && nt.addEventListener('change', () => { dy.note = nt.value; A.save(); });
    },
    act: {
      tick(el) {
        const k = dayKey, dy = A.state.days[k], t = dy.tasks.find((x) => x.id === el.dataset.id); if (!t) return;
        const status = t.status === 'done' ? 'pending' : 'done';
        const delta = A.setTask(k, t.id, status);
        const row = el.closest('.task'); row.classList.toggle('done', status === 'done'); row.classList.remove('now');
        if (status === 'done') { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); A.sfx('done'); A.haptic(15); A.floatXP(el, delta); }
        else { A.sfx('undo'); }
        const pb = document.getElementById('dprog'); if (pb) pb.outerHTML = progressBlock(k);
        const li = A.levelInfo(); const chip = document.querySelector('.topbar .lv'); if (chip) chip.innerHTML = `<b>${li.lv}</b><span class="num">${A.fmtNum(li.xp)} XP</span>`;
        const st = A.dayStats(k);
        if (status === 'done' && st.done === st.total - st.skipped && st.total > 0 && !dy.celebrated) { dy.celebrated = true; A.save(); A.celebQ.push({ icon: '💎', title: 'Day complete', sub: 'Every task checked.' }); }
        if (A.celebQ.length) setTimeout(A.flushCeleb, 650);
      },
      unskip(el) { A.setTask(dayKey, el.dataset.id, 'pending'); A.refresh(); },
      task(el) { const t = A.state.days[dayKey].tasks.find((x) => x.id === el.dataset.id); if (t) taskSheet(dayKey, t); },
      menu() { dayMenu(dayKey); }
    }
  };

  // ---------- WEEKLY REVIEW ----------
  A.weekStats = (wk) => {
    const end = d.add(wk, 6), t = d.today(), e2 = end < t ? end : t;
    const days = d.range(wk, e2);
    return { comp: days.length ? Math.round(A.avg(days, (k) => A.dayStats(k).pct) * 100) : 0, workouts: A.metric('workouts', wk, end), tennis: A.metric('tennis', wk, end), deep: A.metric('deepHours', wk, end), sleep: A.metric('sleepNights', wk, end), chal: A.metric('challenges', wk, end) };
  };
  A.views.review = {
    title: 'Weekly review',
    render(r) {
      const S = A.state; const wk = r.sub && /^\d{4}-/.test(r.sub) ? d.weekStart(r.sub) : d.weekStart(d.today()); const rv = S.reviews[wk] || {}; const w = A.weekStats(wk);
      const past = Object.keys(S.reviews).sort().reverse();
      return `<div class="row" style="margin-bottom:12px"><button class="iconbtn" data-go="review/${d.add(wk, -7)}">${I('left', 18)}</button><div class="sp" style="text-align:center"><b>${d.fmtDate(wk)} – ${d.fmtDate(d.add(wk, 6))}</b>${rv.saved ? '<div class="tiny good">Saved</div>' : ''}</div><button class="iconbtn" data-go="review/${d.add(wk, 7)}">${I('right', 18)}</button></div>
        <div class="grid3" style="margin-bottom:12px">
          <div class="stat"><div class="k">Completion</div><div class="v num">${w.comp}%</div></div><div class="stat"><div class="k">Workouts</div><div class="v num">${w.workouts}</div></div><div class="stat"><div class="k">Tennis</div><div class="v num">${w.tennis}</div></div>
          <div class="stat"><div class="k">Deep work</div><div class="v num">${w.deep}h</div></div><div class="stat"><div class="k">Sleep ✓</div><div class="v num">${w.sleep}/7</div></div><div class="stat"><div class="k">Social</div><div class="v num">${w.chal}</div></div></div>
        <div class="card" id="rvf">${A.fields([
          { n: 'wins', l: 'What went well', t: 'textarea', v: rv.wins },
          { n: 'misses', l: "What didn't work, and why", t: 'textarea', v: rv.misses },
          { n: 'rating', l: 'Rate the week', t: 'scale', v: rv.rating, min: 1, max: 10 }])}
          <button class="btn pri block" data-act="save">${rv.saved ? 'Update' : 'Save · +60 XP'}</button></div>
        ${past.length ? `<div class="sec">Past weeks</div><div class="card flat"><div class="list">${past.map((p) => `<div class="li" data-go="review/${p}"><div class="sp"><div class="t">${d.fmtDate(p, { year: true })}</div><div class="s">${esc((S.reviews[p].wins || '').slice(0, 60))}</div></div>${S.reviews[p].rating ? `<b class="num">${S.reviews[p].rating}/10</b>` : ''}</div>`).join('')}</div></div>` : ''}`;
    },
    act: {
      save() {
        const r = A.route(); const wk = r.sub && /^\d{4}-/.test(r.sub) ? d.weekStart(r.sub) : d.weekStart(d.today());
        const f = A.read(document.getElementById('rvf'));
        A.mutate(() => { A.state.reviews[wk] = Object.assign(A.state.reviews[wk] || {}, f, { saved: new Date().toISOString() }); A.xpAdd('rev:' + wk, 60, 'Weekly review', d.today()); A.autoTask(d.today(), 'review'); });
        A.sfx('done'); A.toast('Review saved'); A.refresh();
      }
    }
  };

  // ---------- NOTES & REFLECTIONS (everything you've written, for review) ----------
  let nf = 'all';
  A.allNotes = () => {
    const S = A.state, out = [];
    Object.entries(S.days).forEach(([k, dy]) => { if (dy.note) out.push({ k, type: 'daily', title: 'Daily reflection', body: dy.note }); dy.tasks.forEach((t) => { if (t.note) out.push({ k, type: 'daily', title: t.title, body: t.note }); }); });
    Object.entries(S.reviews).forEach(([k, r]) => { const b = [r.wins && 'Went well: ' + r.wins, r.misses && "Didn't work: " + r.misses].filter(Boolean).join('\n'); if (b || r.rating) out.push({ k, type: 'weekly', title: 'Week of ' + d.fmtDate(k) + (r.rating ? ' · ' + r.rating + '/10' : ''), body: b }); });
    S.tennis.sessions.forEach((x) => { if (x.notes) out.push({ k: x.date, type: 'tennis', title: 'Tennis · ' + (x.type || 'session'), body: x.notes }); });
    S.tennis.matches.forEach((x) => { const b = [x.worked && 'Worked: ' + x.worked, x.fix && 'Fix: ' + x.fix].filter(Boolean).join('\n'); if (b) out.push({ k: x.date, type: 'tennis', title: 'Match vs ' + (x.opp || 'opponent') + ' · ' + x.result, body: b }); });
    S.social.challenges.forEach((x) => { if (x.note) out.push({ k: x.date, type: 'social', title: x.text, body: x.note }); });
    S.roadmap.milestones.forEach((m) => { if (m.notes) out.push({ k: m.doneOn || m.due, type: 'milestone', title: m.title, body: m.notes }); });
    S.biz.journal.forEach((j) => out.push({ k: j.date, type: 'business', title: 'Research · ' + j.topic, body: [j.thesis, j.outcome].filter(Boolean).join('\n') }));
    return out.filter((x) => x.body).sort((a, b) => b.k.localeCompare(a.k));
  };
  A.views.notes = {
    title: 'Notes & reflections',
    render() {
      const all = A.allNotes(); const F = [['all', 'All'], ['daily', 'Daily'], ['weekly', 'Weekly'], ['tennis', 'Tennis'], ['social', 'Social'], ['milestone', 'Milestones'], ['business', 'Business']];
      const list = all.filter((x) => nf === 'all' || x.type === nf);
      return `<p class="small muted" style="margin-top:0">Everything you've written all year, in one place.</p><div class="chips" style="margin-bottom:14px">${F.map(([k, l]) => `<button class="chip ${nf === k ? 'on' : ''}" data-act="f" data-k="${k}">${l}</button>`).join('')}</div>` +
        (list.length ? list.map((x) => `<div class="card flat" style="padding:14px"><div class="row tiny dim"><span>${d.fmtDate(x.k, { dow: true, year: true })}</span><span class="sp"></span><span>${x.type}</span></div><div style="font-weight:650;margin:4px 0">${esc(x.title)}</div><div class="small muted" style="white-space:pre-wrap">${esc(x.body)}</div></div>`).join('') : '<div class="empty">Nothing written yet. Reflections from My Day, weekly reviews, tennis and challenges show up here.</div>');
    },
    act: { f(el) { nf = el.dataset.k; A.refresh(); } }
  };

  // ---------- MORE ----------
  A.views.more = {
    title: 'More',
    render() {
      const S = A.state, t = d.today();
      const lastW = S.fitness.weights[S.fitness.weights.length - 1];
      const tiles = [
        ['fitness', 'dumbbell', 'Fitness', (lastW ? lastW.lb + ' lb · ' : '') + A.metric('workouts', d.weekStart(t), t) + ' this week', 'var(--c-fitness)', 'rgba(251,113,133,.14)'],
        ['tennis', 'tennis', 'Tennis', A.metric('tennis', d.weekStart(t), t) + ' sessions this week', 'var(--c-tennis)', 'rgba(163,230,53,.12)'],
        ['review', 'review', 'Weekly review', S.reviews[d.weekStart(t)] ? 'Done ✓' : 'Not done yet', 'var(--accent2)', 'var(--accentSoft)'],
        ['notes', 'book', 'Notes', A.allNotes().length + ' entries', 'var(--accent2)', 'var(--accentSoft)'],
        ['insights', 'chart', 'Insights', 'Trends & reports', 'var(--accent2)', 'var(--accentSoft)'],
        ['settings', 'gear', 'Settings', 'Routines & backup', 'var(--muted)', 'var(--card3)']
      ];
      return `<div class="grid2">${tiles.map(([go, ic, n, s, c, bg]) => `<div class="tile" data-go="${go}"><div class="ic" style="background:${bg};color:${c}">${I(ic)}</div><div class="t">${n}</div><div class="s">${s}</div></div>`).join('')}</div>`;
    }
  };
})(window.A);
