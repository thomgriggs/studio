/* ========================================================================== */
/* OPTIMUM RV CRM — mock data                                                 */
/* Every screen renders from this file. Shape:                                */
/*   CRM_DATA.roles[role].desks[desk] → { label, tabs, stages, leads }        */
/*   lead.thread[] entries: day | event | message | call | note | email | image */
/* Field names here are the names the developer will map API fields onto.    */
/* ========================================================================== */
window.CRM_DATA = (function () {

	const STAGES = {
		sales: [
			{ id:'assigned',   label:'Assigned' },
			{ id:'attempting', label:'Attempting' },
			{ id:'working',    label:'Working' },
			{ id:'agreed',     label:'Agreed' },
			{ id:'lost',       label:'Lost', terminal:true }
		],
		consign: [
			{ id:'assigned',   label:'Assigned' },
			{ id:'attempting', label:'Attempting' },
			{ id:'working',    label:'Working' },
			{ id:'documents',  label:'Documents' },
			{ id:'contract',   label:'Contract' },
			{ id:'processing', label:'Processing' },
			{ id:'lost',       label:'Lost', terminal:true }
		],
		backoffice: [
			{ id:'motility', label:'Added to Motility' },
			{ id:'checkin',  label:'Check-In Scheduled' },
			{ id:'arrived',  label:'Arrived On Lot' },
			{ id:'forsale',  label:'For Sale' },
			{ id:'deals',    label:'Deals' },
			{ id:'payout',   label:'Payout' }
		]
	};

	const IMG = { thor:'assets/unit-1.webp', redhawk:'assets/unit-2.webp', minnie:'assets/unit-1.webp' };

	/* ---------------------------------------------------------------------- */
	/* SALES desk — Riley Morgan, Ocala                                        */
	/* ---------------------------------------------------------------------- */
	const salesLeads = [
		{
			id:'tom-gallagher', name:'Tom Gallagher', initials:'TG', phone:'352-555-0190', email:'tom.g@example.com', location:'Ocala, FL',
			owner:'Sam Okafor', tabs:['new','working'], unread:'unread', time:'9:38 AM',
			preview:'New lead — Website · Get Lowest Price', pill:{ label:'3m left', status:'urgent', icon:'clock' },
			stage:'assigned', stageNote:'Assigned · 12m',
			summary:[
				{ kind:'unit', image:IMG.redhawk, title:'2020 Newmar Bay Star 3226', meta:'#5CR0812 · $118,000', status:[{ label:'Ready for sale', status:'ok' }] },
				{ kind:'icon', icon:'globe', tone:'info', title:'Website · Get Lowest Price', meta:'Lead form · 12 minutes ago', status:[{ label:'Respond within 15m', status:'urgent' }] }
			],
			textOptIn:false,
			thread:[
				{ type:'day', label:'Today', time:'9:26 AM' },
				{ type:'event', icon:'inbox', text:'Lead received — Website · Get Lowest Price' },
				{ type:'event', icon:'user', text:'Assigned to Sam Okafor' },
				{ type:'message', dir:'out', label:'Automated', labelIcon:'zap', text:'Hi Tom — Sam at Optimum RV Ocala. Thanks for asking about the 2020 Newmar Bay Star 3226. I\'ll follow up shortly with our best price — reply here anytime.' }
			]
		},
		{
			id:'priscilla-nguyen', name:'Priscilla Nguyen', initials:'PN', phone:'352-555-0163', email:'p.nguyen@example.com', location:'Ocala, FL',
			owner:'Sam Okafor', tabs:['new','working'], unread:'unread', time:'9:29 AM',
			preview:'Auto-reply sent — RVChat · Pre-Qualification', pill:{ label:'12m left', status:'info', icon:'clock' },
			stage:'assigned', stageNote:'Assigned · 9m',
			summary:[
				{ kind:'unit', image:IMG.redhawk, title:'2023 Jayco Redhawk 26XD', meta:'#5CR0797 · $74,900', status:[{ label:'Sale pending', status:'flagged' }] },
				{ kind:'icon', icon:'message-square', tone:'info', title:'RVChat · Pre-Qualification', meta:'Chat transcript attached', status:[{ label:'Auto-reply sent', status:'neutral' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'day', label:'Today', time:'9:29 AM' },
				{ type:'event', icon:'inbox', text:'Lead received — RVChat · Pre-Qualification' },
				{ type:'message', dir:'out', label:'Automated', labelIcon:'zap', text:'Hi Priscilla — thanks for chatting with us about the 2023 Redhawk 26XD. A salesperson will reach out within the hour.' }
			]
		},
		{
			id:'marcus-trent', name:'Marcus Trent', initials:'MT', phone:'352-555-0142', email:'m.trent@example.com', location:'Ocala, FL',
			owner:'Riley Morgan', tabs:['today','working'], unread:null, time:'9:12 AM',
			preview:'You: 1:30 works great — I\'ll have both parked up front.', pill:{ label:'1:30 PM', status:'appointment', icon:'calendar' },
			stage:'working', stageNote:'Working · 2d',
			summary:[
				{ kind:'unit', image:IMG.thor, star:true, title:'2022 Thor ACE 32.3', meta:'#5CR0801 · $89,900', status:[{ label:'Ready for sale', status:'ok' }] },
				{ kind:'unit', image:IMG.redhawk, title:'2023 Jayco Redhawk 26XD', meta:'#5CR0797 · $74,900', status:[{ label:'Sale pending', status:'flagged' }] },
				{ kind:'unit', svg:'rv-trailer', title:'2021 Micro Minnie 2306BHS', meta:'$11,400–$17,600', status:[{ label:'Trade-in', status:'dark' }] },
				{ kind:'icon', icon:'calendar', tone:'info', title:'Today · 1:30 PM', meta:'Ocala store', status:[{ label:'Confirmed', status:'confirmed' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'event', icon:'inbox', text:'Lead received — RVTrader.com · Get Lowest Price' },
				{ type:'message', dir:'out', label:'Automated', labelIcon:'zap', text:'Hi Marcus — Riley at Optimum RV Ocala. The 2022 Thor ACE 32.3 is on the lot and ready to see — want to set up a time this week?' },
				{ type:'call', title:'Outgoing call · 6:12', summary:'Connected — trade talk; wants the Redhawk compared' },
				{ type:'note', author:'Riley Morgan', text:'If the trade appraises at $18K+ he\'s ready to move this week.' },
				{ type:'day', label:'Yesterday', time:'4:12 PM' },
				{ type:'email', time:'Email · 4:12 PM', subject:'Redhawk 26XD comparison + payment options', preview:'Marcus — here\'s the side-by-side we talked about, plus two financing scenarios for the Thor.', opened:true },
				{ type:'image', src:IMG.minnie, caption:'Here\'s our Minnie — one owner, garage kept.' },
				{ type:'event', icon:'calendar', text:'Appointment set — Today 2:00 PM · Ocala store' },
				{ type:'day', label:'Today', time:'8:58 AM' },
				{ type:'message', dir:'in', text:'Running a little early — would 1:30 work instead?' },
				{ type:'message', dir:'out', text:'1:30 works great — I\'ll have both parked up front.', meta:'Delivered' },
				{ type:'event', icon:'calendar', text:'Appointment updated — Today 1:30 PM' }
			]
		},
		{
			id:'elaine-kowalski', name:'Elaine Kowalski', initials:'EK', phone:'352-555-0118', email:'elaine.k@example.com', location:'Ocala, FL',
			owner:'Riley Morgan', tabs:['working'], unread:'unread', time:'8:47 AM',
			preview:'Call — no answer (2nd attempt today)', pill:null,
			stage:'working', stageNote:'Working · 1d', flag:'No contact logged — flagged for review',
			summary:[
				{ kind:'icon', icon:'users', tone:'info', title:'Referral · General Info', meta:'Referred by Dana Whitfield', status:[{ label:'No unit yet', status:'neutral' }] },
				{ kind:'icon', icon:'flag', tone:'warn', title:'Flagged for review', meta:'No contact logged in 24h', status:[{ label:'Manager notified', status:'flagged' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'day', label:'Yesterday', time:'3:40 PM' },
				{ type:'event', icon:'inbox', text:'Lead received — Referral · General Info' },
				{ type:'call', title:'Outgoing call · 0:00', summary:'No answer — voicemail left' },
				{ type:'day', label:'Today', time:'8:47 AM' },
				{ type:'call', title:'Outgoing call · 0:00', summary:'No answer (2nd attempt)' },
				{ type:'event', icon:'flag', tone:'warn', text:'No contact logged — flagged for review' }
			]
		},
		{
			id:'rob-cheryl-baxter', name:'Rob & Cheryl Baxter', initials:'RB', phone:'352-555-0177', email:'baxters@example.com', location:'Belleview, FL',
			owner:'Riley Morgan', tabs:['today','working'], unread:null, time:'8:31 AM',
			preview:'Confirmed for this afternoon — thank you!', pill:{ label:'4:30 PM', status:'appointment', icon:'calendar' },
			stage:'agreed', stageNote:'Agreed · 3h',
			summary:[
				{ kind:'unit', image:IMG.redhawk, title:'2023 Jayco Redhawk 26XD', meta:'#5CR0797 · $74,900', status:[{ label:'Sale pending', status:'flagged' }] },
				{ kind:'icon', icon:'calendar', tone:'ok', title:'Today · 4:30 PM', meta:'Delivery · Ocala store', status:[{ label:'Confirmed', status:'confirmed' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'day', label:'Yesterday', time:'5:10 PM' },
				{ type:'event', icon:'tag', text:'Offer accepted — $74,900 · Walk-In · Make Offer' },
				{ type:'event', icon:'calendar', text:'Delivery scheduled — Today 4:30 PM · Ocala store' },
				{ type:'day', label:'Today', time:'8:31 AM' },
				{ type:'message', dir:'in', text:'Confirmed for this afternoon — thank you!' }
			]
		},
		{
			id:'hector-alvarez', name:'Hector Alvarez', initials:'HA', phone:'352-555-0151', email:'h.alvarez@example.com', location:'Ocala, FL',
			owner:'Sam Okafor', tabs:['working'], unread:'overdue', time:'Yesterday',
			preview:'You: I\'ll check on that Montana and get back to you.', pill:{ label:'Overdue 2h', status:'overdue', icon:'clock' },
			stage:'working', stageNote:'Working · 1d',
			summary:[
				{ kind:'icon', icon:'map-pin', tone:'info', title:'Walk-In · General Info', meta:'Asked about a Keystone Montana', status:[{ label:'Follow-up overdue', status:'overdue' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'day', label:'Yesterday', time:'2:15 PM' },
				{ type:'event', icon:'map-pin', text:'Walk-in logged — Ocala store' },
				{ type:'message', dir:'in', text:'Do you have any Montana fifth wheels coming in?' },
				{ type:'message', dir:'out', text:'I\'ll check on that Montana and get back to you.', meta:'Delivered' },
				{ type:'event', icon:'clock', tone:'alert', text:'Follow-up overdue — promised reply not sent' }
			]
		},
		{
			id:'dana-whitfield', name:'Dana Whitfield', initials:'DW', phone:'352-555-0129', email:'dana.w@example.com', location:'Ocala, FL',
			owner:'Riley Morgan', tabs:['working'], unread:null, time:'Yesterday',
			preview:'Email — “Trade value questions”', pill:null,
			stage:'working', stageNote:'Working · 3d',
			summary:[
				{ kind:'unit', svg:'rv-trailer', title:'2019 Grand Design Reflection 315RLTS', meta:'Website · Trade Evaluation', status:[{ label:'Trade pending', status:'neutral' }] },
				{ kind:'icon', icon:'calendar', tone:'info', title:'Mon Aug 17 · 4:00 PM', meta:'Sales Visit · Ocala store', status:[{ label:'Confirmed', status:'confirmed' }] }
			],
			composerStatus:'Email d.whitfield — no text opt-in',
			thread:[
				{ type:'day', label:'Yesterday', time:'11:02 AM' },
				{ type:'event', icon:'inbox', text:'Lead received — Website · Trade Evaluation' },
				{ type:'email', time:'Email · 11:02 AM', subject:'Trade value questions', preview:'Hi — I filled out the trade form for my Reflection. What do you need from me to get a number?', opened:false }
			]
		},
		{
			id:'renee-fontaine', name:'Renee Fontaine', initials:'RF', phone:'352-555-0107', email:'renee.f@example.com', location:'Ocala, FL',
			owner:'Riley Morgan', tabs:['working'], unread:null, time:'Tuesday',
			preview:'Left voicemail — try again Thursday', pill:null,
			stage:'attempting', stageNote:'Attempting · 6d',
			summary:[
				{ kind:'icon', icon:'phone', tone:'info', title:'Phone Call · General Info', meta:'Inbound call, 6 days ago', status:[{ label:'6d in stage', status:'flagged' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'day', label:'Tuesday', time:'10:20 AM' },
				{ type:'call', title:'Outgoing call · 0:00', summary:'Left voicemail — try again Thursday' }
			]
		}
	];

	/* ---------------------------------------------------------------------- */
	/* CONSIGN desk — lister side                                              */
	/* ---------------------------------------------------------------------- */
	const consignLeads = [
		{
			id:'raymond-cho', waitingOn:'Lister', name:'Raymond Cho', initials:'RC', phone:'352-555-0171', email:'r.cho@example.com', location:'Ocala, FL · OCA',
			owner:'Riley Morgan', tabs:['new','working'], unread:'unread', time:'11:34 AM', unit:'Unit not identified yet', unitPlaceholder:true,
			preview:'Auto-reply sent — RVChat · Consignment', pill:{ label:'4m left', status:'info', icon:'clock' },
			stage:'assigned', stageNote:'Assigned · 1m',
			summary:[ { kind:'icon', icon:'message-square', tone:'info', title:'RVChat · Consignment', meta:'Unit not identified yet', status:[{ label:'Auto-reply sent', status:'neutral' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Today', time:'11:34 AM' }, { type:'event', icon:'inbox', text:'Lead received — RVChat · Consignment' }, { type:'message', dir:'out', label:'Automated', labelIcon:'zap', text:'Hi Raymond — thanks for asking about consigning with Optimum RV. A lister will call you shortly.' } ]
		},
		{
			id:'beth-larkin', waitingOn:'Lister', name:'Beth Larkin', initials:'BL', phone:'352-555-0183', email:'b.larkin@example.com', location:'Ocala, FL · OCA',
			owner:'Riley Morgan', tabs:['new','working'], unread:'unread', time:'11:32 AM', unit:'2019 Forest River Wildwood 26DBUD',
			preview:'New lead — Website · Consignment', pill:{ label:'2m left', status:'urgent', icon:'clock' },
			stage:'assigned', stageNote:'Assigned · 3m',
			summary:[ { kind:'unit', svg:'rv-trailer', title:'2019 Forest River Wildwood 26DBUD', meta:'Travel Trailer · Ocala, FL', status:[{ label:'New', status:'info' }] } ],
			textOptIn:false,
			thread:[ { type:'day', label:'Today', time:'11:32 AM' }, { type:'event', icon:'inbox', text:'Lead received — Website · Consignment' } ]
		},
		{
			id:'owen-pruitt', waitingOn:'Consignor', name:'Owen Pruitt', initials:'OP', phone:'352-555-0122', email:'o.pruitt@example.com', location:'Ocala, FL · OCA',
			owner:'Riley Morgan', tabs:['due','working'], unread:'unread', time:'11:10 AM', unit:'2022 Thor ACE 32.3',
			preview:'Price agreed — $89,900 · 120-day term', pill:null,
			stage:'documents', stageNote:'Price Agreed · 25m',
			summary:[ { kind:'unit', image:IMG.thor, title:'2022 Thor ACE 32.3', meta:'Class A · Ocala, FL', status:[{ label:'Converted from lead', status:'ok' }] }, { kind:'icon', icon:'tag', tone:'ok', title:'Agreed $89,900', meta:'120-day term', status:[{ label:'Price agreed', status:'ok' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Today', time:'11:10 AM' }, { type:'event', icon:'tag', text:'Price agreed — $89,900 · 120-day term' }, { type:'event', icon:'check-circle', text:'Converted from lead — Sales Working → Consign Documents' } ]
		},
		{
			id:'nadia-petrov', waitingOn:'Consignor', name:'Nadia Petrov', initials:'NP', phone:'352-555-0146', email:'n.petrov@example.com', location:'Titusville, FL · TIV',
			owner:'Riley Morgan', tabs:['due','working'], unread:null, time:'11:00 AM', unit:'2019 Grand Design Reflection 315RLTS',
			preview:'You: requested a new 10-day payoff letter', pill:{ label:'Payoff', status:'neutral', icon:'loader' },
			stage:'documents', stageNote:'Collecting Documents · 40m', flag:'Bounced — payoff mismatch (4-point check)',
			summary:[ { kind:'unit', svg:'rv-trailer', title:'2019 Grand Design Reflection 315RLTS', meta:'Fifth Wheel · $42,500', status:[{ label:'Collecting documents', status:'neutral' }] }, { kind:'icon', icon:'file-text', tone:'warn', title:'Payoff letter', meta:'New 10-day payoff requested', status:[{ label:'Bounced — mismatch', status:'flagged' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Today', time:'10:25 AM' }, { type:'event', icon:'rotate-ccw', tone:'warn', text:'Bounced — payoff mismatch (4-point check)' }, { type:'message', dir:'out', text:'Nadia — the payoff letter didn\'t match the lender\'s figure. Could you request a fresh 10-day payoff and send it over?', meta:'Delivered' } ]
		},
		{
			id:'anita-brookshire', waitingOn:'Consignor', name:'Anita Brookshire', initials:'AB', phone:'813-555-0164', email:'a.brookshire@example.com', location:'Wesley Chapel, FL · ZEP',
			owner:'Riley Morgan', tabs:['due','working'], unread:'unread', time:'10:35 AM', unit:'2021 Winnebago Micro Minnie 2306BHS',
			preview:'You: JD Power avg came in at $21,400 — let\'s talk term', pill:null,
			stage:'working', stageNote:'Working · 2d',
			cta:{ label:'Mark price agreed', action:'mark-price-agreed', icon:'check-circle', tone:'primary' },
			summary:[
				{ kind:'unit', image:IMG.minnie, title:'2021 Winnebago Micro Minnie 2306BHS', meta:'Travel Trailer · one owner · Wesley Chapel, FL', meta2:'3 photos from the consignor', status:[] },
				{ kind:'icon', icon:'book-open', title:'Asking $24,900', meta:'JD Power avg $21,400 · low $18,900', status:[{ label:'$3,500 over avg', status:'flagged' }] },
				{ kind:'icon', icon:'file-text', title:'Payoff ~$15,000 · estimated', meta:'Suncoast CU · title with the lender', status:[{ label:'10-day payoff not pulled', status:'flagged' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'event', icon:'inbox', text:'Lead received — Referral · Consignment · referred by Dana Whitfield' },
				{ type:'event', icon:'user', text:'Assigned to Riley Morgan' },
				{ type:'message', dir:'out', label:'Automated', labelIcon:'zap', text:'Hi Anita — Riley Morgan with Optimum RV Consignment. Thanks for asking about consigning your 2021 Micro Minnie 2306BHS — I\'ll call you in a few minutes, and you can reply here anytime.' },
				{ type:'call', title:'Outgoing call · 9:48', summary:'Connected — floorplan confirmed; one owner, covered storage; loan with Suncoast CU' },
				{ type:'image', src:IMG.minnie, caption:'Here it is — new tires in March, never smoked in.' },
				{ type:'note', author:'Riley Morgan', text:'Wants $25K to clear the loan and walk with cash; the $16K soft buyout didn\'t land.' },
				{ type:'day', label:'Yesterday', time:'2:05 PM' },
				{ type:'email', time:'Email · 2:05 PM', subject:'How consignment works at Optimum RV', preview:'Anita — here\'s what we covered: the 120-day term, the $399 inspection fee, the marketing package…', opened:true },
				{ type:'day', label:'Today', time:'10:31 AM' },
				{ type:'event', icon:'book-open', text:'JD Power appraisal recorded — low $18,900 · avg $21,400 · Aug 2026 book, matched 2021' },
				{ type:'message', dir:'out', text:'JD Power avg came in at $21,400 — let\'s talk term', meta:'Delivered' }
			]
		},
		{
			id:'tina-rojas', waitingOn:'Consignor', name:'Tina Rojas', initials:'TR', phone:'352-555-0139', email:'t.rojas@example.com', location:'Ocala, FL · OCA',
			owner:'Riley Morgan', tabs:['working'], unread:'unread', time:'9:35 AM', unit:'2015 Tiffin Allegro 32SA',
			preview:'Call — no answer (Day 1 of 321)', pill:{ label:'Day 1', status:'neutral', icon:'more-horizontal' },
			stage:'attempting', stageNote:'Attempting · Day 1 of 321',
			summary:[ { kind:'unit', svg:'rv-motorhome', title:'2015 Tiffin Allegro 32SA', meta:'Class A · RVTrader.com', status:[{ label:'Day 1 of 321', status:'neutral' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Today', time:'9:35 AM' }, { type:'call', title:'Outgoing call · 0:00', summary:'No answer — Day 1 of 321-day cadence' } ]
		},
		{
			id:'colleen-vandermeer', waitingOn:'Consignor', name:'Colleen Vandermeer', initials:'CV', phone:'352-555-0155', email:'c.vandermeer@example.com', location:'Bushnell, FL · BUS',
			owner:'Riley Morgan', tabs:['due','working'], unread:'unread', time:'7:35 AM', unit:'2016 Airstream Flying Cloud 25FB',
			preview:'Fee link sent — $399 inspection fee', pill:{ label:'Fee', status:'neutral', icon:'loader' },
			stage:'processing', stageNote:'Manager Approved · 2d',
			summary:[ { kind:'unit', svg:'rv-trailer', title:'2016 Airstream Flying Cloud 25FB', meta:'Travel Trailer · $52,000', status:[{ label:'Fee due', status:'fee-due' }] }, { kind:'icon', icon:'credit-card', tone:'warn', title:'Inspection fee $399', meta:'Entity #48127 · fee link sent', status:[{ label:'Awaiting payment', status:'flagged' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Today', time:'7:35 AM' }, { type:'event', icon:'credit-card', text:'Inspection fee link sent — $399 · Entity #48127' } ]
		},
		{
			id:'sheila-marchetti', waitingOn:'GM', name:'Sheila Marchetti', initials:'SM', phone:'352-555-0112', email:'s.marchetti@example.com', location:'Ocala, FL · OCA',
			owner:'Riley Morgan', tabs:['working'], unread:null, time:'Yesterday', unit:'2018 Grand Design Solitude 310GK',
			preview:'Contract signed — in the approval queue', pill:null,
			stage:'contract', stageNote:'Contract Signed · 1d',
			summary:[ { kind:'unit', svg:'rv-trailer', title:'2018 Grand Design Solitude 310GK', meta:'Fifth Wheel · $46,500', status:[{ label:'Signed', status:'ok' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Yesterday', time:'4:48 PM' }, { type:'event', icon:'check', text:'Contract signed — Sheila Marchetti' }, { type:'event', icon:'shield', text:'Sent to approval queue — Ocala GM' } ]
		},
		{
			id:'elena-vasquez', waitingOn:'Inventory Admin', name:'Elena Vasquez', initials:'EV', phone:'352-555-0188', email:'e.vasquez@example.com', location:'Ocala, FL · OCA',
			badges:[{ label:'Also buying', status:'info', icon:'shopping-bag', chevron:true }],
			owner:'Riley Morgan', tabs:['working'], unread:null, time:'Yesterday', unit:'2020 Winnebago Minnie 2301BHS',
			preview:'Reminder sent — drop-off Thu 10:00 AM', pill:{ label:'Thu · Ocala', status:'appointment', icon:'calendar' },
			stage:'processing', stageDone:true, stageNote:'Inspection Fee Settled · 1d · stock # pending',
			cta:{ label:'Waiting on Inventory Admin', action:'waiting-on', icon:'loader', tone:'waiting' },
			summary:[
				{ kind:'unit', svg:'rv-trailer', title:'2020 Winnebago Minnie 2301BHS', meta:'Travel Trailer · Ocala, FL', status:[{ label:'Fee paid $399', status:'ok' }, { label:'Stock-pending', status:'flagged' }] },
				{ kind:'icon', icon:'book-open', title:'Agreed $22,900', meta:'JD Power avg $24,100 · low $20,800', status:[{ label:'$1,200 under avg', status:'ok' }, { label:'120 days', status:'neutral' }] },
				{ kind:'icon', icon:'file-text', tone:'ok', title:'No lien on the unit', meta:'Title year 2020', status:[{ label:'Title in hand', status:'ok' }] },
				{ kind:'icon', icon:'calendar', tone:'info', title:'Thu Aug 20 · 10 AM', meta:'Drop-off · Ocala store', status:[{ label:'Confirmed', status:'confirmed' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'day', label:'Wed, Aug 5', time:'4:40 PM' },
				{ type:'event', icon:'tag', text:'Price agreed — $22,900 · 120-day term' },
				{ type:'day', label:'Mon, Aug 10', time:'3:12 PM' },
				{ type:'event', icon:'upload', text:'Documents requested — upload link sent · 5 items' },
				{ type:'event', icon:'file-text', text:'Document received — proof of insurance (5 of 5)' },
				{ type:'event', icon:'edit-3', text:'Packet sent for e-sign — FL consignment packet · 1 signer' },
				{ type:'day', label:'Wed, Aug 12', time:'9:04 AM' },
				{ type:'event', icon:'check', text:'Contract signed — Elena Vasquez' },
				{ type:'event', icon:'shield', text:'Manager approved — Jordan Pike · 4-point check passed' },
				{ type:'event', icon:'credit-card', text:'Inspection fee link sent — $399 · Travel Trailer' },
				{ type:'day', label:'Fri, Aug 14', time:'8:20 AM' },
				{ type:'message', dir:'in', text:'Just paid it — thanks Riley!' },
				{ type:'event', icon:'check', text:'Fee paid $399 — receipt emailed' },
				{ type:'day', label:'Monday', time:'11:20 AM' },
				{ type:'message', dir:'out', text:'You\'re set for Thursday at 10 AM at our Ocala store. The stock number is on its way and the prep instructions will follow it.' },
				{ type:'event', icon:'calendar', text:'Drop-off booked — Thu Aug 20 · 10:00 AM · Ocala store · stock # pending' },
				{ type:'day', label:'Yesterday', time:'9:00 AM' },
				{ type:'message', dir:'out', label:'Automated', labelIcon:'zap', text:'Reminder: your Minnie\'s drop-off is Thursday, Aug 20 at 10:00 AM at Optimum RV Ocala. Reply here with any questions.' },
				{ type:'message', dir:'in', text:'See you Thursday!' }
			]
		}
	];

	/* ---------------------------------------------------------------------- */
	/* BACK OFFICE desk — inventory / buy-in admin side                        */
	/* ---------------------------------------------------------------------- */
	const backofficeLeads = [
		{
			id:'harold-brenner', waitingOn:'GM', name:'Harold Brenner', initials:'HB', phone:'352-555-0104', email:'h.brenner@example.com', location:'Tallahassee, FL · TAL',
			owner:'Devon Marsh', tabs:['today','due','all'], unread:'unread', time:'11:15 AM', unit:'2016 Forest River Georgetown 364TS',
			preview:'Pickup requested — clearance check pending', pill:{ label:'Term ended', status:'flagged', icon:'clock' },
			stage:'forsale', stageNote:'Off Market · Pickup Pending · term ended Aug 18',
			cta:{ label:'Schedule pickup', action:'schedule-pickup', icon:'truck', tone:'primary' },
			summary:[ { kind:'unit', svg:'rv-motorhome', title:'2016 Forest River Georgetown 364TS', meta:'Class A · 5CR0733 · Tallahassee store', status:[{ label:'Off market', status:'neutral' }, { label:'Pickup pending', status:'flagged' }] }, { kind:'icon', icon:'calendar', tone:'warn', title:'Term ended Aug 18', meta:'Day 120 of 120', status:[{ label:'Clearance check pending', status:'flagged' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Today', time:'11:15 AM' }, { type:'event', icon:'clock', tone:'warn', text:'Term ended — 120 days · listing removed' }, { type:'message', dir:'in', text:'I\'d like to pick up the Georgetown this week if it\'s clear.' } ]
		},
		{
			id:'rob-cheryl-baxter-bo', waitingOn:'Consignor', name:'Rob & Cheryl Baxter', initials:'RB', phone:'352-555-0177', email:'baxters@example.com', location:'Belleview, FL · OCA',
			badges:[{ label:'2 on title', status:'neutral', icon:'users' }],
			owner:'Riley Morgan', tabs:['today','due','all'], unread:'unread', time:'10:52 AM', unit:'2018 Keystone Cougar 368MBI',
			preview:'Cheryl: Rob\'s been traveling and will sign this weekend.', pill:{ label:'Signature', status:'neutral', icon:'loader' },
			stage:'forsale', stageNote:'Ready For Sale · day 60 of 120 · term ends Oct 18',
			cta:{ label:'Send 60-day update', action:'send-60-day-update', icon:'send', tone:'primary' },
			summary:[
				{ kind:'unit', image:IMG.redhawk, title:'2018 Keystone Cougar 368MBI', meta:'Fifth Wheel · 5CR0790 · Ocala store', status:[{ label:'Ready for sale', status:'ok' }, { label:'As of 5:10 AM', status:'neutral' }] },
				{ kind:'icon', icon:'tag', title:'Listed $41,500 · agreed', meta:'To $38,900 — addendum out', status:[{ label:'1 of 2 signed', status:'flagged' }] },
				{ kind:'icon', icon:'eye', title:'1,284 views · 23 favorites', meta:'6 leads · last 30 days', status:[{ label:'Listed Jun 20', status:'neutral' }] },
				{ kind:'icon', icon:'calendar', tone:'warn', title:'Term ends Oct 18', meta:'Day 60 of 120', status:[{ label:'60-day update due', status:'flagged' }] }
			],
			composerStatus:'Texting Cheryl · 352-555-0177 · opted in · Rob: email only',
			thread:[
				{ type:'day', label:'Sat, Jun 20', time:'4:48 PM' },
				{ type:'event', icon:'tag', text:'Listed on optimumrv.com — $41,500 · 120-day term ends Oct 18' },
				{ type:'day', label:'Mon, Jul 20', time:'9:00 AM' },
				{ type:'email', time:'Email · 9:00 AM', automated:true, subject:'Your Cougar at 30 days — 612 views, 11 favorites, 3 leads', preview:'Hi Rob and Cheryl — here\'s how the listing is doing after its first month, and what we\'re seeing in the market…', opened:true },
				{ type:'day', label:'Wed, Aug 5', time:'2:20 PM' },
				{ type:'event', icon:'tag', text:'Price change proposed — $41,500 → $38,900 · Ocala GM' },
				{ type:'message', dir:'out', text:'Hi Cheryl — the Ocala team recommends moving the Cougar to $38,900 to line up with the market. I\'m sending the addendum for both of you to sign.' },
				{ type:'event', icon:'edit-3', text:'Addendum sent for e-sign — 2 signers' },
				{ type:'message', dir:'in', text:'That\'s fine with us. I signed — Rob will sign tonight.' },
				{ type:'event', icon:'check', text:'Addendum signed — Cheryl Baxter (1 of 2)' },
				{ type:'day', label:'Yesterday', time:'9:00 AM' },
				{ type:'message', dir:'out', label:'Automated', labelIcon:'zap', text:'Reminder: the price-change addendum for your 2018 Cougar is still waiting for Rob\'s signature. The link is in your email — reply here with any questions.' },
				{ type:'day', label:'Today', time:'10:52 AM' },
				{ type:'message', dir:'in', text:'Rob\'s been traveling and will sign this weekend. Do we still get the 60-day report in the meantime?' }
			]
		},
		{
			id:'lorraine-beckett', waitingOn:'Buy-in Admin', name:'Lorraine Beckett', initials:'LB', phone:'352-555-0131', email:'l.beckett@example.com', location:'Ocala, FL · OCA',
			badges:[{ label:'CBR', status:'dark' }],
			owner:'Sam Okafor', tabs:['due','all'], unread:null, time:'9:41 AM', unit:'2020 Newmar Bay Star 3226',
			preview:'Lorraine: Wire went out this morning, confirmation ending 4471.', pill:{ label:'Delivery hold', status:'overdue', icon:'alert-triangle' },
			stage:'deals', stageNote:'Sale In Progress · 3d · Motility deal 48231',
			cta:{ label:'Waiting on Buy-in Admin', action:'waiting-on', icon:'loader', tone:'waiting' },
			summary:[
				{ kind:'unit', image:IMG.thor, title:'2020 Newmar Bay Star 3226', meta:'Class A · CBR0142 · Ocala store', status:[{ label:'Sale pending', status:'flagged' }, { label:'As of 5:10 AM', status:'neutral' }] },
				{ kind:'icon', icon:'tag', title:'Sale $118,000 · agreed', meta:'Avg $114,200 · low $98,900', status:[{ label:'$3,800 over avg', status:'flagged' }] },
				{ kind:'icon', icon:'file-text', tone:'warn', title:'Payoff $126,300', meta:'Through Aug 28 · $31.40/day', status:[{ label:'Hold · $8,300 short', status:'overdue' }] },
				{ kind:'icon', icon:'briefcase', title:'Motility deal 48231', meta:'06. Approved · AppOne', status:[{ label:'Not funded', status:'flagged' }] }
			],
			textOptIn:true,
			thread:[
				{ type:'day', label:'Sunday', time:'6:05 AM' },
				{ type:'event', icon:'briefcase', text:'Buyer deal detected — Motility deal 48231 · 01. Desking · Ocala' },
				{ type:'day', label:'Monday', time:'8:30 AM' },
				{ type:'event', icon:'file-text', text:'Payoff refreshed — $126,300 · good through Aug 28 · $31.40 per diem' },
				{ type:'event', icon:'alert-triangle', tone:'alert', text:'Delivery hold set — payoff over sale price · $8,300 shortfall' },
				{ type:'message', dir:'out', label:'Avery Lindqvist · Buy-in Admin', labelIcon:'user', text:'Hi Lorraine — good news, we have a buyer for the Bay Star at $118,000. Your payoff is $126,300, so there\'s an $8,300 difference to settle before delivery. It\'s over $5,000, so it goes by wire — I\'ll email the instructions now.' },
				{ type:'message', dir:'in', text:'Understood. Can I put part of it on a card?' },
				{ type:'message', dir:'out', label:'Avery Lindqvist · Buy-in Admin', labelIcon:'user', text:'Cards are only for amounts under $5,000 — this one has to be a wire. Once it lands, the hold comes off and the buyer can take delivery.' },
				{ type:'event', icon:'send', text:'Delivery hold sent to GM — Ocala' },
				{ type:'note', author:'Avery Lindqvist', text:'AppOne approval is in; funding waits on the shortfall wire.' },
				{ type:'day', label:'Today', time:'9:41 AM' },
				{ type:'message', dir:'in', text:'Wire went out this morning, confirmation ending 4471.' }
			]
		},
		{
			id:'gerald-whitcomb', waitingOn:'Inventory Admin', name:'Gerald Whitcomb', initials:'GW', phone:'813-555-0119', email:'g.whitcomb@example.com', location:'Zephyrhills, FL · ZEP',
			owner:'Sam Okafor', tabs:['due','all'], unread:'unread', time:'8:35 AM', unit:'2019 Coachmen Catalina 263BHSCK',
			preview:'Check-in returned — condition differs from described', pill:null,
			stage:'arrived', stageNote:'Arrived On Lot · 1d', flag:'Check-in returned — condition differs from described',
			cta:{ label:'Request re-evaluation', action:'request-reevaluation', icon:'refresh-cw', tone:'primary' },
			summary:[ { kind:'unit', svg:'rv-trailer', title:'2019 Coachmen Catalina 263BHSCK', meta:'Travel Trailer · 5CR0829 · Zephyrhills store', status:[{ label:'Condition re-evaluation', status:'flagged' }] }, { kind:'icon', icon:'camera', title:'Walk-around done', meta:'32 photos · 3h ago', status:[{ label:'$19,900 listed', status:'neutral' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Today', time:'8:35 AM' }, { type:'event', icon:'camera', text:'Walk-around done — 32 photos' }, { type:'event', icon:'rotate-ccw', tone:'warn', text:'Check-in returned — condition differs from described' } ]
		},
		{
			id:'priscilla-nguyen-bo', waitingOn:'Consignor', name:'Priscilla Nguyen', initials:'PN', phone:'352-555-0163', email:'p.nguyen@example.com', location:'Ocala, FL · OCA',
			owner:'Riley Morgan', tabs:['today','due','all'], unread:'unread', time:'Yesterday', unit:'2017 Jayco Eagle 330RSTS',
			preview:'Pickup today — fees cleared, release signed', pill:{ label:'2:00 PM · Ocala', status:'appointment', icon:'calendar' },
			stage:'payout', stageNote:'Consignor Paid · pickup today',
			summary:[ { kind:'unit', svg:'rv-trailer', title:'2017 Jayco Eagle 330RSTS', meta:'Fifth Wheel · 5CR0702 · Ocala store', status:[{ label:'Released', status:'ok' }] }, { kind:'icon', icon:'calendar', tone:'info', title:'Today · 2:00 PM', meta:'Pickup · Ocala store', status:[{ label:'Confirmed', status:'confirmed' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Yesterday', time:'3:30 PM' }, { type:'event', icon:'check', text:'Fees cleared — release signed' }, { type:'message', dir:'out', text:'You\'re all set for pickup tomorrow at 2:00 PM.', meta:'Delivered' } ]
		},
		{
			id:'elena-vasquez-bo', waitingOn:'Inventory Admin', name:'Elena Vasquez', initials:'EV', phone:'352-555-0188', email:'e.vasquez@example.com', location:'Ocala, FL · OCA',
			owner:'Riley Morgan', tabs:['due','all'], unread:null, time:'Yesterday', unit:'2020 Winnebago Minnie 2301BHS',
			preview:'Reminder sent — drop-off Thu 10:00 AM', pill:{ label:'Thu · Ocala', status:'appointment', icon:'calendar' },
			stage:'checkin', stageNote:'Check-In Scheduled · 2d · stock pending',
			summary:[ { kind:'unit', svg:'rv-trailer', title:'2020 Winnebago Minnie 2301BHS', meta:'Travel Trailer · Ocala, FL', status:[{ label:'Stock-pending', status:'flagged' }] }, { kind:'icon', icon:'calendar', tone:'info', title:'Thu Aug 20 · 10 AM', meta:'Drop-off · Ocala store', status:[{ label:'Reminder sent', status:'neutral' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Yesterday', time:'9:00 AM' }, { type:'message', dir:'out', label:'Automated', labelIcon:'zap', text:'Reminder: your Minnie\'s drop-off is Thursday, Aug 20 at 10:00 AM at Optimum RV Ocala.' } ]
		},
		{
			id:'janet-ferrell', waitingOn:'Buy-in Admin', name:'Janet Ferrell', initials:'JF', phone:'352-555-0176', email:'j.ferrell@example.com', location:'Ocala, FL · OCA',
			owner:'Riley Morgan', tabs:['all'], unread:null, time:'Yesterday', unit:'2023 Jayco Redhawk 26XD',
			preview:'Buyer deal · 09. Paperwork Complete', pill:null,
			stage:'deals', stageNote:'Sale In Progress · 5d',
			summary:[ { kind:'unit', image:IMG.redhawk, title:'2023 Jayco Redhawk 26XD', meta:'Class C · 5CR0797 · Ocala store', status:[{ label:'$74,900', status:'neutral' }] }, { kind:'icon', icon:'briefcase', title:'Buyer deal', meta:'09. Paperwork Complete', status:[{ label:'Awaiting funding', status:'neutral' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Yesterday', time:'1:12 PM' }, { type:'event', icon:'briefcase', text:'Buyer deal — 09. Paperwork Complete' } ]
		},
		{
			id:'milton-greer', waitingOn:'Buy-in Admin', name:'Milton Greer', initials:'MG', phone:'850-555-0148', email:'m.greer@example.com', location:'Tallahassee, FL · TAL',
			owner:'Riley Morgan', tabs:['all'], unread:null, time:'Monday', unit:'2015 Tiffin Allegro Bus 40SP',
			preview:'On the CIT report — check held', pill:{ label:'CIT hold', status:'flagged', icon:'lock' },
			stage:'payout', stageNote:'Buy-In Complete · 9d',
			summary:[ { kind:'unit', svg:'rv-motorhome', title:'2015 Tiffin Allegro Bus 40SP', meta:'Class A · 5CR0776 · Tallahassee store', status:[{ label:'$139,000', status:'neutral' }, { label:'CIT hold', status:'flagged' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Monday', time:'10:05 AM' }, { type:'event', icon:'lock', tone:'warn', text:'On the CIT report — check held' } ]
		},
		{
			id:'ron-haskell', waitingOn:'Consignor', name:'Ron Haskell', initials:'RH', phone:'405-555-0161', email:'r.haskell@example.com', location:'Oklahoma City, OK · OKC',
			owner:'Sam Okafor', tabs:['all'], unread:null, time:'Monday', unit:'2014 Newmar Ventana 3437',
			preview:'Consignor away until Labor Day — drop-off after', pill:{ label:'Drop-off', status:'neutral', icon:'loader' },
			stage:'motility', stageNote:'Added to Motility · 12d',
			summary:[ { kind:'unit', svg:'rv-motorhome', title:'2014 Newmar Ventana 3437', meta:'Class A · 5CR0851 · Oklahoma City store', status:[{ label:'$96,000', status:'neutral' }] } ],
			textOptIn:true,
			thread:[ { type:'day', label:'Monday', time:'8:40 AM' }, { type:'message', dir:'in', text:'We\'re out of town until Labor Day — can we drop it off after?' } ]
		}
	];

	/* ---------------------------------------------------------------------- */
	/* PIPELINE-ONLY leads — on the boards but not in today's inbox            */
	/* (tabs:[] keeps them out of the Daily View list; cards still open them) */
	/* ---------------------------------------------------------------------- */
	function boardLead(o) {
		return Object.assign({ tabs:[], unread:null, time:'', preview:'', pill:null, summary:[], composerStatus:'Texting — opted in', thread:[ { type:'event', icon:'inbox', text:'Lead received — ' + o.card.source + ' · ' + o.card.type } ] }, o);
	}
	const consignBoardLeads = [
		boardLead({ id:'gwen-holloway', waitingOn:'Lister', name:'Gwen Holloway', initials:'GH', phone:'405-555-0102', email:'g.holloway@example.com', location:'Oklahoma City, OK · OKC', owner:'Sam Okafor', stage:'assigned', stageNote:'Assigned · 3m', unit:'2018 Forest River Rockwood 2608BS',
			card:{ svg:'rv-trailer', source:'Website', type:'Consignment', loc:'OKC', timer:{ label:'2m left', status:'urgent' }, activity:'Assigned to Sam Okafor', activityIcon:'inbox', age:'3m' } }),
		boardLead({ id:'luis-ferreira', waitingOn:'Lister', name:'Luis Ferreira', initials:'LF', phone:'337-555-0144', email:'l.ferreira@example.com', location:'Lafayette, LA · LAF', owner:'Devon Marsh', stage:'assigned', stageNote:'Assigned · 1m', unit:'2016 Keystone Montana 3791RD',
			card:{ svg:'rv-trailer', source:'Phone Call', type:'Consignment', loc:'LAF', timer:{ label:'4m left', status:'info' }, activity:'Auto-reply sent', activityIcon:'zap', age:'1m' } }),
		boardLead({ id:'denise-hale', waitingOn:'Consignor', name:'Denise Hale', initials:'DH', phone:'850-555-0177', email:'d.hale@example.com', location:'Tallahassee, FL · TAL', owner:'Sam Okafor', stage:'attempting', stageNote:'Attempting · Day 2 of 321', unit:'2019 Coachmen Freelander 26DS',
			card:{ svg:'rv-motorhome', source:'Website', type:'Consignment', loc:'TAL', timer:{ label:'Day 2', status:'neutral', icon:'more-horizontal' }, activity:'Day 2 of 321 — no reply yet', activityIcon:'mail', age:'40m' } }),
		boardLead({ id:'frank-delgado', waitingOn:'GM', name:'Frank Delgado', initials:'FD', phone:'361-555-0135', email:'f.delgado@example.com', location:'Corpus Christi, TX · COR', owner:'Devon Marsh', stage:'working', stageNote:'Working · 9d', unit:'2017 Heartland Bighorn 3270RS',
			card:{ svg:'rv-trailer', source:'Website', type:'Consignment', loc:'COR', timer:{ label:'9d', status:'flagged' }, badges:[{ label:'CBR', status:'dark' }], activity:'Jordan Pike joined the CBR call', activityIcon:'user', age:'3h' } }),
		boardLead({ id:'yolanda-reyes', waitingOn:'Consignor', name:'Yolanda Reyes', initials:'YR', phone:'352-555-0198', email:'y.reyes@example.com', location:'Bushnell, FL · BUS', owner:'Sam Okafor', stage:'documents', stageNote:'Collecting Documents · 3d', unit:'2021 Grand Design Imagine 2500RL',
			card:{ svg:'rv-trailer', lane:'collecting', source:'RVTrader.com', type:'Consignment', loc:'BUS', price:'$31,900', timer:{ label:'3d', status:'neutral' }, activity:'Title + IDs received (3 of 5)', activityIcon:'file-text', age:'1d', flag:{ text:'Co-owner on the title — second signer needed', tone:'warn', icon:'flag' } } }),
		boardLead({ id:'douglas-tran', waitingOn:'Consignor', name:'Douglas Tran', initials:'DT', phone:'864-555-0126', email:'d.tran@example.com', location:'Spartanburg, SC · SPA', owner:'Devon Marsh', stage:'contract', stageNote:'Contract Out · 1h', unit:'2017 Winnebago Vista 31BE',
			card:{ svg:'rv-motorhome', lane:'out', source:'Website', type:'Consignment', loc:'SPA', price:'$71,500', badges:[{ label:'CBR', status:'dark' }], timer:{ label:'1h', status:'neutral', icon:'loader' }, activity:'Packet sent for e-sign', activityIcon:'edit-3', age:'1h', flag:{ text:'CBR pre-approval missing — flagged', tone:'warn', icon:'flag' } } }),
		boardLead({ id:'walter-osei', waitingOn:'Consignor', name:'Walter Osei', initials:'WO', phone:'215-555-0158', email:'w.osei@example.com', location:'Philadelphia, PA · PHI', owner:'Sam Okafor', stage:'contract', stageNote:'Contract Out · 41d', unit:'2015 Fleetwood Bounder 34T',
			card:{ svg:'rv-motorhome', lane:'out', muted:true, source:'Phone Call', type:'Consignment', loc:'PHI', price:'$54,000', timer:{ label:'41d', status:'overdue', icon:'loader' }, activity:'Monthly long-tail touch — no reply', activityIcon:'mail', age:'6d' } }),
		boardLead({ id:'jeanette-okonkwo', waitingOn:'Inventory Admin', name:'Jeanette Okonkwo', initials:'JO', phone:'321-555-0113', email:'j.okonkwo@example.com', location:'Titusville, FL · FES', owner:'Sam Okafor', stage:'processing', stageNote:'Inspection Fee Settled · 1d', unit:'2017 Forest River Cherokee 274DBH',
			card:{ svg:'rv-trailer', lane:'fee', source:'Drive By', type:'Consignment', loc:'FES', price:'$18,500', timer:{ label:'1d', status:'neutral' }, activity:'Fee paid $399 — stock setup next', activityIcon:'credit-card', age:'1d' } })
	];
	const backofficeBoardLeads = [
		boardLead({ id:'diane-faulkner', waitingOn:'Inventory Admin', name:'Diane Faulkner', initials:'DF', phone:'361-555-0109', email:'d.faulkner@example.com', location:'Corpus Christi, TX · COR', owner:'Devon Marsh', stage:'motility', stageNote:'Added to Motility · 4d', unit:'2019 Keystone Raptor 356',
			card:{ svg:'rv-trailer', source:'Website', type:'Consignment', loc:'COR', price:'$58,000', stock:'5CR0834', timer:{ label:'4d', status:'neutral' }, activity:'Stocked — housekeeping email sent', activityIcon:'tag', age:'3d' } }),
		boardLead({ id:'patrick-dunleavy', waitingOn:'Inventory Admin', name:'Patrick Dunleavy', initials:'PD', phone:'864-555-0141', email:'p.dunleavy@example.com', location:'Spartanburg, SC · SPA', owner:'Devon Marsh', stage:'checkin', stageNote:'Check-In Scheduled · 5d', unit:'2018 Jayco Greyhawk 29MV',
			card:{ svg:'rv-motorhome', source:'Website', type:'Consignment', loc:'SPA', price:'$61,500', stock:'5CR0847', timer:{ label:'5d', status:'neutral' }, activity:'US Carriers transport — arrives Fri', activityIcon:'truck', age:'1d' } }),
		boardLead({ id:'simone-achterberg', waitingOn:'Inventory Admin', name:'Simone Achterberg', initials:'SA', phone:'352-555-0167', email:'s.achterberg@example.com', location:'Bushnell, FL · BUS', owner:'Riley Morgan', stage:'arrived', stageNote:'Arrived On Lot · 1d', unit:'2016 Grand Design Momentum 385TH',
			card:{ svg:'rv-trailer', source:'Website', type:'Consignment', loc:'BUS', price:'$49,900', stock:'5CR0841', timer:{ label:'1d', status:'neutral' }, activity:'Check-in at Inventory Review', activityIcon:'clipboard', age:'2h' } }),
		boardLead({ id:'stanley-brubaker', waitingOn:'Buy-in Admin', name:'Stanley Brubaker', initials:'SB', phone:'813-555-0150', email:'s.brubaker@example.com', location:'Zephyrhills, FL · ZEP', owner:'Devon Marsh', stage:'deals', stageNote:'Deal Funded · 2d', unit:'2018 Forest River Sunseeker 2500TS',
			card:{ svg:'rv-motorhome', lane:'funded', source:'Website', type:'Consignment', loc:'ZEP', price:'$57,900', stock:'5CR0806', timer:{ label:'2d', status:'neutral' }, activity:'Funded (AppOne) — payoff wired', activityIcon:'credit-card', age:'1d' } }),
		boardLead({ id:'rosa-delacroix', waitingOn:'GM', name:'Rosa Delacroix', initials:'RD', phone:'573-555-0172', email:'r.delacroix@example.com', location:'Bonne Terre, MO · BON', owner:'Sam Okafor', stage:'payout', stageNote:'Buy-In Complete · 1d', unit:'2017 Keystone Passport 2670BH',
			card:{ svg:'rv-trailer', lane:'buyin', source:'Website', type:'Consignment', loc:'BON', price:'$17,900', stock:'5CR0788', timer:{ label:'1d', status:'neutral' }, activity:'Check request awaiting sign-off', activityIcon:'clipboard', age:'3h' } })
	];

	/* lost leads — closed out with a reason; live in the collapsed Lost column */
	const salesLostLeads = [
		boardLead({ id:'greg-palmer', name:'Greg Palmer', initials:'GP', phone:'352-555-0125', email:'g.palmer@example.com', location:'Ocala, FL', owner:'Riley Morgan', stage:'lost', stageNote:'Lost · 4d', lost:{ reason:'Bought elsewhere', when:'4d' }, unit:'2021 Forest River Wildwood 27RE',
			card:{ svg:'rv-trailer', source:'Website', type:'Get Lowest Price', muted:true, timer:{ label:'Lost', status:'neutral' }, activity:'Lost — bought elsewhere (Camping World)', activityIcon:'x-circle', age:'4d' } }),
		boardLead({ id:'nina-rossi', name:'Nina Rossi', initials:'NR', phone:'352-555-0184', email:'n.rossi@example.com', location:'Ocala, FL', owner:'Sam Okafor', stage:'lost', stageNote:'Lost · 9d', lost:{ reason:'Stopped responding', when:'9d' },
			card:{ source:'RVChat', type:'Pre-Qualification', muted:true, timer:{ label:'Lost', status:'neutral' }, activity:'Lost — no reply after 6 attempts', activityIcon:'x-circle', age:'9d' } })
	];
	const consignLostLeads = [
		boardLead({ id:'mark-ellison', name:'Mark Ellison', initials:'ME', phone:'352-555-0166', email:'m.ellison@example.com', location:'Ocala, FL · OCA', owner:'Riley Morgan', stage:'lost', stageNote:'Lost · 6d', lost:{ reason:'Changed mind', when:'6d' }, unit:'2018 Jayco Jay Flight 28BHS',
			card:{ svg:'rv-trailer', source:'Website', type:'Consignment', loc:'OCA', muted:true, timer:{ label:'Lost', status:'neutral' }, activity:'Lost — decided to keep it another season', activityIcon:'x-circle', age:'6d' } })
	];

	/* ---------------------------------------------------------------------- */
	/* CARD FIELDS for inbox leads — what the pipeline card shows              */
	/* ---------------------------------------------------------------------- */
	const CARDS = {
		'tom-gallagher':      { image:IMG.redhawk, source:'Website', type:'Get Lowest Price', timer:{ label:'3m left', status:'urgent', icon:'clock' }, unitTitle:'2020 Newmar Bay Star 3226', activity:'Assigned to Sam Okafor', activityIcon:'inbox', age:'12m' },
		'priscilla-nguyen':   { image:IMG.redhawk, source:'RVChat', type:'Pre-Qualification', timer:{ label:'12m left', status:'info', icon:'clock' }, unitTitle:'2023 Jayco Redhawk 26XD', activity:'Auto-reply sent', activityIcon:'zap', age:'9m' },
		'renee-fontaine':     { source:'Phone Call', type:'General Info', timer:{ label:'6d', status:'flagged', icon:'clock' }, activity:'Left voicemail — try again Thursday', activityIcon:'phone', age:'2d', muted:true },
		'elaine-kowalski':    { source:'Referral', type:'General Info', unread:true, activity:'Call — no answer (2nd attempt)', activityIcon:'phone', age:'2h', flag:{ text:'No contact logged — flagged for review', tone:'warn', icon:'flag' } },
		'marcus-trent':       { image:IMG.thor, unitTitle:'2022 Thor ACE 32.3', source:'RVTrader.com', type:'Get Lowest Price', activity:'You: 1:30 works great — I\'ll have both parked up front.', activityIcon:'message-circle', age:'2h' },
		'dana-whitfield':     { svg:'rv-trailer', unitTitle:'2019 Grand Design Reflection 315RLTS', source:'Website', type:'Trade Evaluation', activity:'Email — “Trade value questions”', activityIcon:'mail', age:'1d' },
		'hector-alvarez':     { source:'Walk-In', type:'General Info', unread:'overdue', timer:{ label:'Overdue 2h', status:'overdue', icon:'clock' }, activity:'You: I\'ll check on that Montana and get back to you.', activityIcon:'message-circle', age:'1d' },
		'rob-cheryl-baxter':  { image:IMG.redhawk, unitTitle:'2023 Jayco Redhawk 26XD', source:'Walk-In', type:'Make Offer', activity:'Confirmed for this afternoon — thank you!', activityIcon:'message-circle', age:'3h' },
		/* consign desk */
		'tina-rojas':         { svg:'rv-motorhome', source:'RVTrader.com', type:'Consignment', loc:'OCA', timer:{ label:'Day 1', status:'neutral', icon:'more-horizontal' }, activity:'Day 1 of 321 — call, no answer', activityIcon:'phone', age:'2h' },
		'anita-brookshire':   { svg:'rv-trailer', source:'Referral', type:'Consignment', loc:'ZEP', unread:true, timer:{ label:'2d', status:'neutral' }, activity:'You: JD Power avg came in at $21,400 — let\'s talk term', activityIcon:'message-circle', age:'1h' },
		'owen-pruitt':        { image:IMG.thor, lane:'agreed', source:'Website', type:'Consignment', loc:'OCA', price:'$89,900', timer:{ label:'25m', status:'neutral' }, activity:'Converted from lead at $89,900', activityIcon:'check-circle', age:'25m' },
		'nadia-petrov':       { svg:'rv-trailer', lane:'collecting', source:'Referral', type:'Consignment', loc:'TIV', price:'$42,500', timer:{ label:'40m', status:'neutral' }, activity:'New 10-day payoff requested', activityIcon:'file-text', age:'35m', flag:{ text:'Bounced — payoff mismatch (4-point check)', tone:'warn', icon:'rotate-ccw' } },
		'sheila-marchetti':   { svg:'rv-trailer', lane:'signed', source:'Website', type:'Consignment', loc:'OCA', price:'$46,500', timer:{ label:'1d', status:'neutral' }, activity:'Signed — in the approval queue', activityIcon:'edit-3', age:'1d' },
		'colleen-vandermeer': { svg:'rv-trailer', lane:'approved', source:'Referral', type:'Consignment', loc:'BUS', price:'$52,000', badges:[{ label:'Fee due', status:'fee-due' }], timer:{ label:'2d', status:'neutral' }, activity:'Entity #48127 — fee link sent', activityIcon:'credit-card', age:'4h' },
		/* back office desk */
		'ron-haskell':        { svg:'rv-motorhome', source:'Phone Call', type:'Consignment', loc:'OKC', price:'$96,000', stock:'5CR0851', timer:{ label:'12d', status:'neutral' }, activity:'Consignor away until Labor Day', activityIcon:'message-circle', age:'2d' },
		'elena-vasquez-bo':   { svg:'rv-trailer', source:'Website', type:'Consignment', loc:'OCA', price:'$22,900', badges:[{ label:'Stock-pending', status:'flagged' }], timer:{ label:'2d', status:'neutral' }, activity:'Check-in Thu 10 AM — reminder sent', activityIcon:'calendar', age:'1d', stockNote:'Stock pending' },
		'gerald-whitcomb':    { svg:'rv-trailer', source:'Website', type:'Consignment', loc:'ZEP', price:'$19,900', stock:'5CR0829', badges:[{ label:'Condition re-evaluation', status:'flagged' }], timer:{ label:'1d', status:'neutral' }, activity:'Walk-around done — 32 photos', activityIcon:'camera', age:'3h', flag:{ text:'Check-in returned — condition differs from described', tone:'warn', icon:'rotate-ccw' } },
		'lorraine-beckett':   { image:IMG.thor, lane:'progress', source:'Website', type:'Consignment', loc:'OCA', price:'$118,000', stock:'CBR0142', badges:[{ label:'CBR', status:'dark' }, { label:'Delivery hold', status:'overdue' }], timer:{ label:'3d', status:'neutral' }, activity:'Payoff over price — hold sent to GM', activityIcon:'alert-triangle', age:'2h' },
		'janet-ferrell':      { image:IMG.redhawk, lane:'progress', source:'Website', type:'Consignment', loc:'OCA', price:'$74,900', stock:'5CR0797', timer:{ label:'5d', status:'neutral' }, activity:'Buyer deal · 09. Paperwork Complete', activityIcon:'briefcase', age:'1d' },
		'milton-greer':       { svg:'rv-motorhome', lane:'buyin', source:'Website', type:'Consignment', loc:'TAL', price:'$139,000', stock:'5CR0776', badges:[{ label:'CIT hold', status:'flagged' }], timer:{ label:'9d', status:'neutral' }, activity:'On the CIT report — check held', activityIcon:'lock', age:'2d' }
	};
	[salesLeads, consignLeads, backofficeLeads].flat().forEach(l => { if (CARDS[l.id]) l.card = CARDS[l.id]; });

	/* board layout per desk: which stages get sub-lanes / a summary column */
	const BOARDS = {
		sales: { lanes:{} },
		consign: {
			filters:['location', 'owner', 'waiting'],
			lanes:{
				documents:[ { id:'agreed', label:'Price Agreed' }, { id:'collecting', label:'Collecting Documents' } ],
				contract:[ { id:'out', label:'Contract Out' }, { id:'signed', label:'Contract Signed' } ],
				processing:[ { id:'approved', label:'Manager Approved' }, { id:'fee', label:'Inspection Fee Settled' } ]
			}
		},
		backoffice: {
			filters:['location', 'owner', 'waiting'],
			lanes:{
				deals:[ { id:'progress', label:'Sale In Progress' }, { id:'funded', label:'Deal Funded' } ],
				payout:[ { id:'buyin', label:'Buy-In Complete' }, { id:'paid', label:'Consignor Paid', count:38, collapsed:true } ]
			},
			summary:{
				stage:'forsale', count:'1,012', scope:'All stores',
				buckets:{ label:'Days on lot', rows:[ ['0–15 days', 84], ['16–30 days', 97], ['31–60 days', 188], ['61–90 days', 203], ['91–120 days', 226], ['120+ days', 214] ] },
				queues:{ label:'Queues', rows:[ { label:'Off Market · Pickup Pending', count:31, tone:'warn', note:'Newest: Harold Brenner — 2016 Georgetown 364TS · TAL', age:'20m' }, { label:'Term ending · 14 days or less', count:47, tone:'ok' } ] }
			}
		}
	};

	const OWNERS = { sales:['Riley Morgan', 'Sam Okafor'], consignment:['Riley Morgan', 'Sam Okafor', 'Devon Marsh'] };
	/* stores — from optimumrv.com's location list; hours from the store pages (Ocala verified, others assumed the same) */
	const STORES = [
		{ id:278,  code:'OCA', name:'Ocala, FL', reps:['Riley Morgan', 'Sam Okafor'],          address:'7400 S. US Highway 441, Ocala FL 34480',       phone:'352-477-8377', hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:[11,17] } },
		{ id:819,  code:'BUS', name:'Bushnell, FL', reps:['Devon Marsh'],       address:'2540 West County Road 48, Bushnell FL 33513',  phone:'352-477-8379', hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:[11,17] } },
		{ id:924,  code:'TIV', name:'Titusville, FL', reps:['Kara Bell'],     address:'2764 US-1, Mims FL 32754',                     phone:'321-404-6801', hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:[11,17] } },
		{ id:468,  code:'ZEP', name:'Zephyrhills, FL', reps:['Luis Ortega'],    address:'3334 Paul S Buchman Hwy., Zephyrhills FL 33540', phone:'813-681-3055', hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:[11,17] } },
		{ id:1587, code:'TAL', name:'Tallahassee, FL', reps:['Devon Marsh'],    address:'Tallahassee FL',                               phone:'',             hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:[11,17] } },
		{ id:862,  code:'SPA', name:'Spartanburg, SC', reps:['Devon Marsh'],    address:'9600 Ashville Hwy, Inman SC 29349',            phone:'864-473-5709', hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:null } },
		{ id:1097, code:'PHI', name:'Philadelphia, PA', reps:['Sam Okafor'],   address:'1809 W High St., Pottstown PA 19464',          phone:'610-922-1832', hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:null } },
		{ id:1523, code:'BON', name:'Bonne Terre, MO', reps:['Marcus Lee'],    address:'Bonne Terre MO',                               phone:'',             hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:null } },
		{ id:1522, code:'STL', name:'St. Louis, MO', reps:['Marcus Lee'],      address:'3441 US 67, Festus MO 63028',                  phone:'636-586-7600', hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:null } },
		{ id:1388, code:'COR', name:'Corpus Christi, TX', reps:['Devon Marsh'], address:'4460 US-77, Robstown TX 78380',                phone:'361-360-8004', hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:null } },
		{ id:1657, code:'HAR', name:'Harlingen, TX', reps:['Ana Reyes'],      address:'Harlingen TX',                                 phone:'',             hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:null } },
		{ id:1809, code:'OKC', name:'Oklahoma City, OK', reps:['Sam Okafor'],  address:'Oklahoma City OK',                             phone:'',             hours:{ mon:[8,19], tue:[8,19], wed:[8,19], thu:[8,19], fri:[8,19], sat:[8,19], sun:null } }
	];
	const LOCATIONS = ['Ocala, FL', 'Bushnell, FL', 'Titusville, FL', 'Zephyrhills, FL', 'Tallahassee, FL', 'Spartanburg, SC', 'Philadelphia, PA', 'Bonne Terre, MO', 'St. Louis, MO', 'Corpus Christi, TX', 'Harlingen, TX', 'Oklahoma City, OK'];

	/* ---------------------------------------------------------------------- */
	/* CALENDAR — week of Mon Aug 17 2026 (today = Wed 19, 11:35 AM)          */
	/* event.kind: 'appointment' | 'followup'; start/end in decimal hours      */
	/* ---------------------------------------------------------------------- */
	/* the sample week floats with the real date: the mock "Wednesday" is always today, so the demo never goes stale */
	const REL = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + (n - 2)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
	const CALENDAR = { startHour:0, endHour:24, workHours:[8, 19] };
	const salesEvents = [
		{ id:'ev-dana',     kind:'appointment', date:REL(0), start:16, end:17,     lead:'dana-whitfield',    name:'Dana Whitfield',      unit:'2019 Grand Design Reflection 315RLTS', type:'Sales Visit', image:null, svg:'rv-trailer', owner:'Riley Morgan', state:'past' },
		{ id:'ev-hector-1', kind:'appointment', date:REL(1), start:14, end:15,     lead:'hector-alvarez',    name:'Hector Alvarez',      type:'Be-Back', timeLabel:'2 – 3 PM', owner:'Sam Okafor', state:'cancelled' },
		{ id:'fu-elaine',   kind:'followup',    date:REL(2), start:9.5,            lead:'elaine-kowalski',   label:'Call Elaine Kowalski' },
		{ id:'fu-hector',   kind:'followup',    date:REL(2), start:10,             lead:'hector-alvarez',    label:'Text Hector Alvarez', status:'overdue' },
		{ id:'ev-marcus',   kind:'appointment', date:REL(2), start:13.5, end:14.5, lead:'marcus-trent',      name:'Marcus Trent',        unit:'2022 Thor ACE 32.3', type:'Sales Visit', image:IMG.thor, owner:'Riley Morgan', done:true },
		{ id:'ev-baxter',   kind:'appointment', date:REL(2), start:16.5, end:17.5, lead:'rob-cheryl-baxter', name:'Rob & Cheryl Baxter', type:'Delivery', timeLabel:'4:30 – 5:30 PM', owner:'Riley Morgan', tone:'ok', done:true },
		{ id:'fu-renee',    kind:'followup',    date:REL(3), start:10,             lead:'renee-fontaine',    label:'Call Renee Fontaine' },
		{ id:'ev-hector-2', kind:'appointment', date:REL(3), start:15, end:16,     lead:'hector-alvarez',    name:'Hector Alvarez',      type:'Be-Back', timeLabel:'3 – 4 PM', owner:'Sam Okafor', tone:'working' },
		{ id:'fu-marcus',   kind:'followup',    date:REL(4), start:9,              lead:'marcus-trent',      label:'Email Marcus Trent' },
		{ id:'ev-priscilla',kind:'appointment', date:REL(4), start:10, end:11,     lead:'priscilla-nguyen',  name:'Priscilla Nguyen',    unit:'2023 Jayco Redhawk 26XD', type:'Sales Visit', image:IMG.redhawk, owner:'Sam Okafor' },
		{ id:'ev-tom',      kind:'appointment', date:REL(5), start:11, end:12,     lead:'tom-gallagher',     name:'Tom Gallagher',       unit:'2020 Newmar Bay Star 3226', type:'Sales Visit', image:IMG.redhawk, owner:'Sam Okafor' }
	];
	const consignmentEvents = [
		{ id:'fu-baxter-60', kind:'followup',    date:REL(2), start:9.5,           lead:'rob-cheryl-baxter-bo', label:'Send 60-day update — Baxters', status:'overdue' },
		{ id:'fu-anita',     kind:'followup',    date:REL(2), start:10,            lead:'anita-brookshire',     label:'Text Anita Brookshire — term' },
		{ id:'ev-priscilla-pickup', kind:'appointment', date:REL(2), start:14, end:15, lead:'priscilla-nguyen-bo', name:'Priscilla Nguyen', unit:'2017 Jayco Eagle 330RSTS', type:'Pickup', svg:'rv-trailer', owner:'Riley Morgan', tone:'ok' },
		{ id:'ev-gerald',    kind:'appointment', date:REL(2), start:15, end:16,    lead:'gerald-whitcomb',      name:'Gerald Whitcomb',  unit:'2019 Coachmen Catalina 263BHSCK', type:'Condition re-evaluation', svg:'rv-trailer', owner:'Sam Okafor', tone:'working' },
		{ id:'fu-nadia',     kind:'followup',    date:REL(3), start:9.5,           lead:'nadia-petrov',         label:'Call Nadia Petrov — payoff letter' },
		{ id:'ev-elena',     kind:'appointment', date:REL(3), start:10, end:11,    lead:'elena-vasquez',        name:'Elena Vasquez',    unit:'2020 Winnebago Minnie 2301BHS', type:'Drop-off', svg:'rv-trailer', owner:'Riley Morgan' },
		{ id:'ev-harold',    kind:'appointment', date:REL(4), start:11, end:12,    lead:'harold-brenner',       store:'TAL', name:'Harold Brenner',   unit:'2016 Forest River Georgetown 364TS', type:'Pickup', svg:'rv-motorhome', owner:'Devon Marsh', tone:'ok' }
	];
	const APPOINTMENT_TYPES = { sales:['Sales Visit', 'Be-Back', 'Delivery', 'Test Drive', 'Trade Appraisal'], consignment:['Drop-off', 'Pickup', 'Inspection', 'Condition re-evaluation', 'Signing'] };

	return {
		locations: LOCATIONS,
		stores: STORES,
		calendar: { startHour:CALENDAR.startHour, endHour:CALENDAR.endHour, workHours:CALENDAR.workHours, events:{ sales:salesEvents, management:salesEvents, consignment:consignmentEvents }, types:APPOINTMENT_TYPES },
		roles: {
			sales: {
				label:'Salesperson',
				user:{ name:'Riley Morgan', initials:'RM', location:'Ocala, FL' },
				defaultDesk:'default',
				desks:{
					default:{ label:'Sales', stages:STAGES.sales, board:BOARDS.sales, ownerScope:'mine', tabs:[ { id:'new', label:'New' }, { id:'today', label:'Due' }, { id:'working', label:'All' } ], defaultTab:'working', defaultLead:'marcus-trent', leads:salesLeads.concat(salesLostLeads) }
				}
			},
			management: {
				label:'Management',
				user:{ name:'Jordan Pike', initials:'JP', location:'Ocala, FL' },
				owners:OWNERS.sales, ownerLabel:'All Salespeople',
				defaultDesk:'default',
				desks:{
					default:{ label:'Sales floor', showOwner:true, stages:STAGES.sales, board:Object.assign({ filters:['location', 'owner'] }, BOARDS.sales), tabs:[ { id:'new', label:'New' }, { id:'today', label:'Due' }, { id:'working', label:'All' } ], defaultTab:'working', defaultLead:'marcus-trent', leads:salesLeads.concat(salesLostLeads) }
				}
			},
			consignment: {
				label:'Consignment',
				user:{ name:'Riley Morgan', initials:'RM', location:'Ocala, FL' },
				owners:OWNERS.consignment, ownerLabel:'All Listers',
				defaultDesk:'consign',
				desks:{
					consign:{ label:'Consign', showOwner:true, stages:STAGES.consign, board:BOARDS.consign, tabs:[ { id:'new', label:'New' }, { id:'due', label:'Due' }, { id:'working', label:'All' } ], defaultTab:'working', defaultLead:'anita-brookshire', leads:consignLeads.concat(consignBoardLeads, consignLostLeads) },
					backoffice:{ label:'Back Office', showOwner:true, stages:STAGES.backoffice, board:BOARDS.backoffice, tabs:[ { id:'today', label:'Today' }, { id:'due', label:'Due' }, { id:'all', label:'All' } ], defaultTab:'all', defaultLead:'rob-cheryl-baxter-bo', leads:backofficeLeads.concat(backofficeBoardLeads) }
				}
			}
		}
	};
})();
