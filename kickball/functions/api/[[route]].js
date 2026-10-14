/* ========================================================================== */
/* KICKBALL — cloud backup (beta). Cloudflare Pages Function + D1.            */
/* The phone is still the source of truth; this keeps timestamped copies so a  */
/* lost phone, a cleared Safari, or a bad tap can be rolled back. Every call    */
/* needs an invite code (table `codes`). Caps live in `flags` so they can be   */
/* changed without a deploy. Over a cap → 429 with {paused} — the app shows    */
/* the footer notice and keeps working on the phone.                           */
/*   GET  /api/status?code=                    → { sync, code }                */
/*   POST /api/sync        { code, device, label, hash, gameId, status, note, body } */
/*   GET  /api/snapshots?code=[&device=]       → latest 60 across the code's devices */
/*   GET  /api/snapshot?code=&id=              → the stored body (text)        */
/* ========================================================================== */

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers:{ 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' } });
const dayStart = (now) => now - (now % 86400000);

async function flags(db) {
	const { results } = await db.prepare('SELECT key, value FROM flags').all();
	const f = Object.fromEntries(results.map(r => [r.key, r.value]));
	return { sync:f.sync !== 'off', dayCap:+f.day_cap || 2000, deviceCap:+f.device_cap || 400, minGap:(+f.min_gap || 8) * 1000, maxBytes:+f.max_bytes || 1000000 };
}
async function codeRow(db, code) {
	if (!code || typeof code !== 'string' || code.length > 64) return null;
	return db.prepare('SELECT code, label, enabled FROM codes WHERE code = ?').bind(code.trim().toLowerCase()).first();
}

export async function onRequest({ request, env, params }) {
	const db = env.DB;
	if (!db) return json({ error:'no database bound' }, 500);
	const route = (params.route || []).join('/');
	const url = new URL(request.url);
	const now = Date.now();

	if (route === 'status' && request.method === 'GET') {
		const f = await flags(db), c = await codeRow(db, url.searchParams.get('code'));
		return json({ sync:f.sync ? 'on' : 'off', code:!c ? 'unknown' : c.enabled ? 'ok' : 'disabled', label:c ? c.label : null, minGap:f.minGap / 1000 });
	}

	if (route === 'sync' && request.method === 'POST') {
		let p; try { p = await request.json(); } catch (e) { return json({ error:'bad json' }, 400); }
		const f = await flags(db), c = await codeRow(db, p.code);
		if (!c) return json({ paused:'code', error:'invite code not recognised' }, 401);
		if (!c.enabled || !f.sync) return json({ paused:'off', error:'cloud backup is switched off' }, 403);
		const device = String(p.device || '').slice(0, 64), body = typeof p.body === 'string' ? p.body : '';
		if (!/^[a-z0-9-]{8,64}$/.test(device)) return json({ error:'bad device id' }, 400);
		if (!body || body.length > f.maxBytes) return json({ error:'body missing or too large', max:f.maxBytes }, 413);
		const hash = String(p.hash || '').slice(0, 32);
		const last = await db.prepare('SELECT id, at, hash FROM snapshots WHERE device = ? ORDER BY at DESC LIMIT 1').bind(device).first();
		if (last && last.hash === hash) return json({ ok:true, dup:true, id:last.id, at:last.at });
		if (last && now - last.at < f.minGap) return json({ paused:'rate', retry:Math.ceil((f.minGap - (now - last.at)) / 1000) }, 429);
		const day = dayStart(now), until = day + 86400000;
		const mine = await db.prepare('SELECT COUNT(*) AS n FROM snapshots WHERE device = ? AND at >= ?').bind(device, day).first();
		if (mine.n >= f.deviceCap) return json({ paused:'day', until, error:'this phone hit its daily backup cap' }, 429);
		const all = await db.prepare('SELECT COUNT(*) AS n FROM snapshots WHERE at >= ?').bind(day).first();
		if (all.n >= f.dayCap) return json({ paused:'day', until, error:'the beta hit its daily backup cap' }, 429);
		const label = String(p.label || '').slice(0, 40) || null;
		await db.batch([
			db.prepare('INSERT INTO devices (id, code, label, created, last_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET label = excluded.label, last_at = excluded.last_at').bind(device, c.code, label, now, now),
			db.prepare('INSERT INTO snapshots (device, code, at, hash, game_id, status, note, bytes, body) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(device, c.code, now, hash, p.gameId ? String(p.gameId).slice(0, 64) : null, p.status ? String(p.status).slice(0, 16) : null, p.note ? String(p.note).slice(0, 120) : null, body.length, body)
		]);
		const row = await db.prepare('SELECT id FROM snapshots WHERE device = ? ORDER BY id DESC LIMIT 1').bind(device).first();
		return json({ ok:true, id:row.id, at:now });
	}

	if (route === 'snapshots' && request.method === 'GET') {
		const c = await codeRow(db, url.searchParams.get('code'));
		if (!c) return json({ paused:'code', error:'invite code not recognised' }, 401);
		const device = url.searchParams.get('device');
		const q = device
			? db.prepare('SELECT s.id, s.device, d.label, s.at, s.game_id AS gameId, s.status, s.note, s.bytes FROM snapshots s LEFT JOIN devices d ON d.id = s.device WHERE s.code = ? AND s.device = ? ORDER BY s.at DESC LIMIT 60').bind(c.code, device)
			: db.prepare('SELECT s.id, s.device, d.label, s.at, s.game_id AS gameId, s.status, s.note, s.bytes FROM snapshots s LEFT JOIN devices d ON d.id = s.device WHERE s.code = ? ORDER BY s.at DESC LIMIT 60').bind(c.code);
		const { results } = await q.all();
		return json({ ok:true, snapshots:results });
	}

	if (route === 'snapshot' && request.method === 'GET') {
		const c = await codeRow(db, url.searchParams.get('code'));
		if (!c) return json({ paused:'code', error:'invite code not recognised' }, 401);
		const id = +url.searchParams.get('id');
		const row = await db.prepare('SELECT body FROM snapshots WHERE id = ? AND code = ?').bind(id, c.code).first();
		if (!row) return json({ error:'no such snapshot' }, 404);
		return new Response(row.body, { headers:{ 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' } });
	}

	return json({ error:'not found' }, 404);
}
