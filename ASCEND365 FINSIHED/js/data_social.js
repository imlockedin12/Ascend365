/* ASCEND 365 — Social Intelligence content: scenarios, lessons, challenge ladder */
(function (A) {
  'use strict';
  const tp = (k, label, kw, lines, ask, follow) => ({ k, label, kw, lines, ask, follow });

  A.SCENARIOS = [
    { id: 'party', title: 'Friend-of-a-friend at a party', icon: '🎉', diff: 'Easy', name: 'Jordan', pr: 'she',
      setting: "You're in the kitchen at a friend's party. Jordan is refilling her drink next to you. You've never met. You start.",
      goal: 'Get past small talk into something she actually cares about.', start: 50, thr: 68,
      greet: ['Hey! Are you here for the chips too?', "Hi! Sorry, I'm hogging the drinks."],
      howareyou: "Pretty good! A little tired honestly — I was up early ", whatdo: "I work at a design studio downtown, mostly making packaging for snack brands. Weirdly fun.", from: "I grew up here, but I just got back from a week in Colorado.",
      topics: [
        tp('colorado', 'her Colorado trip', ['colorado', 'trip', 'travel', 'mountain', 'hike', 'hiking', 'ski', 'snow', 'denver', 'vacation', 'lake', 'feet', 'pancake', 'diner', 'altitude'], ["I just got back from Colorado. We hiked up to this lake at like 11,000 feet and I thought I was going to die.", "The best part was the town at the bottom — tiny diner, best pancakes of my life. I'm already planning to go back."], 'Do you travel much?', 'Wait, 11,000 feet? What made you want to do that hike?'),
        tp('design', 'her design job', ['design', 'designer', 'studio', 'packaging', 'art', 'draw', 'job', 'work', 'brand', 'freelance', 'chip', 'bag', 'client'], ["I design packaging. Next time you see a weird-looking chip bag, there's a chance it was me.", "I'm actually trying to go freelance next year. Terrifying, but I want to pick my own projects."], 'What do you do?', "What's the hardest part about going freelance?"),
        tp('dog', 'her dog', ['dog', 'puppy', 'pet', 'rescue', 'biscuit', 'cat', 'couch'], ["I have a rescue dog named Biscuit who thinks he's a cat.", "He sits on the back of the couch like a cat and judges everyone who walks by. I'm convinced he's an old man inside."], 'Do you have any pets?', 'How did you end up with Biscuit?'),
        tp('cooking', 'the guac she made', ['guac', 'guacamole', 'cook', 'cooking', 'food', 'recipe', 'chips', 'make', 'made', 'lime', 'secret', 'roommate'], ["Fun fact, I made that guac. I'm very proud of it.", "The secret is way more lime than you think. My roommate says it's a crime."], 'Do you cook at all?', 'Okay what is the secret to the guac?'),
        tp('host', 'how she knows the host', ['know', 'friend', 'host', 'party', 'here', 'meet', 'met', 'pottery', 'class', 'bowl', 'sam'], ["I know Sam from a pottery class, of all things. We were the two worst people in it.", "Neither of us ever made a usable bowl. We just bonded over failing."], 'How do you know Sam?', 'Wait, pottery class? How bad are we talking?')
      ],
      accept: ["Yeah, I'd like that! Here, put your number in my phone.", "Ha, okay — yes. Give me your number."],
      decline: ["Ha, maybe! I don't really know you yet though.", "Oh — I mean, we just met. Let's see."],
      close: { warm: "I should go find my friends, but this was really fun. Come say hi again later.", mid: "I'm gonna go find my friend. Nice meeting you!", cold: "Okay, I'm gonna go mingle. See you." },
      cold: ['Yeah.', 'Mhm.', 'Ha. Yeah.'] },

    { id: 'crush', title: 'Talking to the girl you like', icon: '💬', diff: 'Medium', name: 'Ava', pr: 'she',
      setting: "Ava is in a weekly group you're both part of. You've chatted a few times. It's the end of the meeting and she's packing up near you. You start.",
      goal: 'Keep it flowing naturally, and if it feels mutual, invite her to something specific.', start: 55, thr: 70,
      greet: ['Oh hey! How was your week?', 'Hey you. Survive the meeting?'],
      howareyou: "Good! Busy though — ", whatdo: "Mostly school and work, and I've been painting a lot lately when I can.", from: "Here — I've lived in this city my whole life.",
      topics: [
        tp('concert', 'the concert she\'s going to', ['concert', 'show', 'music', 'band', 'tickets', 'saturday', 'weekend', 'listen', 'song', 'album', 'indie', 'tickets'], ["I'm going to a concert this weekend — this indie band I've loved since high school. I got tickets the day they dropped.", "I'm going with my sister. We've been playing their album on repeat in the car to prepare like it's an exam."], "What kind of music are you into?", 'Who are they? What should I listen to first?'),
        tp('painting', 'her painting', ['paint', 'painting', 'art', 'canvas', 'draw', 'drawing', 'watercolor', 'creative', 'lemon', 'watercolor'], ["I've been painting a lot lately. Mostly watercolors, mostly bad.", "I'm doing one tiny painting a day this month. Some days it's just a lemon. Lots of lemons."], 'Do you do anything creative?', 'Why lemons? Is there a lemon story?'),
        tp('sister', "her sister's wedding", ['sister', 'wedding', 'family', 'bridesmaid', 'married', 'speech', 'maid', 'honor', 'spring'], ["My sister's getting married in the spring and I'm the maid of honor, so I've been planning like a full-time job.", "I have to give a speech and I'm already stressed. I'm a terrible public speaker."], 'Do you have siblings?', 'Oh no, the speech — what are you thinking of saying?'),
        tp('baking', 'her baking', ['bake', 'baking', 'bread', 'cookies', 'sourdough', 'cake', 'oven', 'cooking', 'brick', 'doorstop', 'dad'], ["I tried making sourdough last weekend. It came out like a brick.", "My dad used it as a doorstop. I'm not giving up though."], 'Do you cook?', 'A doorstop! What went wrong?'),
        tp('hike', 'the trail she wants to try', ['hike', 'hiking', 'trail', 'outside', 'outdoors', 'walk', 'park', 'nature', 'waterfall', 'early', 'morning', 'crowd'], ["There's a trail outside the city with a waterfall I keep meaning to do.", "Everyone says go early before it gets crowded, which is the problem because I am not a morning person."], 'Do you like being outdoors?', 'Where is it? How long is the hike?')
      ],
      accept: ["I'd really like that. Saturday afternoon?", "Yeah! That sounds fun. Text me so we can figure out when."],
      decline: ["Aw, I'm pretty swamped right now, but maybe another time!", "Hmm, this week's crazy for me. Maybe!"],
      close: { warm: "I have to run, but I'm glad we talked. See you next week?", mid: "I gotta head out — see you next week!", cold: "Okay, I've got to go. Bye!" },
      cold: ['Ha, yeah.', 'Yeah, totally.', 'Mm.'] },

    { id: 'silence', title: 'Rescue an awkward silence', icon: '🫥', diff: 'Hard', name: 'Leo', pr: 'he',
      setting: "You're at a cookout. You've been talking with Leo, a friend-of-a-friend, for a minute and it's gone quiet. He's giving short answers. Restart it without forcing it.",
      goal: 'Recover the conversation with open questions, a short story, or a callback.', start: 32, thr: 70,
      greet: ['Hey.', 'Oh, hey.'],
      howareyou: "Not bad. Long week. ", whatdo: "I do IT stuff for a hospital. Fixing printers, mostly. Glamorous.", from: "Born here, lived in Phoenix for a few years, came back.",
      topics: [
        tp('pc', 'his PC building', ['computer', 'pc', 'build', 'gaming', 'game', 'games', 'gpu', 'tech', 'nerd', 'setup', 'rgb', 'lights', 'cable', 'girlfriend'], ["I build PCs on the side. Just finished one with way too many RGB lights.", "Honestly it's half the fun. I spent more time on cable management than gaming. My girlfriend thinks it's insane."], 'Are you into games or tech at all?', 'How many RGB lights is "too many"?'),
        tp('phoenix', 'living in Phoenix', ['phoenix', 'arizona', 'heat', 'hot', 'desert', 'moved', 'live', 'lived', 'steering', 'degrees'], ["I lived in Phoenix for three years. 115 degrees is not a vibe.", "My car's steering wheel burned my hand once. That was the day I decided to move back."], 'Have you ever lived anywhere else?', 'Okay, what was the breaking point with Phoenix?'),
        tp('grill', 'the grill', ['grill', 'burger', 'burgers', 'food', 'bbq', 'barbecue', 'cook', 'meat', 'hot dog', 'brisket', 'smoke', 'smoked', 'disaster'], ["I'm actually the one who brought the grill. It's my baby.", "I've been trying to smoke a brisket for a year. Every attempt is a different disaster."], 'Do you grill?', 'Brisket disasters — what happened on the worst one?'),
        tp('basketball', 'his rec league', ['basketball', 'ball', 'hoops', 'league', 'sports', 'sport', 'play', 'gym', 'tuesday', 'team', 'position', 'rec'], ["I play in a Tuesday night rec league. We're 0 and 6.", "We're terrible, but the team dinner after is the best part of my week."], 'You play any sports?', '0 and 6! What position do you play?'),
        tp('car', 'his ridiculous car', ['car', 'drive', 'truck', 'road', 'trip', 'driving', 'civic', 'door', 'miles', 'gentleman'], ["I drive a 2004 Civic with 280,000 miles. It refuses to die.", "The passenger door only opens from the inside. People think I'm being a gentleman. I'm not, it's broken."], 'What do you drive?', 'How has it not died?')
      ],
      accept: ["Ha, yeah man, I'm down. Tuesday league needs subs anyway.", "Sure, I'd be into that."],
      decline: ["Eh, maybe. We'll see.", "Ha, maybe sometime."],
      close: { warm: "Alright, I gotta check the grill. Good talking, man.", mid: "I'm gonna grab another plate. Later.", cold: "Yeah. I'm gonna go grab food." },
      cold: ['Yeah.', 'Cool.', 'Hm.', 'True.'] },

    { id: 'coffee', title: 'Small talk in a coffee line', icon: '☕', diff: 'Easy', name: 'Maya', pr: 'she',
      setting: "You're in a slow-moving coffee line. Maya, in front of you, just sighed at how long it's taking. Strangers, low stakes. You start.",
      goal: 'Practice a natural opener from shared context and keep it going for a few exchanges.', start: 42, thr: 75,
      greet: ['Oh, hi.', 'Hey.'],
      howareyou: "Good, just impatient. ", whatdo: "I'm a nurse. Night shifts, hence the caffeine emergency.", from: "I moved here from Chicago about a year ago.",
      topics: [
        tp('line', 'the slow line', ['line', 'slow', 'wait', 'waiting', 'long', 'busy', 'forever', 'coffee', 'order', 'drink', 'latte', 'home', 'usual'], ["This line is moving at like one person per hour.", "Every single time I come here I swear I'll make coffee at home, and every single time I'm back."], 'What do you usually get?', "What's your order? Is it worth the wait?"),
        tp('nurse', 'her nursing night shifts', ['nurse', 'nursing', 'hospital', 'shift', 'shifts', 'night', 'work', 'tired', 'sleep', 'vibes', 'zone'], ["I just got off a 12-hour night shift. I'm running on vibes.", "Nights are weird — you basically live in a different time zone from everyone you know."], 'What do you do?', 'How do you even sleep after a night shift?'),
        tp('chicago', 'moving from Chicago', ['chicago', 'moved', 'move', 'new', 'city', 'winter', 'snow', 'from', 'lake', 'wind'], ["I moved here from Chicago last year. Still not used to winters without snow.", "I miss the lake and the food. I don't miss the wind trying to kill me."], 'Are you from here?', "What do you miss most about Chicago?"),
        tp('running', 'her half marathon', ['run', 'running', 'race', 'marathon', 'half', 'train', 'training', 'miles', 'march', 'motivat', 'long'], ["I'm training for my first half marathon, which is why I need this coffee.", "My long run this week was 10 miles and I was mad the entire time. The race is in March."], 'Do you work out?', 'First half! How do you stay motivated on a 10-mile run?')
      ],
      accept: ["Ha, sure, I'm here most mornings anyway.", "Yeah, okay! I'm always looking for people to explore with."],
      decline: ["Ha, I think I'm just going to grab my coffee, but nice chatting!", "Oh, that's nice of you, but I'm good. Nice talking though!"],
      close: { warm: "That's me! Nice talking to you — good luck with your day.", mid: "Oh, finally, my turn. Nice chatting!", cold: "That's me. Bye." },
      cold: ['Yeah.', 'Haha. Yeah.', 'Mhm.'] },

    { id: 'gym', title: 'Talking to a regular at the gym', icon: '🏋️', diff: 'Medium', name: 'Chris', pr: 'he',
      setting: "Chris is a strong regular at your gym who you see most mornings. He's resting between sets near the squat rack you're waiting on. You start.",
      goal: 'Start a conversation with someone more experienced and learn something without being awkward.', start: 45, thr: 70,
      greet: ['Hey man.', "What's up."],
      howareyou: "Good. Legs day, so mentally preparing. ", whatdo: "I'm an electrician. Gym's basically my morning coffee.", from: "From around here.",
      topics: [
        tp('meet', 'his powerlifting meet', ['meet', 'powerlifting', 'compete', 'competition', 'squat', 'deadlift', 'bench', 'strong', 'lift', 'lifting', 'heavy', '500', 'pound', 'pounds', 'weeks', 'goal'], ["I've got a powerlifting meet in eight weeks. First one in three years.", "My goal is a 500-pound squat. I'm at 465 right now, so it's going to be close."], 'You ever think about competing?', 'Eight weeks out — how do you plan your training for that?'),
        tp('injury', 'his comeback from injury', ['injury', 'hurt', 'back', 'knee', 'shoulder', 'pain', 'comeback', 'rehab', 'injured', 'pec', 'ego', 'warm'], ["I tore my pec a few years back doing something dumb, so I'm careful now.", "Honestly the injury made me way better. I learned to actually warm up and stop ego lifting."], 'How long have you been lifting?', 'What did coming back from that teach you?'),
        tp('food', 'eating to gain', ['eat', 'eating', 'food', 'protein', 'diet', 'bulk', 'gain', 'weight', 'calories', 'skinny', 'milk', 'meals', 'gallon'], ["Honestly the gym is the easy part. Eating enough is the job.", "When I was trying to put on size I ate four real meals a day and kept a gallon of milk at work. Not glamorous, but it worked."], 'You trying to put on size?', 'What did a normal day of eating look like for you?'),
        tp('start', 'how he started', ['start', 'started', 'begin', 'beginner', 'first', 'new', 'learn', 'program', 'routine', 'program', 'year', 'soaking'], ["I started at like 150 pounds soaking wet. Couldn't bench the bar for reps.", "Picked one simple program and ran it for a year. People jump around too much."], 'How long have you been coming here?', 'What program did you run that first year?')
      ],
      accept: ["Yeah, I'm here at six most days. Jump in with me Thursday, I'll show you.", "Sure man. Grab me next time you see me."],
      decline: ["Ha, I kind of train alone, but ask me anything anytime.", "Eh, I'm locked in for this meet, but I'm always around."],
      close: { warm: "Alright, back to it. Good talking, see you tomorrow.", mid: "Alright, got a set to do. Later.", cold: "Yeah. Gotta get back to it." },
      cold: ['Yep.', 'Cool.', 'Yeah, man.'] },

    { id: 'group', title: 'Joining a group conversation', icon: '👥', diff: 'Hard', name: 'Priya', pr: 'she',
      setting: "At a social event, three people are laughing about a movie. You know nobody. Priya glances over and makes room. Join in naturally.",
      goal: 'Enter a group without hijacking it, contribute, and become part of the conversation.', start: 40, thr: 72,
      greet: ['Hey! Come join, we need a tiebreaker.', 'Oh hi! We\'re arguing about a movie.'],
      howareyou: "Good! Though I'm losing an argument right now. ", whatdo: "I teach high school chemistry. So I'm used to being ignored, ha.", from: "Originally from Toronto.",
      topics: [
        tp('movie', 'the movie argument', ['movie', 'film', 'watch', 'watched', 'ending', 'seen', 'theater', 'cinema', 'tiebreaker', 'argument', 'arguing', 'space', 'twist', 'simulation', 'genius', 'lazy', 'cop'], ["We're arguing about whether the ending of that space movie was genius or lazy. I say genius. I'm alone.", "The twist is that the whole thing was a simulation, and these two think that's a cop-out. Help me."], 'Have you seen it?', 'Okay, make your case — why was it genius?'),
        tp('teaching', 'teaching chemistry', ['teach', 'teacher', 'teaching', 'chemistry', 'school', 'students', 'science', 'class', 'kid', 'kids', 'credit', 'chem'], ["I teach chem. Last week a kid asked if he could get extra credit for not blowing anything up.", "The best part is when a kid who hates science suddenly gets it. That's why I do it."], 'What do you do?', "What's the funniest thing a student has done?"),
        tp('toronto', 'Toronto', ['toronto', 'canada', 'canadian', 'moved', 'from', 'hockey', 'polite', 'grad', 'winters'], ["I'm from Toronto. Yes, I'm polite. No, I don't play hockey.", "I came down for grad school and just kind of stayed. The winters here feel like cheating."], 'Where are you from?', 'What made you stay after grad school?'),
        tp('trivia', 'their trivia team', ['trivia', 'team', 'quiz', 'bar', 'night', 'thursday', 'game', 'win', 'third', 'cup', 'category'], ["Actually, the three of us have a trivia team. We're very mid.", "We came in third last week and acted like we won the World Cup."], 'You ever do trivia?', "What's your team's weak category?")
      ],
      accept: ["Yes! We need someone who knows sports. Thursday, 7pm.", "Oh, you should totally come! We play Thursdays."],
      decline: ["Ha, maybe! We're kind of a closed team right now, but come say hi.", "Aw, maybe sometime!"],
      close: { warm: "Okay, we're getting food — you should come with us!", mid: "We're gonna grab food. Nice meeting you!", cold: "Anyway — nice meeting you." },
      cold: ['Ha, yeah.', 'Totally.', 'Mm, yeah.'] }
  ];

  A.LESSONS = [
    { id: 'l1', title: 'Starting conversations', mins: 4, icon: '👋', cards: [
      ['The secret: there is no perfect opener', "People remember how a conversation felt, not your first line. A simple, friendly opener plus genuine curiosity beats any clever line."],
      ['Use the shared situation', "Comment on something you're both experiencing, then ask about it. “This line is not moving. Is it always this slow?” It feels natural because it is natural."],
      ['Statement + question', "A good opener is often an observation plus an easy question. It gives them something to react to and an easy way in."],
      ['Low stakes, light energy', "Smile, relaxed tone, short. If they give a short answer and turn away, that's fine — it's information, not rejection of you."]],
      practice: { prompt: "You're both waiting for a delayed train on a platform. Type what you'd say to start a conversation.", hooks: ['train', 'late', 'delay', 'delayed', 'wait', 'waiting', 'platform', 'commute', 'again'], checks: ['context', 'question', 'short'] } },
    { id: 'l2', title: 'Keeping it flowing', mins: 5, icon: '🌊', cards: [
      ['Share, then ask', "Conversations die in two ways: interview mode (question after question) or monologue mode. Alternate: a bit about you, then a question back."],
      ['Pick up a thread', "Every answer contains hooks — details you can follow. “I've been learning to cook, mostly Thai food” has three: learning, cooking, Thai food."],
      ['Go one level deeper', "Instead of jumping to a new topic, ask about the why or the feeling. “What got you into Thai food?” beats “Cool. Do you like movies?”"],
      ['Free information', "Volunteer small details about yourself. They give the other person hooks to grab, so the work is shared."]],
      practice: { prompt: "They say: “I've been learning to cook lately, mostly Thai food.” Type your reply.", hooks: ['cook', 'cooking', 'thai', 'food', 'learn', 'learning', 'recipe', 'curry', 'spicy', 'dish'], checks: ['hook', 'open', 'share'] } },
    { id: 'l3', title: 'Follow-up questions & listening', mins: 5, icon: '👂', cards: [
      ['Listen for the emotional word', "When someone says “I almost quit my job,” the interesting part isn't the job — it's the almost. Ask about that."],
      ['Open questions', "What, how and why invite stories. Do, did and are invite yes or no. “How did you decide to stay?” vs “Did you like it?”"],
      ['Reflect before you ask', "Briefly put what they said in your own words: “So you were one email away from leaving?” It shows you were actually listening."],
      ["Don't hijack", "Resist jumping to your own similar story right away. Stay on their thread for one or two more exchanges first."]],
      practice: { prompt: "They say: “I almost quit my job last month, but I decided to stay.” Type your reply.", hooks: ['quit', 'job', 'stay', 'stayed', 'almost', 'decide', 'decided', 'leave', 'work', 'month'], checks: ['hook', 'open', 'nohijack'] } },
    { id: 'l4', title: 'Telling short stories', mins: 5, icon: '📖', cards: [
      ['Keep it under 45 seconds', "Setup → something goes wrong or surprises you → how it ended or how you felt. That's it."],
      ['Specific details make it real', "“A guy in a full suit was doing pull-ups at 6 a.m.” beats “I saw something funny at the gym.”"],
      ['Feelings over facts', "“I was so nervous I forgot my own name” is more engaging than a timeline of events."],
      ['Hand it back', "End with something that invites them in: “Has that ever happened to you?”"]],
      practice: { prompt: "Tell a short story (3–5 sentences) about something funny, unexpected or embarrassing from this week.", hooks: [], checks: ['story', 'share'] } },
    { id: 'l5', title: 'Handling awkward silence', mins: 4, icon: '🤫', cards: [
      ['Silence is normal', "A 3–5 second pause feels long to you and normal to them. Don't panic-fill it with nothing."],
      ['Callback', "Go back to something they said earlier: “Wait, you said you're training for a half marathon — how's that going?” It shows you listened."],
      ['Observe out loud', "Comment on something around you. The environment is always a free topic."],
      ['Open question reset', "“What's been the best part of your week?” works almost anywhere."]],
      practice: { prompt: "Earlier they mentioned planning a weekend camping trip. The conversation has gone quiet. Restart it.", hooks: ['camp', 'camping', 'trip', 'weekend', 'tent', 'outdoors', 'hike', 'plans', 'going'], checks: ['hook', 'open'] } },
    { id: 'l6', title: 'Reading social cues', mins: 4, icon: '👀', cards: [
      ['Interest signals', "They ask you questions back, give longer answers, turn toward you, laugh, add details, stay when they could leave."],
      ['Disinterest signals', "One-word answers, looking around or at their phone, body angled away, no questions back."],
      ['Respond to what you see', "If cues are good, go deeper. If cues are low, try one good open question; if it stays low, wrap up warmly."],
      ['Leaving well is a skill', "“I'll let you get back to it — nice talking to you!” A graceful exit leaves a good impression, and nobody can read minds perfectly anyway."]],
      practice: { prompt: "They've given three one-word answers and keep checking their phone. Type what you'd say.", hooks: [], checks: ['graceful', 'nopressure'] } },
    { id: 'l7', title: 'Flirting respectfully', mins: 5, icon: '✨', cards: [
      ['Flirting = showing interest + playfulness', "It's warmth, light teasing about situations (never insecurities), and letting someone know you like talking to them."],
      ['Compliment choices, not bodies', "Compliment things people chose: their style, their laugh, their taste, how they talk about something they love. Specific beats generic."],
      ['Match their energy', "If they flirt back, great. If they don't, keep it friendly. Interest has to be mutual, so you watch for it rather than push for it."],
      ['No tricks', "No scripts, negging, or games. Honest interest is more attractive than any technique."]],
      practice: { prompt: "You've been talking easily for 10 minutes with someone you like. They just told you passionately about a band they love. Give a genuine, specific compliment.", hooks: ['band', 'music', 'passion', 'passionate', 'taste', 'talk', 'light', 'excited', 'love'], checks: ['compliment', 'respect'] } },
    { id: 'l8', title: 'Asking someone out', mins: 5, icon: '📅', cards: [
      ['Be direct and specific', "“We should hang out sometime” is easy to dodge and easy to forget. “There's a trivia night Thursday — want to come with me?” is clear."],
      ['Tie it to the conversation', "Invite them to something connected to what you talked about. It feels natural, not random."],
      ['Make saying no easy', "Low pressure is attractive. “No worries if not!” gives them real freedom."],
      ['Take no gracefully', "“No worries, it was great talking to you” — and mean it. That's respect, and it's also how you keep your confidence."]],
      practice: { prompt: "You've had a great conversation about a coffee place they've wanted to try. Ask them to go with you.", hooks: ['coffee', 'cafe', 'place', 'try', 'spot'], checks: ['invite', 'specific', 'nopressure'] } }
  ];

  A.CHALLENGES = [
    { lv: 1, name: 'Presence', items: ['Say good morning to 3 people today', 'Make eye contact and smile at 5 people', 'Ask a cashier or barista how their day is going — and listen', "Compliment someone's choice (shoes, book, jacket)", "Use someone's name when you greet them", 'Hold a 2-minute conversation with someone you already know', 'Keep your phone in your pocket for 30 min in a social setting', 'Notice 3 interest cues in someone during a conversation'] },
    { lv: 2, name: 'Curiosity', items: ['Ask one genuine follow-up question', 'Ask someone "What\'s been keeping you busy lately?"', 'Learn one new fact about a classmate or coworker', 'Paraphrase what someone said before replying', 'Ask someone for a recommendation (food, show, music)', 'Share a small personal opinion in a group', 'Tell someone something you appreciate about them', 'Get someone talking for 2+ minutes about something they love'] },
    { lv: 3, name: 'Initiative', items: ['Start a short conversation with someone new', 'Introduce yourself to someone in a group', 'Tell a short story in a conversation', 'Join an ongoing group conversation', 'Restart a conversation after a pause', 'Make a light, playful comment', 'Ask someone their opinion on something nearby', 'Remember and ask about something from a previous chat'] },
    { lv: 4, name: 'Connection', items: ['Have a 10-minute conversation with someone new', 'Share something slightly personal or vulnerable', 'Exchange contact info with someone', 'Text someone to follow up on a conversation', 'Give a sincere, specific compliment to someone you are interested in', 'Talk with someone you find attractive for 3+ minutes', 'Suggest a group hangout', 'Ask a deeper question ("What are you excited about lately?")'] },
    { lv: 5, name: 'Courage', items: ['Invite someone to do something specific', 'Ask someone on a date (coffee, an activity)', 'Plan and host a small hangout', 'Introduce two people who should know each other', 'Start a conversation at an event where you know no one', 'Stay comfortable through a silence instead of filling it', 'Handle a "no" gracefully and reflect on it', 'Lead a 20+ minute conversation that flows'] }
  ];
  A.CHALLENGE_UNLOCK = 6; // complete 6 of 8 to unlock the next level
})(window.A);
