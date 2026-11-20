/* ASCEND 365 — shell, router, focus timer, lock */
(function (A) {
  'use strict';
  const d = A.d;
  A.views = A.views || {};
  const TABS = [['home', 'home', 'Home'], ['day', 'day', 'My Day'], ['roadmap', 'map', 'Roadmap'], ['social', 'social', 'Social'], ['more', 'grid', 'More']];
  const PARENT = { fitness: 'more', tennis: 'more', biz: 'more', look: 'more', insights: 'more', settings: 'more', review: 'more', notes: 'more', year: 'roadmap', sim: 'social', lesson: 'social' };

  let cur = (location.hash || '#/home').slice(2) || 'home';
  A.route = () => { const h = cur.split('/'); return { name: h[0] || 'home', sub: h[1] || '', arg: h[2] || '' }; };
  A.go = (path) => { cur = path || 'home'; try { if (location.hash !== '#/' + cur) history.pushState(null, '', '#/' + cur); } catch (e) { /* sandboxed preview */ } A.render(); };

  let rendering = false, again = false;
  A.render = (keepScroll) => {
    if (rendering) { again = true; return; }
    rendering = true;
    const ae = document.activeElement; if (ae && document.getElementById('view').contains(ae)) ae.blur();
    try { renderInner(keepScroll); } finally { rendering = false; }
    if (again) { again = false; renderInner(true); }
  };
  function renderInner(keepScroll) {
    const r = A.route(); const v = A.views[r.name] || A.views.home;
    const root = document.getElementById('view'); const top = keepScroll ? root.scrollTop : 0;
    const li = A.levelInfo();
    const parent = PARENT[r.name];
    const title = typeof v.title === 'function' ? v.title(r) : v.title;
    document.getElementById('topbar').innerHTML =
      (parent ? `<button class="back" data-go="${parent}" aria-label="Back">${A.icon('back', 18)}</button>` : '') +
      `<h1>${title}</h1>` + timerPill() +
      `<div class="lv" data-go="home"><b>${li.lv}</b><span class="num">${A.fmtNum(li.xp)} XP</span></div>`;
    try { root.innerHTML = `<div class="${keepScroll ? '' : 'fadein'}">${v.render(r)}</div>`; }
    catch (e) { console.error(e); root.innerHTML = `<div class="card"><b>Something went wrong rendering this screen.</b><div class="small muted" style="margin-top:6px">${A.esc(e.message)}</div></div>`; }
    if (v.mount) v.mount(root, r);
    root.scrollTop = top;
    const tab = TABS.find((t) => t[0] === r.name) ? r.name : (PARENT[r.name] === 'home' ? 'home' : PARENT[r.name] || 'more');
    document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.go === tab));
    A.flushCeleb();
  }
  A.refresh = () => A.render(true);

  function timerPill() {
    const t = A.state.timer; if (!t) return '';
    const left = Math.max(0, t.dur * 60000 - elapsed(t));
    return `<div class="timerpill" data-act-global="timer"><i style="${t.startedAt ? '' : 'animation:none;opacity:.4'}"></i><span class="num" id="tpill">${fmtMs(left)}</span></div>`;
  }
  const elapsed = (t) => t.acc + (t.startedAt ? Date.now() - t.startedAt : 0);
  const fmtMs = (ms) => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + d.pad(s % 60); };

  // ---------- global click delegation ----------
  function onClick(e) {
    const an = e.target.closest('a[href^="#/"]');
    if (an) { e.preventDefault(); return A.go(an.getAttribute('href').slice(2)); }
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); A.sfx('tick'); return A.go(go.dataset.go); }
    const g = e.target.closest('[data-act-global]');
    if (g) { const a = g.dataset.actGlobal; if (a === 'timer') return A.openTimer(); }
    const el = e.target.closest('[data-act]');
    if (el && document.getElementById('view').contains(el)) {
      const v = A.views[A.route().name];
      const fn = v && v.act && v.act[el.dataset.act];
      if (fn) { e.preventDefault(); fn(el, e); }
    }
    if (document.getElementById('view').contains(e.target)) A.bindFormBits(e);
  }

  // ---------- focus timer ----------
  A.focusProjects = () => {
    const ps = A.state.biz.projects.filter((p) => p.status === 'active').map((p) => [p.id, p.name]);
    return ps.concat([['research', 'Stock research'], ['other', 'Other / admin']]);
  };
  A.projectName = (id) => { const p = A.state.biz.projects.find((x) => x.id === id); return p ? p.name : id === 'research' ? 'Stock research' : id === 'other' ? 'Other / admin' : 'Project'; };
  let tick;
  A.openTimer = () => {
    const S = A.state;
    const body = () => {
      const t = S.timer;
      if (!t) return `<p class="muted small" style="margin-top:0">One project per session. The deep-work XP cap is ${S.settings.deepCapMin / 60}h/day so you're never rewarded for burning out.</p>` +
        A.fields([{ n: 'project', l: 'Project', t: 'select', o: A.focusProjects(), v: A.focusProjects()[0][0] }, { n: 'dur', l: 'Length', t: 'chips', o: [[25, '25 min'], [50, '50 min'], [90, '90 min']], v: 50 }, { n: 'label', l: 'Session goal (optional)', ph: 'e.g. finish the data loader' }]);
      const p = elapsed(t) / (t.dur * 60000);
      return `<div style="display:grid;place-items:center;padding:8px 0 4px">${A.chart.ring(Math.min(1, p), 210, 12, 'url(#rg)', `<div><div class="big num" id="tbig">${fmtMs(Math.max(0, t.dur * 60000 - elapsed(t)))}</div><div class="small muted">${A.esc(A.projectName(t.project))}</div>${t.label ? `<div class="tiny dim" style="max-width:150px">${A.esc(t.label)}</div>` : ''}</div>`)}</div>`;
    };
    const foot = () => S.timer ? [{ label: 'Stop & log', act: 'stop' }, { label: S.timer.startedAt ? 'Pause' : 'Resume', cls: 'pri', act: 'pause' }] : [{ label: 'Log past session', act: 'manual' }, { label: 'Start focus', cls: 'pri', act: 'start' }];
    const sh = A.sheet({
      title: 'Focus timer', body: body(), foot: foot(),
      onMount: (el) => { clearInterval(tick); tick = setInterval(() => { const b = el.querySelector('#tbig'); if (b && S.timer) { b.textContent = fmtMs(Math.max(0, S.timer.dur * 60000 - elapsed(S.timer))); const ring = el.querySelector('.ringfg'); if (ring) ring.style.strokeDashoffset = ring.dataset.c * (1 - Math.min(1, elapsed(S.timer) / (S.timer.dur * 60000))); } }, 500); },
      onClose: () => clearInterval(tick),
      onAction: (a, el, close) => {
        if (a === 'start') { const f = A.read(el); S.timer = { project: f.project, dur: Number(f.dur) || 50, label: f.label, startedAt: Date.now(), acc: 0, day: d.today() }; A.save(); A.sfx('done'); close(); A.refresh(); }
        if (a === 'pause') { const t = S.timer; if (t.startedAt) { t.acc += Date.now() - t.startedAt; t.startedAt = null; } else t.startedAt = Date.now(); A.save(); close(); A.refresh(); }
        if (a === 'stop') { close(); finishTimer(true); }
        if (a === 'manual') { close(); A.manualFocus(); }
      }
    });
    return sh;
  };
  function finishTimer(early) {
    const t = A.state.timer; if (!t) return;
    const min = Math.round(Math.min(elapsed(t), t.dur * 60000) / 60000);
    A.state.timer = null;
    if (min < 5) { A.save(); A.toast('Session under 5 min — not logged'); A.refresh(); return; }
    const delta = A.addFocus({ date: t.day || d.today(), min, project: t.project, note: t.label || '' });
    A.sfx('done'); A.toast(`Logged ${min} min focus${delta > 0 ? ' · +' + delta + ' XP' : ' (daily XP cap reached)'}`);
    A.refresh();
  }
  A.manualFocus = (pre = {}) => {
    A.sheet({ title: 'Log focus session', body: A.fields([{ n: 'project', l: 'Project', t: 'select', o: A.focusProjects(), v: pre.project }, [{ n: 'date', l: 'Date', t: 'date', v: pre.date || d.today() }, { n: 'min', l: 'Minutes', t: 'number', v: pre.min || 60, min: 5 }], { n: 'note', l: 'What did you get done?', t: 'textarea', ph: 'Optional' }]),
      foot: [{ label: 'Save', cls: 'pri', act: 'save' }],
      onAction: (a, el, close) => { const f = A.read(el); if (!f.min || f.min < 1) return A.toast('Enter minutes'); const delta = A.addFocus({ date: f.date, min: f.min, project: f.project, note: f.note }); close(); A.toast('Session logged' + (delta > 0 ? ' · +' + delta + ' XP' : '')); A.refresh(); } });
  };
  setInterval(() => {
    const t = A.state && A.state.timer; if (!t) return;
    const p = document.getElementById('tpill'); const left = t.dur * 60000 - elapsed(t);
    if (p) p.textContent = fmtMs(Math.max(0, left));
    if (left <= 0 && t.startedAt) { A.celebrate({ icon: '🧠', title: 'Focus block complete', sub: t.dur + ' minutes on ' + A.projectName(t.project) + '. Take a real break.', btn: 'Log it' }).then(() => finishTimer()); t.startedAt = null; t.acc = t.dur * 60000; }
  }, 1000);

  // ---------- lock screen ----------
  function lockScreen() {
    return new Promise((res) => {
      const el = document.createElement('div'); el.className = 'lockscreen'; let pin = '';
      const draw = () => { el.innerHTML = `<div style="text-align:center"><div style="color:var(--accent2)">${A.icon('lock', 34)}</div><div class="mid" style="margin:10px 0 18px">ASCEND 365</div><div class="pindots">${[0, 1, 2, 3].map((i) => `<i class="${i < pin.length ? 'on' : ''}"></i>`).join('')}</div><div class="pinpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((n) => `<button data-n="${n}" ${n === '' ? 'style="visibility:hidden"' : ''}>${n}</button>`).join('')}</div></div>`; };
      draw(); document.body.appendChild(el);
      el.onclick = async (e) => {
        const b = e.target.closest('button'); if (!b) return; const n = b.dataset.n;
        if (n === '⌫') pin = pin.slice(0, -1); else if (pin.length < 4) pin += n;
        draw();
        if (pin.length === 4) { if ((await A.sha(pin)) === A.state.settings.pinHash) { el.remove(); res(); } else { pin = ''; draw(); el.querySelector('.pindots').classList.add('shake'); } }
      };
    });
  }

  // ---------- boot ----------
  A.applyTheme = () => { const s = A.state.settings; document.body.classList.toggle('oled', !!s.oled); document.body.classList.toggle('rm', !!s.reducedMotion); ['indigo', 'magenta', 'blue'].forEach((c) => document.body.classList.toggle('acc-' + c, s.accent === c)); };
  async function boot() {
    A.load(); A.applyTheme();
    document.getElementById('tabbar').innerHTML = TABS.map(([k, ic, l]) => `<button data-go="${k}">${A.icon(ic, 23)}<span>${l}</span></button>`).join('');
    document.addEventListener('click', onClick);
    const fromHash = () => { const h = (location.hash || '').slice(2); if (h && h !== cur) { cur = h; A.render(); } };
    window.addEventListener('hashchange', fromHash); window.addEventListener('popstate', fromHash);
    if (A.state.settings.pinHash) await lockScreen();
    A.ensureDay(d.today()); A.after(null);
    A.render();
    // day rollover while the app stays open
    let lastDay = d.today();
    setInterval(() => { if (d.today() !== lastDay) { lastDay = d.today(); A.ensureDay(lastDay); A.refresh(); } }, 30000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && d.today() !== lastDay) { lastDay = d.today(); A.ensureDay(lastDay); A.render(); } });
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  document.addEventListener('DOMContentLoaded', boot);
})(window.A);
