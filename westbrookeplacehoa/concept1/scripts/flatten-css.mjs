#!/usr/bin/env node
/* ========================================================================== */
/* Flatten native CSS nesting (`& …` rules inside a parent block) into plain  */
/* selectors, because HOA Express validates pasted CSS with the W3C CSS       */
/* Validator, which cannot parse nesting ("Parse Error").                     */
/*                                                                            */
/* Handles the shapes this file uses:                                         */
/*   parent { decls; & child { … } & .a, & .b { … } @media (…) { & x { … } } } */
/* → parent { decls }  parent child { … }  parent .a, parent .b { … }          */
/*   @media (…) { parent x { … } }                                            */
/* Comments and order are preserved. Writes <in> → <out>; never in place.     */
/* Usage: node scripts/flatten-css.mjs custom-css/hoa-custom.css out.css      */
/* ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';

const [,, inFile, outFile] = process.argv;
if (!inFile || !outFile) { console.error('usage: flatten-css.mjs <in.css> <out.css>'); process.exit(1); }
const src = readFileSync(inFile, 'utf8');

/* --- tokenize into a tree of { prelude, body: [decls|rules], comments } ---- */
function parse(text) {
	let i = 0;
	function skipWs() { while (i < text.length && /\s/.test(text[i])) i++; }
	function readComment() { const end = text.indexOf('*/', i + 2); const c = text.slice(i, end + 2); i = end + 2; return c; }
	function readUntil(stops) { /* read raw text until one of the stop chars at depth 0, respecting strings/parens/comments */
		let out = '', depth = 0;
		while (i < text.length) {
			const ch = text[i];
			if (ch === '/' && text[i + 1] === '*') { out += readComment(); continue; }
			if (ch === '"' || ch === "'") { const q = ch; let s = ch; i++; while (i < text.length && text[i] !== q) { if (text[i] === '\\') { s += text[i++]; } s += text[i++]; } s += text[i++]; out += s; continue; }
			if (ch === '(') depth++; if (ch === ')') depth--;
			if (depth === 0 && stops.includes(ch)) break;
			out += ch; i++;
		}
		return out;
	}
	function block() { /* after '{' : returns array of nodes until matching '}' */
		const nodes = [];
		for (;;) {
			skipWs();
			if (i >= text.length) return nodes;
			if (text[i] === '}') { i++; return nodes; }
			if (text[i] === '/' && text[i + 1] === '*') { nodes.push({ type:'comment', text:readComment() }); continue; }
			const head = readUntil(['{', ';', '}']);
			if (text[i] === '{') { i++; nodes.push({ type:'rule', prelude:head.trim(), body:block() }); }
			else if (text[i] === ';') { i++; nodes.push({ type:'decl', text:head.trim() }); }
			else { if (head.trim()) nodes.push({ type:'decl', text:head.trim() }); }
		}
	}
	const top = []; /* top level: same as block but no closing brace */
	for (;;) {
		skipWs();
		if (i >= text.length) break;
		if (text[i] === '/' && text[i + 1] === '*') { top.push({ type:'comment', text:readComment() }); continue; }
		const head = readUntil(['{', ';']);
		if (text[i] === '{') { i++; top.push({ type:'rule', prelude:head.trim(), body:block() }); }
		else { i++; top.push({ type:'at', text:head.trim() + ';' }); }
	}
	return top;
}

/* --- flatten -------------------------------------------------------------- */
const splitSel = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
const join = (parent, child) => splitSel(parent).flatMap(p => splitSel(child).map(c => c.includes('&') ? c.replace(/&/g, p) : `${p} ${c}`)).join(',\n');

function emit(nodes, parentSel, indent = '') {
	let out = '';
	for (const n of nodes) {
		if (n.type === 'comment') { out += `${indent}${n.text}\n`; continue; }
		if (n.type === 'at') { out += `${indent}${n.text}\n`; continue; }
		if (n.type === 'decl') { out += `${indent}${n.text};\n`; continue; }
		if (n.prelude.startsWith('@')) {
			/* at-rule: keep it, flatten its contents with the same parent */
			out += `${indent}${n.prelude} {\n${emit(n.body, parentSel, indent + '  ')}${indent}}\n`;
			continue;
		}
		const sel = parentSel ? join(parentSel, n.prelude) : n.prelude;
		const decls = n.body.filter(b => b.type === 'decl' || b.type === 'comment');
		const rules = n.body.filter(b => b.type === 'rule');
		if (decls.some(d => d.type === 'decl') || !rules.length) {
			out += `${indent}${sel} {\n`;
			for (const d of decls) out += d.type === 'decl' ? `${indent}  ${d.text};\n` : `${indent}  ${d.text}\n`;
			out += `${indent}}\n`;
		} else { for (const d of decls) if (d.type === 'comment') out += `${indent}${d.text}\n`; }
		if (rules.length) out += emit(rules, sel, indent);
	}
	return out;
}

const tree = parse(src);
const flat = emit(tree, '');
writeFileSync(outFile, flat);
const nested = (src.match(/^\s*&/gm) || []).length;
console.log(`flattened ${nested} nested rules → ${outFile} (${flat.length} bytes)`);
