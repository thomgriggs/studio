/* ========================================================================== */
/* KICKBALL — sport configs + seed teams                                      */
/* A sport is DATA, not code. The engine in kb.js reads one of these and       */
/* builds the ump screen, the buttons, the arithmetic and the game record.     */
/*                                                                            */
/* Shape (full description in HANDOFF.md → Sport config):                     */
/*   structure  how the game is divided and when it ends (innings or rounds)  */
/*   clock      (optional) real-time limits: minutes, officialAfter, capUntil */
/*   actions[]  the buttons: { id, label, kind, value?, size?, hit?, pa?,     */
/*              modeOnly? }  kind: reach|out|runner|halfEnd|bagIn|bagOn|…     */
/*   scoring    additive (runs add) | cancellation (per-round net, cornhole)   */
/*   rules      runCap, mercy (per mode), overtime (per mode)                 */
/*   team       what a captain manages: sizes, positions, coed rules          */
/*   record     linescore | rounds                                            */
/* ========================================================================== */
window.KB_SPORTS = {

	/* Tampa Bay Club Sport — Coed Self-Pitch Kickball. Source: the league's     */
	/* rules doc (linked from tampabayclubsport.com/sport/kickball), read       */
	/* 2026-09-30. Each field below cites the rule it encodes.                  */
	kickball: {
		id:'kickball', name:'Kickball', sides:{ away:'Away', home:'Home' },
		modes:{ season:'Regular season', playoffs:'Playoffs', championship:'Championship' },
		structure:{
			kind:'innings',
			outsPerHalf:4,                 /* "Each team gets four (4) outs per inning" */
			innings:null,                  /* no fixed count — the clock decides (see below) */
			tiesAllowed:{ season:true, playoffs:false, championship:false }
		},
		clock:{
			minutes:55,                    /* "Games are 55 minutes in length. The inning in progress at 55 is the last and completed" */
			officialAfter:30,              /* "official after 30 minutes of play" */
			capUntil:45                    /* run cap applies in the first 45 minutes */
		},
		/* "One pitch per kicker. A missed kick, foul ball, or a catch on the fly is an out." — so no count */
		actions:[
			{ id:'single',  label:'Single',   kind:'reach', value:1, size:'primary', hit:true },
			{ id:'double',  label:'Double',   kind:'reach', value:2, size:'primary', hit:true },
			{ id:'triple',  label:'Triple',   kind:'reach', value:3, size:'primary', hit:true },
			{ id:'homer',   label:'Home run', kind:'reach', value:4, size:'primary', hit:true },
			{ id:'out',     label:'Out',      kind:'out', note:'forced, tagged, or thrown' },
			{ id:'caught',  label:'Caught',   kind:'out', note:'catch on the fly' },
			{ id:'foul',    label:'Foul',     kind:'out', note:'a foul ball is an out' },
			{ id:'missed',  label:'Missed',   kind:'out', note:'missed kick' },
			{ id:'error',   label:'Reached on error', kind:'reach', value:1 },
			{ id:'fc',      label:'Fielder’s choice', kind:'reach', value:1, fc:true, note:'kicker safe at first; a forced runner is out' },
			{ id:'bunt',    label:'Man bunt', kind:'out', note:'men may not bunt — dead ball out', menOnly:true },
			{ id:'autoout', label:'Auto out', kind:'out', pa:false, note:'two men kicked consecutively — recorded between them' }
		],
		scoring:{ mode:'additive' },
		rules:{
			/* "Only 10 runs can be scored in an inning in the first 45 minutes. The 10th run is also the 4th out.
			   No 10-run rule in the last 10 minutes unless the kicking team is up by 20 or more." */
			runCap:{ runs:10, countsAsOut:true, lateLeadException:20 },
			/* "Regular season: no mercy rule. Playoffs: 20 after 3, 15 after 4, 10 after 5 (not the championship)." */
			mercy:{ season:null, playoffs:[{ after:3, diff:20 }, { after:4, diff:15 }, { after:5, diff:10 }], championship:null },
			/* "Overtime during playoffs with a runner on second (the one who made the last out)." */
			overtime:{ season:false, playoffs:{ runnerOnSecond:true }, championship:{ runnerOnSecond:true } },
			courtesyRunner:{ requestBeforeKick:true, maxBase:1, whoRuns:'lastOutSameGender', forRestOfGame:true }
		},
		team:{
			minPlayers:6,                  /* "at least 6 players (minimum one female) to start" */
			minWomen:1,
			positions:['Pitcher', 'Catcher', '1st Base', '2nd Base', '3rd Base', 'Left Short', 'Right Short', 'Left Field', 'Left Center', 'Right Center'],
			infield:['Pitcher', 'Catcher', '1st Base', '2nd Base', '3rd Base', 'Left Short', 'Right Short'],
			maxFielders:10,                /* "Maximum of 10 fielders with no more than 5 men" */
			maxMenOnField:5,
			maxInfielders:6,               /* "No more than 6 infielders, including the catcher" */
			coed:{ noBackToBackMen:true, autoOutBetween:true, splitSlots:true }, /* "two men may share one kicking spot and alternate" */
			bunting:{ women:true, men:false }
		},
		record:'linescore'
	},

	cornhole: {
		id:'cornhole', name:'Cornhole', sides:{ away:'Team A', home:'Team B' },
		modes:{ season:'Regular season', playoffs:'Playoffs' },
		structure:{ kind:'rounds', pointsToWin:21, winBy:1, bagsPerSide:4 },
		actions:[
			{ id:'bagIn', label:'In the hole', kind:'bagIn', value:3, size:'primary' },
			{ id:'bagOn', label:'On the board', kind:'bagOn', value:1 },
			{ id:'scoreRound', label:'Score round', kind:'scoreRound', size:'commit' }
		],
		scoring:{ mode:'cancellation' },       /* each round: net = A points − B points, only the leader scores */
		rules:{ bust:{ enabled:false, resetTo:15 } },
		record:'rounds'
	}
};

