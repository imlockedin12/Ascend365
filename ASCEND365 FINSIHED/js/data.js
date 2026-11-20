/* ASCEND 365 — default content (editable in-app). Planning targets only; no fake progress. */
(function (A) {
  'use strict';
  const T = (time, end, title, cat, xp, kind, extra) => Object.assign({ tid: 't' + Math.random().toString(36).slice(2, 8), time, end, title, cat, xp, kind: kind || null }, extra || {});

  A.DEFAULT_ROUTINES = {
    weekday: [
      T('06:00', null, 'Wake up', 'discipline', 15, 'wake'),
      T('06:10', '07:40', 'Gym / strength training', 'fitness', 40, 'workout'),
      T('07:40', '08:10', 'Breakfast', 'fitness', 10),
      T('08:10', '08:40', 'Shower & get ready', 'appearance', 10, 'skincare_am'),
      T('08:40', null, 'Leave home', 'life', 5),
      T('09:05', '16:35', 'School / work', 'life', 5),
      T('17:05', null, 'Arrive home', 'life', 5),
      T('17:20', '18:30', 'Tennis', 'tennis', 20, 'tennis'),
      T('18:30', '19:30', 'Dinner & shower', 'recovery', 10),
      T('19:30', '21:00', 'Deep work', 'business', 25, 'focus'),
      T('21:00', '21:15', 'Duolingo', 'learning', 10, 'duolingo'),
      T('21:15', '21:30', 'Phone away, prep tomorrow', 'discipline', 15, 'skincare_pm'),
      T('21:30', null, 'Lights out', 'discipline', 25, 'sleep'),
      T(null, null, 'Daily social challenge', 'social', 20, 'social'),
      T(null, null, 'Log bodyweight', 'fitness', 5, 'weigh')
    ],
    weekend: [
      T('07:00', null, 'Wake up', 'discipline', 15, 'wake'),
      T('07:30', '08:00', 'Protein breakfast', 'fitness', 10),
      T('08:30', '09:15', 'Calisthenics skills & mobility', 'fitness', 30, 'skills'),
      T('09:15', '09:45', 'Shower, skincare, grooming', 'appearance', 10, 'skincare_am'),
      T('10:30', '12:00', 'Tennis', 'tennis', 20, 'tennis'),
      T('13:30', '16:00', 'Deep work block', 'business', 25, 'focus'),
      T('16:00', '18:00', 'Social time', 'social', 15),
      T('19:00', '19:30', 'Weekly review', 'discipline', 15, 'review', { days: [0] }),
      T('21:00', '21:15', 'Duolingo', 'learning', 10, 'duolingo'),
      T('21:30', '21:45', 'PM skincare, phone away', 'discipline', 15, 'skincare_pm'),
      T('22:00', null, 'Lights out', 'discipline', 25, 'sleep'),
      T(null, null, 'Daily social challenge', 'social', 20, 'social'),
      T(null, null, 'Log bodyweight', 'fitness', 5, 'weigh')
    ],
    recovery: [
      T('06:30', null, 'Wake up', 'discipline', 15, 'wake'),
      T('07:00', '07:25', 'Mobility & stretching (20 min)', 'recovery', 15),
      T('07:30', '08:00', 'Protein breakfast', 'fitness', 10),
      T('08:00', '08:30', 'Shower, skincare, grooming', 'appearance', 10, 'skincare_am'),
      T('17:30', '18:00', 'Easy walk outside', 'recovery', 10),
      T('19:30', '20:30', 'Deep work (lighter)', 'business', 20, 'focus'),
      T('21:00', '21:15', 'Phone away, prep tomorrow', 'discipline', 15, 'skincare_pm'),
      T('21:15', null, 'Lights out (early)', 'discipline', 25, 'sleep'),
      T(null, null, 'Daily social challenge', 'social', 20, 'social')
    ],
    vacation: [
      T('07:30', null, 'Wake up', 'discipline', 15, 'wake'),
      T('08:00', '08:30', 'Move: bodyweight circuit or walk', 'fitness', 15),
      T('09:00', '09:15', 'AM skincare & grooming', 'appearance', 10, 'skincare_am'),
      T('12:00', '12:15', 'Duolingo', 'learning', 10, 'duolingo'),
      T('22:00', '22:15', 'PM skincare, phone away', 'discipline', 15, 'skincare_pm'),
      T('22:30', null, 'Lights out', 'discipline', 25, 'sleep'),
      T(null, null, 'Talk to someone new', 'social', 20, 'social')
    ]
  };
  A.DAYTYPE_LABEL = { weekday: 'Weekday', weekend: 'Weekend', recovery: 'Recovery day', vacation: 'Vacation' };

  // ---------- Fitness ----------
  const E = (name, sets, lo, hi, opt) => Object.assign({ name, sets, lo, hi }, opt || {});
  A.DEFAULT_TEMPLATES = {
    upperA: { name: 'Upper A — Chest focus', ex: [E('Bench Press', 3, 6, 10), E('Lat Pulldown', 3, 8, 12), E('Seated Cable Row', 3, 8, 12), E('Seated DB Shoulder Press', 3, 8, 12), E('Lateral Raise', 3, 12, 20), E('EZ-Bar Curl', 2, 10, 15), E('Triceps Pushdown', 2, 10, 15)] },
    lowerA: { name: 'Lower A — Squat', ex: [E('Back Squat', 3, 6, 10, { lower: true }), E('Romanian Deadlift', 3, 8, 12, { lower: true }), E('Leg Press', 2, 10, 15, { lower: true }), E('Lying Leg Curl', 2, 10, 15), E('Standing Calf Raise', 3, 10, 15), E('Hanging Knee Raise', 3, 10, 15, { bw: true })] },
    skills: { name: 'Calisthenics skills & mobility', ex: [E('Pull-up Negatives (5s down)', 4, 3, 5, { bw: true }), E('Push-ups', 3, 6, 15, { bw: true }), E('Chest-to-Wall Handstand (sec)', 4, 20, 45, { bw: true, hold: true }), E('Tuck L-sit (sec)', 4, 10, 20, { bw: true, hold: true }), E('Hollow Body Hold (sec)', 3, 20, 40, { bw: true, hold: true })] },
    upperB: { name: 'Upper B — Back & shoulders', ex: [E('Incline DB Press', 3, 8, 12), E('Assisted / Strict Pull-ups', 3, 4, 10, { bw: true }), E('Chest-Supported Row', 3, 8, 12), E('Machine Shoulder Press', 2, 8, 12), E('Lateral Raise', 3, 12, 20), E('Cable Fly', 2, 12, 15), E('Hammer Curl', 2, 10, 15), E('Overhead Triceps Extension', 2, 10, 15)] },
    lowerB: { name: 'Lower B — Hinge', ex: [E('Trap Bar Deadlift', 3, 5, 8, { lower: true }), E('Bulgarian Split Squat', 3, 8, 12, { lower: true }), E('Leg Extension', 2, 12, 15), E('Lying Leg Curl', 2, 10, 15), E('Seated Calf Raise', 3, 10, 15), E('Cable Crunch', 3, 10, 15)] }
  };
  // day-of-week (0=Sun) -> template id or null (rest)
  A.DEFAULT_PROGRAM = { 0: null, 1: 'upperA', 2: 'lowerA', 3: 'skills', 4: 'upperB', 5: 'lowerB', 6: null };
  // Recommended split for a lean, aesthetic build with near-daily tennis: upper body twice a week,
  // one leg day (tennis already loads the legs), abs at the end of most sessions, skills on Friday.
  A.SPLIT_TYPES = ['Push', 'Pull', 'Legs', 'Upper', 'Skills + abs', 'Abs', 'Full body', 'Arms & shoulders'];
  A.DEFAULT_SPLIT = { 0: null, 1: 'Push', 2: 'Pull', 3: 'Legs', 4: 'Upper', 5: 'Skills + abs', 6: null };

  A.SKILL_TREES = [
    { id: 'pullup', name: 'Pull-ups', icon: '🧗', unit: 'reps', levels: [
      { n: 'Dead hang 30s', goal: 30, unit: 'sec', how: ['Hang from the bar with straight arms, shoulders engaged (not shrugged to ears).', 'Build grip and shoulder tolerance. 3 sets.'] },
      { n: 'Scapular pulls 3×10', goal: 10, how: ['From a dead hang, pull shoulder blades down and back without bending the elbows.', 'Teaches you to start every pull-up from the back, not the arms.'] },
      { n: 'Slow negatives 3×5', goal: 5, how: ['Jump or step to the top, chin over bar.', 'Lower yourself over 5 full seconds. Reset and repeat.'] },
      { n: '3 strict pull-ups', goal: 3, how: ['Dead hang to chin over bar, no kipping.', 'Do several sets of 1–2 with full rest if needed ("greasing the groove").'] },
      { n: '5 strict pull-ups', goal: 5, how: ['Ladders: 1, 2, 3 reps with rest, repeat 2–3 times.', 'Keep negatives in at the end of sessions.'] },
      { n: '8 strict pull-ups', goal: 8, how: ['3 sets near (not to) failure, 2× per week.', 'Add chin-ups to build volume.'] },
      { n: '12 strict pull-ups', goal: 12, how: ['Volume work: 5×5 with 2 min rest, progress to 5×7.'] },
      { n: '15 strict pull-ups', goal: 15, how: ['Mix one heavy day (weighted 3×5) with one volume day.'] },
      { n: 'Weighted +25 lb × 5', goal: 5, how: ['Use a dip belt or dumbbell between the feet.', 'Strength here carries straight into the front lever.'] }
    ] },
    { id: 'pushup', name: 'Push-ups', icon: '💪', unit: 'reps', levels: [
      { n: 'Incline push-ups 3×12', goal: 12, how: ['Hands on a bench or bar. Body in a straight line.'] },
      { n: 'Full push-ups 3×8', goal: 8, how: ['Chest to an inch off the floor, elbows ~45° from the body.'] },
      { n: 'Full push-ups 3×15', goal: 15, how: ['Add 1 rep per set each session.'] },
      { n: '25 push-ups in one set', goal: 25, how: ['One max set weekly; 3–4 submax sets the rest of the week.'] },
      { n: 'Diamond push-ups 3×12', goal: 12, how: ['Hands together under the chest. Great for triceps.'] },
      { n: 'Archer push-ups 3×5 / side', goal: 5, how: ['Wide hands, shift onto one arm while the other stays straight.'] },
      { n: 'Pseudo-planche push-ups 3×8', goal: 8, how: ['Hands by the hips, fingers out, lean forward. Builds straight-arm strength.'] }
    ] },
    { id: 'handstand', name: 'Handstand', icon: '🤸', unit: 'sec', levels: [
      { n: 'Plank 60s + pike hold 30s', goal: 60, unit: 'sec', how: ['Hollow plank with squeezed glutes.', 'Pike hold: hips high, weight into the hands.'] },
      { n: 'Wall walk / chest-to-wall 3×30s', goal: 30, unit: 'sec', req: [['pushup', 1]], how: ['Walk feet up the wall until your chest faces it.', 'Push tall through the shoulders, ribs in, body straight.'] },
      { n: 'Chest-to-wall 60s', goal: 60, unit: 'sec', how: ['Build to one clean 60s hold.', 'Try lifting one hand to a shoulder tap for a few reps.'] },
      { n: 'Toe & heel pulls (balance drills)', goal: 10, unit: 'reps', how: ['Back-to-wall handstand, gently pull toes off the wall and balance.', 'Learn to fix balance with fingers (overbalance) and palms (underbalance).'] },
      { n: 'Freestanding 5s', goal: 5, unit: 'sec', how: ['Kick up away from the wall (or with a spotter).', 'Practice bail-out cartwheel first so falling is safe.'] },
      { n: 'Freestanding 15s', goal: 15, unit: 'sec', how: ['10 minutes of kick-up attempts at the start of a session, while fresh.'] },
      { n: 'Freestanding 30s', goal: 30, unit: 'sec', how: ['Consistency over volume: 5 days a week, short practice.'] }
    ] },
    { id: 'hspu', name: 'Handstand Push-up', icon: '⬇️', unit: 'reps', levels: [
      { n: 'Pike push-ups 3×10', goal: 10, req: [['pushup', 2]], how: ['Hips high, head moves toward the floor ahead of your hands.'] },
      { n: 'Elevated pike push-ups 3×8', goal: 8, how: ['Feet on a box so your torso is more vertical.'] },
      { n: 'Wall HSPU negatives 3×3', goal: 3, req: [['handstand', 2]], how: ['Kick up to the wall, lower your head to a pad over 4–5 s.', 'Come down, reset.'] },
      { n: 'Partial wall HSPU 3×5', goal: 5, how: ['Stack a pad or books under your head to shorten the range; lower it over weeks.'] },
      { n: 'First full wall HSPU', goal: 1, how: ['Head to floor and press back to lockout.'] },
      { n: 'Wall HSPU 3×5', goal: 5, how: ['Two sessions a week, never to failure.'] },
      { n: 'Freestanding HSPU attempt', goal: 1, req: [['handstand', 6]], how: ['Only once a 30s freestanding handstand is solid.'] }
    ] },
    { id: 'lsit', name: 'L-sit', icon: '🪑', unit: 'sec', levels: [
      { n: 'Support hold 30s', goal: 30, how: ['On parallettes, dip bars, or two chairs. Arms locked, shoulders pushed down.'] },
      { n: 'Tuck L-sit 3×10s', goal: 10, how: ['Knees to chest, feet off the floor.'] },
      { n: 'Tuck L-sit 3×20s', goal: 20, how: ['Push shoulders down hard and lean slightly forward.'] },
      { n: 'One-leg L-sit 3×10s / side', goal: 10, how: ['One leg tucked, one straight. Work hamstring flexibility daily.'] },
      { n: 'Full L-sit 10s', goal: 10, how: ['Both legs straight, toes pointed, legs parallel to the floor.'] },
      { n: 'Full L-sit 20s', goal: 20, how: ['Build total time: aim for 60 s accumulated per session.'] }
    ] },
    { id: 'flever', name: 'Front Lever', icon: '🪽', unit: 'sec', levels: [
      { n: 'Active hang + scap pulls 3×10', goal: 10, unit: 'reps', req: [['pullup', 4]], how: ['Needs about 5 strict pull-ups first so your back can carry the load.'] },
      { n: 'Hollow body hold 3×30s', goal: 30, how: ['Lower back pressed into the floor, arms overhead.'] },
      { n: 'Tuck front lever 3×10s', goal: 10, how: ['Hang, pull the body up so your back is flat and parallel to the floor, knees to chest.'] },
      { n: 'Tuck FL 3×20s + tuck raises', goal: 20, how: ['Add 3×5 tuck front-lever raises from hang.'] },
      { n: 'Advanced tuck 3×10s', goal: 10, how: ['Open the hips so thighs are at 90° to the torso, back flat.'] },
      { n: 'One-leg / straddle 3×5s', goal: 5, how: ['Extend one leg (or straddle) while keeping the back flat.'] },
      { n: 'Full front lever 3s', goal: 3, how: ['A long-term goal. Keep weighted pull-ups in the program.'] }
    ] }
  ];

  // ---------- Tennis ----------
  A.TENNIS_SKILLS = [['fh', 'Forehand'], ['bh', 'Backhand'], ['serve', 'Serve'], ['ret', 'Return'], ['volley', 'Net / volleys'], ['foot', 'Footwork'], ['mental', 'Match mentality']];
  A.TENNIS_DRILLS = [
    { n: 'Crosscourt consistency', d: 'Rally crosscourt only. Count your longest rally; aim to beat it each week.', f: 'fh' },
    { n: 'Backhand to backhand', d: 'Backhand crosscourt only. Focus on early unit turn and a full follow-through.', f: 'bh' },
    { n: 'Serve targets', d: '20 first serves per box at T / body / wide targets. Log made / attempted.', f: 'serve' },
    { n: 'Second serve reps', d: '30 second serves with spin and margin over the net. Aim for 90%+ in.', f: 'serve' },
    { n: 'Split-step timing', d: 'Partner feeds; split-step as they make contact, every single ball.', f: 'foot' },
    { n: 'Figure-8 footwork', d: 'Alternate FH crosscourt and BH down-the-line, recovering to the middle each time.', f: 'foot' },
    { n: 'Approach + volley', d: 'Short ball → approach down the line → close in → put the volley away.', f: 'volley' },
    { n: 'Return of serve', d: 'Partner serves at 70%; block or swing returns deep down the middle.', f: 'ret' },
    { n: 'Change direction', d: '3 crosscourt balls, then go down the line on the 4th. Builds shot selection.', f: 'fh' },
    { n: 'Pressure points', d: 'Play tiebreaks starting at 4–5 down. Practice routines between points.', f: 'mental' }
  ];

  // ---------- Roadmap ----------
  A.CHAPTER_THEMES = ['Establish the foundation', 'Build consistency', 'Establish measurable progress', 'Increase capability', 'Improve performance', 'Midyear evaluation', 'Build momentum', 'Expand skills and output', 'Strengthen what works', 'Refine and optimize', 'Final major push', 'Consolidate and complete'];
  A.METRICS = {
    workouts: { l: 'Gym workouts logged', u: '' },
    tennis: { l: 'Tennis sessions logged', u: '' },
    matches: { l: 'Matches / sets played', u: '' },
    deepHours: { l: 'Focused work hours', u: 'h' },
    challenges: { l: 'Social challenges done', u: '' },
    sims: { l: 'Practice conversations', u: '' },
    sleepNights: { l: 'Nights on bedtime target', u: '' },
    avgCompletion: { l: 'Avg daily completion', u: '%' },
    reviews: { l: 'Weekly reviews done', u: '' },
    income: { l: 'Best monthly income', u: '$' }
  };
  // [chapter, cat, title, criteria, metric|null, target, tasks[]]
  const M = [
    [1, 'business', 'Log 15 hours of focused project work', '15+ focus hours logged this chapter, on no more than 2 active projects.', 'deepHours', 15, ['Pick your 2 active projects (park the rest in the backlog)', 'Write a one-page spec for the stock research algorithm v1', 'Set up a shared task board with your Roblox partner']],
    [1, 'fitness', 'Complete 14 gym sessions', '14 workouts logged with sets, reps and weights.', 'workouts', 14, ['Log starting bodyweight and measurements', 'Take baseline physique photos', 'Test max pull-ups and push-ups']],
    [1, 'tennis', 'Log 8 tennis sessions', '8 sessions logged with a focus area each.', 'tennis', 8, ['Do a baseline skill assessment', 'List 3 strengths and 3 weaknesses']],
    [1, 'social', 'Complete 10 social challenges', '10 real-world challenges completed with a reflection.', 'challenges', 10, ['Finish lessons 1 and 2', 'Do your first practice conversation']],
    [1, 'discipline', 'Hit your bedtime target on 18 nights', 'In bed within 30 min of target with 7+ hours of sleep.', 'sleepNights', 18, ['Set iPhone Screen Time app limits', 'Charge your phone outside the bedroom']],
    [2, 'business', 'Log 25 focused hours', '25+ focus hours logged this chapter.', 'deepHours', 25, ['Algorithm: daily price data pipeline working', 'Roblox: core gameplay loop playable']],
    [2, 'fitness', 'Complete 16 gym sessions', '16 workouts, adding weight or reps to main lifts.', 'workouts', 16, ['Add weight to bench, squat and rows at least once']],
    [2, 'tennis', 'Log 10 focused sessions', '10 sessions, each with a stated technical focus.', 'tennis', 10, ['Pick one technical goal for the month']],
    [2, 'social', 'Complete 14 social challenges', '14 challenges completed.', 'challenges', 14, ['Finish lessons 3 and 4']],
    [2, 'discipline', 'Average 70% daily completion', 'Average checklist completion of 70%+ across the chapter.', 'avgCompletion', 70, ['Do a weekly review every Sunday']],
    [3, 'business', 'Ship a playable Roblox test build', 'Real players have played a test build and you collected feedback.', null, 0, ['Invite 5+ testers', 'Write down top 3 pieces of feedback']],
    [3, 'fitness', 'Reach 5 strict pull-ups and 20 push-ups', 'Tested max reps, strict form.', null, 0, ['Retest pull-ups', 'Retest push-ups']],
    [3, 'tennis', 'First serve 60%+ in during practice', 'Logged serve accuracy of 60%+ over a full session of 40+ serves.', null, 0, ['Do the Serve Targets drill weekly']],
    [3, 'social', 'Complete 5 practice conversations', '5 simulations completed; read the coaching after each.', 'sims', 5, []],
    [3, 'discipline', 'Complete 4 weekly reviews', 'A review saved each week this chapter.', 'reviews', 4, []],
    [4, 'business', 'Algorithm v1 backtest with written results', 'Backtest run on historical data with a written summary of what works and what does not.', null, 0, ['Define entry/exit rules', 'Run backtest', 'Write results in the research journal']],
    [4, 'fitness', 'Complete 16 gym sessions', '16 workouts logged.', 'workouts', 16, []],
    [4, 'tennis', 'Play 3 practice matches or sets', 'Against players at or above your level; results logged.', 'matches', 3, []],
    [4, 'social', 'Complete 16 social challenges', '16 challenges completed.', 'challenges', 16, []],
    [4, 'discipline', 'Bedtime target on 22 nights', '22 nights on target.', 'sleepNights', 22, []],
    [5, 'business', 'First $500 month', '$500+ earned in a calendar month from business or work (trading gains excluded).', 'income', 500, []],
    [5, 'fitness', 'Freestanding handstand 5s + tuck L-sit 15s', 'Both skills logged.', null, 0, []],
    [5, 'tennis', 'Log 12 sessions', '12 sessions logged.', 'tennis', 12, []],
    [5, 'social', 'Invite someone to do something', 'A specific invite (coffee, game, event), whatever the answer.', null, 0, []],
    [5, 'discipline', 'Average 75% daily completion', '75%+ average.', 'avgCompletion', 75, []],
    [6, 'business', 'Midyear business review', 'Decide keep / kill / double down for each project, written down.', null, 0, ['Review income trend', 'Review hours per project', 'Write decisions']],
    [6, 'fitness', 'Midyear physique check', 'New photos, measurements and weight trend compared to day 1.', null, 0, ['Photos', 'Measurements', 'Compare to day 1']],
    [6, 'tennis', 'Midyear skill assessment', 'Assessment logged and compared with baseline.', null, 0, []],
    [6, 'social', 'Midyear social reflection', 'Write what feels easier now and what is still hard.', null, 0, []],
    [6, 'discipline', 'Rebuild your routine from 6 months of data', 'Use Insights to keep what works and cut what does not.', null, 0, []],
    [7, 'business', 'Reach $1,500 in a month', '$1,500+ income in one calendar month.', 'income', 1500, []],
    [7, 'fitness', 'Complete 18 gym sessions', '18 workouts logged.', 'workouts', 18, []],
    [7, 'tennis', 'Play 4 matches or sets', '4 logged.', 'matches', 4, []],
    [7, 'social', 'Complete 18 social challenges', '18 challenges.', 'challenges', 18, []],
    [7, 'discipline', 'Bedtime target on 24 nights', '24 nights.', 'sleepNights', 24, []],
    [8, 'business', 'Launch a second title or major update', 'Published and live for players.', null, 0, []],
    [8, 'fitness', '10 strict pull-ups + wall HSPU negatives', 'Both logged in skill trees.', null, 0, []],
    [8, 'tennis', 'Log 14 sessions', '14 sessions.', 'tennis', 14, []],
    [8, 'social', 'Organize a group hangout', 'You made the plan and invited people.', null, 0, []],
    [8, 'discipline', 'Average 80% daily completion', '80%+ average.', 'avgCompletion', 80, []],
    [9, 'business', 'Reach $3,500 in a month', '$3,500+ income in one calendar month.', 'income', 3500, []],
    [9, 'fitness', 'Complete 18 gym sessions', '18 workouts.', 'workouts', 18, []],
    [9, 'tennis', 'Enter a league, ladder or tournament', 'Signed up and played.', null, 0, []],
    [9, 'social', 'Complete 18 social challenges', '18 challenges.', 'challenges', 18, []],
    [9, 'discipline', 'Complete 4 weekly reviews', '4 reviews.', 'reviews', 4, []],
    [10, 'business', 'Reach $6,000 in a month', '$6,000+ in one calendar month.', 'income', 6000, []],
    [10, 'fitness', 'Advanced tuck front lever 10s', 'Logged in skill tree.', null, 0, []],
    [10, 'tennis', 'Play 6 matches or sets', '6 logged.', 'matches', 6, []],
    [10, 'social', 'A 20-minute conversation with someone new feels comfortable', 'Your own honest call, written in the notes.', null, 0, []],
    [10, 'discipline', 'Bedtime target on 25 nights', '25 nights.', 'sleepNights', 25, []],
    [11, 'business', 'Reach $8,000 in a month', '$8,000+ in one calendar month.', 'income', 8000, []],
    [11, 'fitness', 'Complete 20 gym sessions', '20 workouts.', 'workouts', 20, []],
    [11, 'tennis', 'Log 16 sessions', '16 sessions.', 'tennis', 16, []],
    [11, 'social', 'Complete 20 social challenges', '20 challenges.', 'challenges', 20, []],
    [11, 'discipline', 'Average 80% daily completion', '80%+ average.', 'avgCompletion', 80, []],
    [12, 'business', 'Hit $10,000 in a month', '$10,000+ in one calendar month from business/work income. Unrealized or trading gains do not count.', 'income', 10000, []],
    [12, 'fitness', 'Final measurements & photos vs. day 1', 'Side-by-side comparison saved.', null, 0, []],
    [12, 'tennis', 'Final skill assessment vs. baseline', 'Logged and compared.', null, 0, []],
    [12, 'social', 'Write your social growth story', 'What changed in a year, in your own words.', null, 0, []],
    [12, 'discipline', 'Plan year two', 'Goals and routine for the next year written down.', null, 0, []]
  ];
  A.defaultMilestones = function () {
    return M.map(([ch, cat, title, criteria, metric, target, tasks]) => ({
      id: 'm' + ch + cat, ch, cat, title, criteria, metric, target,
      due: A.chapters[ch - 1].end, manualPct: 0, status: 'auto', done: false, doneOn: null,
      tasks: tasks.map((t) => ({ id: A.uid(), t, done: false })), notes: '', evidence: '', adjusted: []
    }));
  };
  A.defaultYearGoals = function () {
    return [
      { id: 'g_income', cat: 'business', title: '$10,000 / month income', auto: 'income', target: 10000, unit: '$' },
      { id: 'g_weight', cat: 'fitness', title: 'Healthy bodyweight gain to goal', auto: 'weight', target: null, unit: 'lb' },
      { id: 'g_pullups', cat: 'fitness', title: '15 strict pull-ups', auto: null, current: 2, target: 15, unit: 'reps' },
      { id: 'g_hs', cat: 'fitness', title: 'Freestanding handstand 30 s', auto: null, current: 0, target: 30, unit: 's' },
      { id: 'g_tennis', cat: 'tennis', title: 'Average skill rating 8/10', auto: 'tennisAvg', target: 8, unit: '/10' },
      { id: 'g_social', cat: 'social', title: 'Complete all 5 challenge levels', auto: 'socialLevel', target: 5, unit: 'levels' },
      { id: 'g_disc', cat: 'discipline', title: '80% routine adherence for the year', auto: 'adherence', target: 80, unit: '%' }
    ];
  };

  // ---------- Appearance ----------
  A.DEFAULT_APPEARANCE = {
    am: ['Gentle cleanser', 'Moisturizer', 'Sunscreen SPF 30+'],
    pm: ['Cleanser', 'Moisturizer', 'Lip balm'],
    grooming: [['Haircut', 21], ['Shave / beard trim', 3], ['Nails', 7], ['Eyebrow cleanup', 14]]
  };

  // ---------- Badges ----------
  A.BADGES = [
    { id: 'first', i: '✨', n: 'First Step', d: 'Complete your first task' },
    { id: 'perfect', i: '💎', n: 'Perfect Day', d: 'Complete 100% of a day' },
    { id: 'streak7', i: '🔥', n: 'One Week', d: '7-day streak' },
    { id: 'streak30', i: '☄️', n: 'Unbroken Month', d: '30-day streak' },
    { id: 'streak100', i: '🌋', n: 'Century', d: '100-day streak' },
    { id: 'comeback', i: '🔁', n: 'Comeback', d: 'Hit your target the day after a miss' },
    { id: 'wo1', i: '🏋️', n: 'First Lift', d: 'Check off your first workout' },
    { id: 'wo25', i: '🦾', n: 'Iron Habit', d: '25 workouts' },
    { id: 'wo100', i: '🗿', n: 'Built Different', d: '100 workouts' },
    { id: 'skill', i: '🤸', n: 'Skill Unlocked', d: 'Reach a new calisthenics level' },
    { id: 'tennis10', i: '🎾', n: 'On Court', d: '10 tennis sessions' },
    { id: 'win', i: '🏅', n: 'Match Win', d: 'Log a match win' },
    { id: 'sleep7', i: '🌙', n: 'Sleep Guardian', d: '7 nights on target' },
    { id: 'early', i: '🌅', n: 'Early Riser', d: 'Wake on time 5 days' },
    { id: 'deep10', i: '🧠', n: 'Deep Worker', d: '10 focused hours' },
    { id: 'deep100', i: '⚙️', n: 'Builder', d: '100 focused hours' },
    { id: 'income1', i: '💵', n: 'First Dollar', d: 'Log your first income' },
    { id: 'sim1', i: '💬', n: 'First Words', d: 'Finish a practice conversation' },
    { id: 'chal10', i: '🗣️', n: 'Out There', d: '10 real-world social challenges' },
    { id: 'social3', i: '🌟', n: 'Connector', d: 'Reach social level 3' },
    { id: 'review4', i: '🧭', n: 'Navigator', d: '4 weekly reviews' },
    { id: 'milestone', i: '🎯', n: 'Milestone', d: 'Complete a roadmap milestone' },
    { id: 'chapter', i: '📖', n: 'Chapter Closed', d: 'Complete every milestone in a chapter' },
    { id: 'level10', i: '⚡', n: 'Level 10', d: 'Reach level 10' },
    { id: 'level25', i: '👑', n: 'Level 25', d: 'Reach level 25' }
  ];
})(window.A);
