/* ASCEND 365 — Social Intelligence: offline practice partner, coaching, lessons, challenges */
(function (A) {
  'use strict';
  const d = A.d, esc = A.esc, I = A.icon;
  const SO = () => A.state.social;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const words = (s) => s.toLowerCase().replace(/[’‘]/g, "'").match(/[a-z0-9']+/g) || [];
  const firstSentence = (s) => { const m = s.match(/^[^.!?]*[.!?]/); return m ? m[0] : s; };
  const STOP = new Set('the a an and or but so to of in on at for with that this it its it\'s was were is are be been i you he she they we my your our me him her them just really very like kind sort what how why when where who which do did does have has had not no yes about from there here then than too also some any all can could would should will okay yeah'.split(' '));
  const BODY = /\b(sexy|hot|body|legs|butt|ass|boobs|curves|thicc|figure|booty|hips|thighs)\b/;
  const DIMS = [['flow', 'Flow'], ['listening', 'Listening & follow-ups'], ['natural', 'Naturalness'], ['confidence', 'Confidence'], ['respect', 'Respect']];

  // ---------- message analysis ----------
  A.analyzeMsg = (text, sc, sim) => {
    const lo = text.toLowerCase().replace(/[’‘]/g, "'").trim(); const w = words(lo);
    const q = /\?/.test(text) || /^(so |wait |and |oh |ok |okay )?(what|how|why|where|when|who|which|do|did|does|are|is|was|were|have|has|can|could|would|will|should)\b/.test(lo);
    const open = q && /\b(what|how|why|which|tell me|describe|what's|whats|how's|hows|where)\b/.test(lo);
    const selfN = w.filter((x) => ['i', "i'm", 'im', "i've", 'ive', 'my', 'me', "i'd", "i'll", 'mine', 'myself'].includes(x)).length;
    const self = selfN > 0 && w.length >= 5 && !(q && w.length < 8);
    const low = (!q && w.length <= 2) || /^(lol|lmao|haha+|ha|cool|nice|ok|okay|k|yeah|yea|yep|true|same|wow|oh|bet|word|fr|nah|mhm|hmm)[.! ]*$/.test(lo);
    const greet = /^(hey+|hi+|hello|yo|sup|hiya|howdy|what's up|whats up|good (morning|afternoon|evening))\b/.test(lo) && w.length <= 4;
    const bye = /\b(bye|see you|see ya|gotta go|got to go|nice (talking|meeting|chatting)|talk (to you )?later|catch you later|take care|let you (go|get back))\b/.test(lo);
    const invite = /\b(do you want to|would you (like|want) to|want to (grab|get|go|come|hang|join|check|try|hit|play|train|lift|do something)|you wanna|wanna|we should|let's|lets|down to|you free|are you free|come with me|join me|you should come|can i come|could i join)\b/.test(lo) && !/\b(what|why|how|which) (made|makes|did|does|would) you want\b/.test(lo) && /\b(grab|get|go|come|hang|join|coffee|lunch|dinner|food|movie|game|play|hit|walk|hike|concert|show|sometime|together|out|trivia|train|lift|workout|session|pancakes|drink|try)\b/.test(lo);
    const contact = /\b(your number|number\?|insta|instagram|snap|snapchat|text you|add you|socials)\b/.test(lo);
    const disrespect = BODY.test(lo) && /\b(you|your|you're|ur)\b/.test(lo);
    const pushy = /\b(come on|why not|just say yes|you have to|don't be (like that|boring|lame)|please please|i insist|stop playing)\b/.test(lo);
    const negative = (lo.match(/\b(hate|sucks|boring|stupid|dumb|lame|annoying|ugh|whatever)\b/g) || []).length;
    const hedges = (lo.match(/\b(sorry|idk|i don't know|i dont know|i guess|kinda|sort of|um+|uh+)\b/g) || []).length;
    const compliment = /\b(i like your|i love your|love your|nice|cool|great|awesome) (jacket|shirt|shoes|style|laugh|taste|hat|outfit|vibe|energy|bag|sweater|smile|playlist|tattoo)\b/.test(lo) || /\b(you're|you are|that's|thats|you seem)\b.{0,25}\b(funny|smart|interesting|talented|impressive|cool|awesome|great at|good at|easy to talk to|fun)\b/.test(lo);
    const humor = /(haha|lol|lmao|😂|😄|jk|😅)/.test(lo);
    const nameX = /\b(my name is|what's your name|whats your name|your name|i'm [a-z]+,? by the way|nice to meet you)\b/.test(lo);
    const hit = (t, ws) => t.kw.some((k) => ws.some((x) => x === k || (k.length >= 4 && x.startsWith(k))));
    const sents = lo.match(/[^.!?]+[.!?]*/g) || [lo]; const qs = sents.filter((x) => /\?/.test(x)); const lastQ = words(qs.length ? qs[qs.length - 1] : sents[sents.length - 1]);
    let topics = sc ? sc.topics.filter((t) => hit(t, w)) : [];
    const pend = (sim && sim.pending) || [];
    if (topics.length > 1) topics.sort((a, b) => ((hit(b, lastQ) ? 2 : 0) + (pend.includes(b.k) ? 1 : 0)) - ((hit(a, lastQ) ? 2 : 0) + (pend.includes(a.k) ? 1 : 0)));
    let follow = false;
    if (sim && sim.pending && sim.pending.length) follow = topics.some((t) => sim.pending.includes(t.k));
    if (sim && !follow && !topics.length && q && sim.pending && sim.pending.length && !/\b(you (from|do for)|your name|keeping you busy|been up to|what's new|whats new)\b/.test(lo)) { follow = true; topics = sc.topics.filter((t) => t.k === sim.pending[0]); }
    if (sim && !follow && sim.lastThem) { const lw = new Set(words(sim.lastThem).filter((x) => x.length >= 5 && !STOP.has(x))); if (w.some((x) => lw.has(x))) follow = true; }
    return { q, open, closed: q && !open, self, low, greet, bye, invite, contact, disrespect, pushy, negative, hedges, compliment, humor, nameX, topics: topics.map((t) => t.k), follow, words: w.length };
  };

  // ---------- partner engine ----------
  function newSim(id) {
    const sc = A.SCENARIOS.find((s) => s.id === id);
    const sim = { sid: id, msgs: [{ who: 'note', text: sc.setting }], eng: sc.start, turn: 0, revealed: {}, pending: [], declined: 0, ended: false, outcome: null, lowStreak: 0, qStreak: 0, meStreak: 0, asked: {}, hinted: false, lastThem: '', started: Date.now() };
    if (id === 'silence') { sim.msgs.push({ who: 'them', text: 'So… yeah.' }); sim.lastThem = 'So yeah'; sim.msgs.push({ who: 'note', text: '…the conversation goes quiet.' }); }
    return sim;
  }
  const hookFor = (sim, sc) => sc.topics.find((t) => !sim.revealed[t.k]);
  const revealIn = (sim, sc, str) => { const w = words(str); const t = sc.topics.map((t) => [t, t.kw.filter((k) => w.some((x) => x.startsWith(k))).length]).sort((a, b) => b[1] - a[1])[0]; if (t && t[1] > 0) { sim.revealed[t[0].k] = Math.max(1, sim.revealed[t[0].k] || 0); sim.pending = [t[0].k]; } };
  const tidy = (s) => { s = s.replace(/[\s—-]+$/, ''); return /[.!?]$/.test(s) ? s : s + '.'; };

  function engDelta(a, sim) {
    let x = 0;
    if (a.open) x += 6; else if (a.q) x += 2;
    if (a.follow) x += 8; else if (a.topics.length) x += 3;
    if (a.self) x += 4;
    if (a.low) x -= 7;
    if (a.compliment) x += sim.eng >= 45 ? 5 : 1;
    if (a.humor) x += 2;
    if (a.nameX) x += 3;
    x -= a.negative * 4; if (a.hedges >= 2) x -= 2;
    if (a.words > 60) x -= 4;
    if (sim.qStreak >= 3 && !a.self) x -= 3;
    if (sim.meStreak >= 3) x -= 4;
    if (a.disrespect) x -= 40; if (a.pushy) x -= 20;
    return x;
  }

  function partnerReply(sim, sc, a) {
    const tier = sim.eng >= 65 ? 'warm' : sim.eng >= 38 ? 'mid' : 'cold';
    const pos = sc.pr === 'she' ? 'her' : 'his';
    if (a.disrespect) return { text: pick(["Uh… okay. I'm going to go find my friend.", "That's a little much. I'm gonna go."]), end: 'left' };
    if ((a.invite || a.contact) && sim.declined > 0) return { text: pick(["Like I said, maybe another time. I'm going to head out.", "I already answered that. I'm gonna go."]), end: 'left', pushed: true };
    if (a.pushy) return { text: pick(['Ha… okay. Let\'s just keep talking.', 'Whoa, no pressure, right?']) };
    if (a.bye) return { text: sc.close[tier], end: tier === 'warm' ? 'warm exit' : 'exit' };
    if (a.invite || a.contact) {
      sim.invitedTurn = sim.turn; sim.invitedEng = sim.eng;
      if (sim.eng >= sc.thr && sim.turn >= 3) return { text: pick(sc.accept), end: 'success' };
      sim.declined++; return { text: pick(sc.decline), declined: true };
    }
    let pre = '';
    if (a.compliment) pre = sim.eng >= 45 ? pick(['Ha, thank you! ', 'Aw, thanks! ', "Ha, that's nice of you. "]) : 'Oh. Thanks. ';
    // topic hit
    if (a.topics.length) {
      const k = a.topics[0]; const t = sc.topics.find((x) => x.k === k);
      const idx = sim.revealed[k] || 0;
      let line;
      if (idx < t.lines.length) line = t.lines[idx];
      else { const h = hookFor(sim, sc); if (h && tier !== 'cold') { sim.revealed[h.k] = 1; sim.pending = [h.k]; return { text: pre + pick(["Ha, that's honestly the whole story. ", "That's about it! "]) + 'Anyway — ' + h.lines[0] }; } line = pick(["Ha, that's honestly the whole story. What about you?", "That's about it! What about you?"]); }
      if (tier === 'cold') line = firstSentence(line);
      sim.revealed[k] = idx + 1; sim.pending = [k];
      if (a.follow && tier !== 'cold' && !pre) pre = pick(['Ha! ', 'Oh, yeah. ', 'Honestly? ', '', '']);
      let ask = '';
      if (tier !== 'cold' && t.ask && !sim.asked[k] && (sim.qStreak >= 2 || (tier === 'warm' && Math.random() < 0.4))) { ask = ' ' + t.ask; sim.asked[k] = true; sim.theyAsked = true; }
      return { text: pre + line + ask };
    }
    const lo = a._lo;
    if (a.greet && sim.turn <= 1) return { text: pre + pick(sc.greet) };
    if (a.q) {
      if (/(how('s| is| are| was)? (it going|you|your (day|night|week|weekend))|how you doing|how are things|what's up|whats up|what's new)/.test(lo)) { const h = hookFor(sim, sc); let s = tidy(sc.howareyou); if (h && tier !== 'cold') { s += ' ' + h.lines[0]; sim.revealed[h.k] = 1; sim.pending = [h.k]; } return { text: pre + s + (tier === 'warm' ? ' How about you?' : '') }; }
      if (/(what do you do|your job|where do you work|do you work|what do you study|in school|for work|for a living)/.test(lo)) { revealIn(sim, sc, sc.whatdo); return { text: pre + (tier === 'cold' ? firstSentence(sc.whatdo) : sc.whatdo) }; }
      if (/(where are you from|are you from|grow up|grew up|where do you live|from (around )?here)/.test(lo)) { revealIn(sim, sc, sc.from); return { text: pre + sc.from }; }
      if (/(keeping you busy|been up to|what's new|whats new|anything fun|plans for|this weekend|lately)/.test(lo)) { const h = hookFor(sim, sc); if (h) { sim.revealed[h.k] = 1; sim.pending = [h.k]; return { text: pre + pick(['Honestly? ', 'Hmm — ', 'Ha, okay: ']) + (tier === 'cold' ? firstSentence(h.lines[0]) : h.lines[0]) }; } }
      if (/(your name|who are you)/.test(lo)) return { text: pre + "I'm " + sc.name + '. ' + (/\b(i'm|im|my name)\b/.test(lo) ? 'Nice to meet you!' : "What's yours?") };
      const h = hookFor(sim, sc);
      if (a.closed && tier === 'cold') return { text: pre + pick(['Yeah.', 'Not really.', 'Kind of.']) };
      if (h) { sim.revealed[h.k] = 1; sim.pending = [h.k]; const l = tier === 'cold' ? firstSentence(h.lines[0]) : h.lines[0]; return { text: pre + (a.closed ? pick(['Yeah, kind of. ', 'Ha, sometimes. ', 'Not really, but ']) : pick(['Hmm. ', 'Ha — ', 'Oh — ', ''])) + l }; }
      return { text: pre + pick(["Ha, I feel like I've been doing all the talking. What about you — what's been keeping you busy?", "Honestly, not much else going on! What about you?"]), theyAsked: true };
    }
    if (a.low) { sim.lowStreak++; const out = { text: pre + pick(sc.cold) }; if (sim.lowStreak >= 2) out.note = `*${sc.name} glances at ${pos} phone*`; return out; }
    if (a.self) {
      if (tier === 'cold') return { text: pre + pick(['Oh, cool.', 'Nice.', 'Huh.']) };
      sim.theyAsked = true;
      return { text: pre + pick(["Ha, that's cool. ", 'Oh nice. ', 'Wait, really? ', "That's awesome. "]) + pick(['How did you get into that?', "What's that like?", 'How long have you been doing that?', 'What do you like most about it?', 'How did that happen?']) };
    }
    // plain statement / reaction
    if (tier === 'cold') return { text: pre + pick(sc.cold) };
    const cur = sim.pending[0] && sc.topics.find((t) => t.k === sim.pending[0]);
    if (cur && (sim.revealed[cur.k] || 0) < cur.lines.length && tier === 'warm') { const l = cur.lines[sim.revealed[cur.k]]; sim.revealed[cur.k]++; return { text: pre + pick(['Right?! ', 'Exactly. ', 'Ha, yes. ']) + l }; }
    return { text: pre + pick(['Ha, right?', 'Exactly.', 'Ha, true.', 'Right?']) };
  }

  function step(sim, text) {
    const sc = A.SCENARIOS.find((s) => s.id === sim.sid);
    sim.turn++;
    const a = A.analyzeMsg(text, sc, sim); a._lo = text.toLowerCase().replace(/[’‘]/g, "'");
    const pendingBefore = sim.pending.slice();
    sim.eng = A.clamp(sim.eng + engDelta(a, sim), 0, 100);
    sim.qStreak = a.q && !a.self ? sim.qStreak + 1 : 0;
    sim.meStreak = a.self && !a.q ? sim.meStreak + 1 : 0;
    if (!a.low) sim.lowStreak = 0;
    const pt = pendingBefore[0] && sc.topics.find((t) => t.k === pendingBefore[0]);
    const pendingOpen = !!(pt && (sim.revealed[pt.k] || 0) < pt.lines.length);
    sim.msgs.push({ who: 'me', text, a: Object.assign({}, a, { _lo: undefined }), pendingBefore, pendingOpen, engAfter: sim.eng });
    const r = partnerReply(sim, sc, a);
    if (r.declined) sim.eng = A.clamp(sim.eng - 5, 0, 100);
    if (r.pushed) sim.pushedAfterNo = true;
    const out = [{ who: 'them', text: r.text }];
    if (r.note) out.push({ who: 'note', text: r.note });
    sim.lastThem = r.text;
    if (r.end) { sim.ended = true; sim.outcome = r.end; }
    else if (sim.eng < 12 && sim.turn >= 3) { out.push({ who: 'them', text: sc.close.cold }); sim.ended = true; sim.outcome = 'fizzled'; }
    else if (sim.turn >= 14) { out.push({ who: 'them', text: sc.close[sim.eng >= 65 ? 'warm' : 'mid'] }); sim.ended = true; sim.outcome = 'time'; }
    else if (sim.turn >= 8 && sim.eng >= sc.thr && !sim.invitedTurn && !sim.hinted) { out.push({ who: 'them', text: "Anyway — I should probably head out soon." }); sim.hinted = true; sim.hintTurn = sim.turn; }
    if (!r.end && !r.declined && pendingBefore.length === 0 && sim.pending.length === 0) sim.pending = [];
    return out;
  }

  // ---------- coaching ----------
  const rewrite = (q) => {
    const lo = q.toLowerCase().replace(/\?+$/, '').trim(); let m;
    if ((m = lo.match(/^do you like (.+)/))) return 'What do you like about ' + m[1] + '?';
    if ((m = lo.match(/^do you (.+)/))) return 'How did you get into ' + m[1].replace(/^(play|do|have) /, '') + '?';
    if ((m = lo.match(/^did you (.+)/))) return 'How was ' + m[1].replace(/^(have|go to|go|enjoy|like) /, '') + '?';
    if (/^(are|is|was|were) /.test(lo)) return "What's that been like?";
    return "What's the story behind that?";
  };
  A.coach = (sim) => {
    const sc = A.SCENARIOS.find((s) => s.id === sim.sid);
    const me = sim.msgs.filter((m) => m.who === 'me'); const N = me.length || 1;
    const c = { open: 0, closed: 0, follow: 0, missed: [], self: 0, low: [], hedges: 0, humor: 0, negative: 0, longs: 0, disrespect: 0, pushy: 0 };
    let iStreak = 0, iMax = 0, mStreak = 0, mMax = 0, bestFollow = null, closedEx = null;
    me.forEach((m) => {
      const a = m.a; if (a.open) c.open++; else if (a.q) { c.closed++; if (!closedEx) closedEx = m.text; }
      if (a.follow) { c.follow++; if (!bestFollow || (a.open && !bestFollow.a.open)) bestFollow = m; }
      else if (m.pendingOpen && !a.bye && !a.invite) c.missed.push({ k: m.pendingBefore[0], text: m.text });
      if (a.self) c.self++; if (a.low) c.low.push(m.text); c.hedges += a.hedges; if (a.humor) c.humor++; c.negative += a.negative; if (a.words > 45) c.longs++;
      if (a.disrespect) c.disrespect++; if (a.pushy) c.pushy++;
      iStreak = a.q && !a.self ? iStreak + 1 : 0; iMax = Math.max(iMax, iStreak);
      mStreak = a.self && !a.q ? mStreak + 1 : 0; mMax = Math.max(mMax, mStreak);
    });
    const qRatio = (c.open + c.closed) / N; const first = me[0];
    const goodOpener = first && !first.a.greet && (first.a.q || first.a.topics.length || first.a.self);
    const success = sim.outcome === 'success';
    const s = {};
    s.flow = A.clamp(Math.round(30 + sim.eng * 0.45 + c.follow * 6 - c.low.length * 9 - (mMax >= 3 ? 10 : 0) - (sim.outcome === 'fizzled' ? 15 : 0)), 0, 100);
    s.listening = A.clamp(Math.round(25 + (c.follow / Math.max(1, c.follow + c.missed.length)) * 50 + (c.open / N) * 30 - (iMax >= 4 ? 10 : 0)), 0, 100);
    s.natural = A.clamp(Math.round(72 - Math.abs(qRatio - 0.5) * 50 - c.low.length * 8 - c.longs * 8 - (iMax >= 4 ? 10 : 0) + (c.self ? 8 : 0) + Math.min(6, c.humor * 3)), 0, 100);
    s.confidence = A.clamp(Math.round(42 + Math.min(24, c.self * 6) + (goodOpener ? 10 : 0) + (success ? 20 : sim.invitedTurn ? 10 : 0) - c.hedges * 5 - c.low.length * 4), 0, 100);
    s.respect = A.clamp(100 - c.disrespect * 60 - c.pushy * 25 - c.negative * 5 - (sim.pushedAfterNo ? 30 : 0), 0, 100);
    if (N < 5) s.flow = Math.max(0, s.flow - (5 - N) * 6);
    const overall = Math.round(s.flow * 0.25 + s.listening * 0.25 + s.natural * 0.2 + s.confidence * 0.15 + s.respect * 0.15);
    const fb = [];
    const T = (k) => sc.topics.find((t) => t.k === k);
    if (success) fb.push(['good', `${sc.name} said yes. You built enough rapport first (vibe ${sim.invitedEng}/100 when you asked) and made it easy to agree.`]);
    if (bestFollow) fb.push(['good', `“${bestFollow.text}” — you picked up on something ${sc.name} said and went deeper. That's the core skill.`]);
    if (goodOpener) fb.push(['good', 'Your opener gave them something to respond to instead of just "hey".']);
    else if (first && first.a.greet) fb.push(['try', 'You opened with just a greeting. Add something about the shared situation and a light question, e.g. comment on what is happening around you, then ask about it.']);
    if (c.missed.length) { const m = c.missed[0]; const t = T(m.k); if (t) fb.push(['try', `When ${sc.name} mentioned ${t.label}, you replied “${m.text.slice(0, 60)}${m.text.length > 60 ? '…' : ''}” and the thread dropped. Try: “${t.follow}”`]); }
    if (iMax >= 3) fb.push(['try', `You asked ${iMax} questions in a row without sharing anything about yourself. That starts to feel like an interview. Answer + share a bit + then ask.`]);
    if (mMax >= 3) fb.push(['try', `You shared about yourself ${mMax} times in a row without turning it back. After sharing, hand the conversation back with a question.`]);
    if (c.closed > c.open && closedEx) fb.push(['try', `Most of your questions were yes/no. “${closedEx}” could be “${rewrite(closedEx)}” — open questions invite stories.`]);
    if (c.low.length) fb.push(['try', `“${c.low[0]}” gives them nothing to work with. React, then add a thought or a question.`]);
    if (c.hedges >= 2) fb.push(['try', 'Lots of hedging ("sorry", "idk", "I guess"). Say it plainly — you are allowed to take up space in a conversation.']);
    if (c.longs) fb.push(['try', 'Some messages were long. In real conversation, shorter turns keep it a back-and-forth.']);
    if (sim.invitedTurn && !success) fb.push(['try', sim.invitedTurn < 4 ? `You asked at turn ${sim.invitedTurn}, before there was much rapport. A softer reply usually means "not yet", not "never". Build more first.` : `They weren't warmed up enough yet (vibe ${sim.invitedEng}/100). Look for cues like them asking you questions and giving longer answers.`]);
    if (sim.declined && !sim.pushedAfterNo && !c.pushy) fb.push(['good', 'You took the soft no without pushing. That is respect — and it keeps you looking confident.']);
    if (sim.hinted && !sim.invitedTurn) fb.push(['try', `${sc.name} was clearly enjoying it and signaled leaving — a natural moment to suggest something specific, tied to what you talked about.`]);
    if (c.disrespect) fb.push(['try', 'A comment about their body ended it. Compliment choices (style, taste, how they talk about things), never bodies — especially with someone you just met.']);
    if (c.pushy || sim.pushedAfterNo) fb.push(['try', 'Pushing after a no reads as pressure. Accept it warmly and move on — that is what makes people comfortable around you.']);
    const unexplored = sc.topics.filter((t) => !sim.revealed[t.k]).map((t) => t.label);
    return { scores: s, overall, fb: fb.slice(0, 7), unexplored, outcome: sim.outcome, eng: sim.eng };
  };

  A.socialLevel = () => { let lv = 1; for (const L of A.CHALLENGES) { const done = new Set(SO().challenges.filter((c) => c.lv === L.lv && c.went !== 'skip').map((c) => c.idx)).size; if (done >= A.CHALLENGE_UNLOCK && lv === L.lv && lv < 5) lv++; } return lv; };
  A.socialLevelDone = () => A.CHALLENGES.filter((L) => new Set(SO().challenges.filter((c) => c.lv === L.lv).map((c) => c.idx)).size >= A.CHALLENGE_UNLOCK).length;
  A.todayChallenge = () => {
    const t = d.today(); const lv = A.socialLevel(); const L = A.CHALLENGES[lv - 1];
    const doneIdx = new Set(SO().challenges.filter((c) => c.lv === lv).map((c) => c.idx));
    const pool = L.items.map((x, i) => i).filter((i) => !doneIdx.has(i)); const P = pool.length ? pool : L.items.map((x, i) => i);
    const seed = Number(t.replace(/-/g, '')) + (SO().swaps[t] || 0);
    const idx = P[seed % P.length];
    return { lv, idx, text: L.items[idx], level: L, done: SO().challenges.find((c) => c.date === t) };
  };
  const dimAvg = () => { const last = SO().sims.slice(-5); if (!last.length) return null; const o = {}; DIMS.forEach(([k]) => (o[k] = Math.round(A.avg(last, (s) => s.scores[k])))); return o; };

  // ---------- views ----------
  A.views.social = {
    title: 'Social',
    render(r) { if (r.sub === 'progress') return `<div class="row" style="margin-bottom:12px"><button class="btn sm ghost" data-go="social">${I('back', 14)} Social</button></div>` + progress(); return page(); },
    act: {}
  };
  const sa = A.views.social.act;
  function page() {
    const lv = A.socialLevel(); const L = A.CHALLENGES[lv - 1]; const act = SO().active;
    const n = new Set(SO().challenges.filter((c) => c.lv === lv && c.went !== 'skip').map((c) => c.idx)).size;
    return `<div class="row" style="margin-bottom:12px;gap:10px"><button class="pill acc" data-act="ladder" style="border:0;cursor:pointer;padding:6px 12px">Level ${lv} · ${L.name} · ${n}/${A.CHALLENGE_UNLOCK}</button><span class="sp"></span><button class="link small" data-go="social/progress">Progress</button></div>
      ${chalCard()}
      <div class="sec">Practice a conversation</div>
      ${act && !act.ended && act.turn > 0 ? `<div class="card hero" data-go="sim/${act.sid}" style="cursor:pointer;padding:12px 16px"><div class="row"><b class="sp">Continue with ${esc(A.SCENARIOS.find((x) => x.id === act.sid).name)}</b>${I('chev', 16, 'class="chev"')}</div></div>` : ''}
      <div class="card"><div class="list">${A.SCENARIOS.map((x) => { const runs = SO().sims.filter((y) => y.scenario === x.id); const best = runs.length ? Math.max(...runs.map((y) => y.overall)) : null; return `<div class="li" data-act="simstart" data-id="${x.id}"><span style="font-size:22px;width:28px;text-align:center">${x.icon}</span><div class="sp" style="min-width:0"><div class="t" style="font-size:14px">${esc(x.title)}</div><div class="s">${x.diff}${best != null ? ' · best ' + best : ''}</div></div>${I('chev', 16, 'class="chev"')}</div>`; }).join('')}</div></div>
      <div class="sec">Lessons</div>
      <div class="card"><div class="list">${A.LESSONS.map((l, i) => `<div class="li" data-go="lesson/${l.id}"><span style="font-size:20px;width:28px;text-align:center">${l.icon}</span><div class="sp"><div class="t" style="font-size:14px">${esc(l.title)}</div><div class="s">${l.mins} min</div></div>${SO().lessons[l.id] ? '<span class="good">✓</span>' : I('chev', 16, 'class="chev"')}</div>`).join('')}</div></div>`;
  }
  sa.ladder = () => A.sheet({ title: 'Confidence ladder', body: `<p class="small muted" style="margin-top:0">Do ${A.CHALLENGE_UNLOCK} different challenges in a level to unlock the next.</p>` + A.CHALLENGES.map((L) => { const unlocked = L.lv <= A.socialLevel(); const doneIdx = new Set(SO().challenges.filter((c) => c.lv === L.lv && c.went !== 'skip').map((c) => c.idx)); return `<div style="margin-bottom:14px;opacity:${unlocked ? 1 : 0.45}"><b>Level ${L.lv} · ${L.name}${unlocked ? '' : ' 🔒'}</b>${L.items.map((t, i) => `<div class="row small" style="margin-top:5px"><span>${doneIdx.has(i) ? '✅' : '◻️'}</span><span class="sp ${doneIdx.has(i) ? 'muted' : ''}">${esc(t)}</span></div>`).join('')}</div>`; }).join('') });
  function chalCard() {
    const c = A.todayChallenge();
    return `<div class="card hero"><div class="tiny dim" style="font-weight:700;letter-spacing:.06em">TODAY'S CHALLENGE</div>
      ${c.done ? `<div style="font-weight:700;font-size:16px;margin:8px 0 4px">${esc(c.done.text)}</div><div class="small good">${c.done.went === 'skip' ? 'Skipped today — no penalty.' : 'Done ✓ ' + (c.done.before ? `Nerves ${c.done.before} → ${c.done.after}` : '')}</div>`
        : `<div style="font-weight:700;font-size:17px;margin:8px 0 12px">${esc(c.text)}</div><div class="row" style="gap:8px"><button class="btn pri sp" data-act="cdone">I did it · +40 XP</button><button class="btn ghost" data-act="cswap">Swap</button></div>`}</div>`;
  }
  function hub() {
    const lv = A.socialLevel(); const da = dimAvg(); const nextL = A.LESSONS.find((l) => !SO().lessons[l.id]);
    return chalCard() + `<div class="card"><h3>Your social skills<span class="sp"></span><span class="tiny dim" style="text-transform:none;letter-spacing:0">avg of last 5 practices</span></h3>${da ? DIMS.map(([k, l]) => `<div style="margin-bottom:9px"><div class="row small"><span>${l}</span><span class="sp"></span><b class="num">${da[k]}</b></div><div class="bar thin" style="margin-top:3px"><i style="width:${da[k]}%;background:var(--c-social)"></i></div></div>`).join('') : '<div class="small dim">Do a practice conversation to get your first skill read.</div>'}</div>
      <div class="grid2"><div class="tile" data-go="social/sims"><div class="ic" style="background:rgba(56,189,248,.12);color:var(--c-social)">${I('social')}</div><div class="t">Practice a conversation</div><div class="s">${SO().sims.length} done</div></div>
      <div class="tile" data-go="${nextL ? 'lesson/' + nextL.id : 'social/lessons'}"><div class="ic" style="background:rgba(56,189,248,.12);color:var(--c-social)">${I('book')}</div><div class="t">${nextL ? 'Next lesson' : 'Lessons'}</div><div class="s">${nextL ? esc(nextL.title) : 'All complete ✓'}</div></div></div>
      <div class="card" style="margin-top:12px"><h3>Confidence ladder</h3>${A.CHALLENGES.map((L) => { const n = new Set(SO().challenges.filter((c) => c.lv === L.lv && c.went !== 'skip').map((c) => c.idx)).size; const unlocked = L.lv <= lv; return `<div class="row" style="margin-bottom:9px;opacity:${unlocked ? 1 : 0.45}"><span class="pill ${L.lv === lv ? 'acc' : ''}" style="width:44px;justify-content:center">Lv ${L.lv}</span><div class="sp"><div class="small"><b>${L.name}</b> ${unlocked ? '' : '🔒'}</div><div class="bar thin" style="margin-top:4px"><i style="width:${Math.min(1, n / A.CHALLENGE_UNLOCK) * 100}%;background:var(--c-social)"></i></div></div><span class="tiny num dim">${n}/${A.CHALLENGE_UNLOCK}</span></div>`; }).join('')}<div class="tiny dim">Complete ${A.CHALLENGE_UNLOCK} different challenges in a level to unlock the next one.</div></div>`;
  }
  sa.cswap = () => { const t = d.today(); SO().swaps[t] = (SO().swaps[t] || 0) + 1; A.save(); A.refresh(); };
  sa.cdone = () => {
    const c = A.todayChallenge();
    A.sheet({ title: 'How did it go?', body: `<div class="small muted" style="margin-bottom:12px">${esc(c.text)}</div>` + A.fields([{ n: 'before', l: 'Nerves before (1 calm – 10 terrified)', t: 'scale', min: 1, max: 10 }, { n: 'after', l: 'Nerves right after', t: 'scale', min: 1, max: 10 }, { n: 'went', l: 'How it went', t: 'chips', o: [['great', 'Great'], ['okay', 'Okay'], ['awkward', 'Awkward (still counts)']], v: 'okay' }, { n: 'note', l: 'What happened? What would you do differently?', t: 'textarea' }]) + '<div class="tiny dim">Awkward counts. The rep is the win, not the outcome.</div>',
      foot: [{ label: 'Not today', act: 'skip' }, { label: 'Save', cls: 'pri', act: 's' }],
      onAction: (a, el, close) => {
        const f = A.read(el); const t = d.today();
        A.mutate(() => {
          const rec = { id: A.uid(), date: t, lv: c.lv, idx: c.idx, text: c.text, before: f.before ? Number(f.before) : null, after: f.after ? Number(f.after) : null, went: a === 'skip' ? 'skip' : f.went, note: f.note };
          SO().challenges = SO().challenges.filter((x) => x.date !== t); SO().challenges.push(rec);
          if (a !== 'skip') { A.xpAdd('sc:' + t, 40, 'Social challenge', t); A.ensureDay(t); A.autoTask(t, 'social'); } else A.xpRemove('sc:' + t);
        });
        close(); if (a !== 'skip') { A.sfx('done'); A.toast('Challenge logged'); } A.refresh();
      } });
  };
  function sims() {
    const act = SO().active;
    return (act && !act.ended ? `<div class="card hero" data-go="sim/${act.sid}" style="cursor:pointer"><div class="row"><div class="sp"><b>Continue: ${esc(A.SCENARIOS.find((s) => s.id === act.sid).title)}</b><div class="small muted">${act.turn} messages in</div></div>${I('chev', 18, 'class="chev"')}</div></div>` : '') +
      `<p class="small muted" style="margin-top:0">Type what you'd actually say. The practice partner reacts to how you talk — follow-ups, open questions, sharing, pressure — and you get coaching at the end. It runs offline from rules, so treat it as reps, not a real person.</p>` +
      A.SCENARIOS.map((s) => { const runs = SO().sims.filter((x) => x.scenario === s.id); const best = runs.length ? Math.max(...runs.map((x) => x.overall)) : null; return `<div class="card" data-act="simstart" data-id="${s.id}" style="cursor:pointer"><div class="row"><div style="font-size:28px">${s.icon}</div><div class="sp"><div style="font-weight:700">${esc(s.title)}</div><div class="small muted">${esc(s.goal)}</div></div></div><div class="row" style="margin-top:10px;gap:6px"><span class="pill ${s.diff === 'Hard' ? 'warn' : s.diff === 'Medium' ? 'acc' : 'good'}">${s.diff}</span><span class="pill">${runs.length} run${runs.length === 1 ? '' : 's'}</span>${best != null ? `<span class="pill">Best ${best}</span>` : ''}</div></div>`; }).join('');
  }
  sa.simstart = async (el) => {
    const act = SO().active;
    if (act && !act.ended && act.sid !== el.dataset.id && act.turn > 0 && !(await A.confirm('Abandon current practice?', 'You have an unfinished conversation.', 'Start new'))) return;
    if (!act || act.ended || act.sid !== el.dataset.id) { SO().active = newSim(el.dataset.id); A.save(); }
    A.go('sim/' + el.dataset.id);
  };

  // ----- simulation screen -----
  const bubble = (m) => m.who === 'note' ? `<div class="bubble note">${esc(m.text)}</div>` : `<div class="bubble ${m.who === 'me' ? 'me' : 'them'}">${esc(m.text)}</div>`;
  const vibe = (e) => { const lab = e >= 65 ? 'Warm' : e >= 38 ? 'Neutral' : 'Cool'; const col = e >= 65 ? 'var(--good)' : e >= 38 ? 'var(--c-social)' : 'var(--warn)'; return `<div class="meter"><span>Vibe</span><div class="bar thin sp"><i style="width:${e}%;background:${col}"></i></div><b style="color:${col}">${lab}</b></div>`; };
  function report(sim, saved) {
    const r = saved || A.coach(sim);
    const OUT = { success: '🎉 They said yes', 'warm exit': '😊 Ended on a high note', exit: '👋 You wrapped it up', time: '⏱️ Conversation ran its course', fizzled: '🫥 It fizzled out', left: '🚪 They left the conversation' };
    return `<div class="card hero" style="margin-top:12px"><div class="row"><div class="sp"><div class="tiny dim" style="font-weight:700;letter-spacing:.06em">COACHING REPORT</div><div style="font-weight:700;font-size:16px;margin-top:4px">${OUT[r.outcome] || 'Conversation ended'}</div></div>${A.chart.ring(r.overall / 100, 70, 7, 'var(--c-social)', `<b class="num">${r.overall}</b>`)}</div></div>
      <div class="card">${DIMS.map(([k, l]) => `<div style="margin-bottom:9px"><div class="row small"><span>${l}</span><span class="sp"></span><b class="num">${r.scores[k]}</b></div><div class="bar thin" style="margin-top:3px"><i style="width:${r.scores[k]}%;background:var(--c-social)"></i></div></div>`).join('')}</div>
      <div class="card"><h3>Feedback</h3>${r.fb.map(([t, x]) => `<div class="row" style="align-items:flex-start;gap:10px;margin-bottom:10px"><span style="flex:none">${t === 'good' ? '✅' : '💡'}</span><div class="small">${esc(x)}</div></div>`).join('') || '<div class="small dim">Short conversation — try a few more turns for detailed feedback.</div>'}</div>
      ${r.unexplored && r.unexplored.length ? `<div class="card flat"><h3>Opportunities you didn't open</h3><div class="small muted">You never found out about: ${r.unexplored.map(esc).join(', ')}. Asking "What's been keeping you busy lately?" or picking up small details usually opens these.</div></div>` : ''}`;
  }
  A.views.sim = {
    title: (r) => { const s = A.SCENARIOS.find((x) => x.id === r.sub); return s ? s.name : 'Practice'; },
    render(r) {
      const sc = A.SCENARIOS.find((x) => x.id === r.sub); if (!sc) return '<div class="empty">Scenario not found</div>';
      let sim = SO().active; if (!sim || sim.sid !== sc.id) { sim = SO().active = newSim(sc.id); A.save(); }
      const saved = sim.savedId ? SO().sims.find((x) => x.id === sim.savedId) : null;
      return `<div class="card flat" style="padding:12px;position:sticky;top:0;z-index:3;background:var(--bg2)"><div class="row"><div style="font-size:22px">${sc.icon}</div><div class="sp"><b>${esc(sc.title)}</b><div class="tiny dim">Goal: ${esc(sc.goal)}</div></div></div><div style="margin-top:8px" id="vibe">${vibe(sim.eng)}</div></div>
        <div id="chat">${sim.msgs.map(bubble).join('')}</div>
        ${sim.ended ? report(sim, saved) + `<div class="row" style="gap:8px;margin-top:4px"><button class="btn ghost sp" data-go="social">Done</button><button class="btn pri sp" data-act="again">Try again</button></div>`
        : `<div class="composer"><textarea class="inp" id="say" rows="1" placeholder="Type what you'd actually say…" enterkeyhint="send"></textarea><button class="btn pri" data-act="send" style="height:44px;width:48px;padding:0">${I('send', 18)}</button></div><div class="row" style="gap:8px;margin-top:6px"><button class="btn sm ghost" data-act="hint">💡 Hint</button><span class="sp"></span><button class="btn sm ghost" data-act="end">End & get coaching</button></div>`}`;
    },
    mount(root) {
      const ta = root.querySelector('#say'); const v = document.getElementById('view');
      setTimeout(() => (v.scrollTop = v.scrollHeight), 30);
      if (ta) { ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); A.views.sim.act.send(); } }); ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; }); }
    },
    act: {
      send() {
        const ta = document.getElementById('say'); const text = (ta.value || '').trim(); const sim = SO().active; if (!text || !sim || sim.ended || sim.busy) return;
        ta.value = ''; ta.style.height = 'auto';
        const chat = document.getElementById('chat'); const v = document.getElementById('view');
        chat.insertAdjacentHTML('beforeend', bubble({ who: 'me', text })); v.scrollTop = v.scrollHeight;
        const out = step(sim, text); sim.busy = true; A.save();
        const typing = document.createElement('div'); typing.className = 'bubble them'; typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
        setTimeout(() => { chat.appendChild(typing); v.scrollTop = v.scrollHeight; }, 250);
        const delay = A.reduced() ? 300 : Math.min(2200, 700 + out[0].text.length * 18);
        setTimeout(() => {
          typing.remove(); out.forEach((m) => { sim.msgs.push(m); chat.insertAdjacentHTML('beforeend', bubble(m)); });
          sim.busy = false; document.getElementById('vibe').innerHTML = vibe(sim.eng); A.sfx('tick');
          v.scrollTop = v.scrollHeight;
          if (sim.ended) finish(sim); else A.save();
        }, delay);
      },
      hint() {
        const sim = SO().active; const sc = A.SCENARIOS.find((s) => s.id === sim.sid);
        const t = sim.pending[0] && sc.topics.find((x) => x.k === sim.pending[0]);
        let h;
        if (sim.turn === 0) h = sim.sid === 'silence' ? "Callbacks and open questions work best here. Try asking about the food, the host, or what he's been up to lately." : 'Comment on the situation you share, then ask an easy question about it.';
        else if (sim.qStreak >= 3) h = "You've asked a lot of questions in a row. Share something about yourself, then hand it back.";
        else if (sim.meStreak >= 2) h = 'Turn it back to them with an open question.';
        else if (sim.hinted && !sim.invitedTurn) h = "They're signaling the conversation is wrapping up and it's gone well — suggest something specific you could do together, tied to what you talked about.";
        else if (t && (sim.revealed[t.k] || 0) < 3) h = `They mentioned ${t.label}. Follow that thread — e.g. “${t.follow}”`;
        else if (sim.eng < 38) h = "Energy is low. Try a genuine open question (what/how) or share a short, specific story.";
        else h = "Ask what's been keeping them busy lately — it opens new topics.";
        A.toast('💡 ' + h);
      },
      end() { const sim = SO().active; if (sim.turn < 2) { SO().active = null; A.save(); return A.go('social'); } sim.ended = true; sim.outcome = sim.outcome || 'exit'; finish(sim); },
      again() { const id = SO().active.sid; SO().active = newSim(id); A.save(); A.refresh(); }
    }
  };
  function finish(sim) {
    if (sim.savedId) return A.refresh();
    const r = A.coach(sim); const id = A.uid(); const t = d.today();
    A.mutate(() => {
      SO().sims.push({ id, date: t, scenario: sim.sid, scores: r.scores, overall: r.overall, outcome: r.outcome, fb: r.fb, unexplored: r.unexplored, eng: r.eng, turns: sim.turn, transcript: sim.msgs.map((m) => ({ who: m.who, text: m.text })) });
      if (SO().sims.length > 60) SO().sims.splice(0, SO().sims.length - 60);
      sim.savedId = id;
      A.xpAdd('sim:' + id, 30 + Math.round(r.overall / 5), 'Practice conversation (' + r.overall + ')', t);
    });
    setTimeout(() => A.refresh(), 400);
  }

  // ----- lessons -----
  function lessons() {
    return A.LESSONS.map((l, i) => `<div class="card" data-go="lesson/${l.id}" style="cursor:pointer"><div class="row"><div style="font-size:24px">${l.icon}</div><div class="sp"><div style="font-weight:700">${i + 1}. ${esc(l.title)}</div><div class="small muted">${l.mins} min · ${l.cards.length} cards + practice</div></div>${SO().lessons[l.id] ? '<span class="pill good">Done</span>' : I('chev', 16, 'class="chev"')}</div></div>`).join('');
  }
  const lessonState = {};
  const CHECKS = {
    context: (a, t, L) => [a.hookHit, 'Refers to the shared situation', 'Mention something you are both experiencing right now'],
    question: (a) => [a.q, 'Gives them an easy way to respond (a question)', 'End with a light question so they have something to answer'],
    short: (a) => [a.words <= 25, 'Short and low-pressure', 'Keep openers short — one or two sentences'],
    hook: (a) => [a.hookHit, 'Picks up a detail they gave you', 'Grab a specific detail from what they said'],
    open: (a) => [a.open, 'Open question (what / how / why)', 'Use an open question instead of yes/no'],
    share: (a) => [a.self, 'Shares something about you', 'Add a small detail about yourself so it is not an interview'],
    nohijack: (a) => [!(a.self && !a.q), 'Stays on their story', "Don't switch to your own story yet — ask about theirs first"],
    story: (a) => [a.words >= 30 && a.words <= 130, 'Story length (30–130 words)', a.words < 30 ? 'Add more: setup → what happened → how it felt' : 'Trim it — aim for under 45 seconds spoken'],
    graceful: (a, t) => [/(let you|i'll let you|nice (talking|chatting|meeting)|catch you|see you|talk later|get back to|good (talking|seeing))/.test(t), 'Wraps up warmly', 'With cues this low, exit kindly: “I\'ll let you get back to it — nice talking!”'],
    nopressure: (a) => [!a.pushy, 'No pressure', 'Remove anything that pressures them'],
    compliment: (a, t) => [/(love|like|cool|awesome|great|amazing|light up|lit up|passion|taste|the way you|fun|interesting)/.test(t) && !BODY.test(t), 'Genuine compliment about who they are or their choices', 'Compliment their taste, energy or how they talk about it'],
    respect: (a, t) => [!BODY.test(t), 'Respectful', 'Keep compliments off their body'],
    invite: (a) => [a.invite, 'Clear invitation', 'Actually ask: “Want to go with me?”'],
    specific: (a, t) => [/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|tomorrow|tonight|this week|next week|\d|morning|afternoon|evening)/.test(t), 'Specific time or plan', 'Name a day or time so it is easy to say yes']
  };
  A.views.lesson = {
    title: 'Lesson',
    render(r) {
      const L = A.LESSONS.find((x) => x.id === r.sub); if (!L) return '<div class="empty">Lesson not found</div>';
      const st = (lessonState[L.id] = lessonState[L.id] || { i: 0, tried: false, fb: null, text: '' });
      const n = L.cards.length; const onPractice = st.i >= n;
      return `<div class="row" style="margin-bottom:12px"><span class="pill acc">${L.icon} ${esc(L.title)}</span><span class="sp"></span><span class="tiny dim num">${Math.min(st.i + 1, n + 1)}/${n + 1}</span></div>
        <div class="bar thin" style="margin-bottom:14px"><i style="width:${(Math.min(st.i + 1, n + 1) / (n + 1)) * 100}%"></i></div>
        ${!onPractice ? `<div class="card hero fadein" style="min-height:220px"><div class="mid" style="margin-bottom:10px">${esc(L.cards[st.i][0])}</div><div style="font-size:15.5px;line-height:1.55">${esc(L.cards[st.i][1])}</div></div>
          <div class="row" style="gap:8px"><button class="btn ghost sp" data-act="prev" ${st.i === 0 ? 'disabled' : ''}>Back</button><button class="btn pri sp" data-act="next">${st.i === n - 1 ? 'Practice' : 'Next'}</button></div>`
        : `<div class="card hero"><div class="tiny dim" style="font-weight:700;letter-spacing:.06em">PRACTICE</div><div style="font-weight:600;margin-top:6px">${esc(L.practice.prompt)}</div></div>
          <textarea class="inp" id="lp" placeholder="Type your response…">${esc(st.text)}</textarea>
          <div class="row" style="gap:8px;margin-top:10px"><button class="btn ghost" data-act="prev">Back</button><button class="btn pri sp" data-act="check">Check my response</button></div>
          ${st.fb ? `<div class="card" style="margin-top:12px">${st.fb.map(([ok, good, tip]) => `<div class="row" style="align-items:flex-start;gap:10px;margin-bottom:9px"><span>${ok ? '✅' : '💡'}</span><div class="small">${ok ? esc(good) : `<b>${esc(good)}</b><div class="muted">${esc(tip)}</div>`}</div></div>`).join('')}<div class="tiny dim">There's no single right answer — this checks the habits from the lesson.</div></div>` : ''}
          ${st.tried ? `<button class="btn pri block" style="margin-top:6px" data-act="complete">${SO().lessons[L.id] ? 'Done ✓ Back to lessons' : 'Complete lesson · +25 XP'}</button>` : ''}`}`;
    },
    act: {
      next() { const st = lessonState[A.route().sub]; st.i++; A.refresh(); }, prev() { const st = lessonState[A.route().sub]; st.i = Math.max(0, st.i - 1); A.refresh(); },
      check() {
        const L = A.LESSONS.find((x) => x.id === A.route().sub); const st = lessonState[L.id]; const text = document.getElementById('lp').value.trim(); if (!text) return A.toast('Type a response first');
        const a = A.analyzeMsg(text, null, null); const lo = text.toLowerCase(); a.hookHit = L.practice.hooks.some((h) => words(lo).some((x) => x.startsWith(h)));
        st.text = text; st.tried = true; st.fb = L.practice.checks.map((c) => CHECKS[c](a, lo, L));
        A.sfx('tick'); A.refresh();
      },
      complete() { const id = A.route().sub; if (!SO().lessons[id]) { A.mutate(() => { SO().lessons[id] = d.today(); A.xpAdd('les:' + id, 25, 'Lesson: ' + A.LESSONS.find((x) => x.id === id).title, d.today()); }); A.sfx('done'); A.toast('Lesson complete'); } A.go('social'); }
    }
  };

  // ----- challenges list -----
  function challenges() {
    const lv = A.socialLevel(); const C = SO().challenges.filter((c) => c.went !== 'skip').sort((a, b) => b.date.localeCompare(a.date));
    return chalCard() + A.CHALLENGES.map((L) => { const unlocked = L.lv <= lv; const doneIdx = new Set(C.filter((c) => c.lv === L.lv).map((c) => c.idx)); return `<div class="card ${unlocked ? '' : 'flat'}" style="opacity:${unlocked ? 1 : 0.5}"><h3>Level ${L.lv} · ${L.name}${unlocked ? '' : ' 🔒'}<span class="sp"></span><span class="num">${doneIdx.size}/${L.items.length}</span></h3>${L.items.map((t, i) => `<div class="row small" style="margin-bottom:6px"><span>${doneIdx.has(i) ? '✅' : '◻️'}</span><span class="sp ${doneIdx.has(i) ? 'muted' : ''}">${esc(t)}</span></div>`).join('')}</div>`; }).join('') +
      (C.length ? `<div class="sec">Reflections</div><div class="card flat">${C.slice(0, 20).map((c) => `<div style="margin-bottom:12px"><div class="row small"><b class="sp">${esc(c.text)}</b><span class="dim">${d.fmtDate(c.date)}</span></div><div class="tiny dim">${c.went}${c.before ? ` · nerves ${c.before} → ${c.after}` : ''}</div>${c.note ? `<div class="small muted" style="margin-top:3px">${esc(c.note)}</div>` : ''}</div>`).join('')}</div>` : '');
  }

  // ----- progress -----
  function progress() {
    const S2 = SO().sims; const C = SO().challenges.filter((c) => c.before && c.after);
    return `<div class="kpi"><div class="stat"><div class="k">Social level</div><div class="v num">${A.socialLevel()}</div><div class="s">${A.CHALLENGES[A.socialLevel() - 1].name}</div></div><div class="stat"><div class="k">Challenges</div><div class="v num">${SO().challenges.filter((c) => c.went !== 'skip').length}</div></div><div class="stat"><div class="k">Practices</div><div class="v num">${S2.length}</div></div><div class="stat"><div class="k">Lessons</div><div class="v num">${Object.keys(SO().lessons).length}/${A.LESSONS.length}</div></div></div>
      <div class="card"><h3>Practice scores</h3>${S2.length > 1 ? A.chart.line(S2.slice(-20).map((s) => ({ x: d.fmtDate(s.date), y: s.overall })), { min: 0, max: 100, color: 'var(--c-social)', fillColor: 'var(--c-social)' }) : '<div class="small dim">Complete two practices to see a trend.</div>'}</div>
      <div class="card"><h3>Nerves before vs. after challenges</h3>${C.length > 1 ? A.chart.line(C.slice(-20).map((c) => ({ x: d.fmtDate(c.date), y: c.before })), { min: 0, max: 10, color: 'var(--warn)', fillColor: 'var(--warn)', h: 120 }) + `<div class="tiny dim" style="margin-top:6px">Nerves before each challenge. Watch it drift down over months. Avg drop during a challenge: <b>${A.round(A.avg(C, (c) => c.before - c.after), 1)}</b> points.</div>` : '<div class="small dim">Rate your nerves when logging challenges to see this.</div>'}</div>
      ${S2.length ? `<div class="sec">Past practices</div><div class="card flat"><div class="list">${S2.slice().reverse().map((s) => `<div class="li" data-act="simview" data-id="${s.id}"><div class="sp"><div class="t">${esc(A.SCENARIOS.find((x) => x.id === s.scenario).title)}</div><div class="s">${d.fmtDate(s.date, { year: true })} · ${s.turns} turns · ${esc(s.outcome || '')}</div></div><b class="num">${s.overall}</b></div>`).join('')}</div></div>` : ''}`;
  }
  sa.simview = (el) => { const s = SO().sims.find((x) => x.id === el.dataset.id); if (!s) return; A.sheet({ title: esc(A.SCENARIOS.find((x) => x.id === s.scenario).title), body: report({}, s) + `<div class="sec">Transcript</div>${s.transcript.map(bubble).join('')}` }); };
})(window.A);