/* Seed teams — Liquid Breakfast Club is a team inside the structure, never "the app". */
/* Copied into storage on first run; edit in the app after that. `captain` is a  */
/* roster id; a roster entry may carry `freeAgent:true` (will fill in for a short  */
/* team) or `guest:true, guestFrom:<teamId>` (recruited for one game).            */
window.KB_SEED_TEAMS = [
	{ id:'lbc', name:'Liquid Breakfast Club', short:'LBC', sport:'kickball', captain:'jason-morton', roster:[
		{ id:'cristy-ceron', name:'Cristy Ceron', gender:'female' },
		{ id:'cheryl-donish', name:'Cheryl Donish', gender:'female' },
		{ id:'erin-forbes', name:'Erin Forbes', gender:'female' },
		{ id:'selene-griggs', name:'Selene Griggs', gender:'female' },
		{ id:'faith-kubicki', name:'Faith Kubicki', gender:'female' },
		{ id:'lorra-kubicki', name:'Lorra Kubicki', gender:'female' },
		{ id:'jessica-miller', name:'Jessica Miller', gender:'female' },
		{ id:'melissa-miller', name:'Melissa Miller', gender:'female' },
		{ id:'katie-morton', name:'Katie Morton', gender:'female' },
		{ id:'tamesha-bombicino', name:'Tamesha Bombicino', gender:'female' },
		{ id:'thom-griggs', name:'Thom Griggs', gender:'male' },
		{ id:'chris-bombicino', name:'Chris Bombicino', gender:'male' },
		{ id:'sean-fetter', name:'Sean Fetter', gender:'male' },
		{ id:'john-kubicki', name:'John Kubicki', gender:'male' },
		{ id:'nick-landowski', name:'Nick Landowski', gender:'male' },
		{ id:'jason-morton', name:'Jason Morton', gender:'male' },
		{ id:'corey-odonnell', name:"Corey O'Donnell", gender:'male' },
		{ id:'garrett-lacey', name:'Garrett Lacey', gender:'male' },
		{ id:'donald-sienkiewicz', name:'Donald Sienkiewicz', gender:'male' }
	] },
	/* two more teams so every role has something to look at — names are made up */
	{ id:'pitch-please', name:'Pitch Please', short:'PP', sport:'kickball', captain:'maya-ortiz', roster:[
		{ id:'maya-ortiz', name:'Maya Ortiz', gender:'female' },
		{ id:'jess-tran', name:'Jess Tran', gender:'female' },
		{ id:'kayla-brooks', name:'Kayla Brooks', gender:'female' },
		{ id:'nina-patel', name:'Nina Patel', gender:'female', freeAgent:true },
		{ id:'amber-cole', name:'Amber Cole', gender:'female' },
		{ id:'luis-ramos', name:'Luis Ramos', gender:'male' },
		{ id:'devin-hart', name:'Devin Hart', gender:'male', freeAgent:true },
		{ id:'marcus-lee', name:'Marcus Lee', gender:'male' },
		{ id:'tyler-nguyen', name:'Tyler Nguyen', gender:'male' },
		{ id:'owen-frost', name:'Owen Frost', gender:'male' },
		{ id:'raj-singh', name:'Raj Singh', gender:'male' }
	] },
	/* a Sunday team — Thom is on it too (same id), so the Player view has two rosters to filter */
	{ id:'sliders', name:'Sunday Sliders', short:'SUN', sport:'kickball', captain:'dana-reyes', roster:[
		{ id:'dana-reyes', name:'Dana Reyes', gender:'female' },
		{ id:'thom-griggs', name:'Thom Griggs', gender:'male' },
		{ id:'ivy-chen', name:'Ivy Chen', gender:'female' },
		{ id:'rosa-delgado', name:'Rosa Delgado', gender:'female' },
		{ id:'pat-murphy', name:'Pat Murphy', gender:'male' },
		{ id:'leo-santos', name:'Leo Santos', gender:'male' },
		{ id:'gwen-hale', name:'Gwen Hale', gender:'female' },
		{ id:'omar-baig', name:'Omar Baig', gender:'male' }
	] },
	{ id:'ball-busters', name:'Ball Busters', short:'BB', sport:'kickball', captain:'sam-rivera', roster:[
		{ id:'sam-rivera', name:'Sam Rivera', gender:'female' },
		{ id:'lena-wu', name:'Lena Wu', gender:'female' },
		{ id:'tori-adams', name:'Tori Adams', gender:'female' },
		{ id:'ben-carter', name:'Ben Carter', gender:'male' },
		{ id:'eli-moore', name:'Eli Moore', gender:'male' },
		{ id:'jake-fields', name:'Jake Fields', gender:'male', freeAgent:true },
		{ id:'noah-kim', name:'Noah Kim', gender:'male' }
	] }
];

