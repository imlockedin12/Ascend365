/* ASCEND 365 — Year Roadmap, milestones, year goals, completion */
(function (A) {
  'use strict';
  const d = A.d, esc = A.esc, I = A.icon;
  const open = {};

  A.goalProgress = (g) => {
    const S = A.state;
    switch (g.auto) {
      case 'income': { const v = A.metric('income', '2000-01-01', '2999-12-31'); return { cur: v, tgt: g.target, p: v / g.target, txt: A.fmtMoney(v) + ' best month' }; }
      case 'weight': { const w = S.fitness.weights; const cur = w.length ? w[w.length - 1].lb : null; const s0 = S.profile.startWeight, tg = S.profile.goalWeight; const p = cur == null ? 0 : A.clamp((cur - s0) / (tg - s0 || 1), 0, 1); return { cur, tgt: tg, p, txt: cur == null ? 'No weigh-ins yet' : cur + ' lb → ' + tg + ' lb' }; }
      case 'tennisAvg': { const as = S.tennis.assessments; if (!as.length) return { p: 0, txt: 'No assessment yet' }; const a = as[as.length - 1]; const v = A.avg(A.TENNIS_SKILLS, ([k]) => a[k] || 0); return { cur: v, p: v / g.target, txt: A.round(v, 1) + ' / 10 latest' }; }
      case 'socialLevel': { const v = A.socialLevel(); const done = A.socialLevelDone ? A.socialLevelDone() : v - 1; return { cur: done, p: done / 5, txt: 'Level ' + v + ' of 5' }; }
      case 'adherence': { const v = A.metric('avgCompletion', A.START, A.END); return { cur: v, p: v / g.target, txt: v + '% average so far' }; }
      default: return { cur: g.current, p: (g.current || 0) / (g.target || 1), txt: (g.current || 0) + ' / ' + g.target + ' ' + (g.unit || '') };
    }
  };
  const chProgress = (n) => { const ms = A.state.roadmap.milestones.filter((m) => m.ch === n); return ms.length ? A.avg(ms, A.msProgress) : 0; };

  function msRow(m) {
    const p = A.msProgress(m), done = m.done || p >= 1;
    return `<div class="li" data-go="roadmap/m/${m.id}">${A.chart.ring(p, 40, 4, A.catColor(m.cat), done ? '<span style="font-size:13px">✓</span>' : `<span class="num" style="font-size:10px;font-weight:700">${Math.round(p * 100)}</span>`)}<div class="sp" style="min-width:0"><div class="t" style="font-size:14px;${done ? 'color:var(--muted)' : ''}">${esc(m.title)}</div><div class="s">${d.fmtDate(m.due)}</div></div></div>`;
  }

  A.views.roadmap = {
    title: 'Roadmap',
    render(r) {
      if (r.sub === 'm') return msDetail(r.arg);
      const S = A.state, t = d.today(), y = A.year(t), cur = A.chapterOf(t) || A.chapters[0];
      const ms = S.roadmap.milestones;
      const cms = ms.filter((m) => m.ch === cur.n);
      const left = Math.max(0, d.diff(t > cur.start ? t : cur.start, cur.end) + 1);
      const chapters = A.chapters.map((c) => {
        const p = chProgress(c.n), isCur = cur.n === c.n, past = t > c.end;
        return `<div class="li" data-act="toggle" data-n="${c.n}" style="${isCur ? '' : ''}"><span class="num small" style="width:22px;color:${isCur ? 'var(--accent2)' : 'var(--dim)'};font-weight:800">${c.n}</span><div class="sp" style="min-width:0"><div class="t" style="font-size:14px">${A.CHAPTER_THEMES[c.n - 1]}</div><div class="bar thin" style="margin-top:6px"><i style="width:${p * 100}%;${past || isCur ? '' : 'opacity:.5'}"></i></div></div><span class="num small ${past && p >= 1 ? 'good' : 'muted'}" style="width:38px;text-align:right">${Math.round(p * 100)}%</span></div>${open[c.n] && !isCur ? `<div style="padding-left:30px">${ms.filter((m) => m.ch === c.n).map(msRow).join('')}</div>` : ''}`;
      }).join('');
      return `<div class="card hero"><div class="row"><div class="sp"><div class="tiny dim" style="font-weight:700;letter-spacing:.06em">CHAPTER ${cur.n} OF 12</div><div class="mid" style="margin-top:2px">${A.CHAPTER_THEMES[cur.n - 1]}</div><div class="small muted">${left} days left</div></div>${A.chart.ring(chProgress(cur.n), 64, 7, 'url(#rg)', `<b class="num small">${Math.round(chProgress(cur.n) * 100)}%</b>`)}</div>
        <div class="list" style="margin-top:8px">${cms.map(msRow).join('')}</div>
        <button class="link small" data-act="addms" data-n="${cur.n}" style="margin-top:8px">+ Add milestone</button></div>
        <div class="sec">Year goals<span class="sp"></span><button class="link small" data-act="addgoal">+ Add</button></div>
        <div class="card"><div class="list">${S.roadmap.goals.map((g) => { const gp = A.goalProgress(g); const p = A.clamp(gp.p || 0, 0, 1); return `<div class="li" data-act="goal" data-id="${g.id}"><div class="sp" style="min-width:0"><div class="row"><div class="t" style="font-size:14px;flex:1">${esc(g.title)}</div><b class="num small">${Math.round(p * 100)}%</b></div><div class="bar thin" style="margin-top:6px"><i style="width:${p * 100}%;background:${A.catColor(g.cat)}"></i></div></div></div>`; }).join('')}</div></div>
        <div class="sec">All chapters</div><div class="card"><div class="list">${chapters}</div></div>
        <div class="card" data-go="year" style="cursor:pointer"><div class="row"><div style="font-size:24px">🏆</div><div class="sp"><b>Nov 20, 2027</b><div class="small muted">Completion day</div></div>${I('chev', 16, 'class="chev"')}</div></div>`;
    },
    act: {
      toggle(el) { const n = el.dataset.n; open[n] = !open[n]; A.refresh(); },
      addms(el) { editMs(null, Number(el.dataset.n)); },
      goal(el) { editGoal(A.state.roadmap.goals.find((g) => g.id === el.dataset.id)); },
      addgoal() { editGoal(null); },
      mdone() { const m = findMs(); const before = A.levelInfo().lv; if (m.done && m.metric && A.msProgress(Object.assign({}, m, { done: false })) >= 1) return A.toast('Target already met — adjust it to reopen'); m.done = !m.done; m.doneOn = m.done ? d.today() : null; A.after(before); if (m.done) A.celebQ.push({ icon: '🎯', title: 'Milestone complete', sub: m.title + ' (+150 XP)' }); A.render(true); },
      madjust() { editMs(findMs()); }
    },
    mount(root, r) {
      if (r.sub !== 'm') return;
      const m = findMs(); if (!m) return;
      const sl = root.querySelector('#mpct'); if (sl) sl.addEventListener('change', () => { const before = A.levelInfo().lv; m.manualPct = Number(sl.value); A.after(before); A.refresh(); });
      const el = root.querySelector('#m_notes'); el && el.addEventListener('change', () => { m.notes = el.value; A.save(); });
    }
  };
  const findMs = () => A.state.roadmap.milestones.find((m) => m.id === A.route().arg);

  function msDetail(id) {
    const m = A.state.roadmap.milestones.find((x) => x.id === id);
    if (!m) return '<div class="empty">Milestone not found.</div>';
    const p = A.msProgress(m), [st, cls] = A.msStatus(m);
    return `<div class="card hero" style="text-align:center;padding:22px 16px"><div style="display:grid;place-items:center">${A.chart.ring(p, 120, 10, A.catColor(m.cat), `<div class="big num">${Math.round(p * 100)}%</div>`)}</div>
      <div class="mid" style="margin-top:14px">${esc(m.title)}</div>
      <div class="row" style="justify-content:center;gap:8px;margin-top:8px"><span class="pill ${cls}">${st}</span><span class="pill">Target ${d.fmtDate(m.due, { year: true })}</span></div>
      ${m.metric ? '' : `<div class="fld" style="margin:16px 0 0;text-align:left"><label>Progress: ${m.manualPct || 0}%</label><input type="range" id="mpct" min="0" max="100" step="5" value="${m.manualPct || 0}"></div>`}
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn ${m.done ? 'ghost' : 'pri'} sp" data-act="mdone">${m.done ? 'Reopen' : 'Mark complete'}</button><button class="btn ghost" data-act="madjust">${I('edit', 16)}</button></div></div>
      <div class="card"><textarea class="inp" id="m_notes" placeholder="Notes" style="min-height:110px">${esc(m.notes)}</textarea></div>`;
  }

  function editMs(m, ch) {
    const isNew = !m; const S = A.state;
    m = m || { id: 'm' + A.uid(), ch, cat: 'discipline', title: '', criteria: '', metric: null, target: 0, due: A.chapters[ch - 1].end, manualPct: 0, done: false, tasks: [], notes: '', evidence: '', adjusted: [] };
    A.sheet({ title: isNew ? 'New milestone' : 'Adjust milestone', body: A.fields([
      { n: 'title', l: 'Milestone', v: m.title },
      [{ n: 'cat', l: 'Category', t: 'select', o: ['business', 'fitness', 'tennis', 'social', 'discipline', 'appearance'].map((c) => [c, A.CATS[c].label]), v: m.cat }, { n: 'due', l: 'Target date', t: 'date', v: m.due }],
      [{ n: 'metric', l: 'Track automatically from', t: 'select', o: [['', 'Manual progress']].concat(Object.entries(A.METRICS).map(([k, v]) => [k, v.l])), v: m.metric || '' }, { n: 'target', l: 'Target', t: 'number', v: m.target || '' }],
      isNew ? '' : { n: 'why', l: 'Why adjust? (kept in history)', ph: 'e.g. injury, new priority, target was too easy' }]) + (isNew ? '' : `<button class="btn sm danger" data-sact="del">${I('trash', 14)} Delete milestone</button>`),
      foot: [{ label: 'Save', cls: 'pri', act: 'save' }],
      onAction: async (a, el, close) => {
        if (a === 'del') { if (!(await A.confirm('Delete milestone?', esc(m.title), 'Delete', true))) return; A.mutate(() => { S.roadmap.milestones = S.roadmap.milestones.filter((x) => x.id !== m.id); A.xpRemove('ms:' + m.id); }); close(); A.go('roadmap'); return; }
        const f = A.read(el); if (!f.title) return A.toast('Give it a name');
        if (f.metric && !f.target) return A.toast('Auto-tracked milestones need a target');
        A.mutate(() => {
          Object.assign(m, { title: f.title, cat: f.cat, due: f.due || m.due, metric: f.metric || null, target: f.target || 0 });
          if (isNew) S.roadmap.milestones.push(m); else { m.adjusted = m.adjusted || []; m.adjusted.push({ date: d.today(), why: f.why }); if (m.metric && A.msProgress(Object.assign({}, m, { done: false })) < 1) m.done = false; }
        });
        close(); A.refresh();
      } });
  }
  function editGoal(g) {
    const isNew = !g; const S = A.state;
    g = g || { id: 'g' + A.uid(), cat: 'discipline', title: '', auto: null, current: 0, target: 10, unit: '' };
    const fields = g.auto ? [{ n: 'title', l: 'Goal', v: g.title }, g.auto === 'income' ? { n: 'target', l: 'Monthly target ($)', t: 'number', v: g.target } : g.auto === 'weight' ? '<div class="small muted" style="margin-bottom:12px">Start and goal weight are set in Fitness → Body.</div>' : { n: 'target', l: 'Target', t: 'number', v: g.target }, '<div class="tiny dim" style="margin-bottom:10px">This goal updates automatically from your logs.</div>']
      : [{ n: 'title', l: 'Goal', v: g.title }, { n: 'cat', l: 'Category', t: 'select', o: ['business', 'fitness', 'tennis', 'social', 'discipline', 'appearance'].map((c) => [c, A.CATS[c].label]), v: g.cat }, [{ n: 'current', l: 'Current', t: 'number', v: g.current }, { n: 'target', l: 'Target', t: 'number', v: g.target }, { n: 'unit', l: 'Unit', v: g.unit }]];
    A.sheet({ title: isNew ? 'New year goal' : 'Year goal', body: A.fields(fields) + (isNew ? '' : `<button class="btn sm danger" data-sact="del">${I('trash', 14)} Remove goal</button>`), foot: [{ label: 'Save', cls: 'pri', act: 'save' }],
      onAction: (a, el, close) => {
        if (a === 'del') { S.roadmap.goals = S.roadmap.goals.filter((x) => x.id !== g.id); A.save(); close(); A.refresh(); return; }
        const f = A.read(el); if (!f.title) return A.toast('Give it a name');
        Object.keys(f).forEach((k) => { if (f[k] !== undefined && f[k] !== null && f[k] !== '') g[k] = f[k]; });
        if (g.auto === 'income' && f.target) S.biz.target = f.target;
        if (isNew) S.roadmap.goals.push(g); A.save(); close(); A.refresh();
      } });
  }

  // ---------- YEAR COMPLETION ----------
  const Q = [['then', 'Who were you on Nov 20, 2026?'], ['proud', 'What are you most proud of this year?'], ['changed', 'What changed the most — body, money, skills, confidence?'], ['learned', 'What did you learn about discipline and missed days?'], ['people', 'Who helped you? Who do you want to thank?'], ['next', 'Year two: who are you becoming next?']];
  A.views.year = {
    title: 'Year complete',
    render() {
      const S = A.state, y = A.year(), t = d.today(), refl = S.roadmap.reflection || {};
      const a = A.START, b = A.END < t ? A.END : t;
      const w = S.fitness.weights; const wch = w.length > 1 ? A.round(w[w.length - 1].lb - w[0].lb, 1) : null;
      const st = A.streak();
      const stats = [['Days tracked', Object.keys(S.days).filter((k) => k >= a).length], ['Avg completion', A.metric('avgCompletion', a, b) + '%'], ['Best streak', st.best + ' days'], ['Workouts', A.metric('workouts', a, b)], ['Tennis sessions', A.metric('tennis', a, b)], ['Focused hours', A.round(A.metric('deepHours', a, b), 0)], ['Best month', A.fmtMoney(A.metric('income', a, b))], ['Social challenges', A.metric('challenges', a, b)], ['Weight change', wch == null ? '—' : (wch > 0 ? '+' : '') + wch + ' lb'], ['Level', A.levelInfo().lv], ['Badges', Object.keys(S.badges).length], ['Milestones', S.roadmap.milestones.filter((m) => m.done).length + '/' + S.roadmap.milestones.length]];
      const ph = S.photos.filter((p) => p.kind === 'physique').sort((x, z) => x.date.localeCompare(z.date));
      return `${y.complete ? '' : `<div class="card flat" style="border-color:rgba(251,191,36,.25)"><b>Preview</b><div class="small muted">This page unlocks on Nov 20, 2027. The numbers below are your real numbers so far.</div></div>`}
        <div class="card hero" style="text-align:center;padding:26px 16px"><div style="font-size:52px">🏆</div><div class="big" style="margin-top:6px">365 days.</div><div class="muted" style="margin-top:4px">Nov 20, 2026 → Nov 20, 2027</div></div>
        <div class="grid3" style="margin-bottom:12px">${stats.map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v num" style="font-size:18px">${v}</div></div>`).join('')}</div>
        ${ph.length > 1 ? `<div class="card"><h3>Day one vs. now</h3><div class="grid2"><div class="photo" data-photo="${ph[0].id}"><span>${d.fmtDate(ph[0].date, { year: true })}</span></div><div class="photo" data-photo="${ph[ph.length - 1].id}"><span>${d.fmtDate(ph[ph.length - 1].date, { year: true })}</span></div></div></div>` : ''}
        <div class="card" id="reflf"><h3>Reflection</h3>${A.fields(Q.map(([n, l]) => ({ n, l, t: 'textarea', v: refl[n] })))}<button class="btn pri block" data-act="save">${y.complete ? (refl.saved ? 'Update reflection' : 'Save reflection · +500 XP') : 'Save draft'}</button></div>`;
    },
    mount(root) { root.querySelectorAll('[data-photo]').forEach(async (el) => { const u = await A.photoURL(el.dataset.photo); if (u) el.insertAdjacentHTML('afterbegin', `<img src="${u}" alt="">`); }); },
    act: { save() { const f = A.read(document.getElementById('reflf')); const y = A.year(); A.mutate(() => { A.state.roadmap.reflection = Object.assign(f, { saved: new Date().toISOString() }); if (y.complete) A.xpAdd('year:complete', 500, 'Year reflection', d.today()); }); if (y.complete) A.celebQ.push({ icon: '🏆', title: 'Year one: complete', sub: 'You kept showing up. Now write year two.' }); A.toast('Saved'); A.refresh(); } }
  };
})(window.A);
