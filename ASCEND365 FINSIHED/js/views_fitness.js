/* ASCEND 365 — Fitness: workout check-ins (lifting is logged in your separate app), calisthenics, body */
(function (A) {
  'use strict';
  const d = A.d, esc = A.esc, I = A.icon;
  const F = () => A.state.fitness;
  const SUBS = [['', 'Workouts'], ['body', 'Body']];
  const seg = (cur) => `<div class="seg">${SUBS.map(([k, l]) => `<button class="${(cur || '') === k ? 'on' : ''}" data-go="fitness${k ? '/' + k : ''}">${l}</button>`).join('')}</div>`;

  A.views.fitness = {
    title: 'Fitness',
    render(r) { const sub = r.sub || ''; return seg(sub) + ({ '': overview, skills, body: bodyView }[sub] || overview)(r); },
    mount(root, r) { if (r.sub === 'body') root.querySelectorAll('[data-photo]').forEach(async (el) => { const u = await A.photoURL(el.dataset.photo); if (u) el.insertAdjacentHTML('afterbegin', `<img src="${u}" alt="">`); }); },
    act: {}
  };
  const act = A.views.fitness.act;

  function overview() {
    const t = d.today(), ws = d.weekStart(t), sp = F().split || A.DEFAULT_SPLIT;
    const planned = A.plannedWorkouts(ws, d.add(ws, 6)), done = A.metric('workouts', ws, d.add(ws, 6));
    const recent = F().workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
    const todayW = F().workouts.find((w) => w.date === t);
    return `<div class="card hero"><div class="row"><div class="sp"><div class="tiny dim" style="font-weight:700;letter-spacing:.06em">TODAY</div><div class="mid" style="margin-top:2px">${todayW ? esc(todayW.type) + ' ✓' : sp[d.dow(t)] ? esc(sp[d.dow(t)]) : 'Rest day'}</div></div><div style="text-align:right"><div class="mid num">${done}/${planned}</div><div class="tiny dim">this week</div></div></div>
        ${todayW ? '' : `<button class="btn pri block" style="margin-top:12px" data-act="checkin">Check off a workout</button>`}</div>
      <div class="card"><h3>Weekly split</h3>${[1, 2, 3, 4, 5, 6, 0].map((dw) => `<div class="row" style="margin-bottom:8px"><span style="width:44px" class="small"><b>${d.DOW[dw]}</b></span><select class="inp" data-split="${dw}" style="padding:9px">${[['', 'Rest']].concat(A.SPLIT_TYPES.map((x) => [x, x])).map(([v, l]) => `<option value="${v}" ${(sp[dw] || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')}
</div>
      <div class="card"><h3>Consistency</h3>${A.chart.heat((k) => (F().workouts.some((w) => w.date === k) ? 1 : k <= t && k >= A.firstDay() && sp[d.dow(k)] ? 0 : null), t)}</div>
      ${recent.length ? `<div class="card flat"><h3>Recent</h3>${recent.map((w) => `<div class="row small" style="margin-bottom:8px"><span class="dim" style="width:92px">${d.fmtDate(w.date, { dow: true })}</span><span class="sp">${esc(w.type)}</span>${w.task ? '' : `<button class="iconbtn" style="width:28px;height:28px" data-act="wdel" data-id="${w.id}">${I('trash', 13)}</button>`}</div>`).join('')}</div>` : ''}`;
  }
  document.addEventListener('change', (e) => { const s = e.target.closest('[data-split]'); if (!s) return; F().split = F().split || JSON.parse(JSON.stringify(A.DEFAULT_SPLIT)); F().split[s.dataset.split] = s.value || null; A.save(); A.toast('Split updated'); });
  act.checkin = () => {
    const sp = F().split || A.DEFAULT_SPLIT; const def = sp[d.dow(d.today())] || 'Push';
    A.sheet({ title: 'Check off a workout', body: A.fields([{ n: 'type', l: 'What did you train?', t: 'chips', o: A.SPLIT_TYPES.map((x) => [x, x]), v: def }, { n: 'date', l: 'Date', t: 'date', v: d.today() }]), foot: [{ label: 'Done · +40 XP', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => {
        const f = A.read(el); if (!f.type) return A.toast('Pick a type');
        A.ensureDay(f.date); const dy = A.state.days[f.date]; const t = dy.tasks.find((x) => (x.kind === 'workout' || x.kind === 'skills') && x.status !== 'done');
        if (t) { t.wtype = f.type; t.title = 'Gym · ' + f.type; A.setTask(f.date, t.id, 'done'); }
        else A.mutate(() => { F().workouts.push({ id: A.uid(), date: f.date, type: f.type }); A.xpAdd('wo:' + f.date, 40, 'Workout: ' + f.type, f.date); });
        close(); A.sfx('done'); A.toast(f.type + ' checked off'); A.refresh();
      } });
  };
  act.wdel = (el) => { const w = F().workouts.find((x) => x.id === el.dataset.id); A.mutate(() => { F().workouts = F().workouts.filter((x) => x.id !== w.id); if (!F().workouts.some((x) => x.date === w.date && !x.task)) A.xpRemove('wo:' + w.date); }); A.refresh(); };

  // ---------- calisthenics ----------
  const lvlOf = (id) => (F().skills[id] == null ? -1 : F().skills[id]);
  const reqMet = (lv) => !lv.req || lv.req.every(([t, l]) => lvlOf(t) >= l);
  function skills(r) {
    if (r.arg) return skillTree(r.arg);
    return `<p class="small muted" style="margin:0 0 12px">Progressions start from where you are (around 2 pull-ups, 7 push-ups). Each level has a test; log attempts and it unlocks when you hit it.</p>` +
      A.SKILL_TREES.map((tr) => { const lv = lvlOf(tr.id); const nx = tr.levels[lv + 1]; const locked = nx && !reqMet(nx); return `<div class="card" style="cursor:pointer" data-go="fitness/skills/${tr.id}"><div class="row"><div style="font-size:26px">${tr.icon}</div><div class="sp"><div style="font-weight:700">${tr.name}</div><div class="small muted">${nx ? (locked ? '🔒 Needs ' + nx.req.map(([t, l]) => A.SKILL_TREES.find((x) => x.id === t).name + ' L' + (l + 1)).join(', ') : 'Next: ' + esc(nx.n)) : 'Tree complete 🏆'}</div></div><b class="num">${lv + 1}/${tr.levels.length}</b></div><div style="margin-top:10px">${A.bar((lv + 1) / tr.levels.length, 'var(--c-fitness)')}</div></div>`; }).join('');
  }
  function skillTree(id) {
    const tr = A.SKILL_TREES.find((x) => x.id === id); if (!tr) return '';
    const lv = lvlOf(id); const logs = F().skillLogs.filter((l) => l.tree === id);
    return `<div class="row" style="margin-bottom:12px"><button class="btn sm ghost" data-go="fitness/skills">${I('back', 14)} All skills</button></div>
      <div class="card hero"><div class="row"><div style="font-size:32px">${tr.icon}</div><div class="sp"><div class="mid">${tr.name}</div><div class="small muted">Level ${lv + 1} of ${tr.levels.length}</div></div></div></div>
      <div class="card">${tr.levels.map((l, i) => { const got = i <= lv, next = i === lv + 1, lock = !got && !reqMet(l); return `<div class="skill ${got ? 'got' : next ? (lock ? 'lock' : 'next') : 'lock'}"><div class="n">${got ? '✓' : i + 1}</div><div class="sp" style="min-width:0"><div style="font-weight:650">${esc(l.n)}</div><div class="tiny dim">Test: ${l.goal} ${l.unit || tr.unit}${l.req ? ' · requires ' + l.req.map(([t, x]) => A.SKILL_TREES.find((s) => s.id === t).name + ' L' + (x + 1)).join(', ') : ''}</div>
        ${next && !lock ? `<ul class="small muted" style="margin:8px 0;padding-left:18px">${l.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ul><div class="row" style="gap:8px"><button class="btn sm pri" data-act="sklog" data-t="${id}" data-l="${i}">Log attempt</button><button class="btn sm ghost" data-act="skset" data-t="${id}" data-l="${i}">I can do this</button></div>` : ''}
        ${got && i === lv ? `<button class="link tiny" data-act="skset" data-t="${id}" data-l="${i - 1}" style="margin-top:4px">Undo this level</button>` : ''}
        ${!got && !next && !lock ? `<button class="link tiny" data-act="skset" data-t="${id}" data-l="${i}" style="margin-top:4px">Already have it? Mark achieved</button>` : ''}</div></div>`; }).join('')}</div>
      <div class="card"><h3>Attempt log</h3>${logs.length > 1 ? A.chart.line(logs.slice(-20).map((l) => ({ x: d.fmtDate(l.date), y: l.value })), { h: 120, color: 'var(--c-fitness)', fillColor: 'var(--c-fitness)' }) : ''}${logs.length ? `<div class="list">${logs.slice().reverse().slice(0, 10).map((l) => `<div class="li" style="cursor:default"><div class="sp"><div class="small">${esc(tr.levels[l.lvl] ? tr.levels[l.lvl].n : '')}</div><div class="tiny dim">${d.fmtDate(l.date, { year: true })}</div></div><b class="num">${l.value} ${tr.levels[l.lvl] && (tr.levels[l.lvl].unit || tr.unit)}</b></div>`).join('')}</div>` : '<div class="small dim">No attempts logged yet.</div>'}</div>`;
  }
  function setLevel(id, l) {
    const before = A.levelInfo().lv; const prev = lvlOf(id);
    F().skills[id] = l;
    for (let i = 0; i <= 12; i++) A.xpAdd('sk:' + id + ':' + i, i <= l ? 50 : 0, 'Skill: ' + A.SKILL_TREES.find((x) => x.id === id).levels[Math.min(i, A.SKILL_TREES.find((x) => x.id === id).levels.length - 1)].n, d.today());
    A.after(before);
    if (l > prev) A.celebQ.unshift({ icon: A.SKILL_TREES.find((x) => x.id === id).icon, title: 'Skill unlocked', sub: A.SKILL_TREES.find((x) => x.id === id).levels[l].n });
  }
  act.skset = (el) => { setLevel(el.dataset.t, Number(el.dataset.l)); A.refresh(); };
  act.sklog = (el) => {
    const id = el.dataset.t, l = Number(el.dataset.l), tr = A.SKILL_TREES.find((x) => x.id === id), lv = tr.levels[l];
    A.sheet({ title: 'Log attempt', body: `<div class="small muted" style="margin-bottom:10px">${esc(lv.n)} · test: ${lv.goal} ${lv.unit || tr.unit}</div>` + A.fields([{ n: 'value', l: 'Best result (' + (lv.unit || tr.unit) + ')', t: 'number' }, { n: 'date', l: 'Date', t: 'date', v: d.today() }]), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, e2, close) => { const f = A.read(e2); if (f.value == null) return A.toast('Enter a result'); F().skillLogs.push({ tree: id, lvl: l, date: f.date, value: f.value }); A.save(); close(); if (f.value >= lv.goal) setLevel(id, l); else A.toast(`Logged. ${lv.goal - f.value} ${lv.unit || tr.unit} to go.`); A.refresh(); } });
  };

  // ---------- body ----------
  function bodyView() {
    const S = A.state, w = F().weights;
    const pts = w.slice(-60).map((x) => ({ x: d.fmtDate(x.date), y: x.lb }));
    let rate = null; if (w.length >= 2) { const last = w[w.length - 1]; const ref = w.slice().reverse().find((x) => d.diff(x.date, last.date) >= 21) || w[0]; const days = d.diff(ref.date, last.date); if (days >= 7) rate = ((last.lb - ref.lb) / days) * 7; }
    const ms = F().measures.slice().sort((a, b) => b.date.localeCompare(a.date));
    const photos = S.photos.filter((p) => p.kind === 'physique').sort((a, b) => a.date.localeCompare(b.date));
    const MK = [['chest', 'Chest'], ['shoulders', 'Shoulders'], ['arms', 'Arms'], ['waist', 'Waist'], ['thigh', 'Thigh']];
    return `<div class="card"><h3>Bodyweight<span class="sp"></span><button class="link small" data-act="weigh">+ Log</button></h3>
        <div class="row" style="margin-bottom:8px"><div><div class="big num">${w.length ? w[w.length - 1].lb : '—'}<span class="small dim"> lb</span></div><div class="tiny dim">Start ${S.profile.startWeight} → goal ${S.profile.goalWeight} lb</div></div><span class="sp"></span><div style="text-align:right"><div class="mid num ${rate == null ? '' : rate > 1 ? 'warn' : rate > 0 ? 'good' : ''}">${rate == null ? '—' : (rate >= 0 ? '+' : '') + A.round(rate, 2)}</div><div class="tiny dim">lb / week (3-wk trend)</div></div></div>
        ${pts.length ? A.chart.line(pts, { goal: S.profile.goalWeight, goalLabel: 'Goal', h: 160 }) : '<div class="empty">Log your first weigh-in.</div>'}

        <button class="btn sm ghost" style="margin-top:10px" data-act="wgoal">Edit start / goal weight</button></div>
      <div class="card"><h3>Physique photos<span class="sp"></span><label class="link small" style="cursor:pointer">+ Add<input type="file" accept="image/*" data-kind="physique" class="photoin" hidden></label></h3>
        ${photos.length >= 2 ? `<div class="small muted" style="margin-bottom:6px">First vs. latest</div><div class="grid2" style="margin-bottom:12px"><div class="photo" data-photo="${photos[0].id}"><span>${d.fmtDate(photos[0].date, { year: true })}</span></div><div class="photo" data-photo="${photos[photos.length - 1].id}"><span>${d.fmtDate(photos[photos.length - 1].date, { year: true })}</span></div></div>` : ''}
        ${photos.length ? `<div class="grid3">${photos.slice().reverse().map((p) => `<div class="photo" data-photo="${p.id}" data-act="photo" data-id="${p.id}"><span>${d.fmtDate(p.date)}</span></div>`).join('')}</div>` : '<div class="small dim">No photos yet.</div>'}</div>`;
  }
  act.weigh = () => A.logWeight();
  act.wgoal = () => { const S = A.state; A.sheet({ title: 'Weight targets', body: A.fields([[{ n: 'startWeight', l: 'Start (lb)', t: 'number', v: S.profile.startWeight }, { n: 'goalWeight', l: 'Goal (lb)', t: 'number', v: S.profile.goalWeight }]]), foot: [{ label: 'Save', cls: 'pri', act: 's' }], onAction: (a, el, close) => { const f = A.read(el); if (f.startWeight) S.profile.startWeight = f.startWeight; if (f.goalWeight) S.profile.goalWeight = f.goalWeight; A.save(); close(); A.refresh(); } }); };
  act.meas = () => { const last = F().measures[F().measures.length - 1] || {}; A.sheet({ title: 'Measurements', body: A.fields([{ n: 'date', l: 'Date', t: 'date', v: d.today() }, [{ n: 'chest', l: 'Chest', t: 'number', step: '0.1', v: last.chest }, { n: 'shoulders', l: 'Shoulders', t: 'number', step: '0.1', v: last.shoulders }], [{ n: 'arms', l: 'Arms (flexed)', t: 'number', step: '0.1', v: last.arms }, { n: 'waist', l: 'Waist (navel)', t: 'number', step: '0.1', v: last.waist }], { n: 'thigh', l: 'Thigh', t: 'number', step: '0.1', v: last.thigh }]), foot: [{ label: 'Save', cls: 'pri', act: 's' }], onAction: (a, el, close) => { const f = A.read(el); F().measures = F().measures.filter((m) => m.date !== f.date); F().measures.push(f); F().measures.sort((x, y) => x.date.localeCompare(y.date)); A.save(); close(); A.refresh(); } }); };
  A.photoSheet = (id) => {
    const p = A.state.photos.find((x) => x.id === id); if (!p) return;
    A.sheet({ title: d.fmtDate(p.date, { year: true }), body: `<div class="photo" data-photo2 style="aspect-ratio:auto;min-height:200px"></div>${p.note ? `<div class="small" style="margin-top:8px">${esc(p.note)}</div>` : ''}`, foot: [{ label: 'Delete photo', cls: 'danger', act: 'del' }],
      onMount: async (el) => { const u = await A.photoURL(id); if (u) el.querySelector('[data-photo2]').innerHTML = `<img src="${u}" alt="" style="height:auto">`; },
      onAction: async (a, el, close) => { if (a === 'del' && (await A.confirm('Delete photo?', 'It will be removed from this device.', 'Delete', true))) { await A.photoDB.del(id); A.state.photos = A.state.photos.filter((x) => x.id !== id); A.save(); close(); A.refresh(); } } });
  };
  act.photo = (el) => A.photoSheet(el.dataset.id);
  // photo input (delegated change)
  document.addEventListener('change', async (e) => {
    const inp = e.target.closest('.photoin'); if (!inp || !inp.files[0]) return;
    try { const blob = await A.shrinkImage(inp.files[0]); const id = 'p' + A.uid(); await A.photoDB.put(id, blob); A.state.photos.push({ id, date: d.today(), kind: inp.dataset.kind, note: '' }); A.save(); A.toast('Photo saved privately on this device'); A.refresh(); }
    catch (err) { A.toast(err.message || 'Could not save photo'); }
  });

})(window.A);
