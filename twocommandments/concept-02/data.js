/* ========================================================================== */
/* II COMMANDMENTS — mock data                                                */
/* Every page renders from this file (+ verses.js for the verse text).        */
/* Shape:                                                                     */
/*   TC_DATA.versions[]   Bible versions in the picker (bundled or licensed)  */
/*   TC_DATA.gospels[]    the four Gospel buttons + their passage             */
/*   TC_DATA.related[]    the "related verses" (featured:true = own step)       */
/*   TC_DATA.tv[]         television channels { id, label, yt, start }         */
/*   TC_DATA.share[]      call-to-share verses                                */
/*   TC_DATA.churches[]   sample churches / non-profits                       */
/*   TC_DATA.designers[]  seed designer profiles                              */
/*   TC_DATA.products[]   media types the merch can be printed on             */
/*   TC_DATA.split        how a sale is divided                               */
/* Field names here are the names a backend will map onto.                    */
/* ========================================================================== */
window.TC_DATA = (function () {

	/* ---------------------------------------------------------------------- */
	/* BIBLE VERSIONS                                                          */
	/* bundled = text lives in verses.js (public domain).                      */
	/* api = licensed; needs API.Bible / ESV API behind a Worker. Shown greyed. */
	/* ---------------------------------------------------------------------- */
	const versions = [
		{ id:'web', label:'World English Bible (WEB)', short:'WEB', source:'bundled', licensed:false },
		{ id:'kjv', label:'King James Version (KJV)',  short:'KJV', source:'bundled', licensed:false },
		{ id:'asv', label:'American Standard Version (ASV)', short:'ASV', source:'bundled', licensed:false },
		{ id:'csb', label:'Christian Standard Bible (CSB)', short:'CSB', source:'api', licensed:true },
		{ id:'niv', label:'New International Version (NIV)', short:'NIV', source:'api', licensed:true },
		{ id:'esv', label:'English Standard Version (ESV)', short:'ESV', source:'api', licensed:true }
	];
	const defaultVersion = 'web'; /* the founder's default is CSB (doc, Oct 2026) — licensed; WEB until then */

	/* ---------------------------------------------------------------------- */
	/* GOSPELS — panel 5 buttons → the passage popup (v.3); `more` = extra refs under the main passage. */
	/* John's 15:9-17 moved here from the related verses (CL). Was: panel 6 passages                */
	/* symbol + color per the storyboard (Ezekiel 1:5-10, Revelation 4:6-8)    */
	/* ---------------------------------------------------------------------- */
	const gospels = [
		{ id:'matthew', label:'Matthew', symbol:'Winged man', icon:'assets/gospel-matthew.svg', ref:'matthew.22.34-40', meaning:'Humanity, reason and divine inspiration — the Gospel of Jesus’ human nature and genealogy.' },
		{ id:'mark',    label:'Mark',    symbol:'Lion',       icon:'assets/gospel-mark.svg',    ref:'mark.12.28-34',    meaning:'Courage, royalty and prophetic voice — the Gospel that opens with a voice in the wilderness.' },
		{ id:'luke',    label:'Luke',    symbol:'Ox',         icon:'assets/gospel-luke.svg',    ref:'luke.10.27-28',    meaning:'Sacrifice, service and strength — the Gospel of compassion and the Good Samaritan.' },
		{ id:'john',    label:'John',    symbol:'Eagle',      icon:'assets/gospel-john.svg',    ref:'john.15.12-14',    more:['john.15.9-17'], meaning:'Spiritual insight and divine vision — the Gospel that gazes into the sun.' }
	];

	/* ---------------------------------------------------------------------- */
	/* RELATED VERSES — panel 11 ("maybe a side track")                        */
	/* ---------------------------------------------------------------------- */
	/* v.3: `featured:true` verses get a full-height step of their own (in this order); the rest are the quiet "More" row */
	const related = [
		{ ref:'romans.13.8-10',   title:'Love fulfills the Law', featured:true },
		{ ref:'galatians.5.14',   title:'The whole law in one word', featured:true },
		{ ref:'matthew.5.43-48',  title:'Love for enemies' },
		{ ref:'matthew.5.17-19',  title:'The fulfillment of the Law' },
		{ ref:'luke.10.30-37',    title:'The Good Samaritan' },
		{ ref:'james.2.8',        title:'The royal law' },
		{ ref:'1john.4.7-12',     title:'God’s love and ours' },
		{ ref:'1john.4.19-21',    title:'We love because he first loved us' },
		{ ref:'galatians.5.13-14',title:'Life by the Spirit' }
		/* John 15:9-17 left this list: it is the John window's `more` */
	];

	/* ---------------------------------------------------------------------- */
	/* CALL TO SHARE — panel 12 (subtle)                                       */
	/* ---------------------------------------------------------------------- */
	const share = [
		{ ref:'matthew.28.19-20', title:'Go, therefore' },
		{ ref:'mark.16.15',       title:'Go into all the world' }
	];

	/* ---------------------------------------------------------------------- */
	/* CHURCHES / NON-PROFITS — panel 13 sample list                           */
	/* ---------------------------------------------------------------------- */
	const churches = [
		{ id:'sample-community',  name:'Sample Community Church',      city:'Tampa, FL',   url:'https://example.org', kind:'church' },
		{ id:'sample-cathedral',  name:'Sample Cathedral Parish',      city:'Orlando, FL', url:'https://example.org', kind:'church' },
		{ id:'sample-orthodox',   name:'Sample Orthodox Church',       city:'Miami, FL',   url:'https://example.org', kind:'church' },
		{ id:'sample-foodbank',   name:'Sample Food Bank',             city:'Tampa, FL',   url:'https://example.org', kind:'nonprofit' },
		{ id:'sample-shelter',    name:'Sample Family Shelter',        city:'St. Petersburg, FL', url:'https://example.org', kind:'nonprofit' }
	];

	/* ---------------------------------------------------------------------- */
	/* DESIGNERS — seed profiles (placeholders; ~10 wanted before launch).     */
	/* Design thumbs are public-domain artwork standing in for the designers'   */
	/* work (credits in `art`; sources in design-iterations/inspiration/artwork). */
	/* ---------------------------------------------------------------------- */
	const designers = [
		{
			id:'designer-one', name:'Designer One', location:'Tampa, FL', initials:'D1',
			tagline:'Hand-lettering and warm, worn textures.',
			styles:['lettering','vintage','screen print'],
			story:'Placeholder story. This is where the designer tells, in their own words, how the two commandments show up in their work and their life. Two or three short paragraphs, first person.',
			designs:[
				{ id:'d1-love-god', title:'Love God', thumb:'assets/art/callot-sermon.jpg', art:'Callot, The Sermon on the Mount (1635)' },
				{ id:'d1-neighbor', title:'Neighbor', thumb:'assets/art/bloch-sermon.jpg', art:'Bloch, Sermon on the Mount (1877)' },
				{ id:'d1-hang',     title:'All the Law', thumb:'assets/art/currier-ives-sermon.jpg', art:'Currier & Ives, Christ’s Sermon on the Mount (1866)' }
			]
		},
		{
			id:'designer-two', name:'Designer Two', location:'Nashville, TN', initials:'D2',
			tagline:'Minimal type, one color, lots of air.',
			styles:['typographic','minimal','monochrome'],
			story:'Placeholder story for the second seed designer.',
			designs:[
				{ id:'d2-two',   title:'Two', thumb:'assets/art/rembrandt-preaching.jpg', art:'Rembrandt, Christ Preaching (c. 1657)' },
				{ id:'d2-keep',  title:'Keep my commandments', thumb:'assets/art/wechtlin-preaching.jpg', art:'Wechtlin, Christ Preaching (1508)' }
			]
		},
		{
			id:'designer-three', name:'Designer Three', location:'Austin, TX', initials:'D3',
			tagline:'Illustrated symbols of the four Gospels.',
			styles:['illustration','iconography','color'],
			story:'Placeholder story for the third seed designer.',
			designs:[
				{ id:'d3-lion',  title:'Lion', thumb:'assets/art/durer-doctors.jpg', art:'Dürer, Christ Among the Doctors (c. 1503)' },
				{ id:'d3-eagle', title:'Eagle', thumb:'assets/art/rembrandt-samaritan.jpg', art:'Rembrandt, The Good Samaritan (1633)' },
				{ id:'d3-ox',    title:'Ox', thumb:'assets/art/tissot-samaritan.jpg', art:'Tissot, The Good Samaritan (1886–94)' }
			]
		}
	];

	/* ---------------------------------------------------------------------- */
	/* PRODUCTS — media types (print per order; pricing is placeholder)        */
	/* ---------------------------------------------------------------------- */
	const products = [
		{ id:'tee',    label:'T-shirt',   price:28, sizes:['S','M','L','XL','2XL'], colors:['white','black','sand'] },
		{ id:'hoodie', label:'Hoodie',    price:52, sizes:['S','M','L','XL','2XL'], colors:['black','grey'] },
		{ id:'hat',    label:'Hat',       price:26, sizes:['One size'],            colors:['black','navy','khaki'] },
		{ id:'mug',    label:'Mug',       price:18, sizes:['11 oz','15 oz'],       colors:['white'] },
		{ id:'print',  label:'Art print', price:22, sizes:['8×10','11×14','18×24'], colors:['matte'] }
	];

	/* ---------------------------------------------------------------------- */
	/* THE SPLIT — how every sale is divided (from the storyboard "About" row) */
	/* ---------------------------------------------------------------------- */
	/* Two cases (Thom, 2026-09-30): with a church chosen it's thirds; with no    */
	/* church affiliation the designer and II Commandments split 50/50. The 1%   */
	/* foundation line from the storyboard stays until the founder confirms it.  */
	const split = {
		withChurch:[
			{ id:'church',   label:'Your church or non-profit', share:0.33 },
			{ id:'designer', label:'The designer',              share:0.33 },
			{ id:'business', label:'II Commandments',           share:0.33 },
			{ id:'foundation', label:'Foundation',              share:0.01 }
		],
		noChurch:[
			{ id:'designer', label:'The designer',              share:0.50 },
			{ id:'business', label:'II Commandments',           share:0.50 }
		]
	};

	/* ---------------------------------------------------------------------- */
	/* MUSIC — the opening panel (founder: "music, ideally Aramaic"). His picks */
	/* from the sheet's NOTES columns. Licensed recordings: no file is bundled;  */
	/* set `src` once a license exists and the sound toggle plays it.           */
	/* ---------------------------------------------------------------------- */
	const music = [
		{ id:'fagrok',  title:'Fagrok Mor Wadhmok', artist:'Sam Thomas', language:'Syriac', src:null },
		{ id:'syriac',  title:'രക്ഷകനുര ചെയ്താൻ (Syriac)', artist:'Sam Thomas · Brothers of Sophia', language:'Syriac', src:null }
	];

	/* focus-group test: one set per tradition, picked with ?music= or the picker; YouTube ids, nothing bundled */
	const musicSets = {
		cinematic:  { label:'Cinematic',  ids:['cWBi3L-Nx9A'] }, /* CL: "USE this playlist for now" — the default */
		syriac:     { label:'Syriac',     ids:['uyoXMs8AZcg', '4vdk1jo7Tw8', '5e9rGmiCxJU'] },
		catholic:   { label:'Catholic',   ids:['FLbyr94LH1I', 'o2_YXd0FPxY'] },
		orthodox:   { label:'Orthodox',   ids:['zLEXAjetYd4'] },
		protestant: { label:'Protestant', ids:['DlAZxnpsFdo'] }
	};

	/* ---------------------------------------------------------------------- */
	/* TELEVISION — the "watch" option (CL's doc: GIVE OPTION TO WATCH).        */
	/* CL will add more channels; each is a YouTube id + start second.         */
	/* Some of these films may refuse to play embedded: the set always shows a  */
	/* "Watch on YouTube" link for the current channel.                         */
	/* ---------------------------------------------------------------------- */
	const tv = [
		/* the sermon leads because it plays embedded; the Matthew film is age-restricted on YouTube and only opens through the link */
		{ id:'love',    label:'Love · Aaron Burke',    yt:'JLk6Xfwd09U', start:1140 },
		{ id:'matthew', label:'The Gospel of Matthew', yt:'-pUy_ytMt3U', start:6829 },
		{ id:'john',    label:'The Gospel of John',    yt:'IZLDEWg9JkU', start:7349 }
	];

	return { versions, defaultVersion, gospels, related, share, churches, designers, products, split, music, musicSets, tv };
})();
