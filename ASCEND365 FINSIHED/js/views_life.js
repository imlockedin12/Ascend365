/* ASCEND 365 — Tennis, Business & Wealth, Appearance & Style */
(function (A) {
  'use strict';
  const d = A.d, esc = A.esc, I = A.icon;
  const segs = (base, subs, cur) => `<div class="seg">${subs.map(([k, l]) => `<button class="${(cur || '') === k ? 'on' : ''}" data-go="${base}${k ? '/' + k : ''}">${l}</button>`).join('')}</div>`;
  const listEdit = (arr, key, ph) => `${arr.map((x, i) => `<div class="row" style="margin-bottom:6px"><span class="dot" style="background:var(--accent2)"></span><span class="sp small">${esc(x)}</span><button class="iconbtn" style="width:28px;height:28px" data-act="lrm" data-key="${key}" data-i="${i}">${I('trash', 13)}</button></div>`).join('')}<div class="row" style="margin-top:6px"><input class="inp" style="padding:8px 10px" data-ladd="${key}" placeholder="${ph}"><button class="btn sm" data-act="ladd" data-key="${key}">Add</button></div>`;
  const getPath = (p) => p.split('.').reduce((o, k) => o[k], A.state);

  // =================== TENNIS ===================
  const TN = () => A.state.tennis;
  const TYPES = [['practice', 'Practice'], ['lesson', 'Lesson'], ['match', 'Match play'], ['hitting', 'Casual hit']];
  A.views.tennis = {
    title: 'Tennis',
    render(r) {
      const sub = r.sub || '';
      return segs('tennis', [['', 'Overview'], ['log', 'Log'], ['matches', 'Matches'], ['assess', 'Skills']], sub) + ({ '': tOverview, log: tLog, matches: tMatches, assess: tAssess }[sub] || tOverview)(r);
    },
    act: {}
  };
  const ta = A.views.tennis.act;
  function tOverview() {
    const S = A.state, t = d.today(), ws = d.weekStart(t), T = TN();
    const wk = A.metric('tennis', ws, d.add(ws, 6));
    const W = T.matches.filter((m) => m.result === 'W').length, L = T.matches.filter((m) => m.result === 'L').length;
    const q = T.sessions.filter((s) => s.quality).slice(-10); const avgQ = q.length ? A.round(A.avg(q, (s) => s.quality), 1) : null;
    const notes = T.sessions.filter((s) => s.notes).slice(-5).reverse();
    const la = T.assessments[T.assessments.length - 1];
    return `<div class="grid3" style="margin-bottom:12px"><div class="stat"><div class="k">This week</div><div class="v num">${wk}/${S.settings.tennisPerWeek}</div></div><div class="stat" data-go="tennis/matches"><div class="k">Record</div><div class="v num">${W}–${L}</div></div><div class="stat"><div class="k">Quality</div><div class="v num">${avgQ == null ? '—' : avgQ}</div></div></div>
      <button class="btn pri block" data-go="tennis/log" style="margin-bottom:12px">${I('plus', 16)} Log a session</button>
      <div class="card"><h3>Technical goals</h3>${TN().goals.map((g) => `<div class="row" style="margin-bottom:8px"><button class="chk" data-act="tgoal" data-id="${g.id}" style="width:26px;height:26px;${g.done ? 'background:linear-gradient(135deg,var(--accent2),var(--accent));border-color:transparent' : ''}"><svg viewBox="0 0 24 24" style="stroke-dashoffset:${g.done ? 0 : 24}"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><span class="sp small" style="${g.done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(g.t)}</span><button class="iconbtn" style="width:28px;height:28px" data-act="tgoaldel" data-id="${g.id}">${I('trash', 13)}</button></div>`).join('')}<div class="row"><input class="inp" id="tgnew" style="padding:8px 10px" placeholder="e.g. Consistent kick second serve"><button class="btn sm" data-act="tgoaladd">Add</button></div></div>
      ${la ? `<div class="card" data-go="tennis/assess" style="cursor:pointer"><h3>Skills<span class="sp"></span><span class="tiny dim" style="text-transform:none;letter-spacing:0">${d.fmtDate(la.date)}</span></h3>${A.TENNIS_SKILLS.map(([k, l]) => `<div class="row small" style="margin-bottom:6px"><span style="width:110px">${l}</span><div class="bar thin sp"><i style="width:${(la[k] || 0) * 10}%;background:var(--c-tennis)"></i></div><b class="num" style="width:22px;text-align:right">${la[k] || '—'}</b></div>`).join('')}</div>` : ''}`;
  }
  ta.tgoal = (el) => { const g = TN().goals.find((x) => x.id === el.dataset.id); g.done = !g.done; A.sfx(g.done ? 'done' : 'undo'); A.save(); A.refresh(); };
  ta.tgoaldel = (el) => { TN().goals = TN().goals.filter((x) => x.id !== el.dataset.id); A.save(); A.refresh(); };
  ta.tgoaladd = () => { const v = document.getElementById('tgnew').value.trim(); if (!v) return; TN().goals.push({ id: A.uid(), t: v, done: false }); A.save(); A.refresh(); };
  function tLog() {
    return `<div class="card" id="tlf">${A.fields([[{ n: 'date', l: 'Date', t: 'date', v: d.today() }, { n: 'min', l: 'Minutes', t: 'number', v: 60 }], { n: 'type', l: 'Type', t: 'chips', o: TYPES, v: 'practice' }, { n: 'quality', l: 'Practice quality', t: 'scale', min: 1, max: 5 }, { n: 'notes', l: 'What did you struggle with? What will you fix?', t: 'textarea' }])}<button class="btn pri block" data-act="tsave">Save · +30 XP</button></div>`;
  }
  ta.tsave = () => {
    const f = A.read(document.getElementById('tlf'));
    if (!f.min) return A.toast('Enter minutes');
    const before = A.levelInfo().lv;
    TN().sessions.push(Object.assign({ id: A.uid() }, f, { quality: f.quality ? Number(f.quality) : null }));
    TN().sessions.sort((a, b) => a.date.localeCompare(b.date));
    A.xpAdd('tn:' + f.date, 30, 'Tennis session', f.date); A.ensureDay(f.date); A.autoTask(f.date, 'tennis');
    A.after(before); A.sfx('done'); A.toast('Session saved');
    A.go(f.type === 'match' ? 'tennis/matches/new' : 'tennis');
  };
  function tMatches(r) {
    const ms = TN().matches.slice().sort((a, b) => b.date.localeCompare(a.date));
    const W = ms.filter((m) => m.result === 'W').length;
    if (r.arg === 'new') setTimeout(() => { if (A.route().arg === 'new') { A.go('tennis/matches'); matchSheet(); } }, 50);
    return `<div class="row" style="margin-bottom:12px"><div><div class="big num">${W}–${ms.length - W}</div><div class="tiny dim">${ms.length ? Math.round((W / ms.length) * 100) + '% wins' : 'No matches yet'}</div></div><span class="sp"></span><button class="btn pri sm" data-act="mnew">${I('plus', 15)} Match</button></div>
      ${ms.length ? `<div class="card flat"><div class="list">${ms.map((m) => `<div class="li" data-act="medit" data-id="${m.id}"><span class="pill ${m.result === 'W' ? 'good' : 'bad'}">${m.result}</span><div class="sp"><div class="t">vs ${esc(m.opp || 'Opponent')} <span class="small muted num">${esc(m.score || '')}</span></div><div class="s">${d.fmtDate(m.date, { year: true })}</div></div></div>`).join('')}</div></div>` : ''}`;
  }
  function matchSheet(m) {
    const isNew = !m; m = m || { id: A.uid(), date: d.today(), opp: '', score: '', result: 'W', worked: '', fix: '' };
    A.sheet({ title: isNew ? 'Log match' : 'Match', body: A.fields([[{ n: 'date', l: 'Date', t: 'date', v: m.date }, { n: 'opp', l: 'Opponent', v: m.opp }], [{ n: 'score', l: 'Score', v: m.score, ph: '6-4 6-3' }, { n: 'result', l: 'Result', t: 'chips', o: [['W', 'Win'], ['L', 'Loss']], v: m.result }], { n: 'fix', l: 'What to fix', t: 'textarea', v: m.fix }]) + (isNew ? '' : `<button class="btn sm danger" data-sact="del">Delete</button>`), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => { if (a === 'del') { A.mutate(() => { TN().matches = TN().matches.filter((x) => x.id !== m.id); }); close(); A.refresh(); return; } const f = A.read(el); A.mutate(() => { Object.assign(m, f); if (isNew) TN().matches.push(m); }); close(); A.refresh(); } });
  }
  ta.mnew = () => matchSheet(); ta.medit = (el) => matchSheet(TN().matches.find((x) => x.id === el.dataset.id));
  function tAssess() {
    const as = TN().assessments; const la = as[as.length - 1] || {};
    const trend = as.map((a) => ({ x: d.fmtDate(a.date), y: A.round(A.avg(A.TENNIS_SKILLS, ([k]) => a[k] || 0), 1) }));
    return `<div class="card" id="taf"><p class="small muted" style="margin-top:0">Rate each part of your game 1–10, once a month.</p>${A.fields(A.TENNIS_SKILLS.map(([k, l]) => ({ n: k, l, t: 'scale', min: 1, max: 10, v: la[k] })))}<button class="btn pri block" data-act="asave">Save</button></div>
      ${trend.length > 1 ? `<div class="card"><h3>Average over time</h3>${A.chart.line(trend, { min: 0, max: 10, color: 'var(--c-tennis)', fillColor: 'var(--c-tennis)' })}</div>` : ''}`;
  }
  ta.asave = () => { const f = A.read(document.getElementById('taf')); if (A.TENNIS_SKILLS.some(([k]) => !f[k])) return A.toast('Rate every skill'); A.TENNIS_SKILLS.forEach(([k]) => (f[k] = Number(f[k]))); f.date = d.today(); A.mutate(() => { TN().assessments = TN().assessments.filter((a) => a.date !== f.date); TN().assessments.push(f); }); A.toast('Saved'); A.refresh(); };

  // shared list add/remove for tennis strengths/weaknesses etc.
  const listActs = { ladd(el) { const inp = document.querySelector(`[data-ladd="${el.dataset.key}"]`); const v = inp.value.trim(); if (!v) return; getPath(el.dataset.key).push(v); A.save(); A.refresh(); }, lrm(el) { getPath(el.dataset.key).splice(Number(el.dataset.i), 1); A.save(); A.refresh(); } };
  Object.assign(ta, listActs);

  // =================== BUSINESS & WEALTH ===================
  const B = () => A.state.biz;
  const KINDS = [['business', 'Business / product'], ['freelance', 'Freelance / services'], ['job', 'Job / wages'], ['other', 'Other']];
  const monthIncome = (mk) => A.sum(B().income.filter((x) => d.monthKey(x.date) === mk), (x) => x.amount);
  A.views.biz = {
    title: 'Business',
    render() {
      const t = d.today(), mk = d.monthKey(t), y = t.slice(0, 4), tgt = B().target;
      const inc = monthIncome(mk), yr = A.sum(B().income.filter((x) => x.date.slice(0, 4) === y), (x) => x.amount);
      const months = []; for (let i = 11; i >= 0; i--) { const k = d.monthKey(d.addMonths(mk + '-01', -i)); months.push({ x: d.MON[Number(k.slice(5)) - 1], y: monthIncome(k) }); }
      const list = B().income.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);
      return `<div class="card hero" style="text-align:center;padding:22px 16px"><div style="display:grid;place-items:center">${A.chart.ring(inc / tgt, 140, 11, 'var(--c-business)', `<div><div class="big num">${Math.round((inc / tgt) * 100)}%</div><div class="tiny dim">of ${A.fmtMoney(tgt)}</div></div>`)}</div>
        <div class="grid2" style="margin-top:16px"><div class="stat"><div class="k">This month</div><div class="v num">${A.fmtMoney(inc)}</div></div><div class="stat"><div class="k">This year</div><div class="v num">${A.fmtMoney(yr)}</div></div></div>
        <button class="btn pri block" style="margin-top:14px" data-act="incadd">${I('plus', 16)} Add income</button></div>
        ${months.some((m) => m.y) ? `<div class="card">${A.chart.bars(months, { color: 'var(--c-business)', goal: tgt, goalLabel: '', fmt: (v) => (v >= 1000 ? '$' + Math.round(v / 1000) + 'k' : '$' + Math.round(v)) })}</div>` : ''}
        ${list.length ? `<div class="card flat"><div class="list">${list.map((x) => `<div class="li" data-act="incedit" data-id="${x.id}"><div class="sp"><div class="t">${esc(x.source || 'Income')}</div><div class="s">${d.fmtDate(x.date)}</div></div><b class="num good">${A.fmtMoney(x.amount)}</b></div>`).join('')}</div></div>` : ''}`;
    },
    act: {}
  };
  const ba = A.views.biz.act;
  function bIncome() {
    const inc = B().income.slice().sort((a, b) => b.date.localeCompare(a.date)), tr = B().trades.slice().sort((a, b) => b.date.localeCompare(a.date));
    return `<button class="btn pri block" data-act="incadd" style="margin-bottom:12px">${I('plus', 16)} Log income received</button>
      <div class="card flat"><h3>Income</h3>${inc.length ? `<div class="list">${inc.map((x) => `<div class="li" data-act="incedit" data-id="${x.id}"><div class="sp"><div class="t">${esc(x.source || 'Income')}</div><div class="s">${d.fmtDate(x.date, { year: true })} · ${(KINDS.find((k) => k[0] === x.kind) || [, ''])[1]}${x.note ? ' · ' + esc(x.note) : ''}</div></div><b class="num good">${A.fmtMoney(x.amount)}</b></div>`).join('')}</div>` : '<div class="small dim">No income logged yet.</div>'}</div>
      <div class="card flat"><h3>Trading P&L (separate)<span class="sp"></span><button class="link small" data-act="trnew">+ Log</button></h3>${tr.length ? `<div class="list">${tr.map((x) => `<div class="li" data-act="tredit" data-id="${x.id}"><div class="sp"><div class="t">${esc(x.market || 'Trade')}</div><div class="s">${d.fmtDate(x.date, { year: true })}${x.note ? ' · ' + esc(x.note) : ''}</div></div><b class="num ${x.pnl >= 0 ? 'good' : 'bad'}">${A.fmtMoney(x.pnl)}</b></div>`).join('')}</div>` : '<div class="small dim">Realized results only. Not counted as income.</div>'}</div>`;
  }
  function incomeSheet(x) {
    const isNew = !x; x = x || { id: A.uid(), date: d.today(), amount: null, source: '', kind: 'business', note: '' };
    const srcs = A.state.biz.projects.map((p) => p.name).concat([...new Set(B().income.map((i) => i.source))]).filter((v, i, a) => v && a.indexOf(v) === i);
    A.sheet({ title: isNew ? 'Income received' : 'Edit income', body: A.fields([[{ n: 'amount', l: 'Amount ($)', t: 'number', v: x.amount }, { n: 'date', l: 'Date received', t: 'date', v: x.date }], { n: 'source', l: 'Source', v: x.source, ph: 'e.g. Roblox DevEx, client name' }, srcs.length ? `<div class="row" style="margin:-6px 0 12px;flex-wrap:wrap;gap:6px">${srcs.map((s) => `<button type="button" class="chip" onclick="this.closest('.sb').querySelector('[name=source]').value=this.textContent">${esc(s)}</button>`).join('')}</div>` : '', ]) + (isNew ? '' : '<button class="btn sm danger" style="margin-top:10px" data-sact="del">Delete</button>'), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => { if (a === 'del') { A.mutate(() => { B().income = B().income.filter((i) => i.id !== x.id); }); close(); A.refresh(); return; } const f = A.read(el); if (!f.amount || f.amount <= 0) return A.toast('Enter an amount'); A.mutate(() => { Object.assign(x, f); if (isNew) B().income.push(x); }); close(); A.sfx('done'); A.toast(A.fmtMoney(f.amount) + ' logged'); A.refresh(); } });
  }
  function tradeSheet(x) {
    const isNew = !x; x = x || { id: A.uid(), date: d.today(), pnl: null, market: '', note: '' };
    A.sheet({ title: 'Realized trading P&L', body: A.fields([[{ n: 'pnl', l: 'Realized P&L ($, negative for loss)', t: 'number', v: x.pnl }, { n: 'date', l: 'Date', t: 'date', v: x.date }], { n: 'market', l: 'Market / instrument', v: x.market }, { n: 'note', l: 'Lesson', t: 'textarea', v: x.note }]) + (isNew ? '' : '<button class="btn sm danger" data-sact="del">Delete</button>'), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => { if (a === 'del') { B().trades = B().trades.filter((i) => i.id !== x.id); A.save(); close(); A.refresh(); return; } const f = A.read(el); if (f.pnl == null) return A.toast('Enter P&L'); Object.assign(x, f); if (isNew) B().trades.push(x); A.save(); close(); A.refresh(); } });
  }
  ba.incadd = () => incomeSheet(); ba.incedit = (el) => incomeSheet(B().income.find((x) => x.id === el.dataset.id));
  ba.trnew = () => tradeSheet(); ba.tredit = (el) => tradeSheet(B().trades.find((x) => x.id === el.dataset.id));

  function bProjects() {
    const ps = B().projects; const grp = (s) => ps.filter((p) => p.status === s);
    const row = (p) => { const dn = p.milestones.filter((m) => m.done).length; const hrs = A.sum(A.state.focus.filter((f) => f.project === p.id), (f) => f.min) / 60; return `<div class="li" data-go="biz/project/${p.id}"><div class="sp"><div class="t">${esc(p.name)}</div><div class="s">${dn}/${p.milestones.length} milestones · ${A.round(hrs, 1)}h focused</div></div>${I('chev', 16, 'class="chev"')}</div>`; };
    return `<button class="btn pri block" data-act="pnew" style="margin-bottom:12px">${I('plus', 16)} New project</button>
      <div class="card"><h3>Active · limit ${A.state.settings.wipLimit}</h3><div class="list">${grp('active').map(row).join('') || '<div class="small dim">None</div>'}</div></div>
      ${grp('paused').length ? `<div class="card flat"><h3>Paused</h3><div class="list">${grp('paused').map(row).join('')}</div></div>` : ''}
      ${grp('done').length ? `<div class="card flat"><h3>Shipped / closed</h3><div class="list">${grp('done').map(row).join('')}</div></div>` : ''}`;
  }
  ba.pnew = async () => {
    const act = B().projects.filter((p) => p.status === 'active').length;
    let status = 'active';
    if (act >= A.state.settings.wipLimit) { if (!(await A.confirm('You already have ' + act + ' active projects', 'Your biggest obstacle is starting too many things. Add it as paused, or park it in Ideas instead?', 'Add as paused'))) return; status = 'paused'; }
    A.sheet({ title: 'New project', body: A.fields([{ n: 'name', l: 'Name' }, { n: 'type', l: 'Type', t: 'select', o: [['roblox', 'Roblox game'], ['algo', 'Algorithm / research'], ['business', 'Business'], ['other', 'Other']] }, { n: 'next', l: 'First next action' }]), foot: [{ label: 'Create', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => { const f = A.read(el); if (!f.name) return A.toast('Name it'); const p = { id: A.uid(), name: f.name, type: f.type, status, next: f.next, notes: '', created: d.today(), milestones: [] }; B().projects.push(p); A.save(); close(); A.go('biz/project/' + p.id); } });
  };
  function projectDetail(id) {
    const p = B().projects.find((x) => x.id === id); if (!p) return '<div class="empty">Project not found</div>';
    const ses = A.state.focus.filter((f) => f.project === id).sort((a, b) => b.date.localeCompare(a.date));
    const ws = d.weekStart(d.today()); const bars = []; for (let i = 7; i >= 0; i--) { const a = d.add(ws, -7 * i); bars.push({ x: d.fmtDate(a), y: A.round(A.sum(ses.filter((s) => s.date >= a && s.date <= d.add(a, 6)), (s) => s.min) / 60, 1) }); }
    return `<div class="row" style="margin-bottom:12px"><button class="btn sm ghost" data-go="biz/projects">${I('back', 14)} Projects</button></div>
      <div class="card hero"><div class="row"><div class="sp"><div class="mid">${esc(p.name)}</div><div class="small muted">${A.round(A.sum(ses, (s) => s.min) / 60, 1)}h focused · ${ses.length} sessions</div></div><button class="iconbtn" data-act="pren" data-id="${p.id}">${I('edit', 16)}</button></div>
        <div class="seg" style="margin:12px 0 0">${[['active', 'Active'], ['paused', 'Paused'], ['done', 'Shipped / closed']].map(([s, l]) => `<button class="${p.status === s ? 'on' : ''}" data-act="pstat" data-s="${s}" data-id="${p.id}">${l}</button>`).join('')}</div></div>
      <div class="card"><div class="fld"><label>Next action</label><input class="inp" id="p_next" value="${esc(p.next)}" placeholder="The very next physical step"></div><button class="btn pri sm" data-act="pfocus" data-id="${p.id}">${I('timer', 15)} Focus on this</button></div>
      <div class="card"><h3>Milestones</h3>${p.milestones.map((m) => `<div class="row" style="margin-bottom:8px"><button class="chk" data-act="pms" data-pid="${p.id}" data-id="${m.id}" style="width:26px;height:26px;${m.done ? 'background:linear-gradient(135deg,var(--accent2),var(--accent));border-color:transparent' : ''}"><svg viewBox="0 0 24 24" style="stroke-dashoffset:${m.done ? 0 : 24}"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><div class="sp" data-act="pmsedit" data-pid="${p.id}" data-id="${m.id}" style="cursor:pointer"><div class="small" style="${m.done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(m.t)}</div>${m.due ? `<div class="tiny ${!m.done && m.due < d.today() ? 'bad' : 'dim'}">Due ${d.fmtDate(m.due, { year: true })}</div>` : ''}</div></div>`).join('')}<button class="btn sm ghost" data-act="pmsedit" data-pid="${p.id}">${I('plus', 14)} Milestone</button></div>
      <div class="card"><h3>Hours per week</h3>${bars.some((b) => b.y) ? A.chart.bars(bars, { color: 'var(--c-business)', fmt: (v) => A.round(v, 1) + 'h' }) : '<div class="small dim">No focus sessions logged on this project yet.</div>'}</div>
      <div class="card"><div class="fld" style="margin:0"><label>Notes</label><textarea class="inp" id="p_notes">${esc(p.notes)}</textarea></div></div>
      ${ses.length ? `<div class="card flat"><h3>Sessions</h3>${ses.slice(0, 15).map((s) => `<div class="row small" style="margin-bottom:6px"><span class="dim" style="width:64px">${d.fmtDate(s.date)}</span><span class="sp muted">${esc(s.note || '')}</span><b class="num">${s.min}m</b></div>`).join('')}</div>` : ''}`;
  }
  ba.pstat = async (el) => { const p = B().projects.find((x) => x.id === el.dataset.id); const s = el.dataset.s; if (s === 'active' && p.status !== 'active' && B().projects.filter((x) => x.status === 'active').length >= A.state.settings.wipLimit && !(await A.confirm('Over your project limit', 'Activating this puts you over ' + A.state.settings.wipLimit + ' active projects. Pause another first?', 'Activate anyway'))) return; p.status = s; A.save(); A.refresh(); };
  ba.pfocus = (el) => { if (A.state.timer) return A.openTimer(); A.state.timer = { project: el.dataset.id, dur: 50, label: B().projects.find((x) => x.id === el.dataset.id).next || '', startedAt: Date.now(), acc: 0, day: d.today() }; A.save(); A.toast('50-min focus started'); A.refresh(); };
  ba.pms = (el) => { const m = B().projects.find((x) => x.id === el.dataset.pid).milestones.find((x) => x.id === el.dataset.id); m.done = !m.done; m.doneOn = m.done ? d.today() : null; A.sfx(m.done ? 'done' : 'undo'); A.save(); A.refresh(); };
  ba.pmsedit = (el) => {
    const p = B().projects.find((x) => x.id === el.dataset.pid); const m = el.dataset.id ? p.milestones.find((x) => x.id === el.dataset.id) : null; const isNew = !m;
    A.sheet({ title: isNew ? 'Project milestone' : 'Edit milestone', body: A.fields([{ n: 't', l: 'Milestone', v: m ? m.t : '' }, { n: 'due', l: 'Deadline', t: 'date', v: m ? m.due : '' }]) + (isNew ? '' : '<button class="btn sm danger" data-sact="del">Delete</button>'), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, e2, close) => { if (a === 'del') { p.milestones = p.milestones.filter((x) => x.id !== m.id); A.save(); close(); A.refresh(); return; } const f = A.read(e2); if (!f.t) return; if (isNew) p.milestones.push({ id: A.uid(), t: f.t, due: f.due, done: false }); else Object.assign(m, f); A.save(); close(); A.refresh(); } });
  };
  ba.pren = async (el) => { const p = B().projects.find((x) => x.id === el.dataset.id); A.sheet({ title: 'Project', body: A.fields([{ n: 'name', l: 'Name', v: p.name }]) + '<button class="btn sm danger" data-sact="del">Delete project</button>', foot: [{ label: 'Save', cls: 'pri', act: 's' }], onAction: async (a, e2, close) => { if (a === 'del') { if (!(await A.confirm('Delete project?', 'Focus sessions stay in your history.', 'Delete', true))) return; B().projects = B().projects.filter((x) => x.id !== p.id); A.save(); close(); A.go('biz/projects'); return; } const f = A.read(e2); if (f.name) p.name = f.name; A.save(); close(); A.refresh(); } }); };

  let rTab = 'journal';
  function bResearch() {
    const J = B().journal.slice().sort((a, b) => b.date.localeCompare(a.date)), X = B().experiments.slice().sort((a, b) => b.date.localeCompare(a.date));
    return `<div class="seg">${[['journal', 'Research journal'], ['exp', 'Experiments']].map(([k, l]) => `<button class="${rTab === k ? 'on' : ''}" data-act="rtab" data-t="${k}">${l}</button>`).join('')}</div>` +
      (rTab === 'journal' ? `<button class="btn pri block" data-act="jnew" style="margin-bottom:12px">${I('plus', 16)} New research entry</button>${J.length ? `<div class="card flat"><div class="list">${J.map((j) => `<div class="li" data-act="jedit" data-id="${j.id}"><div class="sp"><div class="t">${esc(j.topic)} ${j.status ? `<span class="pill ${j.status === 'Worked' ? 'good' : j.status === "Didn't work" ? 'bad' : ''}">${esc(j.status)}</span>` : ''}</div><div class="s">${d.fmtDate(j.date, { year: true })} · ${esc((j.thesis || '').slice(0, 70))}</div></div></div>`).join('')}</div></div>` : '<div class="empty">Log each idea: ticker or theme, thesis, catalyst, and later what actually happened. That feedback loop is what improves your research.</div>'}`
        : `<button class="btn pri block" data-act="xnew" style="margin-bottom:12px">${I('plus', 16)} New experiment</button>${X.length ? `<div class="card flat"><div class="list">${X.map((x) => `<div class="li" data-act="xedit" data-id="${x.id}"><div class="sp"><div class="t">${esc(x.hyp)}</div><div class="s">${d.fmtDate(x.date, { year: true })} · ${esc(x.status)}</div></div></div>`).join('')}</div></div>` : '<div class="empty">Track algorithm or business experiments: hypothesis → method → result → keep or kill.</div>'}`);
  }
  ba.rtab = (el) => { rTab = el.dataset.t; A.refresh(); };
  function jSheet(j) {
    const isNew = !j; j = j || { id: A.uid(), date: d.today(), topic: '', source: 'Manual research', thesis: '', catalyst: '', risk: '', outcome: '', status: '' };
    A.sheet({ title: isNew ? 'Research entry' : esc(j.topic), body: A.fields([[{ n: 'topic', l: 'Ticker / theme', v: j.topic }, { n: 'date', l: 'Date', t: 'date', v: j.date }], { n: 'source', l: 'Found via', t: 'chips', o: [['Algorithm', 'Algorithm'], ['Manual research', 'Manual'], ['News / catalyst', 'News']], v: j.source }, { n: 'thesis', l: 'Thesis', t: 'textarea', v: j.thesis }, { n: 'catalyst', l: 'Catalyst & momentum notes', t: 'textarea', v: j.catalyst }, { n: 'risk', l: 'What would prove it wrong', v: j.risk }, '<div class="sec" style="margin-top:4px">Later</div>', { n: 'outcome', l: 'What actually happened', t: 'textarea', v: j.outcome }, { n: 'status', l: 'Verdict', t: 'chips', o: [['Open', 'Open'], ['Worked', 'Worked'], ["Didn't work", "Didn't work"]], v: j.status || 'Open' }]) + (isNew ? '' : '<button class="btn sm danger" data-sact="del">Delete</button>'), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => { if (a === 'del') { B().journal = B().journal.filter((x) => x.id !== j.id); A.save(); close(); A.refresh(); return; } const f = A.read(el); if (!f.topic) return A.toast('Add a ticker or theme'); Object.assign(j, f); if (isNew) B().journal.push(j); A.save(); close(); A.refresh(); } });
  }
  function xSheet(x) {
    const isNew = !x; x = x || { id: A.uid(), date: d.today(), hyp: '', method: '', result: '', status: 'Running' };
    A.sheet({ title: isNew ? 'Experiment' : 'Edit experiment', body: A.fields([{ n: 'hyp', l: 'Hypothesis', v: x.hyp, ph: 'e.g. 20-day breakout + volume filter beats buy & hold' }, { n: 'date', l: 'Started', t: 'date', v: x.date }, { n: 'method', l: 'Method', t: 'textarea', v: x.method }, { n: 'result', l: 'Result', t: 'textarea', v: x.result }, { n: 'status', l: 'Status', t: 'chips', o: [['Running', 'Running'], ['Keep', 'Keep'], ['Kill', 'Kill']], v: x.status }]) + (isNew ? '' : '<button class="btn sm danger" data-sact="del">Delete</button>'), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => { if (a === 'del') { B().experiments = B().experiments.filter((i) => i.id !== x.id); A.save(); close(); A.refresh(); return; } const f = A.read(el); if (!f.hyp) return; Object.assign(x, f); if (isNew) B().experiments.push(x); A.save(); close(); A.refresh(); } });
  }
  ba.jnew = () => { if (A.route().sub !== 'research') { rTab = 'journal'; } jSheet(); }; ba.jedit = (el) => jSheet(B().journal.find((x) => x.id === el.dataset.id));
  ba.xnew = () => xSheet(); ba.xedit = (el) => xSheet(B().experiments.find((x) => x.id === el.dataset.id));

  function bIdeas() {
    const I2 = B().ideas.slice().sort((a, b) => (b.upside / b.effort) - (a.upside / a.effort));
    return `<p class="small muted" style="margin-top:0">The parking lot for new opportunities (prediction markets, new games, side businesses). Write it down here so it stops pulling you off your active projects. Sorted by upside ÷ effort.</p><button class="btn pri block" data-act="inew" style="margin-bottom:12px">${I('plus', 16)} Park an idea</button>
      ${I2.length ? `<div class="card flat"><div class="list">${I2.map((x) => `<div class="li" data-act="iedit" data-id="${x.id}"><div class="sp"><div class="t">${esc(x.t)}</div><div class="s">Upside ${x.upside}/5 · effort ${x.effort}/5 · ${esc(x.status)}</div></div><b class="num small">${A.round(x.upside / x.effort, 1)}</b></div>`).join('')}</div></div>` : '<div class="empty">No ideas parked.</div>'}`;
  }
  function iSheet(x) {
    const isNew = !x; x = x || { id: A.uid(), date: d.today(), t: '', notes: '', upside: 3, effort: 3, status: 'Parked' };
    A.sheet({ title: isNew ? 'New idea' : 'Idea', body: A.fields([{ n: 't', l: 'Idea', v: x.t }, { n: 'notes', l: 'Notes', t: 'textarea', v: x.notes }, { n: 'upside', l: 'Upside (1–5)', t: 'scale', min: 1, max: 5, v: x.upside }, { n: 'effort', l: 'Effort (1–5)', t: 'scale', min: 1, max: 5, v: x.effort }, { n: 'status', l: 'Status', t: 'chips', o: [['Parked', 'Parked'], ['Exploring', 'Exploring'], ['Dropped', 'Dropped']], v: x.status }]) + (isNew ? '' : '<div class="row" style="gap:8px"><button class="btn sm" data-sact="promote">Promote to project</button><button class="btn sm danger" data-sact="del">Delete</button></div>'), foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: async (a, el, close) => {
        if (a === 'del') { B().ideas = B().ideas.filter((i) => i.id !== x.id); A.save(); close(); A.refresh(); return; }
        if (a === 'promote') { const act = B().projects.filter((p) => p.status === 'active').length; const st = act >= A.state.settings.wipLimit ? 'paused' : 'active'; if (st === 'paused' && !(await A.confirm('At your project limit', 'It will be added as paused until you finish or pause something else.', 'Add paused'))) return; B().projects.push({ id: A.uid(), name: x.t, type: 'other', status: st, next: '', notes: x.notes, created: d.today(), milestones: [] }); B().ideas = B().ideas.filter((i) => i.id !== x.id); A.save(); close(); A.go('biz/projects'); return; }
        const f = A.read(el); if (!f.t) return; Object.assign(x, f, { upside: Number(f.upside) || 3, effort: Number(f.effort) || 3 }); if (isNew) B().ideas.push(x); A.save(); close(); A.refresh();
      } });
  }
  ba.inew = () => iSheet(); ba.iedit = (el) => iSheet(B().ideas.find((x) => x.id === el.dataset.id));

  // =================== APPEARANCE & STYLE ===================
  const AP = () => A.state.appearance;
  A.views.look = {
    title: 'Appearance & Style',
    render(r) { const sub = r.sub || ''; return segs('look', [['', 'Routine'], ['grooming', 'Grooming'], ['style', 'Style'], ['photos', 'Photos'], ['goals', 'Goals']], sub) + ({ '': lRoutine, grooming: lGroom, style: lStyle, photos: lPhotos, goals: lGoals }[sub] || lRoutine)(r); },
    mount(root, r) { root.querySelectorAll('[data-photo]').forEach(async (el) => { const u = await A.photoURL(el.dataset.photo); if (u) el.insertAdjacentHTML('afterbegin', `<img src="${u}" alt="">`); }); const n = root.querySelector('#stylenotes'); n && n.addEventListener('change', () => { AP().notes = n.value; A.save(); }); },
    act: Object.assign({}, listActs)
  };
  const la = A.views.look.act;
  function lRoutine() {
    const t = d.today(), ch = AP().checks[t] || {};
    const block = (key, title) => `<div class="card"><h3>${title}<span class="sp"></span><button class="link small" data-act="skedit" data-k="${key}">Edit</button></h3>${AP()[key].map((it) => `<div class="row" style="margin-bottom:9px"><button class="chk" data-act="skc" data-id="${it.id}" style="width:28px;height:28px;${ch[it.id] ? 'background:linear-gradient(135deg,var(--accent2),var(--accent));border-color:transparent' : ''}"><svg viewBox="0 0 24 24" style="stroke-dashoffset:${ch[it.id] ? 0 : 24}"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><span class="sp" style="${ch[it.id] ? 'color:var(--muted);text-decoration:line-through' : ''}">${esc(it.t)}</span></div>`).join('')}</div>`;
    const items = AP().am.length + AP().pm.length;
    let streak = 0; for (let k = d.add(t, -1); ; k = d.add(k, -1)) { const c = AP().checks[k] || {}; if (Object.values(c).filter(Boolean).length >= Math.ceil(items * 0.5)) streak++; else break; if (streak > 400) break; }
    const done = Object.values(ch).filter(Boolean).length;
    return `<div class="card hero"><div class="row"><div class="sp"><div class="tiny dim" style="font-weight:700;letter-spacing:.06em">TODAY</div><div class="mid num">${done}/${items} steps</div></div><div style="text-align:right"><div class="mid num">${streak}</div><div class="tiny dim">day streak</div></div></div><div style="margin-top:10px">${A.bar(items ? done / items : 0, 'var(--c-appearance)')}</div></div>
      ${block('am', 'Morning')}${block('pm', 'Night')}
      <div class="small dim" style="padding:0 4px">Simple and consistent beats a 10-step routine. Ticking skincare in My Day checks these off too.</div>
      <div class="card" style="margin-top:12px"><h3>Last 17 weeks</h3>${A.chart.heat((k) => { const c = AP().checks[k]; return c ? Object.values(c).filter(Boolean).length / (items || 1) : null; }, t)}</div>`;
  }
  la.skc = (el) => { const t = d.today(); const c = (AP().checks[t] = AP().checks[t] || {}); c[el.dataset.id] = !c[el.dataset.id]; A.sfx(c[el.dataset.id] ? 'done' : 'undo'); A.save(); A.refresh(); };
  la.skedit = (el) => {
    const key = el.dataset.k; const arr = AP()[key];
    A.sheet({ title: (key === 'am' ? 'Morning' : 'Night') + ' routine', body: `<div class="tiny dim" style="margin-bottom:8px">One step per line.</div><textarea class="inp" name="lines" style="min-height:160px">${esc(arr.map((x) => x.t).join('\n'))}</textarea>`, foot: [{ label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, e2, close) => { const lines = e2.querySelector('[name=lines]').value.split('\n').map((s) => s.trim()).filter(Boolean); AP()[key] = lines.map((t) => arr.find((x) => x.t === t) || { id: A.uid(), t }); A.save(); close(); A.refresh(); } });
  };
  function lGroom() {
    const t = d.today();
    return `<div class="card">${AP().grooming.map((g) => { const due = g.last ? d.add(g.last, g.every) : null; const left = due ? d.diff(t, due) : null; return `<div class="li" style="cursor:default"><div class="sp"><div class="t">${esc(g.t)}</div><div class="s">Every ${g.every} days · ${g.last ? 'last ' + d.fmtDate(g.last) : 'never logged'}</div></div><span class="pill ${left == null ? '' : left < 0 ? 'bad' : left <= 1 ? 'warn' : 'good'}">${left == null ? '—' : left < 0 ? Math.abs(left) + 'd overdue' : left === 0 ? 'Due today' : 'in ' + left + 'd'}</span><button class="btn sm" data-act="gdone" data-id="${g.id}">Done</button><button class="iconbtn" style="width:30px;height:30px" data-act="gedit" data-id="${g.id}">${I('edit', 14)}</button></div>`; }).join('')}<button class="btn sm ghost" style="margin-top:10px" data-act="gedit">${I('plus', 14)} Add item</button></div>`;
  }
  la.gdone = (el) => { const g = AP().grooming.find((x) => x.id === el.dataset.id); g.last = d.today(); A.sfx('done'); A.save(); A.refresh(); };
  la.gedit = (el) => { const g = el.dataset.id ? AP().grooming.find((x) => x.id === el.dataset.id) : null; A.sheet({ title: g ? 'Edit' : 'Add grooming item', body: A.fields([{ n: 't', l: 'Item', v: g ? g.t : '' }, [{ n: 'every', l: 'Every (days)', t: 'number', v: g ? g.every : 14 }, { n: 'last', l: 'Last done', t: 'date', v: g ? g.last : '' }]]) + (g ? '<button class="btn sm danger" data-sact="del">Delete</button>' : ''), foot: [{ label: 'Save', cls: 'pri', act: 's' }], onAction: (a, e2, close) => { if (a === 'del') { AP().grooming = AP().grooming.filter((x) => x.id !== g.id); A.save(); close(); A.refresh(); return; } const f = A.read(e2); if (!f.t) return; if (g) Object.assign(g, f, { last: f.last || null }); else AP().grooming.push({ id: A.uid(), t: f.t, every: f.every || 14, last: f.last || null }); A.save(); close(); A.refresh(); } }); };
  const WCATS = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];
  function lStyle() {
    const W = AP().wardrobe;
    return `<div class="card"><h3>Style direction</h3><textarea class="inp" id="stylenotes" placeholder="e.g. clean, fitted basics: neutral colors, fitted tees, dark jeans, white sneakers, one statement jacket. What fits a 6'1&quot; lean build: tapered pants, structured shoulders.">${esc(AP().notes)}</textarea></div>
      <div class="row" style="margin:6px 0 10px"><div class="sec" style="margin:0">Wardrobe</div><span class="sp"></span><button class="btn sm" data-act="wnew">${I('plus', 14)} Item</button></div>
      ${WCATS.map((c) => { const it = W.filter((w) => w.cat === c); return it.length ? `<div class="card flat"><h3>${c}</h3>${it.map((w) => `<div class="li" data-act="wedit" data-id="${w.id}"><div class="sp"><div class="t">${esc(w.name)}</div><div class="s">${esc(w.color || '')}${w.notes ? ' · ' + esc(w.notes) : ''}</div></div><span class="pill ${w.status === 'Own' ? 'good' : 'acc'}">${w.status}</span></div>`).join('')}</div>` : ''; }).join('') || '<div class="empty">Add what you own and what you want to buy. Build outfits from it.</div>'}
      <div class="row" style="margin:16px 0 10px"><div class="sec" style="margin:0">Outfits</div><span class="sp"></span><button class="btn sm" data-act="onew" ${W.length ? '' : 'disabled'}>${I('plus', 14)} Outfit</button></div>
      ${AP().outfits.map((o) => `<div class="card flat" data-act="oedit" data-id="${o.id}" style="cursor:pointer"><b>${esc(o.name)}</b><div class="small muted">${o.items.map((id) => (W.find((w) => w.id === id) || {}).name).filter(Boolean).map(esc).join(' · ')}</div></div>`).join('')}`;
  }
  la.wnew = () => wSheet(); la.wedit = (el) => wSheet(AP().wardrobe.find((x) => x.id === el.dataset.id));
  function wSheet(w) { const isNew = !w; w = w || { id: A.uid(), name: '', cat: 'Tops', color: '', status: 'Own', notes: '' }; A.sheet({ title: isNew ? 'Wardrobe item' : 'Edit item', body: A.fields([{ n: 'name', l: 'Item', v: w.name, ph: 'e.g. Black overshirt' }, [{ n: 'cat', l: 'Category', t: 'select', o: WCATS.map((c) => [c, c]), v: w.cat }, { n: 'color', l: 'Color', v: w.color }], { n: 'status', l: 'Status', t: 'chips', o: [['Own', 'Own it'], ['Want', 'Want it']], v: w.status }, { n: 'notes', l: 'Notes', v: w.notes, ph: 'Fit, size, where to buy' }]) + (isNew ? '' : '<button class="btn sm danger" data-sact="del">Delete</button>'), foot: [{ label: 'Save', cls: 'pri', act: 's' }], onAction: (a, e2, close) => { if (a === 'del') { AP().wardrobe = AP().wardrobe.filter((x) => x.id !== w.id); A.save(); close(); A.refresh(); return; } const f = A.read(e2); if (!f.name) return; Object.assign(w, f); if (isNew) AP().wardrobe.push(w); A.save(); close(); A.refresh(); } }); }
  la.onew = () => oSheet(); la.oedit = (el) => oSheet(AP().outfits.find((x) => x.id === el.dataset.id));
  function oSheet(o) { const isNew = !o; o = o || { id: A.uid(), name: '', items: [] }; A.sheet({ title: 'Outfit', body: A.fields([{ n: 'name', l: 'Name', v: o.name, ph: 'e.g. Date night, casual Friday' }, { n: 'items', l: 'Items', t: 'multichips', o: AP().wardrobe.map((w) => [w.id, w.name]), v: o.items }]) + (isNew ? '' : '<button class="btn sm danger" data-sact="del">Delete</button>'), foot: [{ label: 'Save', cls: 'pri', act: 's' }], onAction: (a, e2, close) => { if (a === 'del') { AP().outfits = AP().outfits.filter((x) => x.id !== o.id); A.save(); close(); A.refresh(); return; } const f = A.read(e2); if (!f.name) return; Object.assign(o, f); if (isNew) AP().outfits.push(o); A.save(); close(); A.refresh(); } }); }
  function lPhotos() {
    const ps = A.state.photos.filter((p) => p.kind === 'look').sort((a, b) => b.date.localeCompare(a.date));
    return `<div class="card"><h3>Look & style photos<span class="sp"></span><label class="link small" style="cursor:pointer">+ Add<input type="file" accept="image/*" data-kind="look" class="photoin" hidden></label></h3>${ps.length ? `<div class="grid3">${ps.map((p) => `<div class="photo" data-photo="${p.id}" data-act="photo" data-id="${p.id}"><span>${d.fmtDate(p.date)}</span></div>`).join('')}</div>` : '<div class="small dim">Haircuts, outfits, skin progress. Stored only on this device.</div>'}</div>`;
  }
  la.photo = (el) => A.photoSheet(el.dataset.id);
  function lGoals() {
    return `<p class="small muted" style="margin-top:0">Optional. Concrete actions only — no ratings of your face or looks.</p><div class="card">${AP().goals.map((g) => `<div class="row" style="margin-bottom:9px"><button class="chk" data-act="agoal" data-id="${g.id}" style="width:26px;height:26px;${g.done ? 'background:linear-gradient(135deg,var(--accent2),var(--accent));border-color:transparent' : ''}"><svg viewBox="0 0 24 24" style="stroke-dashoffset:${g.done ? 0 : 24}"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><span class="sp small" style="${g.done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(g.t)}</span><button class="iconbtn" style="width:28px;height:28px" data-act="agoaldel" data-id="${g.id}">${I('trash', 13)}</button></div>`).join('')}<div class="row"><input class="inp" id="agnew" style="padding:8px 10px" placeholder="e.g. Find a barber and a cut that suits me"><button class="btn sm" data-act="agoaladd">Add</button></div></div>
      <div class="card flat"><h3>Ideas</h3>${['Find a barber you trust and keep a regular cut schedule', 'Get 3 pairs of pants that actually fit', 'Wear sunscreen daily for 30 days', 'Replace worn-out sneakers with one clean pair', 'Ask someone with good style for one honest tip'].map((s) => `<div class="row small" style="margin-bottom:6px"><span class="sp muted">${s}</span><button class="link small" data-act="agoalsug" data-t="${esc(s)}">Add</button></div>`).join('')}</div>`;
  }
  la.agoal = (el) => { const g = AP().goals.find((x) => x.id === el.dataset.id); g.done = !g.done; A.sfx(g.done ? 'done' : 'undo'); A.save(); A.refresh(); };
  la.agoaldel = (el) => { AP().goals = AP().goals.filter((x) => x.id !== el.dataset.id); A.save(); A.refresh(); };
  la.agoaladd = () => { const v = document.getElementById('agnew').value.trim(); if (!v) return; AP().goals.push({ id: A.uid(), t: v, done: false }); A.save(); A.refresh(); };
  la.agoalsug = (el) => { AP().goals.push({ id: A.uid(), t: el.dataset.t, done: false }); A.save(); A.refresh(); };
})(window.A);
