/* ========================================================================== */
/* II COMMANDMENTS — mock data                                                */
/* Every page renders from this file (+ verses.js for the verse text).        */
/* Shape:                                                                     */
/*   TC_DATA.versions[]   Bible versions in the picker (bundled or licensed)  */
/*   TC_DATA.gospels[]    the four Gospel buttons + their passage             */
/*   TC_DATA.related[]    the "related verses" side track                     */
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
	/* GOSPELS — panel 5 buttons → panel 6 passages                            */
	/* symbol + color per the storyboard (Ezekiel 1:5-10, Revelation 4:6-8)    */
	/* ---------------------------------------------------------------------- */
	const gospels = [
		{ id:'matthew', label:'Matthew', symbol:'Winged man', icon:'assets/gospel-matthew.svg', ref:'matthew.22.36-40', meaning:'Humanity, reason and divine inspiration — the Gospel of Jesus’ human nature and genealogy.' },
		{ id:'mark',    label:'Mark',    symbol:'Lion',       icon:'assets/gospel-mark.svg',    ref:'mark.12.28-34',    meaning:'Courage, royalty and prophetic voice — the Gospel that opens with a voice in the wilderness.' },
		{ id:'luke',    label:'Luke',    symbol:'Ox',         icon:'assets/gospel-luke.svg',    ref:'luke.10.25-37',    meaning:'Sacrifice, service and strength — the Gospel of compassion and the Good Samaritan.' },
		{ id:'john',    label:'John',    symbol:'Eagle',      icon:'assets/gospel-john.svg',    ref:'john.13.34-35',    meaning:'Spiritual insight and divine vision — the Gospel that gazes into the sun.' }
	];

	/* ---------------------------------------------------------------------- */
	/* RELATED VERSES — panel 11 ("maybe a side track")                        */
	/* ---------------------------------------------------------------------- */
	const related = [
		{ ref:'matthew.5.43-48',  title:'Love for enemies' },
		{ ref:'matthew.5.17-20',  title:'The fulfillment of the Law' },
		{ ref:'john.15.9-17',     title:'As the Father has loved me' },
		{ ref:'romans.13.8-10',   title:'Love fulfills the Law' },
		{ ref:'galatians.5.13-14',title:'Life by the Spirit' },
		{ ref:'james.2.8',        title:'The royal law' },
		{ ref:'1john.4.7-12',     title:'God’s love and ours' },
		{ ref:'1john.4.19-21',    title:'We love because he first loved us' }
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
	/* DESIGNERS — seed profiles (placeholders; ~10 wanted before launch)      */
	/* ---------------------------------------------------------------------- */
	const designers = [
		{
			id:'designer-one', name:'Designer One', location:'Tampa, FL', initials:'D1',
			tagline:'Hand-lettering and warm, worn textures.',
			styles:['lettering','vintage','screen print'],
			story:'Placeholder story. This is where the designer tells, in their own words, how the two commandments show up in their work and their life. Two or three short paragraphs, first person.',
			designs:[
				{ id:'d1-love-god', title:'Love God', thumb:'assets/design-placeholder.svg' },
				{ id:'d1-neighbor', title:'Neighbor', thumb:'assets/design-placeholder.svg' },
				{ id:'d1-hang',     title:'All the Law', thumb:'assets/design-placeholder.svg' }
			]
		},
		{
			id:'designer-two', name:'Designer Two', location:'Nashville, TN', initials:'D2',
			tagline:'Minimal type, one color, lots of air.',
			styles:['typographic','minimal','monochrome'],
			story:'Placeholder story for the second seed designer.',
			designs:[
				{ id:'d2-two',   title:'Two', thumb:'assets/design-placeholder.svg' },
				{ id:'d2-keep',  title:'Keep my commandments', thumb:'assets/design-placeholder.svg' }
			]
		},
		{
			id:'designer-three', name:'Designer Three', location:'Austin, TX', initials:'D3',
			tagline:'Illustrated symbols of the four Gospels.',
			styles:['illustration','iconography','color'],
			story:'Placeholder story for the third seed designer.',
			designs:[
				{ id:'d3-lion',  title:'Lion', thumb:'assets/design-placeholder.svg' },
				{ id:'d3-eagle', title:'Eagle', thumb:'assets/design-placeholder.svg' },
				{ id:'d3-ox',    title:'Ox', thumb:'assets/design-placeholder.svg' }
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

	return { versions, defaultVersion, gospels, related, share, churches, designers, products, split, music };
})();