/* Player profiles — what a person sets about themselves (settings on the Player view). */
/* Keyed by player id; a person keeps one profile across every roster they're on.   */
window.KB_ICONS = ['⚽','🦵','🔥','⚡','🌴','🦩','🐊','🌊','☀️','🍕','🎯','👑','🦁','🐂','🦅','😇'];
window.KB_SEED_PROFILES = {
	'thom-griggs': { icon:'🦩', nickname:'Thom', walkup:{ title:'', artist:'', url:'' }, freeAgent:'mine' }
};

/* Seed league — the structure the five roles live in. Copied into storage on   */
/* first run (and merged in when an older device has none).                     */
/*   teams      approval status per team id: 'approved' | 'pending' | 'declined' */
/*   umpires    who the league can assign                                        */
/*   schedule   games: who, when, which ump; `prep` holds a captain's pre-game   */
/*              lineup; `availability` is each player's in/out; `lead` is the    */
/*              captain's stand-in per team; `gameId`/`result` once it's played  */
/*   overrides  rule tweaks the league applies on top of KB_SPORTS[sport]        */
window.KB_SEED_LEAGUE = {
	id:'tbcs', name:'Tampa Bay Club Sport', sport:'kickball', season:'Fall 2026', seedVersion:4, /* bump to push new seed data onto phones that already have a league */
	umpires:[{ id:'ump-carl', name:'Carl' }, { id:'ump-bob', name:'Bob' }, { id:'ump-manny', name:'Manny' }],
	teams:{ 'lbc':'approved', 'pitch-please':'approved', 'sliders':'approved', 'ball-busters':'pending' },
	schedule:[
		{ id:'s1', date:'2026-10-08', time:'19:00', field:'Field 2', away:'pitch-please', home:'lbc', ump:'ump-carl', mode:'season', status:'scheduled', availability:{ 'thom-griggs':'in', 'selene-griggs':'in', 'sean-fetter':'out', 'maya-ortiz':'in' }, lead:{ lbc:'katie-morton' }, prep:null },
		{ id:'s2', date:'2026-10-15', time:'20:00', field:'Field 1', away:'lbc', home:'pitch-please', ump:null, mode:'season', status:'scheduled', availability:{}, lead:{}, prep:null },
		{ id:'s3', date:'2026-10-22', time:'19:00', field:'Field 2', away:'pitch-please', home:'lbc', ump:'ump-manny', mode:'season', status:'scheduled', availability:{}, lead:{}, prep:null },
		{ id:'s4', date:'2026-10-11', time:'16:00', field:'Field 3', away:'sliders', home:'pitch-please', ump:'ump-bob', mode:'season', status:'scheduled', availability:{}, lead:{}, prep:null },
		{ id:'s5', date:'2026-10-18', time:'16:00', field:'Field 3', away:'pitch-please', home:'sliders', ump:null, mode:'season', status:'scheduled', availability:{}, lead:{}, prep:null }
	],
	overrides:{}
};
